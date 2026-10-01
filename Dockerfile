# ── Crazy Downloader — single-service production build ──
# Builds the frontend (Vite) and backend (FastAPI) into one image.
# The backend serves both the API and the built static frontend.

# ── Stage 1: Build frontend ──
FROM node:24-slim AS frontend-build
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Stage 2: Backend + static frontend ──
FROM python:3.14-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /build/dist ./static

ENV COOKIES_DIR=/tmp/crazy_downloader
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
