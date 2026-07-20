import time
import uuid
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("terralogy")

# In-memory rate limiting (Redis in production)
_rate_limit_store: dict[str, list[float]] = defaultdict(list)

class TraceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        trace_id = request.headers.get("X-Trace-ID", str(uuid.uuid4())[:8])
        request.state.trace_id = trace_id
        start = time.time()
        response = await call_next(request)
        elapsed = time.time() - start
        response.headers["X-Trace-ID"] = trace_id
        response.headers["X-Response-Time"] = f"{elapsed:.3f}s"
        logger.info("[%s] %s %s -> %d (%.3fs)", trace_id, request.method, request.url.path, response.status_code, elapsed)
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window_seconds

    async def dispatch(self, request: Request, call_next):
        client = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = _rate_limit_store[client]
        timestamps = [t for t in timestamps if now - t < self.window]
        _rate_limit_store[client] = timestamps
        if len(timestamps) >= self.max_requests:
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Rate limit exceeded", "retry_after": self.window}, status_code=429)
        timestamps.append(now)
        return await call_next(request)

class CompressionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        accept = request.headers.get("accept-encoding", "")
        if "gzip" in accept and hasattr(response, "body"):
            import gzip
            response.body = gzip.compress(response.body)
            response.headers["Content-Encoding"] = "gzip"
        return response
