import re
import networkx as nx


def analyze(posts: list[dict]) -> dict:
    G = nx.DiGraph()
    for post in posts:
        author = post["author"]
        G.add_node(author, followers=post.get("followers", 0),
                   likes=post.get("likes", 0), retweets=post.get("retweets", 0))
        for mention in re.findall(r"@(\w+)", post["text"]):
            if mention.lower() != author.lower():
                G.add_edge(author, mention)

    if G.number_of_nodes() < 2:
        return {"influencers": []}

    try:
        centrality = nx.eigenvector_centrality_numpy(G.to_undirected())
    except Exception:
        centrality = nx.degree_centrality(G)

    top = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:10]
    influencers = []
    for i, (node, score) in enumerate(top):
        f = G.nodes.get(node, {}).get("followers", 0)
        if f >= 1_000_000:
            f_str = f"{f / 1_000_000:.1f}M"
        elif f >= 1_000:
            f_str = f"{f / 1_000:.0f}K"
        else:
            f_str = str(f)

        prev_score = top[i - 1][1] if i > 0 else score
        delta_val = round(score - prev_score, 3)
        delta = f"+{delta_val:.3f}" if delta_val >= 0 else f"{delta_val:.3f}"

        influencers.append({
            "rank": i + 1,
            "name": f"@{node}",
            "followers": f_str,
            "score": round(score, 3),
            "delta": delta,
        })

    return {"influencers": influencers}
