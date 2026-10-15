# Crazy Downloader — Backend

FastAPI + yt-dlp + ffmpeg service that extracts YouTube video formats and streams downloads directly to the client with zero server-side storage.

---

## Tech Stack

| Component   | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | FastAPI                             |
| Video engine | yt-dlp                             |
| Merger      | ffmpeg (streamed, no temp files)   |
| HTTP client | httpx (async streaming proxy)       |
| Runtime     | Python 3.14                         |

## Local Development

### Prerequisites

- Python 3.14
- ffmpeg installed (`apt install ffmpeg` / `brew install ffmpeg`)

### Run directly

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint                                                       | Description                                            |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------ |
| `GET`  | `/api/health`                                                  | Health check                                           |
| `GET`  | `/api/formats?url=<youtube-url>`                               | Extract all available formats (cached 5 min)          |
| `GET`  | `/api/download?url=<youtube-url>&format_id=<id>&title=<title>` | Stream a download (auto-merges audio for DASH formats) |

### Headers

- `X-Cookies` (optional) — Base64-encoded Netscape cookies.txt for age-restricted content.

### Response Headers (download)

- `Content-Length` — File size when known (from yt-dlp or upstream CDN).
- `X-Estimated-Size` — Estimated total for merged (ffmpeg) streams where exact size is unknown.
- `Content-Disposition` — Filename for the download.

## How Downloads Work

1. **Progressive formats** (video+audio combined, typically ≤720p): The backend proxies the stream directly from YouTube's CDN to the browser via httpx.

2. **DASH formats** (video-only, typically ≥1080p): The backend finds the best audio-only stream and uses ffmpeg with `-c copy` (no re-encoding) to merge video + audio in real time, piping the result directly to the client. No temporary files are created.

3. **Caching**: Format extraction results are cached in memory for 5 minutes to speed up subsequent downloads of the same URL.

4. **Rate limiting**: 30 requests per 60 seconds per IP.

## Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

## Privacy

- No server-side storage — downloads are piped through, never written to disk.
- Cookies are never persisted — they're written to a temp file, used for the request, then immediately deleted.
- No tracking, no logs, no databases.
