# Backend

This project’s backend is split into two services:

- **Node API** (`backend/node-api`): public-facing HTTP API for the frontend. Handles CORS, input validation, and response formatting.
- **ML Service** (`backend/ml-service`): internal FastAPI service that loads trained models and performs inference (mass + temperature + ESI + habitability).

Architecture:

```text
Client / Frontend
   ↓
Node API (Express, default :3000)
   ↓  (ML_SERVICE_URL)
ML Service (FastAPI, default :5001)
```

---

## Structure

```text
backend/
├── node-api/
│   ├── server.js
│   ├── routes/
│   │   ├── health.js        # GET  /api/health
│   │   └── predict.js       # POST /api/predict
│   ├── controllers/
│   │   ├── healthController.js
│   │   └── predictController.js
│   ├── src/services/mlService.js
│   ├── .env.example
│   ├── package.json
│   └── node_modules/        # local install output
│
└── ml-service/
    ├── app.py               # GET /health, POST /predict
    ├── requirements.txt
    ├── README.md
    └── .venv/               # optional local virtualenv
```

---

## Quickstart (Local)

You typically run **both** services in separate terminals.

### 1) Start the ML Service (FastAPI)

From repo root:

```bash
cd backend/ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 5001
```

Verify:
- `http://127.0.0.1:5001/health`
- `http://127.0.0.1:5001/docs`

**Model artifacts required**

The ML service loads model files from the repo-root `models/` directory (relative to `backend/ml-service/` it resolves `../../models`):
- `models/stage1_V2_lr_log.pkl`
- `models/stage2_FINAL_model.pkl`

If these files are missing, the service will fail to start.

### 2) Start the Node API (Express)

From repo root:

```bash
cd backend/node-api
npm install
cp .env.example .env
npm run dev
```

Verify:
- `http://localhost:3000/test`
- `http://localhost:3000/api/health`

---

## Configuration (Node API)

See `backend/node-api/.env.example`:

- `PORT`: Node API port (default `3000`)
- `CORS_ORIGIN`: allowed origin(s) (default `*`)
- `ML_SERVICE_URL`: base URL for ML Service (default `http://127.0.0.1:5001`)

---

## API

### Node API

#### GET `/api/health`

Returns Node status + checks ML service reachability.

#### POST `/api/predict`

Validates input and proxies to ML service.

Request body:

```json
{
  "radius": 1.0,
  "orbital_period": 365.0,
  "star_mass": 1.0,
  "star_teff": 5778.0,
  "semi_major_axis": 1.0
}
```

Example curl:

```bash
curl -sS -X POST "http://localhost:3000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"radius":1,"orbital_period":365,"star_mass":1,"star_teff":5778,"semi_major_axis":1}'
```

### ML Service

The Node API calls:
- `GET /health`
- `POST /predict`

See `backend/ml-service/README.md` for details.

---

## Notes

- If you deploy, you usually expose **only** the Node API to the internet and keep the ML service internal.
- It’s generally recommended to avoid committing heavy local folders like `node_modules/` and `.venv/` to git (use installs per environment instead).

