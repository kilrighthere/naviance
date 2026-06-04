from fastapi import FastAPI
from .schemas import PredictionRequest
from .predictor import predict_spending

from .model_loader import model
from .model_loader import scaler


app = FastAPI(
    title="Naviance ML Service"
)

@app.get("/")
def root():
    return {
        "service": "Naviance ML Service",
        "status": "running"
    }

@app.get("/info")
def info():
    return {
        "model_input_shape": str(model.input_shape),
        "scaler_type": str(type(scaler))
    }

@app.get("/")
def health():
    return {
        "status": "ok"
    }

@app.post("/predict")
def predict(request: PredictionRequest):
    result = predict_spending(
        request.features
    )

    return result