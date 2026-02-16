import os
import logging
from contextlib import asynccontextmanager

import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "..", "models")

STAGE1_PATH = os.path.join(MODELS_DIR, "stage1_V2_lr_log.pkl")
STAGE2_PATH = os.path.join(MODELS_DIR, "stage2_FINAL_model.pkl")

# ---------------------------------------------------------------------------
# Global model references (populated at startup)
# ---------------------------------------------------------------------------
stage1_model = None
stage2_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global stage1_model, stage2_model

    logger.info("Loading Stage 1 model from %s", STAGE1_PATH)
    if not os.path.exists(STAGE1_PATH):
        raise RuntimeError(f"Stage 1 model not found: {STAGE1_PATH}")
    stage1_model = joblib.load(STAGE1_PATH)
    logger.info("Stage 1 loaded: %s", type(stage1_model).__name__)

    logger.info("Loading Stage 2 model from %s", STAGE2_PATH)
    if not os.path.exists(STAGE2_PATH):
        raise RuntimeError(f"Stage 2 model not found: {STAGE2_PATH}")
    stage2_model = joblib.load(STAGE2_PATH)
    logger.info("Stage 2 loaded: %s", type(stage2_model).__name__)

    yield  # app runs

    logger.info("Shutting down ML service")


app = FastAPI(title="Exoplanet ML Service", lifespan=lifespan)

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    radius: float = Field(..., gt=0, description="Planet radius (Earth radii)")
    orbital_period: float = Field(..., gt=0, description="Orbital period (days)")
    star_mass: float = Field(..., gt=0, description="Host star mass (solar masses)")
    star_teff: float = Field(..., gt=0, description="Star effective temperature (K)")
    semi_major_axis: float = Field(..., gt=0, description="Orbital distance (AU)")


class PredictResponse(BaseModel):
    predicted_mass: float
    predicted_temp: float
    esi_score: float
    habitability: str
    components: dict


# ---------------------------------------------------------------------------
# ESI helpers
# ---------------------------------------------------------------------------
EARTH_RADIUS = 1.0   # Earth radii
EARTH_MASS = 1.0     # reference (pipeline convention)
EARTH_TEMP = 288.0   # Kelvin


def _esi_component(x: float, x_earth: float) -> float:
    """ESI component: 1 - |x - x_earth| / (x + x_earth)"""
    if x <= 0:
        x = 1e-6
    denom = x + x_earth
    if denom == 0:
        denom = 1e-6
    value = 1.0 - abs(x - x_earth) / denom
    return max(0.0, min(1.0, value))


def calculate_esi(radius: float, mass: float, temperature: float) -> dict:
    """Return overall ESI and per-component values."""
    esi_r = _esi_component(radius, EARTH_RADIUS)
    esi_m = _esi_component(mass, EARTH_MASS)
    esi_t = _esi_component(temperature, EARTH_TEMP)

    esi = (esi_r ** 0.57) * (esi_m ** 0.23) * (esi_t ** 0.20)
    esi = max(0.0, min(1.0, esi))

    return {
        "esi": esi,
        "esi_radius": round(esi_r, 6),
        "esi_mass": round(esi_m, 6),
        "esi_temp": round(esi_t, 6),
    }


def classify_habitability(esi: float) -> str:
    if esi >= 0.8:
        return "High"
    elif esi >= 0.5:
        return "Moderate"
    return "Low"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "OK",
        "service": "Exoplanet ML Service",
        "models_loaded": stage1_model is not None and stage2_model is not None,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if stage1_model is None or stage2_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    # Stage 1 – mass prediction (log-transform model)
    s1_features = np.array([[req.radius, req.orbital_period, req.star_mass]])
    pred_mass_log = stage1_model.predict(s1_features)[0]
    pred_mass = float(np.expm1(pred_mass_log))
    pred_mass = max(pred_mass, 1e-6)

    # Stage 2 – temperature prediction (Random Forest)
    s2_features = np.array([[req.star_teff, req.semi_major_axis]])
    pred_temp = float(stage2_model.predict(s2_features)[0])

    # Stage 3 – ESI calculation & habitability
    esi_result = calculate_esi(req.radius, pred_mass, pred_temp)
    habitability = classify_habitability(esi_result["esi"])

    return PredictResponse(
        predicted_mass=round(pred_mass, 6),
        predicted_temp=round(pred_temp, 2),
        esi_score=round(esi_result["esi"], 6),
        habitability=habitability,
        components={
            "esi_radius": esi_result["esi_radius"],
            "esi_mass": esi_result["esi_mass"],
            "esi_temp": esi_result["esi_temp"],
        },
    )
