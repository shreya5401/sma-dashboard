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
    if _db is not None:
        return _db
    if not MONGODB_URI:
        print("[DB] MONGODB_URI not found in environment")
        return None
    with _db_lock:
        if _db is not None:
            return _db
        try:
            from pymongo import MongoClient, ASCENDING, DESCENDING
            from pymongo.errors import ConnectionFailure
            
            # Default to 'sma_db' if no DB name in URI
            db_name = "sma_db"
            if "/" in MONGODB_URI.split("://")[-1]:
                parts = MONGODB_URI.split("/")
                if len(parts) > 3:
                    path = parts[3].split("?")[0]
                    if path:
                        db_name = path

            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            _db = client[db_name]
            
            # Ensure indexes
            _db["posts"].create_index(
                [("post_id", ASCENDING), ("platform", ASCENDING)], unique=True
            )
            _db["posts"].create_index(
                [("keyword", ASCENDING), ("fetched_at", DESCENDING)]
            )
            _db["scrape_sessions"].create_index(
                [("keyword", ASCENDING), ("platform", ASCENDING), ("fetched_at", DESCENDING)]
            )
            _db["influencer_snapshots"].create_index(
                [("keyword", ASCENDING), ("platform", ASCENDING), ("fetched_at", DESCENDING)]
            )
            print(f"[DB] Connected to MongoDB (Database: {db_name})")
        except ConnectionFailure as e:
            print(f"[DB] MongoDB connection failed (Connection Error): {e}")
            _db = None
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
        keyword_clean = keyword.strip().title() # Normalize to 'Amazon', 'Tesla', etc.
        ops = [
            UpdateOne(
                {"post_id": p["id"], "platform": p.get("platform", "x")},
                {"$set": {**p, "post_id": p["id"], "keyword": keyword_clean,
                          "fetched_at": now, "source": source}},
                upsert=True,
            )
            for p in posts
        ]
        db["posts"].bulk_write(ops, ordered=False)
        db["scrape_sessions"].insert_one({
            "keyword": keyword_clean,
            "platform": posts[0].get("platform", "x"),
            "fetched_at": now,
            "count": len(posts),
            "source": source,
        })
        print(f"[DB] Saved {len(posts)} posts for '{keyword_clean}'")
    except Exception as e:
        print(f"[DB] save_posts failed: {e}")


def load_posts(keyword: str, platform: str) -> list[dict] | None:
    """Return all posts for keyword from DB. Returns None only if no posts exist at all."""
    db = get_db()
    if db is None:
        return None
    try:
        # Use case-insensitive search
        posts = list(db["posts"].find(
            {"keyword": {"$regex": f"^{keyword}$", "$options": "i"}, "platform": platform},
            {"_id": 0, "post_id": 0, "fetched_at": 0, "source": 0},
        ))
        if posts:
            print(f"[DB] Loaded {len(posts)} posts for '{keyword}' from MongoDB")
            return posts
    except Exception as e:
        print(f"[DB] load_posts failed: {e}")
    return None


def save_influencer_snapshot(keyword: str, platform: str,
                             scores: dict[str, float]) -> None:
    """Persist a Module 9 centrality snapshot for later trend computation."""
    db = get_db()
    if db is None or not scores:
        return
    try:
        now = datetime.now(timezone.utc)
        db["influencer_snapshots"].insert_one({
            "keyword": keyword.strip().title(),
            "platform": platform,
            "fetched_at": now,
            "scores": scores,
        })
    except Exception as e:
        print(f"[DB] save_influencer_snapshot failed: {e}")


def load_previous_influencer_snapshot(keyword: str,
                                      platform: str) -> dict[str, float] | None:
    """Return the most recent *prior* snapshot's score map (user -> float).

    Returns the second-most-recent document so that saving a fresh snapshot
    before reading doesn't pollute the delta. Callers should load this
    BEFORE saving the new snapshot, but this tolerates either order.
    """
    db = get_db()
    if db is None:
        return None
    try:
        from pymongo import DESCENDING
        docs = list(db["influencer_snapshots"]
                    .find({"keyword": {"$regex": f"^{keyword}$", "$options": "i"},
                           "platform": platform},
                          {"_id": 0, "scores": 1})
                    .sort("fetched_at", DESCENDING)
                    .limit(2))
        if not docs:
            return None
        # Prefer the second-most-recent; fall back to the only one we have.
        return docs[1]["scores"] if len(docs) > 1 else docs[0]["scores"]
    except Exception as e:
        print(f"[DB] load_previous_influencer_snapshot failed: {e}")
        return None
