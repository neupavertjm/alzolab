"""Límite de peticiones para el despliegue público."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.middleware import RateLimitMiddleware


def test_rate_limit_returns_429_and_retry_after():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware, requests_per_minute=2, heavy_per_minute=1)

    @app.get("/api/demo")
    def demo():
        return {"ok": True}

    client = TestClient(app)
    assert client.get("/api/demo").status_code == 200
    assert client.get("/api/demo").status_code == 200
    limited = client.get("/api/demo")
    assert limited.status_code == 429
    assert "Retry-After" in limited.headers


def test_health_endpoint_is_not_rate_limited():
    app = FastAPI()
    app.add_middleware(RateLimitMiddleware, requests_per_minute=1, heavy_per_minute=1)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    client = TestClient(app)
    assert all(client.get("/api/health").status_code == 200 for _ in range(3))
