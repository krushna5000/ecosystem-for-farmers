
# 🌾 Crop Disease Risk Prediction API

A **knowledge-driven + machine learning–based** system to estimate **crop disease risk percentages** based on crop type, growth stage, vegetation indices, and weather conditions.

This API is designed for **real-world agricultural decision support**, not just academic prediction.

---

## What This System Does

Given:

* Crop name
* Crop growth stage
* Vegetation indices (NDVI, NDWI)
* Minimum & maximum temperature
* Humidity

The system returns:

* **All biologically valid diseases** for that crop and stage
* A **risk percentage** for each disease
* A **risk level** (`low`, `medium`, `high`)

Example output:

```json
{
  "crop": "chickpea",
  "stage": "flowering",
  "risk": {
    "ascochyta blight (ascochyta rabiei)": {
      "percentage": 33.29,
      "level": "medium"
    },
    "aphids (aphis craccivora)": {
      "percentage": 33.45,
      "level": "medium"
    }
  }
}
```

---

##  System Architecture (Important)

This system follows a **two-layer design**:

### 1️⃣ Knowledge Layer (Rule-based)

* Maintains a **Crop + Stage → Disease mapping**
* Ensures:

  * No impossible diseases are predicted
  * No stage-irrelevant diseases appear
* Stored as:

  ```
  stage_disease_map.pkl
  ```

### 2️⃣ Risk Scoring Layer

* A TensorFlow neural network (TabNet-style MLP)
* Predicts **risk probability**, not disease existence
* ML answers:

  > “How risky is this disease under current conditions?”

This separation is **intentional and critical**.

---

## ❌ What This Model Does NOT Do

* ❌ It does NOT “discover” diseases
* ❌ It does NOT guarantee outbreaks
* ❌ It does NOT replace agronomy rules
* ❌ It does NOT predict yield loss

It provides **risk estimation for monitoring and preventive action**.

---

## 🤖 Model Details

### Model Type

* TensorFlow / Keras neural network
* Tabular data–optimized (TabNet-style blocks)

### Input Features (8 total)

| Feature       | Description              |
| ------------- | ------------------------ |
| `crop_enc`    | Encoded crop name        |
| `stage_enc`   | Encoded crop stage       |
| `disease_enc` | Encoded disease name     |
| `ndvi`        | Vegetation health index  |
| `ndwi`        | Water stress index       |
| `min_temp`    | Minimum temperature (°C) |
| `max_temp`    | Maximum temperature (°C) |
| `humidity`    | Relative humidity (%)    |

### Output

* Single sigmoid value → converted to **risk percentage**

### Loss Function

* Binary Cross-Entropy

### Why Not Multi-Label Classification?

Because:

* Disease existence is **domain knowledge**
* ML should estimate **risk, not biology**
* This avoids contradictory labels and hallucinations

---

## 📂 Project Structure

```
crop-disease-risk-api/
│
├── app.py                         # FastAPI application
├── README.md                      # This file
├── requirements.txt
│
├── saved_model/
│   ├── Crop_Ai_and_disease_risk_tabnet.keras
│   ├── encodings.json
│   └── stage_disease_map.pkl
```

---

## 🚀 Running the API Locally

### 1️⃣ Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 2️⃣ Start the server (Windows / Linux)

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

### 3️⃣ Open Swagger UI

```
http://localhost:8000/docs
```

---

## 📡 API Endpoints

---

### ✅ Health Check

**Endpoint**

```
GET /health
```

**Response**

```json
{
  "status": "ok",
  "model_loaded": true
}
```

Used by:

* Load balancers
* Docker/Kubernetes
* Monitoring systems

---

### 🌱 Predict Disease Risk

**Endpoint**

```
POST /predict/disease-risk
```

---

### Request Body

```json
{
  "crop": "chickpea",
  "stage": "flowering",
  "ndvi": 2,
  "ndwi": 3,
  "min_temp": 22,
  "max_temp": 30,
  "humidity": 85
}
```

---

### Response Body

```json
{
  "crop": "chickpea",
  "stage": "flowering",
  "risk": {
    "ascochyta blight (ascochyta rabiei)": {
      "percentage": 33.29,
      "level": "medium"
    },
    "aphids (aphis craccivora)": {
      "percentage": 33.45,
      "level": "medium"
    }
  }
}
```

---

## 📊 Risk Interpretation

| Percentage | Level  | Meaning                   |
| ---------- | ------ | ------------------------- |
| `< 20%`    | Low    | Unfavorable conditions    |
| `20–40%`   | Medium | Monitor closely           |
| `> 40%`    | High   | Preventive action advised |

⚠️ Percentages represent **relative activation risk**, not crop loss.

---

## 🔐 Important Engineering Notes

### DO NOT:

* Retrain the model inside the API
* Modify encodings.json
* Modify stage_disease_map.pkl
* One-hot encode categorical inputs
* Normalize risk scores to sum to 100

### ALWAYS:

* Keep model + encodings + mapping together
* Restart API after model updates
* Validate crop and stage inputs

---

## 🧪 Testing Tips

* Change **humidity** to see fungal risk shift
* Change **temperature** to observe disease sensitivity
* NDVI / NDWI control stress-related diseases

---

## 🐳 Deployment Notes

* API is stateless
* Thread-safe
* Safe for concurrent requests
* Suitable for:

  * Docker
  * Kubernetes
  * Cloud Run
  * EC2 / VM deployment

---

## 🛣️ Roadmap (Optional Enhancements)

* Live weather API integration
* Disease severity estimation
* Region-specific calibration
* Time-series risk tracking
* Alert thresholds per crop

---

## 👨‍💻 Ownership & Handoff

This repository can be handed directly to:

* Backend engineers
* DevOps teams
* Frontend integrators

No ML retraining knowledge is required to deploy or use the API.

---

##  Final Status

✔ Production-ready
✔ Domain-safe
✔ Explainable
✔ Extensible

---

