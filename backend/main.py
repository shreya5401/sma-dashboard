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
def api_influencer(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**influencer.analyze(posts), "keyword": keyword}


@app.get("/api/monitoring")
def api_monitoring(keyword: str = "Tesla", platform: str = "x", use_live: bool = True):
    posts = _posts(keyword, platform, use_live)
    return {**monitoring.analyze(posts, keyword), "keyword": keyword}


@app.get("/api/competitor")
def api_competitor(
    keyword: str = "Tesla",
    competitors: str = "Ford,BMW",
    platform: str = "x",
    use_live: bool = True,
):
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
    return {"response": chatbot.get_chat_response(message)}


@app.get("/api/posts")
def api_posts(keyword: str = "Tesla", platform: str = "x", limit: int = 50):
    """Browse raw posts stored in MongoDB for a keyword."""
    from db import get_db
    db = get_db()
    if db is None:
        return {"posts": [], "count": 0, "error": "MongoDB not connected — set MONGODB_URI in .env"}
    posts = list(db["posts"].find(
        {"keyword": keyword, "platform": platform},
        {"_id": 0},
        limit=limit,
        sort=[("fetched_at", -1)],
    ))
    return {"keyword": keyword, "platform": platform, "count": len(posts), "posts": posts}