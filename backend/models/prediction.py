import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler


def _features(post: dict) -> list:
    text = post.get("text", "")
    try:
        dt = datetime.fromisoformat(post["created_at"].replace("Z", "+00:00"))
        hour, dow = dt.hour, dt.weekday()
    except Exception:
        hour, dow = 12, 0
    return [
        len(text), text.count("#"), text.count("@"),
        int("http" in text), text.count("!"),
        hour, dow, post.get("followers", 0),
    ]


def analyze(posts: list[dict]) -> dict:
    if len(posts) < 5:
        return {"historical": [], "predicted": [], "confidence": 0, "model": "RandomForest", "r_squared": 0}

    X = np.array([_features(p) for p in posts], dtype=float)
    y = np.array([p.get("likes", 0) + p.get("retweets", 0) for p in posts], dtype=float)

    split = max(int(len(posts) * 0.8), 3)
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X[:split])

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_train_s, y[:split])
    r2 = max(0.0, model.score(X_train_s, y[:split]))

    day_labels = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1"]
    historical = []
    for i, label in enumerate(day_labels[-min(6, len(posts)):]):
        historical.append({"day": label, "actual": int(y[i]), "predicted": None})

    # Bridge: last historical point also gets a prediction
    if historical:
        bridge_pred = max(0, int(model.predict(scaler.transform(X[split - 1:split]))[0]))
        historical[-1]["predicted"] = bridge_pred

    # Future predictions: mutate last feature vector slightly
    future_X = X[-1:].copy()
    predicted = []
    for day in ["D+1", "D+2", "D+3"]:
        future_X[0][5] = (future_X[0][5] + 8) % 24
        pred = max(0, int(model.predict(scaler.transform(future_X))[0]))
        predicted.append({"day": day, "actual": None, "predicted": pred})

    return {
        "historical": historical,
        "predicted": predicted,
        "confidence": round(min(r2 * 100, 99.0), 1),
        "model": "RandomForest",
        "r_squared": round(r2, 3),
    }
