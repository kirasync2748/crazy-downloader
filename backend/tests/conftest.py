"""Shared test fixtures."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

# Use a temp cookies dir so tests never touch real files
_TMP_COOKIES = Path("/tmp/crazy_downloader_test")


@pytest.fixture(autouse=True)
def isolated_cookies_dir(monkeypatch):
    """Each test gets a clean cookies directory."""
    if _TMP_COOKIES.exists():
        shutil.rmtree(_TMP_COOKIES)
    _TMP_COOKIES.mkdir(parents=True)
    monkeypatch.setattr("app.services.COOKIES_DIR", _TMP_COOKIES)
    monkeypatch.setattr("app.services.COOKIES_FILE", _TMP_COOKIES / "cookies.txt")
    monkeypatch.setattr("app.services.SOURCE_MARKER", _TMP_COOKIES / ".source")
    yield
    if _TMP_COOKIES.exists():
        shutil.rmtree(_TMP_COOKIES)


@pytest.fixture
def client():
    return TestClient(app)
