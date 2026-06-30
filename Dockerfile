# --- Stage 1: build del frontend (React + Vite) ---
FROM node:20-slim AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
# Genera /build/dist

# --- Stage 2: runtime (FastAPI sirve API + SPA) ---
FROM python:3.11-slim AS runtime

# Hugging Face Spaces sirve en el puerto 7860.
ENV PORT=7860 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install -r backend/requirements.txt

COPY backend/ ./backend/
# El build del frontend va donde main.py lo busca: <repo>/frontend/dist
COPY --from=frontend /build/dist ./frontend/dist

# El proceso público no necesita privilegios de root.
RUN useradd --create-home --uid 1000 appuser \
    && chown -R appuser:appuser /app
USER appuser

WORKDIR /app/backend
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/api/health', timeout=3)" || exit 1
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
