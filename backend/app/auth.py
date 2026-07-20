from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase, get_supabase_admin
from app.models import SignUpRequest, SignInRequest
from app.config import settings
import httpx

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    supabase = get_supabase()
    try:
        resp = supabase.auth.get_user(credentials.credentials)
        return resp.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/signup")
async def signup(req: SignUpRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_up({
            "email": req.email, "password": req.password,
            "options": {"data": {"name": req.name or ""}}
        })
        if resp.user:
            try:
                httpx.put(
                    f"{settings.supabase_url}/auth/v1/admin/users/{resp.user.id}",
                    headers={"apikey": settings.supabase_service_role_key, "Authorization": f"Bearer {settings.supabase_service_role_key}"},
                    json={"email_confirm": True}, timeout=10
                )
            except: pass
            return {"user": {"id": resp.user.id, "email": resp.user.email}}
        raise HTTPException(status_code=400, detail="Signup failed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(req: SignInRequest):
    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if resp.session:
            return {"access_token": resp.session.access_token, "user": {"id": resp.user.id, "email": resp.user.email}}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me")
async def get_me(user=Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "name": user.user_metadata.get("name", "")}

@router.put("/profile")
async def update_profile(name: str, user=Depends(get_current_user)):
    supabase = get_supabase()
    try:
        supabase.auth.admin.update_user_by_id(user.id, {"user_metadata": {"name": name}})
        return {"success": True}
    except: raise HTTPException(status_code=500, detail="Failed to update")
