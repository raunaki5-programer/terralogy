from fastapi import APIRouter, HTTPException
from app.models import ChatRequest
from app.services.ai import call_ai_agent
import uuid

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat")
async def chat(req: ChatRequest):
    if not req.session_id:
        req.session_id = str(uuid.uuid4())
    try:
        response = await call_ai_agent(req.message, req.session_id, req.farm_id, req.field_id, req.language)
        return {"session_id": req.session_id, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{session_id}")
async def get_chat(session_id: str):
    return {"session_id": session_id, "messages": [], "message": "Chat history coming soon"}

@router.post("/voice")
async def voice_query(text: str, language: str = "hi"):
    try:
        response = await call_ai_agent(text, str(uuid.uuid4()), None, None, language)
        return {"text": response, "audio_url": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
