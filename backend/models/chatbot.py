import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# Enhanced knowledge base with definitions and dashboard context
SMA_KNOWLEDGE = {
    1: {"title": "Sentiment Analysis", "definition": "Sentiment Analysis identifies emotional tone (Positive, Negative, Neutral).", "dashboard": "Module 1 uses VADER algorithm."},
    2: {"title": "Trending Topics", "definition": "Trending Topics identify frequent keywords/hashtags.", "dashboard": "Module 2 tracks real-time frequencies."},
    5: {"title": "Fake News Detection", "definition": "Fake News Detection uses ML to verify credibility.", "dashboard": "Module 5 gives Credibility Scores."},
    8: {"title": "Ad Campaign & ROI", "definition": "ROI (Return on Investment) measures marketing profitability.", "dashboard": "Module 8 tracks ROI, CTR, and Conversion."},
    11: {"title": "Competitor Analysis", "definition": "Benchmarking compares performance against rivals.", "dashboard": "Module 11 uses Cosine Similarity."},
    12: {"title": "Popularity Prediction", "definition": "Forecasting future reach and virality using ML.", "dashboard": "Module 12 estimates future reach."},
    9: {"title": "Influencer Detection", "definition": "Identifies high-impact users for partnerships.", "dashboard": "Module 9 ranks users by reach."}
}

def get_live_data_summary(keyword):
    """Pull real data from local modules to give to Gemini."""
    try:
        from . import sentiment, trending
        from db import load_posts
        posts = load_posts(keyword, "x")
        if posts:
            sent = sentiment.analyze(posts)
            trend = trending.analyze(posts)
            return (
                f"Current Dashboard Data for {keyword}:\n"
                f"- Dominant Sentiment: {sent['dominant']} ({sent['total']} posts)\n"
                f"- Top Trending Hashtag: {trend['top_tag']} with {trend['top_count']} mentions\n"
            )
    except:
        pass
    return ""

def get_chat_response(message: str, context: dict = None) -> str:
    msg = message.strip()
    keyword = context.get("keyword", "Tesla") if context else "Tesla"
    
    # Get live data for context
    live_data = get_live_data_summary(keyword)
    
    if model:
        try:
            # Construct a comprehensive prompt for Gemini
            prompt = f"""
            You are a premium AI Assistant for a Social Media Analytics (SMA) Dashboard.
            
            USER CONTEXT:
            - The user is currently looking at analytics for: {keyword}
            - {live_data}
            
            DASHBOARD MODULES:
            - Module 1: Sentiment Analysis (VADER)
            - Module 2: Trending Topics
            - Module 5: Fake News Detection (AI Classifier)
            - Module 8: Ad Campaign Optimization (ROI, CTR, Conversion)
            - Module 11: Competitor Analysis (Cosine Similarity)
            - Module 12: Popularity Prediction (ML Forecasting)
            
            INSTRUCTIONS:
            - If the user asks about a specific person or brand, provide a 1-2 line description first, then talk about their current trends using the data provided above.
            - If they ask about a metric (like ROI), define it first, then tell them where to find it on the dashboard.
            - Keep responses professional, helpful, and concise. Use markdown (bolding, lists) for readability.
            
            USER MESSAGE: {msg}
            """
            
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            return "I am currently using my local knowledge base. " + get_local_fallback(msg, keyword, live_data)
    else:
        return get_local_fallback(msg, keyword, live_data)

def get_local_fallback(msg, keyword, live_data):
    # (Existing rule-based logic for when API is unavailable)
    return f"I can explain any of our 12 modules, or give you insights on {keyword}. What's on your mind?"
