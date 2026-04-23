from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()


def analyze(posts: list[dict]) -> dict:
    if not posts:
        return {"total": 0, "positive": 0, "negative": 0, "neutral": 0, "dominant": "neutral"}

    counts = {"positive": 0, "negative": 0, "neutral": 0}
    for post in posts:
        compound = _analyzer.polarity_scores(post["text"])["compound"]
        if compound >= 0.05:
            counts["positive"] += 1
        elif compound <= -0.05:
            counts["negative"] += 1
        else:
            counts["neutral"] += 1

    total = len(posts)
    dominant = max(counts, key=counts.get)
    return {
        "total": total,
        "positive": round(counts["positive"] / total * 100),
        "negative": round(counts["negative"] / total * 100),
        "neutral": round(counts["neutral"] / total * 100),
        "dominant": dominant,
    }
