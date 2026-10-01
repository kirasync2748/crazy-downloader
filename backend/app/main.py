"""Crazy Downloader — FastAPI application factory."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import cookies, download

app = FastAPI(
    title="Crazy Downloader API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Estimated-Size", "Content-Disposition", "Content-Length", "Content-Type"],
)

# ── API routes ──────────────────────────────────────────────
app.include_router(download.router, prefix="/api")
app.include_router(cookies.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "crazy-downloader"}


@app.get("/api")
async def api_root():
    return {
        "name": "Crazy Downloader API",
        "version": "1.0.0",
        "endpoints": [
            "GET  /api/formats?url=<youtube-url>",
            "GET  /api/download?url=<youtube-url>&format_id=<id>&title=<title>",
            "GET  /api/cookies/status",
            "POST /api/cookies",
            "POST /api/cookies/auto",
            "DELETE /api/cookies",
            "GET  /api/health",
        ],
    }


# ── Serve built frontend in production ──────────────────────
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="frontend")
