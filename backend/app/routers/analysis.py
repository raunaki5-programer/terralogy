from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.services.openmeteo import fetch_weather, get_soil_moisture
from app.services.soilgrids import fetch_soil
from app.services.copernicus import fetch_indices, get_access_token
import asyncio

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

def health_status(ndvi, moisture, ndmi):
    if ndvi is None and moisture is None and ndmi is None:
        return {"status": "unknown", "label": "No Data"}
    scores = []
    if ndvi is not None: scores.append(2 if ndvi > 0.4 else (1 if ndvi > 0.2 else 0))
    if moisture is not None: scores.append(2 if moisture > 0.2 else (1 if moisture > 0.12 else 0))
    if ndmi is not None: scores.append(2 if ndmi > 0.1 else (1 if ndmi > -0.1 else 0))
    if not scores: return {"status": "unknown", "label": "No Data"}
    avg = sum(scores) / len(scores)
    if avg >= 1.5: return {"status": "good", "label": "Healthy"}
    if avg >= 1.0: return {"status": "warning", "label": "Fair"}
    return {"status": "critical", "label": "Critical"}

def generate_alerts(ndvi, ndmi, sm, temp, hum, precip):
    alerts = []
    if ndvi is not None and ndvi < 0.15: alerts.append({"type": "vegetation", "severity": "critical", "message": "Bare soil or very sparse vegetation"})
    if sm is not None and sm < 0.08: alerts.append({"type": "water", "severity": "critical", "message": "Critical soil moisture — irrigate immediately"})
    elif sm is not None and sm < 0.15: alerts.append({"type": "water", "severity": "warning", "message": "Low soil moisture — consider irrigation"})
    if ndmi is not None and ndmi < -0.1: alerts.append({"type": "water", "severity": "warning", "message": "Negative NDMI indicates water stress"})
    if hum is not None and temp is not None and hum > 85 and temp > 22: alerts.append({"type": "disease", "severity": "warning", "message": "High humidity + warmth — fungal disease risk"})
    return alerts

@router.post("/field/{field_id}")
async def analyze_field(field_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("fields").select("*").eq("id", field_id).execute()
        if not resp.data: raise HTTPException(status_code=404, detail="Field not found")
        field = resp.data[0]
    except: raise HTTPException(status_code=404, detail="Field not found")

    lat, lng = field["center_lat"], field["center_lng"]
    bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]

    token = await get_access_token()
    indices, weather, soil = await asyncio.gather(
        fetch_indices(bbox, token), fetch_weather(lat, lng), fetch_soil(lat, lng)
    )

    ndvi = indices.get("ndvi", {}).get("mean") if indices else None
    ndmi = indices.get("ndmi", {}).get("mean") if indices else None
    sm = get_soil_moisture(weather)
    temp = weather.get("current", {}).get("temperature_2m") if weather else None
    hum = weather.get("current", {}).get("relative_humidity_2m") if weather else None

    analysis = {
        "field_id": field_id,
        "soil": {"ph": round(soil["ph"], 1) if soil.get("ph") else None, "organic_carbon": round(soil["soc"], 2) if soil.get("soc") else None, "clay": round(soil["clay"]) if soil.get("clay") else None, "sand": round(soil["sand"]) if soil.get("sand") else None, "moisture": round(sm * 100) if sm else None},
        "vegetation": {"ndvi": round(ndvi, 3) if ndvi else None, "ndmi": round(ndmi, 3) if ndmi else None},
        "weather": {"temp": round(temp) if temp else None, "humidity": round(hum) if hum else None},
        "health": health_status(ndvi, sm, ndmi),
        "alerts": generate_alerts(ndvi, ndmi, sm, temp, hum, None),
    }

    try:
        supabase.from_("analyses").insert({"field_id": field_id, "data": analysis}).execute()
        for a in analysis["alerts"]:
            supabase.from_("alerts").insert({"field_id": field_id, "type": a["type"], "severity": a["severity"], "message": a["message"]}).execute()
    except: pass

    return analysis

@router.get("/field/{field_id}")
async def get_analysis(field_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("analyses").select("*").eq("field_id", field_id).order("created_at", desc=True).limit(1).execute()
        if resp.data: return resp.data[0]
    except: pass
    raise HTTPException(status_code=404, detail="No analysis found")
