import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Cookie, X, Upload, ScanSearch, CheckCircle2 } from "lucide-react";
import {
  detectBrowserCookies,
  getCookieStatus,
  setStoredCookies,
  removeStoredCookies,
  type CookieStatus,
} from "../api/client";

export default function CookieManager() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<CookieStatus>({ has_cookies: false, source: null });
  const [cookiesText, setCookiesText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const autoRan = useRef(false);

  const refresh = useCallback(() => {
    setStatus(getCookieStatus());
  }, []);

  const autoDetect = useCallback((): boolean => {
    const detected = detectBrowserCookies();
    if (!detected) return false;
    setStoredCookies(detected, "auto");
    setStatus(getCookieStatus());
    return true;
  }, []);

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    refresh();
    if (!getCookieStatus().has_cookies) {
      autoDetect();
    }
  }, [refresh, autoDetect]);

  const handleManual = () => {
    if (!cookiesText.trim()) {
      setError("Paste your cookies.txt content first.");
      return;
    }
    setError("");
    setSuccess("");
    setStoredCookies(cookiesText, "manual");
    setCookiesText("");
    setStatus(getCookieStatus());
    setSuccess("Cookies saved in your browser.");
  };

  const handleAuto = () => {
    setError("");
    setSuccess("");
    const detected = detectBrowserCookies();
    if (!detected) {
      setError(
        'No YouTube cookies found in your browser. Browsers don\'t share cookies between websites for security. Please export your cookies using a browser extension (e.g. "Get cookies.txt") and paste them below.'
      );
      return;
    }
    setStoredCookies(detected, "auto");
    setStatus(getCookieStatus());
    setSuccess("Cookies auto-detected from your browser.");
  };

  const handleRemove = () => {
    setError("");
    setSuccess("");
    removeStoredCookies();
    setStatus(getCookieStatus());
    setSuccess("Cookies removed from your browser.");
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
          status.has_cookies
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
        }`}
      >
        <Cookie className="h-4 w-4" />
        Cookies
        {status.has_cookies && <span className="flex h-2 w-2 rounded-full bg-emerald-400" />}
      </button>

      {/* Modal */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
            <div
              className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Cookie className="h-5 w-5 text-amber-400" />
                  Cookie Manager
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Privacy note */}
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-blue-300/80">
                <Cookie className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <p>
                  Cookies are stored only in your browser (localStorage). They are sent with each
                  request for that download only and never saved on our server. Clearing your
                  browser data removes them permanently.
                </p>
              </div>

              {/* Status badge */}
              <div
                className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                  status.has_cookies
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${status.has_cookies ? "bg-emerald-400" : "bg-slate-500"}`}
                />
                {status.has_cookies ? `Active — source: ${status.source}` : "No cookies set"}
              </div>

              {/* Auto-extract */}
              <div className="mb-4">
                <button onClick={handleAuto} className="btn-ghost w-full">
                  <ScanSearch className="h-4 w-4" />
                  Auto-detect Browser Cookies
                </button>
                <p className="mt-1.5 text-xs text-slate-500">
                  Checks your browser cookies automatically. If no YouTube cookies are found, use
                  the manual upload below.
                </p>
              </div>

              {/* Manual upload */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Manually add cookies (Netscape cookies.txt format)
                </label>
                <textarea
                  value={cookiesText}
                  onChange={(e) => setCookiesText(e.target.value)}
                  rows={6}
                  placeholder="# Netscape HTTP Cookie File&#10;.youtube.com  TRUE  /  TRUE  1234567890  name  value"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-300 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
                />
                <button onClick={handleManual} className="btn-primary mt-2 w-full text-sm">
                  <Upload className="h-4 w-4" />
                  Save Cookies
                </button>
              </div>

              {/* Remove */}
              {status.has_cookies && (
                <button
                  onClick={handleRemove}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                  Remove Cookies
                </button>
              )}

              {/* Messages */}
              {success && (
                <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </p>
              )}
              {error && <p className="mt-3 text-sm text-red-400 animate-fade-in">{error}</p>}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
