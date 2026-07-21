import httpx

async def fetch_weather(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "weather_code"],
        "hourly": ["temperature_2m", "relative_humidity_2m", "precipitation_probability", "soil_moisture_0_to_7cm"],
        "timezone": "auto", "forecast_days": 1
    }
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=30)
            return r.json() if r.status_code == 200 else {"current": {}, "hourly": {}}
    except Exception:
        return {"current": {}, "hourly": {}}

async def fetch_forecast(lat: float, lon: float):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat, "longitude": lon,
        "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "precipitation_probability_max", "wind_speed_10m_max"],
        "timezone": "auto", "forecast_days": 7
    }
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=30)
            if r.status_code == 200:
                data = r.json()
                daily = data.get("daily", {})
                return [{"date": daily["time"][i], "temp_max": daily["temperature_2m_max"][i], "temp_min": daily["temperature_2m_min"][i], "precip_mm": daily["precipitation_sum"][i]} for i in range(len(daily.get("time", [])))]
            return []
    except Exception:
        return []

def get_soil_moisture(weather_data):
    try:
        hourly = weather_data.get("hourly", {})
        sm_values = hourly.get("soil_moisture_0_to_7cm", [])
        if sm_values:
            valid = [v for v in sm_values if v is not None]
            if valid: return sum(valid) / len(valid)
    except: pass
    return None
