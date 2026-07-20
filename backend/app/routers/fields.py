from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models import FieldCreate, CropCreate
import math

router = APIRouter(prefix="/api", tags=["fields"])

def compute_area(coords):
    if len(coords) < 3: return 0
    R = 6378137
    to_rad = lambda d: d * math.pi / 180
    area = 0
    for i in range(len(coords) - 1):
        x1, y1 = coords[i]; x2, y2 = coords[i + 1]
        area += to_rad(x2 - x1) * (2 + math.sin(to_rad(y1)) + math.sin(to_rad(y2)))
    return abs((area * R * R) / 2)

def center_of(coords):
    lat = sum(c[1] for c in coords) / len(coords)
    lng = sum(c[0] for c in coords) / len(coords)
    return {"lat": lat, "lng": lng}

@router.get("/farms/{farm_id}/fields")
async def list_fields(farm_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("fields").select("*, crop:crops(*)").eq("farm_id", farm_id).order("created_at", desc=True).execute()
        if resp.data: return {"fields": [format_field(f) for f in resp.data]}
    except: pass
    return {"fields": []}

@router.post("/fields")
async def create_field(req: FieldCreate):
    c = center_of(req.boundary)
    area = round(compute_area(req.boundary) / 10000, 2)
    supabase = get_supabase()
    try:
        resp = supabase.from_("fields").insert({"farm_id": req.farm_id, "name": req.name, "boundary": req.boundary, "center_lat": c["lat"], "center_lng": c["lng"], "area_ha": area}).execute()
        if resp.data: return format_field(resp.data[0])
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=500, detail="Failed")

@router.get("/fields/{field_id}")
async def get_field(field_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("fields").select("*, crop:crops(*)").eq("id", field_id).execute()
        if resp.data: return format_field(resp.data[0])
    except: pass
    raise HTTPException(status_code=404, detail="Field not found")

@router.put("/fields/{field_id}")
async def update_field(field_id: str, name: str = None):
    supabase = get_supabase()
    try:
        if name: supabase.from_("fields").update({"name": name}).eq("id", field_id).execute()
        return {"success": True}
    except: raise HTTPException(status_code=500, detail="Failed")

@router.delete("/fields/{field_id}")
async def delete_field(field_id: str):
    supabase = get_supabase()
    try:
        supabase.from_("analyses").delete().eq("field_id", field_id).execute()
        supabase.from_("alerts").delete().eq("field_id", field_id).execute()
        supabase.from_("crops").delete().eq("field_id", field_id).execute()
        supabase.from_("fields").delete().eq("id", field_id).execute()
        return {"success": True}
    except: raise HTTPException(status_code=500, detail="Failed")

# Crop endpoints
@router.get("/fields/{field_id}/crop")
async def get_crop(field_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("crops").select("*").eq("field_id", field_id).order("created_at", desc=True).limit(1).execute()
        if resp.data: return {"crop": resp.data[0]}
    except: pass
    return {"crop": None}

@router.post("/fields/{field_id}/crop")
async def add_crop(field_id: str, req: CropCreate):
    supabase = get_supabase()
    try:
        resp = supabase.from_("crops").insert({"field_id": field_id, "crop_type": req.crop_type, "variety": req.variety, "planting_date": req.planting_date, "expected_harvest": req.expected_harvest}).execute()
        if resp.data: return {"crop": resp.data[0]}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=500, detail="Failed")

def format_field(f):
    crop_data = (f.get("crop") or [None])[0]
    return {"id": f["id"], "farm_id": f["farm_id"], "name": f["name"], "boundary": f["boundary"], "center": {"lat": f["center_lat"], "lng": f["center_lng"]}, "area_ha": f["area_ha"], "created_at": f["created_at"], "crop": crop_data}
