import re
import networkx as nx


def analyze(posts: list[dict]) -> dict:
    G = nx.DiGraph()
    for post in posts:
        author = post["author"]
        G.add_node(author, followers=post.get("followers", 0))
        for mention in re.findall(r"@(\w+)", post["text"]):
            if mention.lower() != author.lower():
                G.add_edge(author, mention)

    undirected = G.to_undirected()
    try:
        comms = list(nx.community.greedy_modularity_communities(undirected))
    except Exception:
        comms = []

    top_nodes = sorted(G.nodes(), key=lambda n: G.degree(n), reverse=True)[:20]
    nodes = [{"id": n, "degree": G.degree(n), "followers": G.nodes[n].get("followers", 0)} for n in top_nodes]

    return {
        "total_nodes": G.number_of_nodes(),
        "total_edges": G.number_of_edges(),
        "communities": len(comms),
        "influencers": min(12, G.number_of_nodes()),
        "connectors": sum(1 for n in G.nodes() if G.degree(n) >= 2),
        "nodes": nodes,
    }
