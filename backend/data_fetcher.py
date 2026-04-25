import os
import csv
import time
import threading
from dotenv import load_dotenv

load_dotenv()

APIFY_API_KEY = os.getenv("APIFY_API_KEY", "")
TWITTER_ACTOR_ID = os.getenv("TWITTER_ACTOR_ID", "apidojo/tweet-scraper")
FACEBOOK_ACTOR_ID = os.getenv("FACEBOOK_ACTOR_ID", "apify/facebook-posts-scraper")

CACHE_TTL = 300  # 5 minutes
_cache: dict = {}

# Per-keyword locks: only one Apify run fires per keyword at a time.
# Other threads wait for the in-progress fetch, then read from cache.
_inflight: dict[str, threading.Event] = {}
_inflight_mutex = threading.Lock()


def _normalize_tweet(raw: dict) -> dict:
    author = raw.get("author", {})
    if isinstance(author, str):
        username, followers = author, 0
    else:
        username = author.get("userName", author.get("username", "unknown"))
        followers = author.get("followersCount", author.get("followers_count", 0)) or 0

    return {
        "id": str(raw.get("id", "")),
        "text": raw.get("text", raw.get("full_text", "")),
        "author": username,
        "followers": int(followers),
        "likes": int(raw.get("likeCount", raw.get("favorite_count", 0)) or 0),
        "retweets": int(raw.get("retweetCount", raw.get("retweet_count", 0)) or 0),
        "replies": int(raw.get("replyCount", raw.get("reply_count", 0)) or 0),
        "hashtags": raw.get("hashtags", []),
        "created_at": str(raw.get("createdAt", raw.get("created_at", ""))),
        "platform": "x",
    }


def fetch_from_apify(keyword: str, platform: str = "x", limit: int = 100) -> list[dict]:
    try:
        from apify_client import ApifyClient
        client = ApifyClient(APIFY_API_KEY)

        if platform == "x":
            run_input = {"searchTerms": [keyword], "maxTweets": limit, "addUserInfo": True}
            run = client.actor(TWITTER_ACTOR_ID).call(run_input=run_input)
        else:
            run_input = {"searchTerms": [keyword], "maxPosts": limit}
            run = client.actor(FACEBOOK_ACTOR_ID).call(run_input=run_input)

        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        return [_normalize_tweet(item) for item in items]
    except Exception as e:
        print(f"[Apify] fetch failed: {e}")
        return []


def _int(val) -> int:
    try:
        return int(float(val or 0))
    except (ValueError, TypeError):
        return 0


def _float(val) -> float:
    try:
        return float(val or 0)
    except (ValueError, TypeError):
        return 0.0


def fetch_from_csv(keyword: str, platform: str = "x") -> list[dict]:
    data_dir = os.path.join(os.path.dirname(__file__), "data")

    # Prefer the full dataset; fall back to the small sample
    for filename in [
        "social_media_analytics_full_dataset_with_demographics.csv",
        "sample_tweets.csv",
    ]:
        csv_path = os.path.join(data_dir, filename)
        if not os.path.exists(csv_path):
            continue

        is_full = filename.startswith("social_media")
        posts = []

        with open(csv_path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                try:
                    if is_full:
                        hashtags = [h.strip().lstrip("#") for h in row.get("hashtags", "").split() if h.strip()]
                        mentions = [m.strip().lstrip("@") for m in row.get("mentions", "").split() if m.strip()]
                        post = {
                            "id": str(row["tweet_id"]),
                            "text": row.get("text", ""),
                            "author": row.get("user", "unknown"),
                            "followers": _int(row.get("followers")),
                            "likes": _int(row.get("likes")),
                            "retweets": _int(row.get("retweets")),
                            "replies": _int(row.get("replies")),
                            "hashtags": hashtags,
                            "mentions": mentions,
                            "created_at": row.get("date", ""),
                            "platform": "x",
                            "sentiment_label": row.get("sentiment", ""),
                            "fake_label": row.get("fake_label", ""),
                            "engagement_rate": _float(row.get("engagement_rate")),
                            "ctr": _float(row.get("ctr")),
                            "conversion_rate": _float(row.get("conversion_rate")),
                            "impressions": _int(row.get("impressions")),
                        }
                        # For the full dataset, filter by brand name
                        brand = row.get("brand", "").lower()
                        kw = keyword.lower()
                        if keyword and keyword.lower() != "all" and brand != kw:
                            continue
                    else:
                        if platform != "all" and row.get("platform", "x") != platform:
                            continue
                        post = {
                            "id": row["id"],
                            "text": row["text"],
                            "author": row["author"],
                            "followers": _int(row.get("followers")),
                            "likes": _int(row.get("likes")),
                            "retweets": _int(row.get("retweets")),
                            "replies": _int(row.get("replies")),
                            "hashtags": [h.strip() for h in row.get("hashtags", "").split(",") if h.strip()],
                            "created_at": row.get("created_at", ""),
                            "platform": row.get("platform", "x"),
                        }
                        # For the sample CSV, filter by keyword in text/hashtags
                        if keyword and keyword.lower() != "all":
                            kw = keyword.lower()
                            if not (kw in post["text"].lower() or any(kw in h.lower() for h in post["hashtags"])):
                                continue
                    posts.append(post)
                except Exception:
                    continue

        if posts:
            return posts

    return []


def fetch_posts(keyword: str, platform: str = "x", use_live: bool = True, limit: int = 100) -> list[dict]:
    cache_key = f"{keyword}:{platform}:{use_live}"

    # L1: in-memory cache
    if cache_key in _cache:
        data, ts = _cache[cache_key]
        if time.time() - ts < CACHE_TTL:
            return data

    # Stampede guard: only one thread fetches per cache_key; others wait and read cache.
    with _inflight_mutex:
        # Re-check after acquiring lock — another thread may have just populated cache
        if cache_key in _cache:
            data, ts = _cache[cache_key]
            if time.time() - ts < CACHE_TTL:
                return data

        if cache_key in _inflight:
            # Another thread is already fetching — wait for it
            event = _inflight[cache_key]
            is_fetcher = False
        else:
            event = threading.Event()
            _inflight[cache_key] = event
            is_fetcher = True

    if not is_fetcher:
        event.wait(timeout=120)
        # Return whatever the fetching thread put in cache (or fall back to CSV)
        cached = _cache.get(cache_key)
        return cached[0] if cached else fetch_from_csv(keyword, platform)

    # This thread owns the fetch
    try:
        posts = None

        # L2: MongoDB — always check first (serves seeded dataset + any prior Apify results)
        # Apify is only called if posts are completely absent from the DB for this keyword.
        try:
            from db import load_posts
            posts = load_posts(keyword, platform)
        except Exception:
            posts = None

        if not posts and use_live and APIFY_API_KEY:
            # L3: Apify — only ONE call fires per keyword thanks to the lock above
            posts = fetch_from_apify(keyword, platform, limit)
            if posts:
                try:
                    from db import save_posts
                    save_posts(posts, keyword, source="apify")
                except Exception:
                    pass
            else:
                print("[Apify] No data returned, falling back to CSV")

        if not posts:
            posts = fetch_from_csv(keyword, platform)

        _cache[cache_key] = (posts, time.time())
        return posts
    finally:
        # Release waiting threads regardless of success or failure
        with _inflight_mutex:
            _inflight.pop(cache_key, None)
        event.set()
