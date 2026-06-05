import tensorflow as tf
import joblib

from .config import MODEL_PATH
from .config import SCALER_PATH
import joblib

loaded = joblib.load(SCALER_PATH)

scaler = loaded["scaler"]

print(type(scaler))
print(scaler)

model = tf.keras.models.load_model(MODEL_PATH)

# scaler = joblib.load(SCALER_PATH)