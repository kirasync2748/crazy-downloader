"""Cookie management endpoints — auto-extract, manual upload, remove."""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException

from ..schemas import CookieStatus, CookieUpload
from ..services import (
    auto_extract_cookies,
    get_cookie_status,
    remove_cookies,
    save_cookies,
)

router = APIRouter(tags=["cookies"])


@router.get("/cookies/status", response_model=CookieStatus)
async def cookie_status():
    return get_cookie_status()


@router.post("/cookies", response_model=CookieStatus)
async def upload_cookies(body: CookieUpload):
    text = body.cookies_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Cookies text must not be empty.")
    if "# Netscape HTTP Cookie File" not in text and not text.startswith("# "):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid Netscape cookies format. Expected '# Netscape HTTP Cookie File' header."
            ),
        )
    save_cookies(text, body.source or "manual")
    return get_cookie_status()


@router.post("/cookies/auto", response_model=CookieStatus)
async def auto_cookies():
    success, message = await asyncio.to_thread(auto_extract_cookies)
    if not success:
        raise HTTPException(status_code=422, detail=message)
    return get_cookie_status()


@router.delete("/cookies", response_model=CookieStatus)
async def clear_cookies():
    remove_cookies()
    return get_cookie_status()
