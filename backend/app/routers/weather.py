from fastapi import APIRouter, HTTPException
from app.services.openmeteo import fetch_weather, fetch_forecast
import httpx

router = APIRouter(prefix="/api/weather", tags=["weather"])

@router.get("")
async def weather(lat: float, lon: float):
    try:
        current = await fetch_weather(lat, lon)
        forecast = await fetch_forecast(lat, lon)
        return {"current": current, "forecast": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast")
async def forecast(lat: float, lon: float):
    try:
        data = await fetch_forecast(lat, lon)
        return {"forecast": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
