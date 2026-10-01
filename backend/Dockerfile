# ── Crazy Downloader backend ── Python 3.14 + yt-dlp ──
FROM python:3.14-slim

# ffmpeg is needed for post-processing / format merging fallback
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# In production the frontend build is copied to backend/static (see docker-compose.yml)
ENV COOKIES_DIR=/tmp/crazy_downloader

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
