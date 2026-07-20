# Terralogy

Earth Intelligence Platform — satellite-powered farm monitoring, soil analysis, and alerting.

## Stack
- **Backend**: FastAPI + Supabase
- **Frontend**: React + Vite + TypeScript
- **APIs**: Copernicus/Sentinel, Open-Meteo, ISRIC SoilGrids
- **Deploy**: Render

## Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```
