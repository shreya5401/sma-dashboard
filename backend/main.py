from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from data_fetcher import fetch_posts
from models import (
    sentiment, trending, network, recommendation,
    fake_news, segmentation, data_viz, ad_campaign,
    influencer, monitoring, competitor, prediction, chatbot,
)

app = FastAPI(title="Social Media Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _posts(keyword: str, platform: str, use_live: bool, limit: int = 100) -> list[dict]:
    return fetch_posts(keyword, platform, use_live, limit)


@app.get("/")
def root():
    return {"message": "SMA Backend is running!"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/sentiment")
def api_sentiment(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**sentiment.analyze(posts), "keyword": keyword, "total_fetched": len(posts)}


@app.get("/api/trending")
def api_trending(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**trending.analyze(posts), "keyword": keyword}


@app.get("/api/network")
def api_network(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**network.analyze(posts), "keyword": keyword}


@app.get("/api/recommendation")
def api_recommendation(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**recommendation.analyze(posts), "keyword": keyword}


@app.get("/api/fake-news")
def api_fake_news(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**fake_news.analyze(posts), "keyword": keyword}


@app.get("/api/segmentation")
def api_segmentation(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**segmentation.analyze(posts), "keyword": keyword}


@app.get("/api/data-viz")
def api_data_viz(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**data_viz.analyze(posts), "keyword": keyword}


@app.get("/api/ad-campaign")
def api_ad_campaign(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**ad_campaign.analyze(posts), "keyword": keyword}


@app.get("/api/influencer")
def api_influencer(
    keyword: str = "Tesla",
    platform: str = "x",
    use_live: bool = True,
    include_graph: bool = False,
):
    posts = _posts(keyword, platform, use_live)
    result = influencer.analyze(posts)

    # Diff against the previous snapshot so 'delta' reflects real movement
    # over time rather than a static placeholder.
    current_scores: dict[str, float] = result.pop("scores", {}) or {}
    try:
        from db import save_influencer_snapshot, load_previous_influencer_snapshot
        previous = load_previous_influencer_snapshot(keyword, platform)
        if previous:
            for row in result.get("influencers", []):
                user = row["name"].lstrip("@")
                prev_score = float(previous.get(user, 0.0))
                delta_val = round(row["score"] - prev_score, 3)
                row["delta"] = f"+{delta_val:.3f}" if delta_val >= 0 else f"{delta_val:.3f}"
        if current_scores:
            save_influencer_snapshot(keyword, platform, current_scores)
    except Exception as e:
        print(f"[api_influencer] snapshot step skipped: {e}")

    if not include_graph:
        result.pop("graph", None)

    return {**result, "keyword": keyword}


@app.get("/api/monitoring")
def api_monitoring(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**monitoring.analyze(posts, keyword), "keyword": keyword}


@app.get("/api/competitor")
def api_competitor(
    keyword: str = "Tesla",
    competitors: str = "auto",
    platform: str = "x",
    use_live: bool = False,
):
    from db import get_db
    db = get_db()
    
    # Fallback to defaults if DB is unreachable
    if db is None:
        brands = [keyword] + ["Meta", "Google"]
    # If competitors is 'auto' or we are searching for something not in the hardcoded defaults
    elif competitors == "auto" or not competitors or competitors == "Ford,BMW":
        all_brands = db["posts"].distinct("keyword")
        discovered = competitor.find_competitors(keyword, all_brands)
        brands = [keyword] + discovered
    else:
        brands = [keyword] + [c.strip() for c in competitors.split(",") if c.strip()][:2]

    brand_posts = {b: _posts(b, platform, use_live, limit=50) for b in brands}
    return {**competitor.analyze(brand_posts), "keyword": keyword}


@app.get("/api/prediction")
def api_prediction(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**prediction.analyze(posts), "keyword": keyword}


@app.post("/api/chat")
def api_chat(data: dict):
    message = data.get("message", "")
    context = data.get("context", {})
    keyword = context.get("keyword", "the current brand")
    
    # 1. Fetch live stats for the AI to use
    from data_fetcher import fetch_posts
    posts = fetch_posts(keyword, use_live=False) # Fast fetch from DB/CSV
    
    live_stats = "No live data available."
    if posts:
        avg_likes = sum(p.get("likes", 0) for p in posts) / len(posts)
        hashtags = [h for p in posts for h in p.get("hashtags", [])]
        top_h = sorted(set(hashtags), key=hashtags.count, reverse=True)[:3]
        
        # Simple sentiment mock/calc
        pos = len([p for p in posts if p.get("likes", 0) > 500]) # Example proxy
        live_stats = f"Avg Likes: {avg_likes:.1f}, Top Hashtags: {', '.join(top_h)}, High Engagement Posts: {pos}"

    # 2. Dynamically find competitors
    from db import get_db
    from models import competitor
    db = get_db()
    discovered = ["rival brands"]
    if db:
        all_brands = db["posts"].distinct("keyword")
        discovered = competitor.find_competitors(keyword, all_brands)
    
    return {"response": chatbot.get_chat_response(
        message, 
        keyword=keyword, 
        competitors=", ".join(discovered),
        live_stats=live_stats
    )}


@app.get("/api/posts")
def api_posts(keyword: str = "Tesla", platform: str = "x", limit: int = 50):
    """Browse raw posts stored in MongoDB for a keyword."""
    from db import get_db
    db = get_db()
    if db is None:
        return {"posts": [], "count": 0, "error": "MongoDB not connected — set MONGODB_URI in .env"}
    posts = list(db["posts"].find(
        {"keyword": {"$regex": f"^{keyword}$", "$options": "i"}, "platform": platform},
        {"_id": 0},
        limit=limit,
        sort=[("fetched_at", -1)],
    ))
    return {"keyword": keyword, "platform": platform, "count": len(posts), "posts": posts}