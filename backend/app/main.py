"""Punto de entrada de la API de AlzoLab.

En desarrollo, FastAPI sirve solo la API (`/api/...`) y Vite sirve el frontend
con hot-reload en otro puerto. En producción (Docker, Hugging Face Spaces) este
mismo proceso sirve además el build estático de React desde `frontend/dist`, de
modo que todo vive en un único contenedor.
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import analysis, cleaning, concordance, corpus, exporting, extract, terminology
from app.middleware import RateLimitMiddleware

app = FastAPI(
    title="AlzoLab API",
    description="Creador de corpus: ingesta, limpieza, análisis y terminología.",
    version="0.1.0",
)

# En dev el frontend corre en Vite (5173). En prod se sirve desde el mismo
# origen, así que CORS solo hace falta para desarrollo local.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Retry-After"],
)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60, heavy_per_minute=12)

api = FastAPI(title="AlzoLab API")
api.include_router(extract.router)
api.include_router(corpus.router)
api.include_router(cleaning.router)
api.include_router(analysis.router)
api.include_router(terminology.router)
api.include_router(concordance.router)
api.include_router(exporting.router)


@api.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


# Toda la API cuelga de /api; el resto de rutas quedan libres para el SPA.
app.mount("/api", api)


# --- Servir el frontend compilado (solo si existe el build) ---
# En desarrollo esta carpeta no existe y FastAPI sirve únicamente la API.
_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str) -> FileResponse:
        """Devuelve index.html para cualquier ruta del SPA (client-side routing)."""
        candidate = _DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_DIST / "index.html")
