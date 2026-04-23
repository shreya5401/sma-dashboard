import os
from apify_client import ApifyClient
from dotenv import load_dotenv

load_dotenv()

client = ApifyClient(os.getenv("APIFY_API_KEY"))

def fetch_tweets(keyword: str, max_tweets: int = 100):
    print(f"Fetching tweets for: {keyword}")
    
    run = client.actor("apidojo/tweet-scraper").call(run_input={
        "searchTerms": [keyword],
        "maxTweets": max_tweets,
        "addUserInfo": True,
    })
    
    tweets = []
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        tweets.append({
            "text": item.get("text", ""),
            "username": item.get("author", {}).get("userName", ""),
            "followers": item.get("author", {}).get("followers", 0),
            "likes": item.get("likeCount", 0),
            "retweets": item.get("retweetCount", 0),
            "date": item.get("createdAt", ""),
            "hashtags": item.get("hashtags", []),
        })
    
    print(f"Fetched {len(tweets)} tweets")
    return tweets