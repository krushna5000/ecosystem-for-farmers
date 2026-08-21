from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import json
import pickle

# ---------------------------
# App init
# ---------------------------
app = FastAPI(title="Crop Disease Risk API")

# ---------------------------
# Load model & assets ONCE
# ---------------------------
MODEL_PATH = "saved_model/Crop_Ai_and_disease_risk_tabnet.keras"
ENCODINGS_PATH = "saved_model/encodings.json"
STAGE_DISEASE_MAP_PATH = "saved_model/stage_disease_map.pkl"

try:
    model = tf.keras.models.load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

with open(ENCODINGS_PATH, "r") as f:
    encodings = json.load(f)

with open(STAGE_DISEASE_MAP_PATH, "rb") as f:
    stage_disease_map = pickle.load(f)

# ---------------------------
# Request schema
# ---------------------------
class DiseaseRiskRequest(BaseModel):
    crop: str
    stage: str
    ndvi: float
    ndwi: float
    min_temp: float
    max_temp: float
    humidity: float


# ---------------------------
# Risk band helper
# ---------------------------
def risk_band(value: float) -> str:
    if value < 20:
        return "low"
    elif value < 40:
        return "medium"
    else:
        return "high"


# ---------------------------
# Core prediction logic
# ---------------------------
def predict_disease_risk(payload: DiseaseRiskRequest):

    crop = payload.crop.strip().lower()
    stage = payload.stage.strip().lower()

    # -------------------------------
    # Validate crop & stage
    # -------------------------------
    if crop not in encodings["crop"]:
        raise HTTPException(status_code=400, detail=f"Unknown crop: {crop}")

    if stage not in encodings["stage"]:
        raise HTTPException(status_code=400, detail=f"Unknown stage: {stage}")

    # -------------------------------
    # Fetch diseases for crop + stage
    # -------------------------------
    diseases = stage_disease_map.get((crop, stage))

    if diseases is None or len(diseases) == 0:
        raise HTTPException(
            status_code=400,
            detail=f"No diseases mapped for crop='{crop}', stage='{stage}'"
        )

    results = {}

    # -------------------------------
    # Score each disease
    # -------------------------------
    for disease in diseases:

        if disease not in encodings["disease"]:
            raise HTTPException(
                status_code=500,
                detail=f"Disease '{disease}' missing in encodings.json"
            )

        x = np.array(
            [[
                encodings["crop"][crop],
                encodings["stage"][stage],
                encodings["disease"][disease],
                payload.ndvi,
                payload.ndwi,
                payload.min_temp,
                payload.max_temp,
                payload.humidity
            ]],
            dtype="float32"
        ).reshape(1, -1)

        prob = model.predict(x, verbose=0)[0][0]
        percentage = round(float(prob * 100), 2)

        results[disease] = {
            "percentage": percentage,
            "level": risk_band(percentage)
        }

    # -------------------------------
    # Sort by descending risk
    # -------------------------------
    return dict(
        sorted(
            results.items(),
            key=lambda x: x[1]["percentage"],
            reverse=True
        )
    )


# ---------------------------
# Health endpoint
# ---------------------------
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": True
    }


# ---------------------------
# Prediction API endpoint
# ---------------------------
@app.post("/predict/disease-risk")
def disease_risk_api(payload: DiseaseRiskRequest):

    risk = predict_disease_risk(payload)

    return {
        "crop": payload.crop,
        "stage": payload.stage,
        "risk": risk
    }


# ---------------------------
# Optional: allow `python app.py`
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
