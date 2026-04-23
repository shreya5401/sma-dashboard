import os
import threading
from datetime import datetime, timezone

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

MONGODB_URI = os.getenv("MONGODB_URI", "")

_db = None
_db_lock = threading.Lock()


def get_db():
    global _db
    if _db is not None:  # fast path — no lock needed once connected
        return _db
    if not MONGODB_URI:
        return None
    with _db_lock:  # only one thread connects; others wait then hit the fast path
        if _db is not None:
            return _db
        try:
            from pymongo import MongoClient, ASCENDING, DESCENDING
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
            client.admin.command("ping")
            _db = client["sma_db"]
            _db["posts"].create_index(
                [("post_id", ASCENDING), ("platform", ASCENDING)], unique=True
            )
            _db["posts"].create_index(
                [("keyword", ASCENDING), ("fetched_at", DESCENDING)]
            )
            _db["scrape_sessions"].create_index(
                [("keyword", ASCENDING), ("platform", ASCENDING), ("fetched_at", DESCENDING)]
            )
            print("[DB] Connected to MongoDB")
        except Exception as e:
            print(f"[DB] MongoDB connection failed: {e}")
            _db = None
    return _db


def save_posts(posts: list[dict], keyword: str, source: str = "apify") -> None:
    db = get_db()
    if db is None or not posts:
        return
    try:
        from pymongo import UpdateOne
        now = datetime.now(timezone.utc)
        ops = [
            UpdateOne(
                {"post_id": p["id"], "platform": p.get("platform", "x")},
                {"$set": {**p, "post_id": p["id"], "keyword": keyword,
                          "fetched_at": now, "source": source}},
                upsert=True,
            )
            for p in posts
        ]
        db["posts"].bulk_write(ops, ordered=False)
        db["scrape_sessions"].insert_one({
            "keyword": keyword,
            "platform": posts[0].get("platform", "x"),
            "fetched_at": now,
            "count": len(posts),
            "source": source,
        })
        print(f"[DB] Saved {len(posts)} posts for '{keyword}'")
    except Exception as e:
        print(f"[DB] save_posts failed: {e}")


def load_posts(keyword: str, platform: str) -> list[dict] | None:
    """Return all posts for keyword from DB. Returns None only if no posts exist at all."""
    db = get_db()
    if db is None:
        return None
    try:
        posts = list(db["posts"].find(
            {"keyword": keyword, "platform": platform},
            {"_id": 0, "post_id": 0, "fetched_at": 0, "source": 0},
        ))
        if posts:
            print(f"[DB] Loaded {len(posts)} posts for '{keyword}' from MongoDB")
            return posts
    except Exception as e:
        print(f"[DB] load_posts failed: {e}")
    return None
