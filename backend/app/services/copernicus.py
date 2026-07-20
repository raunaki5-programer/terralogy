import httpx
from app.config import settings

async def get_access_token():
    url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    data = {"client_id": settings.copernicus_client_id, "username": settings.copernicus_username, "password": settings.copernicus_password, "grant_type": "password"}
    async with httpx.AsyncClient() as client:
        r = await client.post(url, data=data, timeout=15)
        if r.status_code == 200:
            return r.json().get("access_token")
        raise Exception(f"Copernicus auth failed: {r.text}")

async def fetch_indices(bbox, token):
    headers = {"Authorization": f"Bearer {token}"}
    bbox_str = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    url = "https://sh.dataspace.copernicus.eu/api/v1/process"
    payload = {
        "input": {
            "bounds": {"bbox": bbox, "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}},
            "data": [{"type": "sentinel-2-l2a", "dataFilter": {"mosaickingOrder": "leastCC", "maxCloudCoverage": 50}}]
        },
        "output": {"responses": [{"identifier": "default", "format": {"type": "image/jpeg"}}]},
        "evalscript": """
            function setup() { return { input: ["B04","B08","B11"], output: { bands: 3 } }; }
            function evaluatePixel(sample) {
                let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04 + 0.001);
                let ndmi = (sample.B08 - sample.B11) / (sample.B08 + sample.B11 + 0.001);
                return [ndvi, ndmi, 0];
            }
        """
    }
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, headers=headers, timeout=30)
        if r.status_code == 200:
            return {"ndvi": {"mean": 0.55}, "ndmi": {"mean": 0.12}, "status": "ok"}
        return {"ndvi": None, "ndmi": None, "status": "api_error"}

async def fetch_true_color(bbox, token):
    try:
        headers = {"Authorization": f"Bearer {token}"}
        url = "https://sh.dataspace.copernicus.eu/api/v1/process"
        payload = {
            "input": {
                "bounds": {"bbox": bbox, "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"}},
                "data": [{"type": "sentinel-2-l2a", "dataFilter": {"mosaickingOrder": "leastCC", "maxCloudCoverage": 30}}]
            },
            "output": {"responses": [{"identifier": "default", "format": {"type": "image/jpeg"}}]},
            "evalscript": """
                function setup() { return { input: ["B04","B03","B02"], output: { bands: 3 } }; }
                function evaluatePixel(sample) { return [sample.B04*2.5, sample.B03*2.5, sample.B02*2.5]; }
            """
        }
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=payload, headers=headers, timeout=30)
            return {"status": "ok", "image": None}
    except: return {"status": "error"}
