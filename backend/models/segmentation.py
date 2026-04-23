import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

_NAMES = ["Power Users", "Casual Browsers", "Lurkers"]
_COLORS = ["#3b82f6", "#f59e0b", "#94a3b8"]


def analyze(posts: list[dict]) -> dict:
    if not posts:
        return {"clusters": [], "n_clusters": 0}

    user_stats: dict[str, dict] = {}
    for post in posts:
        u = post["author"]
        if u not in user_stats:
            user_stats[u] = {"followers": post.get("followers", 0), "posts": 0, "likes": 0, "retweets": 0}
        user_stats[u]["posts"] += 1
        user_stats[u]["likes"] += post.get("likes", 0)
        user_stats[u]["retweets"] += post.get("retweets", 0)

    users = list(user_stats.keys())
    if len(users) < 3:
        return {"clusters": [], "n_clusters": 0}

    features = np.array([
        [
            user_stats[u]["followers"],
            user_stats[u]["posts"],
            user_stats[u]["likes"] / max(user_stats[u]["posts"], 1),
        ]
        for u in users
    ], dtype=float)

    n = min(3, len(users))
    scaled = StandardScaler().fit_transform(features)
    labels = KMeans(n_clusters=n, random_state=42, n_init=10).fit_predict(scaled)

    clusters = []
    for i in range(n):
        mask = labels == i
        group = [users[j] for j in range(len(users)) if mask[j]]
        avg_f = int(np.mean([user_stats[u]["followers"] for u in group]))
        clusters.append({"name": _NAMES[i], "count": int(np.sum(mask)), "avg_followers": avg_f, "color": _COLORS[i]})

    clusters.sort(key=lambda c: c["count"], reverse=True)
    for i, c in enumerate(clusters):
        c["name"] = _NAMES[i]
        c["color"] = _COLORS[i]

    return {"clusters": clusters, "n_clusters": n}
