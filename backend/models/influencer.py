r"""
Module 9 - Influencer Detection via Eigenvector Centrality.

Builds a weighted, directed mention graph from posts (author -> mentioned user)
and ranks nodes with eigenvector centrality. The directed graph captures the
intuition "you are important if important people point at you".

Mention sources, combined so the model works for both CSV and live Apify data:
  - post["mentions"]: list of usernames (CSV path, from the 'mentions' column).
  - re.findall(r"@(\w+)", post["text"]): live tweet text with real @handles.

Falls back gracefully when the primary algorithm is unhappy (disconnected
graph, degenerate spectrum, missing scipy, etc.):
  1. eigenvector_centrality_numpy on the directed weighted graph
  2. eigenvector_centrality (power iteration, pure NumPy)
  3. pagerank (same semantics, very robust)
  4. rank by followers when the graph has no usable edges.
"""

import re

import networkx as nx


_MENTION_RE = re.compile(r"@(\w+)")
_GRAPH_MAX_NODES = 20


def _format_followers(n: int) -> str:
    if n >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if n >= 1_000:
        return f"{n / 1_000:.0f}K"
    return str(n)


def _format_delta(val: float) -> str:
    # Three-decimal signed delta; zero becomes "+0.000" for consistency.
    return f"+{val:.3f}" if val >= 0 else f"{val:.3f}"


def _collect_mentions(post: dict, author: str) -> list[str]:
    """Return the list of users mentioned by `post`, excluding the author."""
    seen: list[str] = []
    added: set[str] = set()

    # Structured mentions column (CSV path).
    for m in post.get("mentions", []) or []:
        name = str(m).lstrip("@").strip()
        if name and name.lower() != author.lower() and name.lower() not in added:
            seen.append(name)
            added.add(name.lower())

    # @handles in free text (Apify / real tweets).
    for m in _MENTION_RE.findall(post.get("text", "") or ""):
        name = m.strip()
        if name and name.lower() != author.lower() and name.lower() not in added:
            seen.append(name)
            added.add(name.lower())

    return seen


def _build_graph(posts: list[dict]) -> nx.DiGraph:
    """Build a weighted directed mention graph from `posts`.

    Node attributes (aggregated over all posts authored by that user):
      - followers: max followers seen
      - likes:     total likes across their posts
      - retweets:  total retweets across their posts
      - posts:     how many posts they authored
    Mentioned-only users still get a node (with zero author stats) so they
    can receive centrality from incoming edges.
    """
    G = nx.DiGraph()

    for post in posts:
        author = (post.get("author") or "").strip()
        if not author:
            continue

        followers = int(post.get("followers", 0) or 0)
        likes = int(post.get("likes", 0) or 0)
        retweets = int(post.get("retweets", 0) or 0)

        if G.has_node(author):
            G.nodes[author]["followers"] = max(G.nodes[author]["followers"], followers)
            G.nodes[author]["likes"] += likes
            G.nodes[author]["retweets"] += retweets
            G.nodes[author]["posts"] += 1
        else:
            G.add_node(author, followers=followers, likes=likes,
                       retweets=retweets, posts=1)

        for target in _collect_mentions(post, author):
            if not G.has_node(target):
                G.add_node(target, followers=0, likes=0, retweets=0, posts=0)
            if G.has_edge(author, target):
                G[author][target]["weight"] += 1
            else:
                G.add_edge(author, target, weight=1)

    return G


