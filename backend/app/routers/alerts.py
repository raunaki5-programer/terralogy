from fastapi import APIRouter
from app.database import get_supabase
from app.models import AlertSubscribe

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
async def list_alerts():
    supabase = get_supabase()
    try:
        resp = supabase.from_("alerts").select("*, fields:fields(name)").order("created_at", desc=True).limit(50).execute()
        if resp.data:
            return {"alerts": [{"id": a["id"], "field_id": a.get("field_id"), "field_name": (a.get("fields") or {}).get("name"), "type": a["type"], "severity": a["severity"], "message": a["message"], "read": a.get("read", False), "created_at": a["created_at"]} for a in resp.data]}
    except: pass
    return {"alerts": []}

@router.patch("/{alert_id}/read")
async def mark_read(alert_id: str):
    supabase = get_supabase()
    try:
        supabase.from_("alerts").update({"read": True}).eq("id", alert_id).execute()
    except: pass
    return {"success": True}

@router.post("/subscribe")
async def subscribe(req: AlertSubscribe):
    return {"success": True, "message": "Alerts subscription coming soon"}
