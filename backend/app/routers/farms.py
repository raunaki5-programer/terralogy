from fastapi import APIRouter, HTTPException
from app.database import get_supabase
from app.models import FarmCreate
from app.auth import get_current_user
from typing import Optional

router = APIRouter(prefix="/api/farms", tags=["farms"])

@router.get("")
async def list_farms():
    supabase = get_supabase()
    try:
        resp = supabase.from_("farms").select("*, fields:fields(count)").order("created_at", desc=True).execute()
        if resp.data:
            return {"farms": [format_farm(f) for f in resp.data]}
    except: pass
    return {"farms": []}

@router.post("")
async def create_farm(req: FarmCreate):
    supabase = get_supabase()
    try:
        resp = supabase.from_("farms").insert({"name": req.name, "description": req.description, "lat": req.lat, "lng": req.lng}).execute()
        if resp.data:
            return format_farm(resp.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=500, detail="Failed")

@router.get("/{farm_id}")
async def get_farm(farm_id: str):
    supabase = get_supabase()
    try:
        resp = supabase.from_("farms").select("*, fields:fields(count)").eq("id", farm_id).execute()
        if resp.data: return format_farm(resp.data[0])
    except: pass
    raise HTTPException(status_code=404, detail="Farm not found")

@router.put("/{farm_id}")
async def update_farm(farm_id: str, name: Optional[str] = None, description: Optional[str] = None):
    supabase = get_supabase()
    data = {}
    if name: data["name"] = name
    if description is not None: data["description"] = description
    try:
        supabase.from_("farms").update(data).eq("id", farm_id).execute()
        return {"success": True}
    except: raise HTTPException(status_code=500, detail="Failed")

@router.delete("/{farm_id}")
async def delete_farm(farm_id: str):
    supabase = get_supabase()
    try:
        supabase.from_("fields").delete().eq("farm_id", farm_id).execute()
        supabase.from_("farms").delete().eq("id", farm_id).execute()
        return {"success": True}
    except: raise HTTPException(status_code=500, detail="Failed")

def format_farm(f):
    return {"id": f["id"], "name": f["name"], "description": f.get("description"), "location": {"lat": f["lat"], "lng": f["lng"]}, "created_at": f["created_at"], "field_count": (f.get("fields") or [{}])[0].get("count", 0)}
