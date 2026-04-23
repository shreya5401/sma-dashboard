"""
One-time script to seed MongoDB from the full dataset CSV.
Run once:  python seed_db.py

After seeding, all 12 API modules will use this data automatically.
Apify calls will upsert new posts on top without replacing existing data.
"""
import csv
import os
import sys

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "social_media_analytics_full_dataset_with_demographics.csv")


def normalize_row(row: dict) -> dict:
    hashtags = [h.strip().lstrip("#") for h in row.get("hashtags", "").split() if h.strip()]
    mentions = [m.strip().lstrip("@") for m in row.get("mentions", "").split() if m.strip()]

    def _int(val):
        try:
            return int(float(val or 0))
        except (ValueError, TypeError):
            return 0

    def _float(val):
        try:
            return float(val or 0)
        except (ValueError, TypeError):
            return 0.0

    return {
        # Standard fields expected by all 12 ML models
        "id": str(row["tweet_id"]),
        "text": row.get("text", ""),
        "author": row.get("user", "unknown"),
        "followers": _int(row.get("followers")),
        "likes": _int(row.get("likes")),
        "retweets": _int(row.get("retweets")),
        "replies": _int(row.get("replies")),
        "hashtags": hashtags,
        "created_at": row.get("date", ""),
        "platform": "x",
        # Extra fields from dataset (used by ad_campaign, fake_news, segmentation models)
        "sentiment_label": row.get("sentiment", ""),
        "fake_label": row.get("fake_label", ""),
        "engagement_rate": _float(row.get("engagement_rate")),
        "ctr": _float(row.get("ctr")),
        "conversion_rate": _float(row.get("conversion_rate")),
        "impressions": _int(row.get("impressions")),
        "following": _int(row.get("following")),
        "mentions": mentions,
        "age": _int(row.get("age")),
        "gender": row.get("gender", ""),
        "location": row.get("location", ""),
        "interest": row.get("interest", ""),
    }


def seed():
    from db import get_db, save_posts

    db = get_db()
    if db is None:
        print("ERROR: MongoDB not connected. Set MONGODB_URI in backend/.env and retry.")
        sys.exit(1)

    if not os.path.exists(CSV_PATH):
        print(f"ERROR: CSV not found at {CSV_PATH}")
        sys.exit(1)

    # Group posts by brand/keyword
    brand_posts: dict[str, list] = {}
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            keyword = row.get("brand", "unknown").strip()
            if not keyword:
                continue
            brand_posts.setdefault(keyword, []).append(normalize_row(row))

    print(f"Found {sum(len(v) for v in brand_posts.values())} rows across {len(brand_posts)} brands.\n")

    total = 0
    for keyword, posts in brand_posts.items():
        save_posts(posts, keyword, source="dataset")
        total += len(posts)
        print(f"  {keyword}: {len(posts)} posts seeded")

    print(f"\nDone. {total} posts stored in MongoDB.")
    print("The app will now serve this data without calling Apify.")
    print("New Apify scrapes will upsert fresh posts on top.")


if __name__ == "__main__":
    seed()
