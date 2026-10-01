"""Tests for cookie management endpoints."""

from fastapi.testclient import TestClient

COOKIES_TEXT = """# Netscape HTTP Cookie File

.youtube.com\tTRUE\t/\tTRUE\t0\tSID\ttest-value
.youtube.com\tTRUE\t/\tTRUE\t0\tVISITOR_INFO1_LIVE\tabc123
"""


def test_cookie_status_empty(client: TestClient):
    res = client.get("/api/cookies/status")
    assert res.status_code == 200
    assert res.json() == {"has_cookies": False, "source": None}


def test_upload_and_status(client: TestClient):
    res = client.post("/api/cookies", json={"cookies_text": COOKIES_TEXT})
    assert res.status_code == 200
    assert res.json()["has_cookies"] is True
    assert res.json()["source"] == "manual"

    # Status should persist
    res = client.get("/api/cookies/status")
    assert res.json()["has_cookies"] is True


def test_upload_with_auto_source(client: TestClient):
    res = client.post(
        "/api/cookies",
        json={"cookies_text": COOKIES_TEXT, "source": "auto"},
    )
    assert res.json()["source"] == "auto"


def test_upload_rejects_empty(client: TestClient):
    res = client.post("/api/cookies", json={"cookies_text": "   "})
    assert res.status_code == 400


def test_upload_rejects_bad_format(client: TestClient):
    res = client.post("/api/cookies", json={"cookies_text": "just some text"})
    assert res.status_code == 400


def test_remove_cookies(client: TestClient):
    client.post("/api/cookies", json={"cookies_text": COOKIES_TEXT})
    assert client.get("/api/cookies/status").json()["has_cookies"] is True

    res = client.delete("/api/cookies")
    assert res.status_code == 200
    assert res.json()["has_cookies"] is False
