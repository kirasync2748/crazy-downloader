import { describe, it, expect, beforeEach } from "vitest";
import { detectBrowserCookies, api } from "../api/client";

// ── detectBrowserCookies ────────────────────────────────────

describe("detectBrowserCookies", () => {
  beforeEach(() => {
    // Reset document.cookie between tests
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  });

  it("returns empty string when no cookies exist", () => {
    expect(detectBrowserCookies()).toBe("");
  });

  it("returns empty string when only non-YouTube cookies exist", () => {
    document.cookie = "theme=dark";
    document.cookie = "session_id=abc123";
    expect(detectBrowserCookies()).toBe("");
  });

  it("returns Netscape format when YouTube cookies exist", () => {
    document.cookie = "SID=youtube-session-id";
    document.cookie = "VISITOR_INFO1_LIVE=visitor-value";

    const result = detectBrowserCookies();
    expect(result).toContain("# Netscape HTTP Cookie File");
    expect(result).toContain("SID\tyoutube-session-id");
    expect(result).toContain("VISITOR_INFO1_LIVE\tvisitor-value");
    expect(result).toContain(".youtube.com");
  });

  it("does not return __Secure- prefixed cookies over non-HTTPS", () => {
    // __Secure- cookies require HTTPS and can't be set in test (jsdom http)
    document.cookie = "SID=test-session";
    const result = detectBrowserCookies();
    expect(result).toContain("SID\ttest-session");
    // __Secure-3PSID won't be set by document.cookie in non-secure context
    expect(result).not.toContain("__Secure-3PSID");
  });
});

// ── api.downloadUrl ─────────────────────────────────────────

describe("api.downloadUrl", () => {
  it("builds a correct download URL", () => {
    const url = api.downloadUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "22", "My Video");
    expect(url).toContain("/api/download?");
    expect(url).toContain("url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ");
    expect(url).toContain("format_id=22");
    expect(url).toContain("title=My%20Video");
  });
});
