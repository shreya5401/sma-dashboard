from collections import defaultdict
from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()
_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def analyze(posts: list[dict]) -> dict:
    if not posts:
        return {"engagement": [], "reach": [], "sentiment": []}

    buckets: dict[str, dict] = defaultdict(lambda: {"eng": 0, "reach": 0, "sent": 0.0, "n": 0})

    for post in posts:
        try:
            dt = datetime.fromisoformat(post["created_at"].replace("Z", "+00:00"))
            day = _DAYS[dt.weekday()]
        except Exception:
            day = _DAYS[0]

        eng = post.get("likes", 0) + post.get("retweets", 0) + post.get("replies", 0)
        buckets[day]["eng"] += eng
        buckets[day]["reach"] += post.get("followers", 0)
        buckets[day]["sent"] += _analyzer.polarity_scores(post["text"])["compound"]
        buckets[day]["n"] += 1

    eng_out, reach_out, sent_out = [], [], []
    for day in _DAYS:
        d = buckets[day]
        n = max(d["n"], 1)
        eng_out.append({"date": day, "value": round(d["eng"] / n)})
        reach_out.append({"date": day, "value": round(d["reach"] / n)})
        sent_out.append({"date": day, "value": round(((d["sent"] / n) + 1) / 2 * 100)})

    return {"engagement": eng_out, "reach": reach_out, "sentiment": sent_out}
