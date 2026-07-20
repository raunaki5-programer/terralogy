from fastapi import APIRouter, HTTPException
from app.services.soilgrids import fetch_soil
import httpx

router = APIRouter(prefix="/api/soil", tags=["soil"])

@router.get("")
async def soil(lat: float, lon: float):
    try:
        data = await fetch_soil(lat, lon)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
