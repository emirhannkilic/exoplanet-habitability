# Exoplanet Habitability Platform

An end-to-end platform for predicting exoplanet habitability using machine learning.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Python](https://img.shields.io/badge/Python-3.14-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Project Overview

A full-stack platform that predicts the habitability of exoplanets using a 3-stage machine learning pipeline. The system analyzes planetary and stellar characteristics to calculate the Earth Similarity Index (ESI) and classify planets as Low, Moderate, or High habitability.

---

## Current Status

### Phase 1: ML Pipeline (COMPLETE)

**Results:**
- **Dataset:** 5,986 exoplanets analyzed
- **Training:** 973 complete samples
- **Accuracy:** 81.50% habitability classification

**Pipeline Performance:**
- Stage 1 (Mass): R² = 0.0755
- Stage 2 (Temperature): R² = 0.8465 
- Stage 3 (ESI): R² = 0.6205

### Phase 2: V2 Optimization (IN PROGRESS)

- [ ] Log transform for mass prediction
- [ ] Feature engineering (density, gravity)
- [ ] Advanced models
- [ ] Hyperparameter tuning

**Target:** Stage 1 R² > 0.50 (+6x improvement)

### Phase 3: Backend API (PLANNED)

- [ ] FastAPI service
- [ ] REST API endpoints
- [ ] Model serving
- [ ] Docker deployment

### Phase 4: Frontend UI (PLANNED)

- [ ] React application
- [ ] Interactive predictions
- [ ] Visualization dashboard
- [ ] Responsive design

---

## Pipeline Architecture
```
Input Features
    ↓
┌─────────────────────┐
│  STAGE 1: Mass      │  Linear Regression
│  Features:          │  → Predicted Mass
│  - radius           │
│  - orbital_period   │
│  - star_mass        │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  STAGE 2: Temp      │  Random Forest
│  Features:          │  → Predicted Temp
│  - star_teff        │
│  - semi_major_axis  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  STAGE 3: ESI       │  Formula-based
│  Inputs:            │  → ESI Score
│  - radius           │  → Habitability
│  - mass (predicted) │     Classification
│  - temp (predicted) │
└─────────────────────┘
```

---

## Project Structure
```
exoplanet-habitability/
│
├── notebooks/              # ML Development (Phase 1)
│   ├── 01_EDA.ipynb
│   ├── 02_Stage1_Mass_Prediction.ipynb
│   ├── 03_Stage2_Temperature_Prediction.ipynb
│   └── 04_Stage3_ESI_and_Full_Pipeline.ipynb
│
├── models/                 # Trained Models
│   ├── stage1_FINAL_model.pkl
│   └── stage2_FINAL_model.pkl
│
├── data/                   # Dataset
│   └── Exoplanet_Dataset.csv
│
├── outputs/                # Results
│   ├── figures/
│   └── full_pipeline_results.csv
│
├── backend/                # API Service (Phase 3 - TODO)
│   ├── server.js
│   └── ml-service/
│
└── frontend/               # UI (Phase 4 - TODO)
    └── src/
```

---

## Quick Start (ML Pipeline)

### Prerequisites
- Python 3.9+
- pip

### Installation
```bash
# Clone repository
git clone https://github.com/emirhannkilic/exoplanet-habitability.git
cd exoplanet-habitability

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows

# Install dependencies
pip install pandas numpy scikit-learn matplotlib seaborn scipy jupyter
```

### Run Notebooks
```bash
jupyter notebook
# Open notebooks/ folder and run in order
```

---

## Technologies

### Current (Phase 1)
- **Python 3.14**
- **scikit-learn** - ML models
- **pandas, numpy** - Data processing
- **matplotlib, seaborn** - Visualization
- **Jupyter** - Interactive development

### Planned (Phase 2-4)
- **FastAPI** - Backend API
- **Node.js/Express** - API Gateway
- **React** - Frontend UI
- **Docker** - Containerization

---

## Results & Visualizations

### Performance Summary

| Stage | Model | Test R² | Test MAE | Status |
|-------|-------|---------|----------|--------|
| Stage 1 (Mass) | Linear Regression | 0.0755 | 0.8025 | Needs improvement |
| Stage 2 (Temp) | Random Forest | 0.8465 | 117.80 K | Excellent |
| Stage 3 (ESI) | Formula-based | 0.6205 | 0.1177 | Good |

### Classification Results
```
Overall Accuracy: 81.50% (793/973 correct)

Confusion Matrix:
              Predicted
Actual    Low  Moderate  High
Low       406      95       4
Moderate    1     346      75
High        0       5      41
```

### Key Insights
- 83.4% of ESI predictions within ±0.2 of actual values
- High habitability planets: 89.1% accuracy
- Zero High planets misclassified as Low (safe predictions)
- Stage 1 limited by high skewness (target for V2)

> **Visualizations:** Run notebooks to generate plots in `/outputs/figures/`

---

## Methodology

### Earth Similarity Index (ESI)
```
ESI = (esi_radius^0.57) × (esi_mass^0.23) × (esi_temp^0.20)

where:
esi_x = 1 - |x - x_earth| / (x + x_earth)

Earth reference values:
- Radius: 1.0 Earth radii
- Mass: 1.0 Earth masses  
- Temperature: 288 K
```

### Classification Thresholds
- **High:** ESI ≥ 0.8
- **Moderate:** 0.5 ≤ ESI < 0.8
- **Low:** ESI < 0.5

---

## Roadmap

- [x] Phase 1: ML Pipeline MVP
- [ ] Phase 1.5: V2 Optimization
- [ ] Phase 2: Backend API
- [ ] Phase 3: Frontend UI
- [ ] Phase 4: Deployment (Docker + Cloud)
- [ ] Phase 5: CI/CD Pipeline

---

## Contributing

Contributions welcome! This is a learning project in active development.

---

## License


---

## Contact


---

## Acknowledgments


---

**Current Phase:** ML Pipeline Optimization (V2)
```

---

```
