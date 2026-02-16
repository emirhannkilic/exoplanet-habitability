# Exoplanet ML Service (FastAPI)

This service serves the trained exoplanet pipeline as an HTTP API:
- **Stage 1**: Predicts planetary mass (log-transform regression model)
- **Stage 2**: Predicts equilibrium temperature (Random Forest)
- **Stage 3**: Computes **Earth Similarity Index (ESI)** and a habitability class (**High / Moderate / Low**)

It is designed to be called by the Node API (`backend/node-api`) as an internal service.

---

## Stack

- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Python**: 3.9+ (recommended)
- **ML**: scikit-learn + joblib
- **Math**: numpy
- **Default port**: `5001`

Dependencies are listed in `requirements.txt`.

---

## Model Artifacts (Required)

On startup, the service loads models from the repo-root `models/` folder:

- `models/stage1_V2_lr_log.pkl`
- `models/stage2_FINAL_model.pkl`

Path resolution note:
- `backend/ml-service/app.py` resolves `MODELS_DIR` as `../../models` (relative to `backend/ml-service/`).

If these files are missing, the service will fail at startup.

---

## Project Structure

```text
backend/ml-service/
├── app.py
├── requirements.txt
├── README.md
└── .venv/                 # optional local virtualenv
```

---

## API

### GET `/health`

Returns service status and whether models are loaded.

**Example response**
```json
{
  "status": "OK",
  "service": "Exoplanet ML Service",
  "models_loaded": true
}
```

---

### POST `/predict`

Takes planet + host-star features and returns mass/temp predictions + ESI + class.

**Request body**
```json
{
  "radius": 1.0,
  "orbital_period": 365.0,
  "star_mass": 1.0,
  "star_teff": 5778.0,
  "semi_major_axis": 1.0
}
```

**Success response**
```json
{
  "predicted_mass": 0.95,
  "predicted_temp": 290.12,
  "esi_score": 0.83,
  "habitability": "High",
  "components": {
    "esi_radius": 0.98,
    "esi_mass": 0.97,
    "esi_temp": 0.99
  }
}
```

**Notes**
- Inputs are validated by Pydantic (must be numbers > 0).
- Habitability thresholds:
  - `High`: ESI >= 0.8
  - `Moderate`: 0.5 <= ESI < 0.8
  - `Low`: ESI < 0.5

---

## Setup & Run (Local)

From repo root:

```bash
cd backend/ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 5001
```

Open:
- Health: `http://127.0.0.1:5001/health`
- Docs (Swagger): `http://127.0.0.1:5001/docs`

---

## Integration (with Node API)

The Node API calls this service via:

- `ML_SERVICE_URL` (see `backend/node-api/.env.example`)
- Default: `http://127.0.0.1:5001`

Flow:
```text
Client → Node API (3000) → ML Service (5001) → Node API → Client
```

---

## Troubleshooting

### Models not found

If you see an error like “Stage 1 model not found”, ensure the repo-root `models/` directory exists and contains:

- `stage1_V2_lr_log.pkl`
- `stage2_FINAL_model.pkl`

### Port already in use

Run on a different port:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 5002
```

Then update Node’s `ML_SERVICE_URL` accordingly.