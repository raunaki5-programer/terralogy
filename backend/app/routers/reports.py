from fastapi import APIRouter, HTTPException
from app.models import ReportRequest
from app.database import get_supabase

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.post("/generate")
async def generate_report(req: ReportRequest):
    supabase = get_supabase()
    try:
        farm = supabase.from_("farms").select("*").eq("id", req.farm_id).execute()
        fields = supabase.from_("fields").select("*").eq("farm_id", req.farm_id).execute()
        if not farm.data:
            raise HTTPException(status_code=404, detail="Farm not found")
        return {
            "report_id": "rpt-001",
            "farm": farm.data[0],
            "fields": fields.data or [],
            "generated_at": "2026-07-20T12:00:00Z",
            "type": req.report_type,
            "summary": "Farm report generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{report_id}")
async def get_report(report_id: str):
    return {"report_id": report_id, "status": "ready", "url": None}

@router.get("/farm/{farm_id}/history")
async def report_history(farm_id: str):
    return {"reports": []}
