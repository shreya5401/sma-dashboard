from collections import defaultdict


def analyze(posts: list[dict]) -> dict:
    if not posts:
        return {"ctr": 0.0, "conversion_rate": 0.0, "roi": 0.0, "weekly": []}

    total_impressions = sum(max(p.get("followers", 1), 1) for p in posts)
    total_clicks = sum(p.get("likes", 0) + p.get("replies", 0) for p in posts)
    total_conv = sum(p.get("retweets", 0) for p in posts)

    ctr = round(min(total_clicks / max(total_impressions, 1) * 100, 99.0), 2)
    conv_rate = round(min(total_conv / max(total_clicks, 1) * 100, 99.0), 2)
    roi = round(min(max((total_conv * 50 - total_clicks * 0.5) / max(total_clicks * 0.5, 1) * 100, 0), 999.0), 1)

    chunk = max(len(posts) // 4, 1)
    week_data: dict[str, dict] = defaultdict(lambda: {"imp": 0, "clicks": 0, "conv": 0})
    for i, post in enumerate(posts):
        week = f"Week {min(i // chunk + 1, 4)}"
        week_data[week]["imp"] += max(post.get("followers", 1), 1)
        week_data[week]["clicks"] += post.get("likes", 0)
        week_data[week]["conv"] += post.get("retweets", 0)

    weekly = []
    for week in sorted(week_data)[:4]:
        d = week_data[week]
        weekly.append({
            "name": week,
            "ctr": round(min(d["clicks"] / max(d["imp"], 1) * 100, 99.0), 2),
            "conv": round(min(d["conv"] / max(d["clicks"], 1) * 100, 99.0), 2),
            "roi": round(min(max((d["conv"] * 50) / max(d["clicks"] * 0.5, 1) * 100, 0), 999.0), 1),
        })

    return {"ctr": ctr, "conversion_rate": conv_rate, "roi": roi, "weekly": weekly}
