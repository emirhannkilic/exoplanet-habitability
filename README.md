# Exoplanet Habitability Prediction

A machine learning pipeline that predicts exoplanet habitability by estimating planetary mass and equilibrium temperature, then computing an Earth Similarity Index (ESI).

![Python](https://img.shields.io/badge/Python-3.9+-blue)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-orange)
![Status](https://img.shields.io/badge/status-ML%20Pipeline%20Complete-brightgreen)

---

## Overview

Discovering potentially habitable exoplanets is one of the key goals in modern astrophysics. This project builds a **3-stage ML pipeline** that:

1. **Predicts planetary mass** from observable features (radius, orbital period, host star mass)
2. **Predicts equilibrium temperature** from stellar properties (star effective temperature, semi-major axis)
3. **Calculates the Earth Similarity Index (ESI)** and classifies habitability as High, Moderate, or Low

The pipeline was trained and evaluated on a dataset of **5,986 confirmed exoplanets**.

---

## Pipeline Architecture

```
         Input: Observable Features
                    |
    ┌───────────────┴───────────────┐
    │                               │
    ▼                               ▼
┌──────────────────┐    ┌──────────────────┐
│  STAGE 1: Mass   │    │  STAGE 2: Temp   │
│                  │    │                  │
│  Model: Linear   │    │  Model: Random   │
│  Regression +    │    │  Forest          │
│  Log Transform   │    │                  │
│                  │    │  Features:       │
│  Features:       │    │  - star_teff     │
│  - radius        │    │  - semi_major    │
│  - orbital_period│    │    _axis         │
│  - star_mass     │    │                  │
│  Output:         │    │  Output:         │
│  predicted mass  │    │  predicted temp  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
         ┌──────────────────────┐
         │  STAGE 3: ESI Score  │
         │                      │
         │  Formula-based       │
         │  Inputs:             │
         │  - radius (actual)   │
         │  - mass (predicted)  │
         │  - temp (predicted)  │
         │                      │
         │  Output:             │
         │  ESI ∈ [0, 1]        │
         │  Habitability class  │
         └──────────────────────┘
```

---

## Results

### Pipeline Performance (V2)

**Evaluated on test set: 195 samples**

| Stage | Model | Metric | Score |
|-------|-------|--------|-------|
| Stage 1 (Mass) | Linear Regression + Log Transform | Log-scale R² | 0.3173 |
| Stage 1 (Mass) | Linear Regression + Log Transform | Original-scale R² | 0.1133 |
| Stage 2 (Temperature) | Random Forest | R² | 0.8465 |
| Stage 3 (ESI) | Formula-based | MAE | 0.0997 |
| **Full Pipeline** | **End-to-end** | **Habitability Accuracy** | **82.1%** |

### Habitability Classification

```
Overall Accuracy: 82.1%

ESI Correlation (actual vs predicted): 0.9013

Habitability Thresholds:
  High:     ESI >= 0.8
  Moderate: 0.5 <= ESI < 0.8
  Low:      ESI < 0.5
```

### Key Findings

- **Stage 2 (temperature) is strong** -- Random Forest achieves R² = 0.85 with just two features
- **Stage 1 (mass) is the bottleneck** -- mass prediction is inherently difficult due to extreme skewness (3.6) in the target variable
- **Log transform was the most effective optimization** -- reduced skewness from 3.6 to 1.6, improved Stage 1 R² by 4.2x in log space
- **Feature engineering and polynomial features did not help** -- engineered features (density, gravity) and polynomial degree-2 features both failed to improve over the log-transform baseline
- **ESI predictions are reliable** -- 0.90 correlation between actual and predicted ESI scores despite modest mass accuracy

---

## V2 Optimization Journey

The V2 iteration focused on improving Stage 1 (mass prediction), which was the weakest link in the MVP pipeline.

| Experiment | Approach | Log-scale R² | Outcome |
|-----------|----------|-------------|---------|
| MVP Baseline | Linear Regression (raw) | 0.0755* | Starting point |
| **V2 Log Transform** | **LR + log1p(mass)** | **0.3173** | **Selected** |
| V2 Feature Engineering | Density, gravity features | 0.1124* | No improvement |
| V2 Polynomial | Degree-2 polynomial features | 0.2632 | Worse than log-only |

_*Original-scale R² (not directly comparable to log-scale metrics)_

**Winner:** Linear Regression + Log Transform -- simple, stable, no overfitting, best generalization.

---

## ESI Methodology

The Earth Similarity Index quantifies how similar a planet is to Earth:

```
ESI = (esi_radius ^ 0.57) × (esi_mass ^ 0.23) × (esi_temp ^ 0.20)

where:
  esi_x = 1 - |x - x_earth| / (x + x_earth)

Earth reference values:
  Radius:      1.0 Earth radii
  Mass:        1.0 Earth masses
  Temperature: 288 K
```

An ESI of 1.0 means identical to Earth; closer to 0 means less Earth-like.

---

## Project Structure

```
exoplanet-habitability/
│
├── notebooks/                          # Development notebooks (run in order)
│   ├── 01_EDA.ipynb                    # Exploratory data analysis
│   ├── 02_Stage1_Mass_Prediction.ipynb # Stage 1: mass prediction (MVP)
│   ├── 03_Stage2_Temperature_Prediction.ipynb  # Stage 2: temperature prediction
│   ├── 04_Stage3_ESI_and_Full_Pipeline.ipynb   # Stage 3: ESI + full pipeline (MVP)
│   ├── 05_V2_Stage1_LogTransform.ipynb         # V2: log transform experiment
│   ├── 06_v2_Stage1_FeatureEngineering.ipynb   # V2: feature engineering experiment
│   ├── 07_V2_Stage1_Polynomial.ipynb           # V2: polynomial features experiment
│   ├── 08_V2_Final_Decision.ipynb              # V2: experiment comparison & decision
│   └── 09_V2_Full_Pipeline.ipynb               # V2: integrated pipeline
│
├── models/                             # Trained model artifacts
│   ├── stage1_V2_lr_log.pkl            # Stage 1: LR + log transform (V2 final)
│   ├── stage1_FINAL_model.pkl          # Stage 1: LR baseline (MVP)
│   └── stage2_FINAL_model.pkl          # Stage 2: Random Forest
│
├── data/
│   └── Exoplanet_Dataset.csv           # 5,986 exoplanets
│
├── outputs/
│   ├── figures/                        # Generated visualizations
│   ├── full_pipeline_results.csv       # Pipeline predictions + ESI scores
│   ├── stage1_predictions.csv          # Mass prediction results
│   └── stage2_predictions.csv          # Temperature prediction results
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/emirhannkilic/exoplanet-habitability.git
cd exoplanet-habitability

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate    # macOS / Linux
# venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Running the Pipeline

```bash
# Start Jupyter
jupyter notebook

# Run notebooks in order:
#   01 -> 02 -> 03 -> 04  (MVP pipeline)
#   05 -> 06 -> 07 -> 08  (V2 optimization experiments)
#   09                     (V2 integrated pipeline)
```

---

## Dataset

The dataset contains **5,986 confirmed exoplanets** with properties including:

| Feature | Description | Used In |
|---------|-------------|---------|
| `radius` | Planet radius (Earth radii) | Stage 1, Stage 3 |
| `orbital_period` | Orbital period (days) | Stage 1 |
| `star_mass` | Host star mass (solar masses) | Stage 1 |
| `star_teff` | Star effective temperature (K) | Stage 2 |
| `semi_major_axis` | Orbital distance (AU) | Stage 2 |
| `mass` | Planet mass (Jupiter masses) | Stage 1 target |
| `temp_calculated` | Equilibrium temperature (K) | Stage 2 target |

**Note:** Not all features are available for every planet. Stage 1 uses 1,521 samples, Stage 2 uses 1,881 samples, and the full pipeline evaluation uses 973 samples where all features are present.

**Source:** [Exoplanets Dataset](https://www.kaggle.com/datasets/akashbommidi/exoplanets-dataset/data) on Kaggle

---

## Technologies

- **pandas** / **numpy** -- data processing
- **scikit-learn** -- ML models (Linear Regression, Random Forest)
- **matplotlib** / **seaborn** -- visualization
- **scipy** -- statistical analysis
- **Jupyter** -- interactive development
- **joblib** -- model serialization

---

## Roadmap

- [x] Phase 1: ML Pipeline MVP (notebooks 01-04)
- [x] Phase 2: V2 Optimization (notebooks 05-09)
- [ ] Phase 3: Backend API (FastAPI model serving)
- [ ] Phase 4: Frontend UI (interactive predictions)
- [ ] Phase 5: Deployment (Docker + cloud)

---

## Acknowledgments

- Dataset by [Akash Bommidi](https://www.kaggle.com/datasets/akashbommidi/exoplanets-dataset/data) on Kaggle

---

## License

MIT
