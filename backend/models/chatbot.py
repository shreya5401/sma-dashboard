import os

# Context about the application for the chatbot
SMA_KNOWLEDGE = {
    1: "Sentiment Analysis: Analyzes the emotional tone (Positive, Negative, Neutral) of social media posts using VADER.",
    2: "Trending Topics: Uses frequency analysis to identify the most discussed keywords and hashtags for a brand.",
    3: "Network Analysis: Visualizes connections between users, mentions, and hashtags to find community clusters.",
    4: "Recommendation System: Suggests new content or users to follow based on engagement patterns.",
    5: "Fake News Detection: An AI classifier that flags sensationalist or suspicious text based on learned misinformation patterns.",
    6: "User Segmentation: Uses clustering (K-Means) to group users by age, gender, and interests.",
    7: "Data Visualization: Provides a deep dive into engagement metrics (likes, retweets, impressions) over time.",
    8: "Ad Campaign: Tracks advertising performance metrics like CTR, Conversion Rate, and ROI (Return on Investment).",
    9: "Influencer Detection: Identifies high-impact users who have the most reach and influence for a specific brand.",
    10: "Real-time Monitoring: Provides a live feed of incoming posts and immediate sentiment shifts.",
    11: "Competitor Analysis: Benchmark your brand against rivals on Growth, Engagement, and Strategy scores.",
    12: "Popularity Prediction: A predictive model that estimates the future reach and virality of a post before it's published."
}

def get_chat_response(message: str) -> str:
    msg = message.lower()
    
    # Handle "Module X" queries
    import re
    module_match = re.search(r"module\s*(\d+)", msg)
    if module_match:
        mod_num = int(module_match.group(1))
        if mod_num in SMA_KNOWLEDGE:
            return f"Module {mod_num} is {SMA_KNOWLEDGE[mod_num]}"
        else:
            return f"We have 12 modules in total. Module {mod_num} doesn't exist yet!"

    if "how" in msg and ("work" in msg or "use" in msg):
        return "Search for a brand (e.g., Tesla) in the search bar. All 12 modules will then analyze the data and update their charts instantly."
    
    if "competitor" in msg or "benchmark" in msg:
        return f"Module 11 (Competitor Analysis) {SMA_KNOWLEDGE[11]}"
    
    if "roi" in msg or "ad" in msg or "campaign" in msg:
        return f"Module 8 (Ad Campaign) {SMA_KNOWLEDGE[8]}"
    
    if "fake" in msg or "news" in msg:
        return f"Module 5 (Fake News Detection) {SMA_KNOWLEDGE[5]}"

    if "segment" in msg or "cluster" in msg:
        return f"Module 6 (User Segmentation) {SMA_KNOWLEDGE[6]}"

    if "predict" in msg or "future" in msg:
        return f"Module 12 (Popularity Prediction) {SMA_KNOWLEDGE[12]}"

    if "brand" in msg or "search" in msg:
        return "You can search for: Tesla, Apple, Samsung, Google, Meta, Microsoft, Amazon, Netflix, or OpenAI."

    return "I can explain any of our 12 modules (just ask for 'Module 11' etc.), help with ROI, or show you how to search for brands. What's on your mind?"
