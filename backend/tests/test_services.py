"""Tests for pure service functions (no network calls)."""

from app.services import (
    _is_hls_format,
    categorize_format,
    find_best_audio,
    find_format,
    sanitize_title,
)

# ── sanitize_title ──────────────────────────────────────────


def test_sanitize_title_basic():
    assert sanitize_title("My Video Title") == "My Video Title"


def test_sanitize_title_strips_unsafe_chars():
    assert sanitize_title('file<>:"/\\|?*name') == "file_________name"


def test_sanitize_title_collapses_whitespace():
    assert sanitize_title("  multiple   spaces  ") == "multiple spaces"


def test_sanitize_title_truncates():
    long = "A" * 200
    assert len(sanitize_title(long)) == 120


def test_sanitize_title_empty_fallback():
    assert sanitize_title("") == "download"


# ── categorize_format ───────────────────────────────────────


def test_categorize_video_audio():
    assert categorize_format({"vcodec": "h264", "acodec": "mp4a"}) == "video_audio"


def test_categorize_video_only():
    assert categorize_format({"vcodec": "vp9", "acodec": "none"}) == "video_only"


def test_categorize_audio_only():
    assert categorize_format({"vcodec": "none", "acodec": "mp4a"}) == "audio_only"


def test_categorize_skips_no_codecs():
    assert categorize_format({"vcodec": "none", "acodec": "none"}) is None


# ── _is_hls_format ──────────────────────────────────────────


def test_is_hls_by_protocol():
    assert _is_hls_format({"ext": "mp4", "protocol": "m3u8_native"}) is True


def test_is_hls_by_ext():
    assert _is_hls_format({"ext": "m3u8", "protocol": "http"}) is True


def test_is_not_hls():
    assert _is_hls_format({"ext": "mp4", "protocol": "https"}) is False


# ── find_format ─────────────────────────────────────────────


def test_find_format_match():
    formats = [{"format_id": "22"}, {"format_id": "18"}]
    assert find_format({"formats": formats}, "18") == {"format_id": "18"}


def test_find_format_no_match():
    assert find_format({"formats": [{"format_id": "22"}]}, "99") is None


# ── find_best_audio ─────────────────────────────────────────


def test_find_best_audio():
    formats = [
        {"vcodec": "none", "acodec": "mp4a", "tbr": 48},
        {"vcodec": "none", "acodec": "mp4a", "tbr": 160},
        {"vcodec": "none", "acodec": "mp4a", "tbr": 128},
    ]
    best = find_best_audio({"formats": formats})
    assert best is not None
    assert best["tbr"] == 160


def test_find_best_audio_none():
    assert find_best_audio({"formats": [{"vcodec": "h264", "acodec": "mp4a"}]}) is None


# ── cache ───────────────────────────────────────────────────


def test_cache_set_and_get():
    from app.services import cache_get, cache_set

    cache_set("https://example.com", {"title": "test"})
    assert cache_get("https://example.com") == {"title": "test"}


def test_cache_miss():
    from app.services import cache_get

    assert cache_get("https://nonexistent.com") is None
