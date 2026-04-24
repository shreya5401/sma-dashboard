import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = None
if os.getenv("GROQ_API_KEY"):
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Technical definitions for core metrics
CONCEPT_DEFINITIONS = {
    "roi": "Return on Investment (ROI) is a critical financial metric used to evaluate the efficiency or profitability of an investment. In marketing, it is (Net Profit / Cost) x 100.",
    "sentiment": "Sentiment Analysis uses VADER NLP to categorize the emotional tone of text as Positive, Negative, or Neutral.",
    "virality": "Virality measures the speed and breadth of content spread, often via engagement velocity.",
    "clustering": "Clustering (K-Means) groups users into personas like 'Power Users' based on engagement history.",
    "competitor": "Benchmarking your brand using Cosine Similarity to find relevant rivals dynamically.",
    "prediction": "Uses Random Forest ML to forecast future post reach with a confidence score.",
}

# Detailed module knowledge
SMA_KNOWLEDGE = {
    1: "Module 1 (Sentiment Analysis): Analyzes emotional tone using VADER NLP.",
    2: "Module 2 (Trending Topics): Extracts high-frequency hashtags and keywords.",
    3: "Module 3 (Network Analysis): Visualizes the Social Graph and community hubs.",
    4: "Module 4 (Recommendation): Suggestions on content types and timing.",
    5: "Module 5 (Fake News): NLP classifier for flagging misinformation.",
    6: "Module 6 (Segmentation): K-Means clustering for user personas.",
    7: "Module 7 (Visualization): Central hub for engagement and reach area charts.",
    8: "Module 8 (Ad Campaign): Tracks CTR, Conversion, and ROI metrics.",
    9: "Module 9 (Influencers): Ranks users by reach and impact score.",
    10: "Module 10 (Real-time): Live Pulse tracking mentions per hour.",
    11: "Module 11 (Competitors): AI-driven benchmarking via Cosine Similarity.",
    12: "Module 12 (Prediction): Forecasts future reach before publishing.",
}

SYSTEM_PROMPT = f"""
You are the SMA (Social Media Analytics) Assistant, a premium AI expert. 
You help users understand their marketing dashboard which has 12 specialized modules.

CONTEXT:
- The dashboard supports brands like Tesla, Apple, Samsung, Google, Meta, Microsoft, Amazon, Netflix, and OpenAI.
- If a user searches for a brand, all modules update instantly.
- We use advanced algorithms like VADER for sentiment, K-Means for clustering, Cosine Similarity for competitors, and Random Forest for prediction.

MODULES:
{chr(10).join([f"- {v}" for v in SMA_KNOWLEDGE.values()])}

CORE CONCEPTS:
{chr(10).join([f"- {k.upper()}: {v}" for k, v in CONCEPT_DEFINITIONS.items()])}

GUIDELINES:
1. Be professional, technical yet accessible, and helpful.
2. If asked about a module (e.g. 'Module 8'), explain it using the context above.
3. If asked about a concept (e.g. 'What is ROI?'), give a clear definition first, then explain how it fits into the dashboard.
4. For single-word queries like 'Elon' or 'Modi', suggest using the search bar for a full 12-module analysis.
5. Use markdown for better readability.
"""

def get_chat_response(message: str) -> str:
    msg = message.lower()
    
    # 1. Try Groq LLM first
    if client:
        try:
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=500,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Error: {e}")
            # Fallback to local logic if API fails

    # 2. Local Logic (Fallback)
    module_match = re.search(r"module\s*(\d+)", msg)
    if module_match:
        mod_num = int(module_match.group(1))
        if mod_num in SMA_KNOWLEDGE:
            return f"🛠️ **Dashboard Context:** {SMA_KNOWLEDGE[mod_num]}"

    if len(msg.split()) == 1 and len(msg) > 2:
        return f"Interested in **{message.strip()}**? Type it into the search bar for a full 12-module analysis!"

    return "I can explain any of our 12 modules, define key metrics (ROI, Sentiment), or help with brand searches. What's on your mind?"
