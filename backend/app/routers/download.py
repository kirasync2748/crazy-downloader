"""Video format extraction and streaming download endpoints."""

from __future__ import annotations

import asyncio

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from ..services import (
    cache_get,
    cache_set,
    categorize_format,
    extract_info,
    find_best_audio,
    find_format,
    get_cookies_path,
    parse_formats,
    sanitize_title,
)

router = APIRouter(tags=["download"])


async def _get_info(url: str) -> dict:
    """Get video info from cache or extract fresh (cache speeds up downloads)."""
    info = cache_get(url)
    if info:
        return info
    cookies_path = get_cookies_path()
    try:
        info = await extract_info(url, cookies_path)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not extract video info: {exc}") from exc
    cache_set(url, info)
    return info


@router.get("/formats")
async def get_formats(url: str = Query(..., description="Public YouTube video URL")):
    """Extract all available formats for a YouTube video."""
    if not url.strip():
        raise HTTPException(status_code=400, detail="A URL is required.")

    info = await _get_info(url)

    return {
        "title": info.get("title", "Unknown"),
        "thumbnail": info.get("thumbnail"),
        "duration": info.get("duration"),
        "uploader": info.get("uploader"),
        "view_count": info.get("view_count"),
        "formats": parse_formats(info),
    }


@router.get("/download")
async def download_video(
    url: str = Query(..., description="Public YouTube video URL"),
    format_id: str = Query(..., description="Format ID from /formats"),
    title: str = Query("video", description="Preferred filename stem"),
):
    """Stream the selected format directly to the client — no server-side storage.

    For video-only (DASH) formats, automatically merges with the best audio
    stream using ffmpeg so the downloaded file has both video and audio.
    """
    info = await _get_info(url)

    fmt = find_format(info, format_id)
    if not fmt or "url" not in fmt:
        raise HTTPException(status_code=404, detail="Selected format not found.")

    category = categorize_format(fmt)
    direct_url = fmt["url"]
    headers = info.get("http_headers", {})
    ext = fmt.get("ext", "mp4")
    filesize: int | None = fmt.get("filesize") or fmt.get("filesize_approx")
    safe_title = sanitize_title(title)

    # ── Video-only format: merge with best audio via ffmpeg ──
    if category == "video_only":
        audio_fmt = find_best_audio(info)
        if audio_fmt and audio_fmt.get("url"):
            estimated_size = (fmt.get("filesize") or fmt.get("filesize_approx") or 0) + (
                audio_fmt.get("filesize") or audio_fmt.get("filesize_approx") or 0
            )
            return await _stream_merged(
                video_url=direct_url,
                audio_url=audio_fmt["url"],
                headers=headers,
                video_ext=ext,
                title=safe_title,
                estimated_size=estimated_size,
            )
        # No audio stream available — fall through to direct stream (video only)

    # ── Direct stream (progressive video+audio or audio-only) ──
    client = httpx.AsyncClient(
        follow_redirects=True,
        timeout=httpx.Timeout(600.0, connect=30.0),
    )
    try:
        upstream = await client.send(
            client.build_request("GET", direct_url, headers=headers),
            stream=True,
        )
    except Exception:
        await client.aclose()
        raise HTTPException(status_code=502, detail="Could not reach the video stream.") from None

    resp_headers: dict[str, str] = {
        "Content-Disposition": f'attachment; filename="{safe_title}.{ext}"',
    }
    if "content-type" in upstream.headers:
        resp_headers["Content-Type"] = upstream.headers["content-type"]
    if filesize:
        resp_headers["Content-Length"] = str(filesize)

    async def stream():
        try:
            async for chunk in upstream.aiter_raw():
                yield chunk
        finally:
            await upstream.aclose()
            await client.aclose()

    return StreamingResponse(stream(), headers=resp_headers)


async def _stream_merged(
    video_url: str,
    audio_url: str,
    headers: dict,
    video_ext: str,
    title: str,
    estimated_size: int = 0,
):
    """Merge video and audio streams with ffmpeg, piping output directly to the client.

    Uses -c copy (no re-encoding) for speed. Output container matches the video
    codec family: MP4 for H.264, WEBM for VP9. No temp files — pure pipe.
    """
    header_str = "".join(f"{k}: {v}\r\n" for k, v in headers.items())

    if video_ext == "webm":
        output_fmt = "webm"
        output_ext = "webm"
        extra_flags: list[str] = []
    else:
        output_fmt = "mp4"
        output_ext = "mp4"
        extra_flags = ["-movflags", "frag_keyframe+empty_moov"]

    cmd: list[str] = [
        "ffmpeg",
        "-headers",
        header_str,
        "-i",
        video_url,
        "-i",
        audio_url,
        "-c",
        "copy",
        *extra_flags,
        "-f",
        output_fmt,
        "pipe:1",
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    # Read the first chunk to detect immediate ffmpeg errors
    first_chunk = await process.stdout.read(65536)
    if not first_chunk:
        stderr_data = b""
        if process.stderr:
            stderr_data = await process.stderr.read()
        await process.wait()
        error_msg = stderr_data.decode("utf-8", errors="replace")[:300]
        raise HTTPException(status_code=500, detail=f"ffmpeg merge failed: {error_msg}")

    filename = f"{title}.{output_ext}"

    async def stream():
        yield first_chunk
        while True:
            chunk = await process.stdout.read(65536)
            if not chunk:
                break
            yield chunk
        await process.wait()

    resp_headers: dict[str, str] = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": f"video/{output_fmt}",
    }
    if estimated_size:
        resp_headers["X-Estimated-Size"] = str(estimated_size)

    return StreamingResponse(stream(), headers=resp_headers)
