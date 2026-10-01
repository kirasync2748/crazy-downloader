const API_BASE = import.meta.env.VITE_API_URL ?? "";

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
 *
 * Note: browsers enforce Same-Origin Policy, so document.cookie only contains
 * cookies for OUR domain — not youtube.com. This will only find YouTube cookies
 * if they were explicitly set for this origin. In most cases it returns "" and
 * the user should use manual upload instead.
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
    return request<VideoInfo>(`${API_BASE}/api/formats?url=${encodeURIComponent(url)}`);
  },

  downloadUrl(url: string, formatId: string, title: string): string {
    return `${API_BASE}/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(formatId)}&title=${encodeURIComponent(title)}`;
  },

  async getCookieStatus(): Promise<CookieStatus> {
    return request<CookieStatus>(`${API_BASE}/api/cookies/status`);
  },

  async uploadCookies(cookiesText: string, source: string = "manual"): Promise<CookieStatus> {
    return request<CookieStatus>(`${API_BASE}/api/cookies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookies_text: cookiesText, source }),
    });
  },

  async autoCookies(): Promise<CookieStatus> {
    return request<CookieStatus>(`${API_BASE}/api/cookies/auto`, {
      method: "POST",
    });
  },

  async removeCookies(): Promise<CookieStatus> {
    return request<CookieStatus>(`${API_BASE}/api/cookies`, {
      method: "DELETE",
    });
  },
};
