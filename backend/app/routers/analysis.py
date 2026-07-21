from fastapi import APIRouter, HTTPException
from app.services.copernicus import fetch_indices, get_access_token
from app.services.openmeteo import fetch_weather, get_soil_moisture
from app.services.soilgrids import fetch_soil
from app.ml.scoring import compute_health_score, compute_soil_score, compute_yield_potential, compute_disease_risk, compute_irrigation_need
import asyncio

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.post("/area")
async def analyze_area(lat: float, lng: float):
    """Full enterprise analysis for any lat/lng — no field required."""
    bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]
    try:
        token = await get_access_token()
    except Exception as e:
        return {"error": f"Copernicus auth failed: {e}", "vegetation": {"ndvi": None, "ndmi": None}}

    try:
        indices, weather, soil = await asyncio.gather(
            fetch_indices(bbox, token), fetch_weather(lat, lng), fetch_soil(lat, lng)
        )
    except Exception as e:
        return {"error": f"Data fetch failed: {e}"}

    ndvi = indices.get("ndvi", {}).get("mean") if indices else None
    ndmi = indices.get("ndmi", {}).get("mean") if indices else None
    sm = get_soil_moisture(weather)
    temp = weather.get("current", {}).get("temperature_2m") if weather else None
    hum = weather.get("current", {}).get("relative_humidity_2m") if weather else None
    precip = weather.get("current", {}).get("precipitation") if weather else None
    wind = weather.get("current", {}).get("wind_speed_10m") if weather else None

    health = compute_health_score(ndvi=ndvi, ndmi=ndmi, soil_moisture=sm, temperature=temp)
    soil_score = compute_soil_score(ph=soil.get("ph"), soc=soil.get("soc"), clay=soil.get("clay"), nitrogen=soil.get("nitrogen"))
    yield_pot = compute_yield_potential(ndvi=ndvi, soil_moisture=sm, soil_quality=soil_score.get("score"), temperature=temp)
    disease = compute_disease_risk(temperature=temp, humidity=hum, ndvi=ndvi)
    irrigation = compute_irrigation_need(soil_moisture=sm, temperature=temp)

    return {
        "location": {"lat": lat, "lng": lng},
        "vegetation": {"ndvi": round(ndvi, 3) if ndvi else None, "ndmi": round(ndmi, 3) if ndmi else None},
        "soil": {
            "ph": round(soil.get("ph"), 1) if soil.get("ph") else None,
            "organic_carbon": round(soil.get("soc"), 2) if soil.get("soc") else None,
            "clay": round(soil.get("clay")) if soil.get("clay") else None,
            "sand": round(soil.get("sand")) if soil.get("sand") else None,
            "silt": round(soil.get("silt")) if soil.get("silt") else None,
            "moisture": round(sm * 100) if sm is not None else None,
            "nitrogen": round(soil.get("nitrogen", 0), 2) if soil.get("nitrogen") else None,
            "cec": soil.get("cec"),
        },
        "weather": {"temp": round(temp) if temp else None, "humidity": round(hum) if hum else None, "precipitation": precip, "wind": wind},
        "health": health,
        "soil_score": soil_score,
        "yield_potential": yield_pot,
        "disease_risk": disease,
        "irrigation": irrigation,
    }


@router.post("/field/{field_id}")
async def analyze_field(field_id: str):
    from app.database import get_supabase
    supabase = get_supabase()
    try:
        resp = supabase.from_("fields").select("*").eq("id", field_id).execute()
        if not resp.data: raise HTTPException(status_code=404, detail="Field not found")
        field = resp.data[0]
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

    lat, lng = field["center_lat"], field["center_lng"]
    bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]

    try:
        token = await get_access_token()
        indices, weather, soil = await asyncio.gather(
            fetch_indices(bbox, token), fetch_weather(lat, lng), fetch_soil(lat, lng)
        )
    except Exception as e:
        return {"error": f"Analysis failed: {e}"}

    ndvi = indices.get("ndvi", {}).get("mean") if indices else None
    ndmi = indices.get("ndmi", {}).get("mean") if indices else None
    sm = get_soil_moisture(weather)
    temp = weather.get("current", {}).get("temperature_2m") if weather else None
    hum = weather.get("current", {}).get("relative_humidity_2m") if weather else None

    health = compute_health_score(ndvi=ndvi, ndmi=ndmi, soil_moisture=sm, temperature=temp)
    soil_score = compute_soil_score(ph=soil.get("ph"), soc=soil.get("soc"), clay=soil.get("clay"), nitrogen=soil.get("nitrogen"))
    yield_pot = compute_yield_potential(ndvi=ndvi, soil_moisture=sm, soil_quality=soil_score.get("score"), temperature=temp)
    disease = compute_disease_risk(temperature=temp, humidity=hum, ndvi=ndvi)
    irrigation = compute_irrigation_need(soil_moisture=sm, temperature=temp)

    analysis = {
        "field_id": field_id,
        "vegetation": {"ndvi": round(ndvi, 3) if ndvi else None, "ndmi": round(ndmi, 3) if ndmi else None},
        "soil": {"ph": round(soil.get("ph"), 1) if soil.get("ph") else None, "organic_carbon": round(soil.get("soc"), 2) if soil.get("soc") else None, "clay": round(soil.get("clay")) if soil.get("clay") else None, "sand": round(soil.get("sand")) if soil.get("sand") else None, "silt": round(soil.get("silt")) if soil.get("silt") else None, "moisture": round(sm * 100) if sm is not None else None, "nitrogen": round(soil.get("nitrogen", 0), 2) if soil.get("nitrogen") else None},
        "weather": {"temp": round(temp) if temp else None, "humidity": round(hum) if hum else None},
        "health": health, "soil_score": soil_score, "yield_potential": yield_pot, "disease_risk": disease, "irrigation": irrigation,
    }

    try:
        supabase.from_("analyses").insert({"field_id": field_id, "data": analysis}).execute()
        for alert in health.get("alerts", []):
            supabase.from_("alerts").insert({"field_id": field_id, "type": alert.get("type", "info"), "severity": alert.get("severity", "info"), "message": alert["message"]}).execute()
    except: pass

    return analysis


@router.get("/field/{field_id}")
async def get_analysis(field_id: str):
    from app.database import get_supabase
    supabase = get_supabase()
    try:
        resp = supabase.from_("analyses").select("*").eq("field_id", field_id).order("created_at", desc=True).limit(1).execute()
        if resp.data: return resp.data[0]["data"]
    except: pass
    raise HTTPException(status_code=404, detail="No analysis found")
