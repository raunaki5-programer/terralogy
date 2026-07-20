import httpx
from app.config import settings

SYSTEM_PROMPT = """You are Terralogy's AI assistant for Indian farmers. You have 9 specialist agents:

1. Weather Agent — forecasts, alerts, rain prediction
2. Satellite Agent — NDVI, crop health from space
3. Disease Agent — pest/disease detection and remedies
4. Soil Agent — soil health, NPK, pH recommendations
5. Crop Agent — best crop for season, planting advice
6. Market Agent — Mandi prices, MSP rates, trends
7. Finance Agent — loans, KCC, PM-KISAN, insurance
8. Government Agent — schemes, subsidies, eligibility
9. Alert Agent — critical warnings and action items

Respond in simple, practical language. If the user asks in Hindi, respond in Hindi. Be concise and helpful. For any question about farming, provide specific actionable advice."""

async def call_ai_agent(message: str, session_id: str, farm_id: str | None, field_id: str | None, language: str):
    headers = {
        "Authorization": f"Bearer {settings.opencode_api_key}",
        "Content-Type": "application/json"
    }

    context = ""
    if language == "hi":
        context += "Respond in Hindi. "
    if farm_id:
        context += f"The user is asking about farm {farm_id}. "
    if field_id:
        context += f"The user is asking about field {field_id}. "

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT + context},
            {"role": "user", "content": message}
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }

    # Use OpenCode Go endpoint
    url = "https://opencode.ai/zen/go/v1/chat/completions"
    async with httpx.AsyncClient() as client:
        r = await client.post(url, json=payload, headers=headers, timeout=30)
        if r.status_code == 200:
            return r.json()["choices"][0]["message"]["content"]
        # Fallback: return helpful response even without AI
        return generate_fallback_response(message, language)

def generate_fallback_response(message: str, language: str):
    msg_lower = message.lower()
    if "weather" in msg_lower or "mausam" in msg_lower:
        return "Weather data is being fetched. Use the Dashboard to see current conditions for your farm." if language == "en" else "Mausam ki jankari prapt ki ja rahi hai. Apne khet ka mausam dekhne ke liye Dashboard ka upyog karein."
    if "soil" in msg_lower or "mitti" in msg_lower:
        return "Soil analysis is available. Go to your field's detail page and click 'Analyze Soil' to get pH, NPK, and organic carbon levels." if language == "en" else "Mitti ka vishleshan uplabdh hai. Apne khet ke page par jayein aur 'Mitti ka Vishleshan' par click karein."
    if "price" in msg_lower or "mandi" in msg_lower or "bhav" in msg_lower:
        return "Market prices and MSP data will be available soon in the Market section." if language == "en" else "Mandi bhav aur MSP ki jankari jald hi Market section mein uplabdh hogi."
    if "scheme" in msg_lower or "yojana" in msg_lower or "subsidy" in msg_lower:
        return "Government schemes like PM-KISAN, KCC, and crop insurance are available. Check the Schemes section for details." if language == "en" else "PM-KISAN, KCC, aur fasal bima jaise sarkari yojanayein uplabdh hain. Schemes section mein adhik jankari prapt karein."
    if "disease" in msg_lower or "pest" in msg_lower or "rog" in msg_lower or "keet" in msg_lower:
        return "Please describe the symptoms you see on your crop. Take a photo and upload it for AI-based disease detection." if language == "en" else "Kripya apni fasal par dikhne wale lakshano ka varnan karein. AI-based rog pahchan ke liye photo upload karein."
    return "I'm your farming assistant. Ask me about weather, soil health, crop advice, market prices, government schemes, or pest control." if language == "en" else "Main aapka kheti sahayak hoon. Mausam, mitti swasthya, fasal salah, mandi bhav, sarkari yojana, ya keet niyantran ke bare mein poochhiye."
