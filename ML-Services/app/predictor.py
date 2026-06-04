import numpy as np

from .model_loader import model
from .model_loader import scaler

LABELS = {
    0: "Healthy",
    1: "Moderate",
    2: "Critical"
}

def predict_spending(features):

    x = np.array([features])

    x_scaled = scaler.transform(x)

    prediction = model.predict(
        x_scaled,
        verbose=0
    )

    predicted_class = int(
        np.argmax(prediction)
    )

    confidence = float(
        np.max(prediction)
    )

    return {
        "label": LABELS[predicted_class],
        "confidence": confidence,
        "probabilities": prediction[0].tolist()
    }