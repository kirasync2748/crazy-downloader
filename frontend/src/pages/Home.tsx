import { useState } from "react";
import { AlertCircle, Youtube } from "lucide-react";
import UrlInput from "../components/UrlInput";
import FormatList from "../components/FormatList";
import CookieManager from "../components/CookieManager";
import { api, type VideoInfo } from "../api/client";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [activeUrl, setActiveUrl] = useState("");

  const handleSearch = async (url: string) => {
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setActiveUrl(url);
    try {
      const info = await api.getFormats(url);
      if (info.formats.length === 0) {
        setError("No downloadable formats found for this video.");
      } else {
        setVideoInfo(info);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract formats.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-400 sm:text-sm">
          <Youtube className="h-4 w-4 text-red-500" />
          Play locally
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          Download videos
          <br />
          <span className="gradient-text">in any format</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
          Paste a YouTube URL, pick a format, download straight to your device. No storage, no
          sign-up.
        </p>
      </div>

      {/* Search + Cookies */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <UrlInput onSubmit={handleSearch} loading={loading} />
        </div>
        <div className="flex justify-center sm:pt-0.5">
          <CookieManager />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 animate-fade-in">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-300">Something went wrong</p>
            <p className="mt-0.5 text-sm text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {videoInfo && (
        <div className="mt-6">
          <FormatList info={videoInfo} url={activeUrl} />
        </div>
      )}
    </div>
  );
}
