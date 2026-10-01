#!/usr/bin/env bash
# Crazy Downloader -- one-command local setup
set -euo pipefail

echo ""
echo "Crazy Downloader -- Setup"
echo "=========================="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Backend
echo ""
echo "Installing backend dependencies (Python + yt-dlp)..."
cd backend
python3 -m pip install --user -r requirements.txt
cd "$ROOT_DIR"

# Frontend
echo ""
echo "Installing frontend dependencies (Node + TypeScript)..."
cd frontend
npm install
cd "$ROOT_DIR"

echo ""
echo "Setup complete!"
echo ""
echo "   Start backend:   cd backend && ./run.sh"
echo "   Start frontend:  cd frontend && ./run.sh"
echo "   Or run both:     docker compose up -d --build"
echo ""
