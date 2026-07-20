from fastapi import APIRouter, HTTPException
from app.services.copernicus import fetch_indices, fetch_true_color, get_access_token
from app.config import settings

router = APIRouter(prefix="/api/satellite", tags=["satellite"])

@router.get("/indices")
async def indices(bbox: str):
    try:
        token = await get_access_token()
        bbox_list = [float(x) for x in bbox.split(",")]
        data = await fetch_indices(bbox_list, token)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/true-color")
async def true_color(bbox: str):
    try:
        token = await get_access_token()
        bbox_list = [float(x) for x in bbox.split(",")]
        data = await fetch_true_color(bbox_list, token)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
