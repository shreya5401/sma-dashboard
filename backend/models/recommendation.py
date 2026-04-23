from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def analyze(posts: list[dict]) -> dict:
    if len(posts) < 2:
        return {"recommendations": [], "method": "TF-IDF Cosine Similarity"}

    texts = [p["text"] for p in posts]
    try:
        vectorizer = TfidfVectorizer(max_features=500, stop_words="english")
        matrix = vectorizer.fit_transform(texts)
        sim = cosine_similarity(matrix)

        scores = sorted(enumerate(sim[0]), key=lambda x: x[1], reverse=True)[1:5]
        recs = []
        for idx, score in scores:
            p = posts[idx]
            title = p["text"][:60] + "..." if len(p["text"]) > 60 else p["text"]
            recs.append({
                "title": title,
                "score": round(score * 100),
                "type": "Content-Based" if score > 0.4 else "Collaborative",
                "author": p["author"],
            })
        return {"recommendations": recs, "method": "TF-IDF Cosine Similarity"}
    except Exception as e:
        return {"recommendations": [], "method": "error", "error": str(e)}
