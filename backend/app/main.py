"""Crazy Downloader — FastAPI application factory."""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .middleware import RateLimitMiddleware
from .routers import download

logger = logging.getLogger("crazy_downloader")

app = FastAPI(
    title="Crazy Downloader API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(RateLimitMiddleware, max_requests=30, window_seconds=60)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Estimated-Size", "Content-Disposition", "Content-Length", "Content-Type"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "An unexpected error occurred."})


# ── API routes ──────────────────────────────────────────────
app.include_router(download.router, prefix="/api")


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
            "GET  /api/health",
        ],
    }


# ── Serve built frontend when static files exist ───────────
_static_dir = Path(__file__).resolve().parent.parent / "static"
if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="frontend")
