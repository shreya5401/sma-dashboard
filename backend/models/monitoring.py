import re
from collections import Counter, defaultdict
from datetime import datetime

_KEY_HOURS = ["00:00", "04:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
_STOPWORDS = {"that", "this", "with", "have", "from", "they", "will", "been", "were", "said",
              "what", "your", "more", "just", "about", "when", "which", "their", "there", "also"}


def analyze(posts: list[dict], keyword: str) -> dict:
    if not posts:
        return {"mentions_per_hour": 0, "time_series": [], "top_keywords": []}

    hourly: dict[int, int] = defaultdict(int)
    all_words: list[str] = []

    for post in posts:
        try:
            dt = datetime.fromisoformat(post["created_at"].replace("Z", "+00:00"))
            hourly[dt.hour] += 1
        except Exception:
            hourly[12] += 1
        all_words.extend(re.findall(r"\b[A-Za-z]{4,}\b", post["text"]))

    time_series = []
    for h_str in _KEY_HOURS:
        h = int(h_str.split(":")[0])
        count = sum(v for k, v in hourly.items() if abs(k - h) <= 1)
        time_series.append({"time": h_str, "mentions": count})

    filtered = [w.lower() for w in all_words if w.lower() not in _STOPWORDS]
    top_words = Counter(filtered).most_common(5)

    half = len(posts) // 2
    trend_pct = round((len(posts[half:]) - len(posts[:half])) / max(len(posts[:half]), 1) * 100)
    trend_str = f"+{trend_pct}%" if trend_pct >= 0 else f"{trend_pct}%"

    top_keywords = [
        {"word": w.capitalize(), "count": c, "trend": trend_str}
        for w, c in top_words[:3]
    ]

    peak = max(time_series, key=lambda x: x["mentions"])
    return {
        "mentions_per_hour": peak["mentions"],
        "time_series": time_series,
        "top_keywords": top_keywords,
    }
