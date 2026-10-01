# Crazy Downloader

Web application that lets you paste any public YouTube URL, view every available format and quality, and download the file directly to your device — with no server-side storage, no tracking, and no sign-up required.

---

## Features

- **Instant format extraction** — Paste a URL and see all available qualities in a single click.
- **Video and audio merge** — DASH (video-only) formats are automatically merged with the best audio stream via ffmpeg, so every download includes sound.
- **Real-time progress bar** — Watch the download happen with live percentage, speed (MB/s), and bytes transferred.
- **Direct downloads** — Files stream through the server as a pipe; nothing is stored on disk.
- **Cookie support** — Add cookies for age-restricted or private content. You stay in control.

## Tech Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Backend  | Python 3.14 · FastAPI · yt-dlp 2026.08.19 · ffmpeg    |
| Frontend | TypeScript 7 · React 19 · Vite 6 · Tailwind CSS 3     |
| Runtime  | Node.js 24 LTS                                        |

## Railway Deploy 

1. Click the **Deploy on Railway** button above.
2. Railway will automatically build the Docker image (frontend + backend in one container).
3. Once the build finishes, you receive a live URL — that's it.

The app uses a **single-service architecture**: the FastAPI backend serves both the API (`/api/*`) and the built static frontend. No additional services or databases are needed.

## Local Development

### Prerequisites

- Docker and Docker Compose
- Or: Python 3.14 + Node.js 24 (for running without Docker)

### Option A — Docker (recommended)

```bash
git clone https://github.com/kirasync2748/crazy-downloader.git
cd crazy-downloader
docker compose -f docker-compose.yml up -d --build
```

- Frontend + API: http://localhost:3000
- API health: http://localhost:8000/api/health

### Option B — Run directly

**Backend:**

```bash
cd backend
pip install -r requirements.txt
# Make sure ffmpeg is installed: apt install ffmpeg / brew install ffmpeg
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

## Production Docker (single image)

```bash
docker build -t crazy-downloader .
docker run -p 8000:8000 crazy-downloader
```

The multi-stage `Dockerfile` at the repository root builds the frontend, copies it into the backend container, and serves everything from a single port.

## API Reference

| Method   | Endpoint                                                                | Description                                              |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET`    | `/api/health`                                                           | Health check                                             |
| `GET`    | `/api/formats?url=<youtube-url>`                                        | Extract all available formats                            |
| `GET`    | `/api/download?url=<youtube-url>&format_id=<id>&title=<title>`         | Stream a download (auto-merges audio for DASH formats)   |
| `GET`    | `/api/cookies/status`                                                   | Check if cookies are set                                 |
| `POST`   | `/api/cookies`                                                          | Upload a cookies.txt file                                |
| `POST`   | `/api/cookies/auto`                                                     | Attempt automatic cookie extraction                      |
| `DELETE` | `/api/cookies`                                                          | Remove stored cookies                                    |

### Example

```bash
# Get formats
curl "http://localhost:8000/api/formats?url=https://youtu.be/U6PZO1n9EPg"

# Download (video_only formats auto-merge with best audio)
curl -L -o video.mp4 "http://localhost:8000/api/download?url=https://youtu.be/U6PZO1n9EPg&format_id=137&title=my_video"
```

## Privacy and Storage

- **No server-side storage.** Downloads stream through the server as a pipe — the video never touches disk.
- **Cookies are ephemeral.** They are stored in `/tmp` and disappear when the container restarts.
- **No tracking.** No analytics, no logs, no databases.

## How It Works

1. **Format extraction.** The backend uses yt-dlp's Python API to extract all available formats from the YouTube URL. Results are cached in memory for five minutes to speed up subsequent downloads.
2. **Download (progressive formats).** For formats with combined video and audio (typically 720p and below), the backend proxies the stream directly from YouTube's CDN to your browser.
3. **Download (DASH formats).** For video-only formats (typically 1080p and above), the backend automatically finds the best audio stream and uses ffmpeg to merge them in real time, piping the result directly to your browser. No temporary files are created.
4. **Progress tracking.** The frontend uses the Fetch API's streaming reader to track bytes received in real time, showing a live progress bar with percentage, speed, and file size.

## License

For personal and educational use. Please respect YouTube's Terms of Service and applicable copyright laws.

---

<p align="center">Crazy Downloader</p>
