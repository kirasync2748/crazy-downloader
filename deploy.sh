#!/usr/bin/env bash
# Crazy Downloader -- Docker build & deploy
set -euo pipefail

echo ""
echo "Crazy Downloader -- Docker Deployment"
echo "======================================"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo ""
echo "Building and starting containers..."
docker compose up -d --build

echo ""
echo "Waiting for services to start..."
sleep 5

echo ""
echo "Deployment complete!"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000/api/health"
echo ""
echo "Container status:"
docker compose ps
echo ""
