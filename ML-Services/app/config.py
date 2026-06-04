from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "model" / "naviance_nn_model.keras"

SCALER_PATH = BASE_DIR / "model" / "naviance_nn_scaler.joblib"