from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.copernicus import (
    get_access_token,
    fetch_indices,
    fetch_true_color,
    fetch_ndvi_image,
    search_catalog,
)

router = APIRouter(prefix="/api/satellite", tags=["satellite"])


@router.get("/health")
async def satellite_health():
    try:
        token = await get_access_token()
        return {"status": "ok", "copernicus": "authenticated", "token_len": len(token or "")}
    except Exception as e:
        return {"status": "error", "copernicus": str(e)}


@router.get("/catalog")
async def catalog(
    west: float = Query(...),
    south: float = Query(...),
    east: float = Query(...),
    north: float = Query(...),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    max_cloud: float = 60,
    limit: int = 20,
):
    """Browse Copernicus Sentinel-2 catalog for a bounding box."""
    try:
        return await search_catalog(west, south, east, north, date_from, date_to, max_cloud, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/indices")
async def indices(bbox: str = Query(..., description="west,south,east,north")):
    try:
        token = await get_access_token()
        bbox_list = [float(x) for x in bbox.split(",")]
        if len(bbox_list) != 4:
            raise HTTPException(status_code=400, detail="bbox must be west,south,east,north")
        return await fetch_indices(bbox_list, token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/true-color")
async def true_color(
    bbox: str = Query(..., description="west,south,east,north"),
    width: int = 512,
    height: int = 512,
):
    try:
        token = await get_access_token()
        bbox_list = [float(x) for x in bbox.split(",")]
        return await fetch_true_color(bbox_list, token, width, height)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ndvi-image")
async def ndvi_image(
    bbox: str = Query(..., description="west,south,east,north"),
    width: int = 512,
    height: int = 512,
):
    try:
        token = await get_access_token()
        bbox_list = [float(x) for x in bbox.split(",")]
        return await fetch_ndvi_image(bbox_list, token, width, height)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/browse")
async def browse_point(
    lat: float = Query(...),
    lng: float = Query(...),
    delta: float = 0.05,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    """One-shot: catalog around a point + true color + NDVI stats."""
    west, south, east, north = lng - delta, lat - delta, lng + delta, lat + delta
    bbox = [west, south, east, north]
    try:
        token = await get_access_token()
        catalog = await search_catalog(west, south, east, north, date_from, date_to, 70, 10)
        indices = await fetch_indices(bbox, token)
        image = await fetch_true_color(bbox, token, 512, 512)
        ndvi_img = await fetch_ndvi_image(bbox, token, 512, 512)
        return {
            "location": {"lat": lat, "lng": lng},
            "bbox": bbox,
            "catalog": catalog,
            "indices": indices,
            "true_color": image,
            "ndvi_image": ndvi_img,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
