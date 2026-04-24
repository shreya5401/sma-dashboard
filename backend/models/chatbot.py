import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
# Also look in the same directory as this file
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, "../../.env") # If in models/
load_dotenv(env_path)
env_path_v2 = os.path.join(current_dir, "../.env") # If in backend/
load_dotenv(env_path_v2)

# Initialize Groq client
client = None
api_key = os.getenv("GROQ_API_KEY")
if api_key:
    print(f"[Chatbot] Groq API Key found. Initializing client...")
    client = Groq(api_key=api_key)
else:
    print(f"[Chatbot] WARNING: GROQ_API_KEY not found in environment.")

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
- The dashboard supports Brands, Public Figures, and Celebrities (e.g., Tesla, Apple, Elon Musk, Narendra Modi, etc.).
- If a user searches for a brand or person, all modules update instantly.
- We use advanced algorithms like VADER for sentiment, K-Means for clustering, Cosine Similarity for competitors/peers, and Random Forest for prediction.

MODULES:
{chr(10).join([f"- {v}" for v in SMA_KNOWLEDGE.values()])}

CORE CONCEPTS:
{chr(10).join([f"- {k.upper()}: {v}" for k, v in CONCEPT_DEFINITIONS.items()])}

FORMATTING RULES:
1. ALWAYS use standard ATX-style Markdown headers (e.g., # Header 1, ## Header 2).
2. NEVER use 'Setext' style headers (NEVER underline titles with '====' or '----').
3. Use bold **text** for key terms and brand names.
4. Use bulleted lists for technical features.
5. Ensure there is a blank line before and after every header.
6. If mentioning the current brand (e.g. Tesla), always bold it like **Tesla**.

CONCISENESS RULES:
1. Keep your opening summary of the brand to exactly 1-2 sentences.
2. For each module, provide exactly 1-2 lines of insight using the LIVE STATS provided.
3. COMPLETENESS: If asked for a 'Full Summary' or 'All Modules', you MUST list all 12 modules (1 through 12). DO NOT SKIP ANY.
4. If a response is very long, ensure it is well-structured with clear headers so the user can scroll through it.

GUIDELINES:
1. Be professional, technical yet accessible, and helpful.
2. ALWAYS acknowledge the current brand being analyzed (provided in context) in your opening sentence.
3. If asked about a module (e.g. 'Module 8'), explain it using the context above.
4. If asked about a concept (e.g. 'What is ROI?'), give a clear definition first, then explain how it fits into the dashboard.
5. Keep your tone 'Premium' and 'Expert'.
6. Use markdown for better readability.
"""

def get_chat_response(message: str, keyword: str = "the dashboard", competitors: str = "rival brands", live_stats: str = "N/A") -> str:
    msg = message.lower()
    
    # 1. Try Groq LLM first
    if client:
        try:
            # Custom prompt extension with LIVE DATA
            contextual_instruction = f"""
CURRENT DASHBOARD CONTEXT:
- Brand/Person: '{keyword}'
- Identified Competitors: {competitors}
- LIVE STATS FROM DASHBOARD: {live_stats}

INSTRUCTION: 
1. Start with 1-2 sentences about {keyword}.
2. If a full overview is requested, list ALL 12 modules with 1-2 lines of actual data-driven insight for each. 
3. DO NOT cut off the response; ensure you reach Module 12.
"""
            
            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT + contextual_instruction},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=1500,
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
