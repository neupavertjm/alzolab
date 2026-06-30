"""Middleware ligero para limitar abuso en el Space público."""

from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Ventana móvil en memoria; suficiente para una única réplica gratuita."""

    def __init__(self, app, requests_per_minute: int = 60, heavy_per_minute: int = 12):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.heavy_per_minute = heavy_per_minute
        self.history: dict[tuple[str, str], deque[float]] = defaultdict(deque)
        self.lock = Lock()

    @staticmethod
    def _client_ip(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        return forwarded or (request.client.host if request.client else "unknown")

    async def dispatch(self, request: Request, call_next):
        if not request.url.path.startswith("/api/") or request.url.path == "/api/health":
            return await call_next(request)
        heavy = request.url.path.startswith(("/api/extract", "/api/analyze", "/api/terminology"))
        bucket = "heavy" if heavy else "general"
        limit = self.heavy_per_minute if heavy else self.requests_per_minute
        key = (self._client_ip(request), bucket)
        now = monotonic()
        with self.lock:
            timestamps = self.history[key]
            while timestamps and timestamps[0] <= now - 60:
                timestamps.popleft()
            if len(timestamps) >= limit:
                retry_after = max(1, int(60 - (now - timestamps[0])))
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Demasiadas peticiones. Inténtalo de nuevo en un minuto."},
                    headers={"Retry-After": str(retry_after)},
                )
            timestamps.append(now)
        return await call_next(request)
