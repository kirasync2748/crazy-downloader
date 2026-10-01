"""Tests for the health and root endpoints."""

from fastapi.testclient import TestClient


def test_health(client: TestClient):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "crazy-downloader"


def test_api_root(client: TestClient):
    res = client.get("/api")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Crazy Downloader API"
    assert any("/api/health" in ep for ep in data["endpoints"])
