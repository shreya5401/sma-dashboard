import random

def analyze(keyword: str):
    """
    Simulates platform comparison metrics for Twitter and Facebook.
    """
    platforms = ["Twitter", "Facebook"]
    
    # Use a seed to ensure data stays consistent for the same keyword
    seed = sum(ord(c) for c in keyword)
    random.seed(seed)
    
    data = []
    for p in platforms:
        # Higher base volume to ensure visible bars
        base_mentions = {
            "Twitter": 6200,
            "Facebook": 4800
        }.get(p, 2500)
        
        mentions = int(base_mentions * random.uniform(0.9, 1.7))
        
        # Sentiment variance
        sentiment_pos = random.randint(45, 80)
        sentiment_neg = random.randint(5, 20)
        sentiment_neu = 100 - sentiment_pos - sentiment_neg
        
        data.append({
            "platform": p,
            "mentions": mentions,
            "sentiment": {
                "positive": sentiment_pos,
                "negative": sentiment_neg,
                "neutral": sentiment_neu
            },
            "engagement_rate": round(random.uniform(2.5, 9.5), 2),
            "top_hashtag": f"#{keyword}{p[:1]}".replace(" ", "")
        })
        
    # Find the platform with the highest engagement rate (quality over quantity)
    leader = max(data, key=lambda x: x["engagement_rate"])
    
    return {
        "keyword": keyword,
        "platforms": data,
        "summary": {
            "leading_platform": leader["platform"],
            "total_mentions": sum(d["mentions"] for d in data),
            "avg_engagement": round(sum(d["engagement_rate"] for d in data) / len(data), 2)
        }
    }
