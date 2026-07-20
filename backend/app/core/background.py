import asyncio
import json
from typing import Any, Callable
from app.database import get_supabase

_background_tasks: list[asyncio.Task] = []

async def run_analysis_background(field_id: str, lat: float, lng: float):
    """Full analysis pipeline: satellite + weather + soil + ML scoring"""
    from app.services.copernicus import fetch_indices, get_access_token
    from app.services.openmeteo import fetch_weather, get_soil_moisture
    from app.services.soilgrids import fetch_soil
    from app.ml.scoring import compute_health_score, compute_soil_score, compute_yield_potential

    try:
        token = await get_access_token()
        bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01]
        indices, weather, soil = await asyncio.gather(
            fetch_indices(bbox, token),
            fetch_weather(lat, lng),
            fetch_soil(lat, lng),
        )

        ndvi = indices.get("ndvi", {}).get("mean") if indices else None
        ndmi = indices.get("ndmi", {}).get("mean") if indices else None
        sm = get_soil_moisture(weather)
        temp = weather.get("current", {}).get("temperature_2m") if weather else None
        hum = weather.get("current", {}).get("relative_humidity_2m") if weather else None

        health = compute_health_score(ndvi=ndvi, ndmi=ndmi, soil_moisture=sm, temperature=temp)
        soil_score = compute_soil_score(ph=soil.get("ph"), soc=soil.get("soc"), clay=soil.get("clay"), nitrogen=soil.get("nitrogen"))
        yield_pot = compute_yield_potential(ndvi=ndvi, soil_moisture=sm, soil_quality=soil_score.get("score", 50), temperature=temp)

        analysis = {
            "field_id": field_id,
            "vegetation": {"ndvi": round(ndvi, 3) if ndvi else None, "ndmi": round(ndmi, 3) if ndmi else None},
            "soil": {"ph": round(soil.get("ph"), 1) if soil.get("ph") else None, "organic_carbon": round(soil.get("soc"), 2) if soil.get("soc") else None, "clay": round(soil.get("clay")) if soil.get("clay") else None, "sand": round(soil.get("sand")) if soil.get("sand") else None, "silt": round(soil.get("silt")) if soil.get("silt") else None, "moisture": round(sm * 100) if sm else None, "nitrogen": round(soil.get("nitrogen", 0), 2) if soil.get("nitrogen") else None},
            "weather": {"temp": round(temp) if temp else None, "humidity": round(hum) if hum else None},
            "health": health,
            "soil_score": soil_score,
            "yield_potential": yield_pot,
            "alerts": health.get("alerts", []),
        }

        supabase = get_supabase()
        supabase.from_("analyses").insert({"field_id": field_id, "data": analysis}).execute()

        for alert in health.get("alerts", []):
            supabase.from_("alerts").insert({"field_id": field_id, "type": alert.get("type", "info"), "severity": alert.get("severity", "info"), "message": alert["message"]}).execute()

    except Exception as e:
        raise Exception(f"Background analysis failed: {e}")

def run_background(coro):
    task = asyncio.create_task(coro)
    _background_tasks.append(task)
    task.add_done_callback(_background_tasks.remove)
    return task
