"""yt-dlp wrapper service — format extraction and streamed downloads."""

from __future__ import annotations

import asyncio
import os
import re
import time
from pathlib import Path
from typing import Any

from yt_dlp import YoutubeDL

COOKIES_DIR = Path(os.environ.get("COOKIES_DIR", "/tmp/crazy_downloader"))
COOKIES_FILE = COOKIES_DIR / "cookies.txt"
SOURCE_MARKER = COOKIES_DIR / ".source"

# ── In-memory format cache (no persistent storage) ──
_format_cache: dict[str, tuple[dict[str, Any], float]] = {}
_CACHE_TTL = 300  # 5 minutes


def cache_get(url: str) -> dict[str, Any] | None:
    """Return cached info dict if still fresh, else None."""
    entry = _format_cache.get(url)
    if entry and time.time() - entry[1] < _CACHE_TTL:
        return entry[0]
    if entry:
        del _format_cache[url]
    return None


def cache_set(url: str, info: dict[str, Any]) -> None:
    _format_cache[url] = (info, time.time())
    expired = [k for k, v in _format_cache.items() if time.time() - v[1] > _CACHE_TTL]
    for k in expired:
        del _format_cache[k]


def _ensure_cookies_dir() -> None:
    COOKIES_DIR.mkdir(parents=True, exist_ok=True)


def get_cookies_path() -> str | None:
    """Return the cookies file path if cookies exist, else None."""
    if COOKIES_FILE.exists() and COOKIES_FILE.stat().st_size > 0:
        return str(COOKIES_FILE)
    return None


def get_cookie_status() -> dict[str, Any]:
    if not COOKIES_FILE.exists() or COOKIES_FILE.stat().st_size == 0:
        return {"has_cookies": False, "source": None}
    source = SOURCE_MARKER.read_text() if SOURCE_MARKER.exists() else "manual"
    return {"has_cookies": True, "source": source}


def save_cookies(cookies_text: str, source: str = "manual") -> None:
    _ensure_cookies_dir()
    COOKIES_FILE.write_text(cookies_text)
    SOURCE_MARKER.write_text(source)


def remove_cookies() -> None:
    if COOKIES_FILE.exists():
        COOKIES_FILE.unlink()
    if SOURCE_MARKER.exists():
        SOURCE_MARKER.unlink()


def auto_extract_cookies() -> tuple[bool, str]:
    """Try to extract YouTube cookies from installed browsers via yt-dlp."""
    _ensure_cookies_dir()
    browsers = ["chrome", "firefox", "edge", "brave", "chromium", "opera", "vivaldi"]
    for browser in browsers:
        try:
            opts: dict[str, Any] = {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "cookiefile": str(COOKIES_FILE),
                "cookiesfrombrowser": (browser,),
            }
            with YoutubeDL(opts) as ydl:
                ydl.extract_info("https://www.youtube.com", download=False)
            if COOKIES_FILE.exists() and COOKIES_FILE.stat().st_size > 0:
                SOURCE_MARKER.write_text("auto")
                return True, f"Cookies extracted from {browser}."
        except Exception:
            continue
    return False, "No browser with YouTube cookies was found on the server."


def _ydl_opts(cookies_path: str | None = None) -> dict[str, Any]:
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "nocheckcertificate": True,
        "noplaylist": True,
    }
    if cookies_path:
        opts["cookiefile"] = cookies_path
    return opts


def _extract_info_sync(url: str, cookies_path: str | None = None) -> dict[str, Any]:
    with YoutubeDL(_ydl_opts(cookies_path)) as ydl:
        return ydl.extract_info(url, download=False)


async def extract_info(url: str, cookies_path: str | None = None) -> dict[str, Any]:
    """Run yt-dlp extraction in a thread to avoid blocking the event loop."""
    return await asyncio.to_thread(_extract_info_sync, url, cookies_path)


def categorize_format(fmt: dict[str, Any]) -> str | None:
    """Return 'video_audio', 'video_only', 'audio_only', or None to skip."""
    vcodec = (fmt.get("vcodec") or "none").lower()
    acodec = (fmt.get("acodec") or "none").lower()
    if vcodec == "none" and acodec == "none":
        return None
    if vcodec != "none" and acodec != "none":
        return "video_audio"
    if vcodec != "none":
        return "video_only"
    return "audio_only"


def _is_hls_format(fmt: dict[str, Any]) -> bool:
    """Return True for HLS/adaptive streaming formats (.m3u8) that can't be downloaded directly."""
    ext = (fmt.get("ext") or "").lower()
    protocol = (fmt.get("protocol") or "").lower()
    return "m3u8" in ext or "m3u8" in protocol


def parse_formats(info: dict[str, Any]) -> list[dict[str, Any]]:
    formats: list[dict[str, Any]] = []
    for f in info.get("formats", []):
        if _is_hls_format(f):
            continue
        category = categorize_format(f)
        if category is None:
            continue
        formats.append(
            {
                "format_id": f.get("format_id", ""),
                "ext": f.get("ext", ""),
                "resolution": f.get("resolution"),
                "width": f.get("width"),
                "height": f.get("height"),
                "fps": f.get("fps"),
                "vcodec": f.get("vcodec"),
                "acodec": f.get("acodec"),
                "filesize": f.get("filesize"),
                "filesize_approx": f.get("filesize_approx") or f.get("filesize"),
                "tbr": f.get("tbr"),
                "format_note": f.get("format_note"),
                "category": category,
            }
        )
    return formats


def find_best_audio(info: dict[str, Any]) -> dict[str, Any] | None:
    """Find the highest-quality audio-only format for merging."""
    best: dict[str, Any] | None = None
    best_tbr = 0.0
    for f in info.get("formats", []):
        if categorize_format(f) != "audio_only":
            continue
        tbr = f.get("tbr") or f.get("abr") or 0
        if tbr >= best_tbr:
            best = f
            best_tbr = tbr
    return best


def find_format(info: dict[str, Any], format_id: str) -> dict[str, Any] | None:
    for f in info.get("formats", []):
        if str(f.get("format_id")) == str(format_id):
            return f
    return None


def sanitize_title(title: str) -> str:
    """Make a string safe for use as a download filename."""
    safe = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", title)
    safe = re.sub(r"\s+", " ", safe).strip()
    return safe[:120] or "download"