def _centrality(G: nx.DiGraph) -> tuple[dict[str, float], str]:
    """Return (scores_by_node, algorithm_name). Falls back gracefully.

    Eigenvector centrality on directed graphs is finicky: the numpy variant
    needs the largest eigenvalue to be simple, and the power-iteration
    variant can fail to converge on graphs with sinks. PageRank is a
    mathematically well-behaved cousin (damping factor guarantees
    convergence) that preserves the "important people point at you"
    interpretation, so we try it before giving up on mentions entirely.
    """
    if G.number_of_edges() > 0:
        # eigenvector_centrality_numpy commonly refuses on directed graphs
        # with sinks (users who are mentioned but never mention anyone),
        # which is the norm for mention graphs. Power iteration is the
        # equivalent fallback, so swallow the failure silently here.
        try:
            return nx.eigenvector_centrality_numpy(G, weight="weight"), "eigenvector_centrality"
        except Exception:
            pass

        try:
            scores = nx.eigenvector_centrality(
                G, max_iter=500, tol=1e-04, weight="weight"
            )
            return scores, "eigenvector_centrality"
        except Exception as e:
            print(f"[influencer] eigenvector_centrality failed, trying pagerank: {e}")

        try:
            return nx.pagerank(G, weight="weight"), "pagerank_fallback"
        except Exception as e:
            print(f"[influencer] pagerank failed: {e}")

    # Graph has no usable edges: rank by followers so the widget still shows
    # something meaningful.
    scores = {n: float(G.nodes[n].get("followers", 0)) for n in G.nodes()}
    max_f = max(scores.values(), default=1.0) or 1.0
    return {n: v / max_f for n, v in scores.items()}, "followers_fallback"


def _incoming_weight(G: nx.DiGraph, node: str) -> int:
    return sum(int(d.get("weight", 1)) for _, _, d in G.in_edges(node, data=True))


def _graph_payload(G: nx.DiGraph, scores: dict[str, float],
                   top_nodes: list[str]) -> dict:
    """Trim the graph to the top-N nodes for frontend visualization."""
    keep = set(top_nodes[:_GRAPH_MAX_NODES])

    nodes = []
    for n in keep:
        attrs = G.nodes[n]
        nodes.append({
            "id": n,
            "name": f"@{n}",
            "score": round(float(scores.get(n, 0.0)), 4),
            "followers": int(attrs.get("followers", 0)),
            "in_degree": int(G.in_degree(n)),
            "out_degree": int(G.out_degree(n)),
        })

    edges = []
    for a, b, d in G.edges(data=True):
        if a in keep and b in keep:
            edges.append({
                "source": a,
                "target": b,
                "weight": int(d.get("weight", 1)),
            })

    return {"nodes": nodes, "edges": edges}


def analyze(posts: list[dict]) -> dict:
    """Rank influencers by eigenvector centrality of the mention graph.

    Pure, side-effect-free. The API route layer is responsible for
    snapshot persistence and computing trend-deltas.
    """
    if not posts:
        return {
            "influencers": [],
            "algorithm": "eigenvector_centrality",
            "stats": {"nodes": 0, "edges": 0, "components": 0},
            "graph": {"nodes": [], "edges": []},
            "scores": {},
        }

    G = _build_graph(posts)

    if G.number_of_nodes() == 0:
        return {
            "influencers": [],
            "algorithm": "eigenvector_centrality",
            "stats": {"nodes": 0, "edges": 0, "components": 0},
            "graph": {"nodes": [], "edges": []},
            "scores": {},
        }

    scores, algo = _centrality(G)

    # Sort once; reuse the ordering for both the top-10 list and the
    # graph payload so the visualization highlights the same users.
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    top_names = [n for n, _ in ranked]

    influencers = []
    for i, (node, score) in enumerate(ranked[:10]):
        attrs = G.nodes[node]
        engagement = int(attrs.get("likes", 0)) + int(attrs.get("retweets", 0))
        influencers.append({
            "rank": i + 1,
            "name": f"@{node}",
            "followers": _format_followers(int(attrs.get("followers", 0))),
            "score": round(float(score), 3),
            "delta": "+0.000",
            "mention_count": _incoming_weight(G, node),
            "engagement": engagement,
        })

    components = nx.number_weakly_connected_components(G) if G.number_of_edges() else G.number_of_nodes()

    return {
        "influencers": influencers,
        "algorithm": algo,
        "stats": {
            "nodes": G.number_of_nodes(),
            "edges": G.number_of_edges(),
            "components": components,
        },
        "graph": _graph_payload(G, scores, top_names),
        # Full score map (user -> float). Used by the API route to diff
        # against the previous snapshot; not intended for the widget.
        "scores": {n: round(float(s), 6) for n, s in scores.items()},
    }
