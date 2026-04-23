from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()


def _score_brand(posts: list[dict]) -> dict:
    if not posts:
        return {"growth": 0, "engagement": 0, "reach": 0, "sentiment": 50}
    total_eng = sum(p.get("likes", 0) + p.get("retweets", 0) for p in posts)
    avg_eng = total_eng / len(posts)
    avg_reach = sum(p.get("followers", 0) for p in posts) / len(posts)
    avg_sent = sum(_analyzer.polarity_scores(p["text"])["compound"] for p in posts) / len(posts)
    return {
        "growth": min(round(len(posts) / 10), 100),
        "engagement": min(round(avg_eng), 100),
        "reach": min(round(avg_reach / 1000), 100),
        "sentiment": round((avg_sent + 1) / 2 * 100),
    }


def analyze(brand_posts: dict[str, list]) -> dict:
    brands = list(brand_posts.keys())
    scores = {b: _score_brand(brand_posts[b]) for b in brands}

    metrics = []
    for metric_key, label in [("growth", "Growth"), ("engagement", "Engagement"),
                               ("reach", "Reach"), ("sentiment", "Sentiment")]:
        row: dict = {"metric": label}
        if len(brands) > 0:
            row["brand"] = scores[brands[0]][metric_key]
        if len(brands) > 1:
            row["compA"] = scores[brands[1]][metric_key]
        if len(brands) > 2:
            row["compB"] = scores[brands[2]][metric_key]
        metrics.append(row)

    if brands:
        total_scores = {b: sum(scores[b].values()) for b in brands}
        leader = max(total_scores, key=total_scores.get)
        top_metric = max(["growth", "engagement", "reach", "sentiment"],
                         key=lambda m: scores[brands[0]][m]).capitalize()
        summary = f"{leader} leads in {top_metric}"
    else:
        summary = "No data"

    return {"brands": brands, "metrics": metrics, "summary": summary}
