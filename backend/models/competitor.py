from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyzer = SentimentIntensityAnalyzer()


def _get_raw_scores(posts: list[dict]) -> dict:
    if not posts:
        return {"growth": 0, "engagement": 0, "strategy": 0}
    
    # Growth: Raw post volume
    growth_raw = len(posts)
    
    # Engagement: Weighted average (Replies > Retweets > Likes)
    # This reflects that a reply is a higher effort interaction than a like.
    total_eng = sum(
        p.get("likes", 0) * 1 + 
        p.get("retweets", 0) * 2 + 
        p.get("replies", 0) * 4 
        for p in posts
    )
    engagement_raw = total_eng / len(posts)
    
    # Strategy: Content diversity and hashtag usage
    media_count = sum(1 for p in posts if p.get("media") or "http" in p.get("text", ""))
    media_score = (media_count / len(posts)) * 60
    
    total_hashtags = sum(len(p.get("hashtags", [])) for p in posts)
    avg_hashtags = total_hashtags / len(posts)
    hashtag_score = min(avg_hashtags * 10, 40)
    
    strategy_raw = media_score + hashtag_score

    return {
        "growth": growth_raw,
        "engagement": engagement_raw,
        "strategy": strategy_raw,
    }


def analyze(brand_posts: dict[str, list]) -> dict:
    brands = list(brand_posts.keys())
    if not brands:
        return {"brands": [], "metrics": [], "summary": "No data"}

    # 1. Get raw scores for all brands
    raw_results = {b: _get_raw_scores(brand_posts[b]) for b in brands}

    # 2. Normalize scores relative to the best performer in each category
    # This ensures there is always visual variation and a clear winner.
    normalized_scores = {b: {} for b in brands}
    for metric in ["growth", "engagement", "strategy"]:
        max_val = max([raw_results[b][metric] for b in brands] + [1]) # Avoid div by zero
        for b in brands:
            # We use a base of 30% for non-zero scores to keep the bars visible but distinct
            raw = raw_results[b][metric]
            if raw == 0:
                normalized_scores[b][metric] = 0
            else:
                score = round((raw / max_val) * 100)
                normalized_scores[b][metric] = max(score, 10) # Minimum 10% if data exists

    # 3. Format for Recharts
    metrics = []
    for metric_key, label in [("growth", "Growth"), ("engagement", "Engagement"),
                                ("strategy", "Strategy")]:
        row: dict = {"metric": label}
        if len(brands) > 0:
            row["brand"] = normalized_scores[brands[0]][metric_key]
        if len(brands) > 1:
            row["compA"] = normalized_scores[brands[1]][metric_key]
        if len(brands) > 2:
            row["compB"] = normalized_scores[brands[2]][metric_key]
        metrics.append(row)

    # 4. Generate summary
    total_scores = {b: sum(normalized_scores[b].values()) for b in brands}
    leader = max(total_scores, key=total_scores.get)
    
    # Best category for the leader
    best_cat_key = max(["growth", "engagement", "strategy"], 
                        key=lambda m: normalized_scores[leader][m])
    best_cat = best_cat_key.capitalize()
    
    summary = f"{leader} leads the market, particularly in {best_cat}."

    return {"brands": brands, "metrics": metrics, "summary": summary}
