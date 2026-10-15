const API_BASE = import.meta.env.VITE_API_URL ?? "";

const COOKIES_STORAGE_KEY = "crazy-downloader-cookies";
const COOKIES_SOURCE_KEY = "crazy-downloader-cookies-source";

export interface FormatInfo {
  format_id: string;
  ext: string;
  resolution: string | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  vcodec: string | null;
  acodec: string | null;
  filesize: number | null;
  filesize_approx: number | null;
  tbr: number | null;
  format_note: string | null;
  category: "video_audio" | "video_only" | "audio_only";
}

export interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  view_count: number | null;
  formats: FormatInfo[];
}

export interface CookieStatus {
  has_cookies: boolean;
  source: string | null;
}

// ── Cookie storage (browser localStorage — never stored on server) ──

export function getStoredCookies(): string {
  return localStorage.getItem(COOKIES_STORAGE_KEY) || "";
}

export function setStoredCookies(text: string, source: string = "manual"): void {
  localStorage.setItem(COOKIES_STORAGE_KEY, text);
  localStorage.setItem(COOKIES_SOURCE_KEY, source);
}

export function removeStoredCookies(): void {
  localStorage.removeItem(COOKIES_STORAGE_KEY);
  localStorage.removeItem(COOKIES_SOURCE_KEY);
}

export function getCookieStatus(): CookieStatus {
  const text = getStoredCookies();
  if (!text) return { has_cookies: false, source: null };
  return { has_cookies: true, source: localStorage.getItem(COOKIES_SOURCE_KEY) || "manual" };
}

function encodeCookiesBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Returns headers to attach to API requests so the server can use cookies per-request. */
export function getCookiesHeader(): Record<string, string> {
  const cookies = getStoredCookies();
  if (!cookies) return {};
  return { "X-Cookies": encodeCookiesBase64(cookies) };
}

// Known YouTube cookie names — used to filter document.cookie
const YOUTUBE_COOKIE_NAMES = new Set([
  "VISITOR_INFO1_LIVE",
  "GPS",
  "SID",
  "HSID",
  "SSID",
  "APISID",
  "SAPISID",
  "LOGIN_INFO",
  "PREF",
  "YSC",
  "SIDCC",
  "__Secure-3PSID",
  "__Secure-3PAPISID",
  "__Secure-1PSID",
  "__Secure-1PAPISID",
  "__Secure-3PSIDTS",
]);

/**
 * Read cookies from the user's browser (document.cookie) and convert any
 * YouTube-relevant ones to Netscape cookies.txt format.
 * Returns the cookies text, or empty string if no YouTube cookies found.
 */
export function detectBrowserCookies(): string {
  const raw = document.cookie;
  if (!raw) return "";

  const pairs = raw
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  const ytCookies: { name: string; value: string }[] = [];

  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    if (!name) continue;
    const bareName = name.replace(/^__Secure-/, "");
    if (YOUTUBE_COOKIE_NAMES.has(name) || YOUTUBE_COOKIE_NAMES.has(bareName)) {
      ytCookies.push({ name, value });
    }
  }

  if (ytCookies.length === 0) return "";

  let text = "# Netscape HTTP Cookie File\n\n";
  for (const c of ytCookies) {
    text += `.youtube.com\tTRUE\t/\tTRUE\t0\t${c.name}\t${c.value}\n`;
  }
  return text;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  async getFormats(url: string): Promise<VideoInfo> {
    return request<VideoInfo>(`${API_BASE}/api/formats?url=${encodeURIComponent(url)}`, {
      headers: getCookiesHeader(),
    });
  },

  downloadUrl(url: string, formatId: string, title: string): string {
    return `${API_BASE}/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(formatId)}&title=${encodeURIComponent(title)}`;
  },
};
