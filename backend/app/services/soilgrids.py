import httpx

async def fetch_soil(lat: float, lon: float):
    url = "https://rest.isric.org/soilgrids/v2.0/properties/query"
    params = {"lat": lat, "lon": lon, "property": ["phh2o", "soc", "clay", "sand", "silt", "nitrogen", "cec"], "depth": ["0-5cm"], "value": "mean"}
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=30)
            if r.status_code == 200:
                data = r.json()
                result = {}
                props = {
                    "phh2o": "ph", "soc": "soc", "clay": "clay",
                    "sand": "sand", "silt": "silt", "nitrogen": "nitrogen", "cec": "cec"
                }
                for layer in data.get("properties", {}).get("layers", []):
                    name = props.get(layer.get("name", ""))
                    if name and layer.get("depths"):
                        val = layer["depths"][0].get("values", {}).get("mean")
                        result[name] = val / 10 if name == "ph" else val / 100
                result.setdefault("ph", None)
                result.setdefault("soc", None)
                result.setdefault("clay", None)
                result.setdefault("sand", None)
                result.setdefault("silt", None)
                return result
            return {"ph": None, "soc": None, "clay": None, "sand": None, "silt": None}
    except Exception:
        return {"ph": None, "soc": None, "clay": None, "sand": None, "silt": None}
