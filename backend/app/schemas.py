"""Pydantic models for API request/response shapes."""

from __future__ import annotations

from pydantic import BaseModel


class FormatInfo(BaseModel):
    format_id: str
    ext: str
    resolution: str | None = None
    width: int | None = None
    height: int | None = None
    fps: float | None = None
    vcodec: str | None = None
    acodec: str | None = None
    filesize: int | None = None
    filesize_approx: int | None = None
    tbr: float | None = None
    format_note: str | None = None
    category: str  # "video_audio" | "video_only" | "audio_only"


class VideoInfo(BaseModel):
    title: str
    thumbnail: str | None = None
    duration: int | None = None
    uploader: str | None = None
    view_count: int | None = None
    formats: list[FormatInfo] = []


class CookieUpload(BaseModel):
    cookies_text: str
    source: str | None = "manual"  # "manual" | "auto"


class CookieStatus(BaseModel):
    has_cookies: bool
    source: str | None = None  # "manual" | "auto" | None
