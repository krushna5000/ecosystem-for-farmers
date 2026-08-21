from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pickle

# -------------------------------------------------
# Load preprocessing artifacts
# -------------------------------------------------
with open("stress_scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

with open("crop_encoder.pkl", "rb") as f:
    crop_encoder = pickle.load(f)

with open("stage_encoder.pkl", "rb") as f:
    stage_encoder = pickle.load(f)

# -------------------------------------------------
# Load NEW multi-disease ANN model ONLY
# -------------------------------------------------
with open("disease_probability_ann_multi.pkl", "rb") as f:
    model = pickle.load(f)

# -------------------------------------------------
# FastAPI app
# -------------------------------------------------
app = FastAPI(
    title="Wheat Multi-Disease Prediction API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://zeocrop.farmseasy.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Input schema
# -------------------------------------------------
class DiseaseInput(BaseModel):
    crop: str
    growth_stage: str

    vegetation_stress_score: float
    water_stress_score: float
    soil_stress_score: float
    final_stress_percent: float

    gdd_min: float
    gdd_max: float


# -------------------------------------------------
# Prediction endpoint
# -------------------------------------------------
@app.post("/predict-disease")
def predict_disease(data: DiseaseInput):

    try:
        crop_enc = crop_encoder.transform([data.crop])[0]
        stage_enc = stage_encoder.transform([data.growth_stage])[0]
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid crop or growth_stage"
        )

    X = np.array([[
        data.vegetation_stress_score,
        data.water_stress_score,
        data.soil_stress_score,
        data.final_stress_percent,
        data.gdd_min,
        data.gdd_max,
        crop_enc,
        stage_enc
    ]])

    X_scaled = scaler.transform(X)
    preds = model.predict(X_scaled)[0]

    disease_probs = {
        "yellow_rust": round(float(preds[0]), 4),
        "brown_rust": round(float(preds[1]), 4),
        "fusarium_head_blight": round(float(preds[2]), 4),
        "powdery_mildew": round(float(preds[3]), 4),
        "leaf_blight": round(float(preds[4]), 4),
        "root_rot": round(float(preds[5]), 4),
        "smut": round(float(preds[6]), 4)
    }

    dominant_disease = max(disease_probs, key=disease_probs.get)

    return {
        "disease_probabilities": disease_probs,
        "dominant_disease": dominant_disease
    }


# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
