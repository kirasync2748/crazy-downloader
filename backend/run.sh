#!/usr/bin/env bash
# Start the Crazy Downloader backend for local development.
set -euo pipefail

cd "$(dirname "$0")"

echo "Starting Crazy Downloader backend..."
echo "   Python: $(python --version 2>&1)"
echo "   yt-dlp: $(yt-dlp --version 2>&1 || echo 'not installed')"

pip install --quiet -r requirements.txt

exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
