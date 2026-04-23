import re
from collections import Counter


def analyze(posts: list[dict]) -> dict:
    all_hashtags = []
    for post in posts:
        if post.get("hashtags"):
            all_hashtags.extend([f"#{h.lstrip('#')}" for h in post["hashtags"]])
        else:
            all_hashtags.extend(re.findall(r"#\w+", post["text"]))

    counts = Counter(all_hashtags)
    top = counts.most_common(10)
    return {
        "hashtags": [{"tag": tag, "count": count} for tag, count in top],
        "total_unique": len(counts),
        "top_tag": top[0][0] if top else "",
        "top_count": top[0][1] if top else 0,
    }
