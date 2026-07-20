from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.middleware.security import TraceMiddleware, RateLimitMiddleware, CompressionMiddleware
from app.auth import router as auth_router
from app.routers import farms, fields, weather, satellite, soil, analysis, alerts, chat, reports

app = FastAPI(title="Terralogy API", version="2.1.0", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(TraceMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=200, window_seconds=60)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(farms.router)
app.include_router(fields.router)
app.include_router(weather.router)
app.include_router(satellite.router)
app.include_router(soil.router)
app.include_router(analysis.router)
app.include_router(alerts.router)
app.include_router(chat.router)
app.include_router(reports.router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "2.1.0", "uptime": "running"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse({"detail": str(exc), "type": type(exc).__name__}, status_code=500)
