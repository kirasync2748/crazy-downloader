import { useState, useEffect, useCallback, useRef } from "react";
import { Cookie, X, Upload, ScanSearch, Loader2, CheckCircle2 } from "lucide-react";
import { api, detectBrowserCookies, type CookieStatus } from "../api/client";

export default function CookieManager() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<CookieStatus>({ has_cookies: false, source: null });
  const [cookiesText, setCookiesText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const autoRan = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setStatus(await api.getCookieStatus());
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-detect browser cookies on page load (client-side, no server call)
  const autoDetect = useCallback(async (): Promise<boolean> => {
    const cookiesText = detectBrowserCookies();
    if (!cookiesText) return false;
    try {
      setStatus(await api.uploadCookies(cookiesText, "auto"));
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    (async () => {
      await refresh();
      // Only auto-detect if no cookies are already set
      const current = await api.getCookieStatus();
      if (!current.has_cookies) {
        await autoDetect();
      }
    })();
  }, [refresh, autoDetect]);

  const handleManual = async () => {
    if (!cookiesText.trim()) {
      setError("Paste your cookies.txt content first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      setStatus(await api.uploadCookies(cookiesText));
      setCookiesText("");
      setSuccess("Cookies saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save cookies.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuto = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const cookiesText = detectBrowserCookies();
      if (!cookiesText) {
        setError(
          'No YouTube cookies found in your browser. Browsers don\'t share cookies between websites for security. Please export your cookies using a browser extension (e.g. "Get cookies.txt") and paste them below.'
        );
        return;
      }
      setStatus(await api.uploadCookies(cookiesText, "auto"));
      setSuccess("Cookies auto-detected from your browser successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auto-detection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      setStatus(await api.removeCookies());
      setSuccess("Cookies removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove cookies.");
    } finally {
      setLoading(false);
    }
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
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-slide-up"
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
              <button onClick={handleAuto} disabled={loading} className="btn-ghost w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanSearch className="h-4 w-4" />
                )}
                Auto-detect Browser Cookies
              </button>
              <p className="mt-1.5 text-xs text-slate-500">
                Checks your browser cookies automatically when you visit this page. If no YouTube
                cookies are found, use the manual upload below.
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
              <button
                onClick={handleManual}
                disabled={loading}
                className="btn-primary mt-2 w-full text-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Save Cookies
              </button>
            </div>

            {/* Remove */}
            {status.has_cookies && (
              <button
                onClick={handleRemove}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
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
        </div>
      )}
    </>
  );
}
