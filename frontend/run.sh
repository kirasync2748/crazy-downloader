#!/usr/bin/env bash
# Start the Crazy Downloader frontend for local development.
set -euo pipefail
cd "$(dirname "$0")"

echo "Starting Crazy Downloader frontend..."
echo "   Node: $(node --version)"

npm install

exec npm run dev
