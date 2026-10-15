import { useState, useRef } from "react";
import {
  Download,
  Film,
  Music,
  Clock,
  Eye,
  Cpu,
  Check,
  X,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { getCookiesHeader, type VideoInfo, type FormatInfo } from "../api/client";

interface Props {
  info: VideoInfo;
  url: string;
}

interface DownloadState {
  status: "idle" | "downloading" | "done" | "error";
  phase: "connecting" | "downloading" | "merging" | "finalizing";
  received: number;
  total: number;
  percent: number; // -1 = unknown
  speed: number; // MB/s
  eta: number | null; // seconds remaining, null = unknown
  errorMsg: string;
}

const idleState: DownloadState = {
  status: "idle",
  phase: "connecting",
  received: 0,
  total: 0,
  percent: -1,
  speed: 0,
  eta: null,
  errorMsg: "",
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let sz = bytes;
  while (sz >= 1024 && i < units.length - 1) {
    sz /= 1024;
    i++;
  }
  return `${sz.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatETA(seconds: number | null): string {
  if (seconds == null || seconds <= 0 || !isFinite(seconds)) return "";
  if (seconds < 60) return `${Math.ceil(seconds)}s left`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `${m}m ${s}s left`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function qualityLabel(fmt: FormatInfo): string {
  if (fmt.format_note && /^\d+p/.test(fmt.format_note)) return fmt.format_note;
  if (fmt.height) return `${fmt.height}p`;
  if (fmt.resolution) return fmt.resolution;
  if (fmt.tbr) return `${Math.round(fmt.tbr)}k`;
  return "Audio";
}

const isVideo = (cat: FormatInfo["category"]) => cat === "video_audio" || cat === "video_only";

function FormatCard({ fmt, url, title }: { fmt: FormatInfo; url: string; title: string }) {
  const [state, setState] = useState<DownloadState>(idleState);
  const abortRef = useRef<AbortController | null>(null);
  const quality = qualityLabel(fmt);

  const handleDownload = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ ...idleState, status: "downloading", phase: "connecting" });

    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(fmt.format_id)}&title=${encodeURIComponent(title)}`;
      const response = await fetch(downloadUrl, {
        signal: controller.signal,
        headers: getCookiesHeader(),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Server error ${response.status}`);
      }
      if (!response.body) throw new Error("Streaming not supported");

      // Resolve total size from headers
      const contentLength = response.headers.get("Content-Length");
      const estimatedSize = response.headers.get("X-Estimated-Size");
      const total = contentLength
        ? parseInt(contentLength)
        : estimatedSize
          ? parseInt(estimatedSize)
          : 0;

      // Detect if this is a merged (ffmpeg) stream — no Content-Length but has estimate
      const isMerged = !contentLength && !!estimatedSize;
      if (isMerged) {
        setState((prev) => ({ ...prev, phase: "merging", total }));
      } else {
        setState((prev) => ({ ...prev, phase: "downloading", total }));
      }

      // Parse filename from Content-Disposition
      const disposition = response.headers.get("Content-Disposition") || "";
      const nameMatch = disposition.match(/filename="?(.+?)"?(?:;|$)/);
      const filename = nameMatch ? nameMatch[1] : `${title}.${fmt.ext}`;

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      let lastUpdate = 0;
      let lastReceived = 0;
      let lastSpeedTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;

        const now = Date.now();
        // Update every 100ms for snappy real-time feedback (was 200ms)
        if (now - lastUpdate > 100) {
          const dt = (now - lastSpeedTime) / 1000;
          const instantSpeed = (received - lastReceived) / 1024 / 1024 / Math.max(dt, 0.1);
          const percent = total > 0 ? Math.min(99, Math.round((received / total) * 100)) : -1;
          // EMA: blend previous speed with instant speed for smooth-but-responsive feedback
          setState((prev) => {
            const smoothSpeed =
              prev.speed > 0 ? prev.speed * 0.6 + instantSpeed * 0.4 : instantSpeed;
            const eta =
              smoothSpeed > 0 && total > 0
                ? (total - received) / (smoothSpeed * 1024 * 1024)
                : null;
            return { ...prev, received, total, percent, speed: smoothSpeed, eta };
          });
          lastReceived = received;
          lastSpeedTime = now;
          lastUpdate = now;
        }
      }

      // Finalizing — assemble blob and trigger save
      setState((prev) => ({ ...prev, phase: "finalizing", percent: 100, eta: null }));

      const blob = new Blob(chunks as BlobPart[], {
        type: response.headers.get("Content-Type") || "application/octet-stream",
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setState((prev) => ({ ...prev, status: "done" }));
      setTimeout(() => setState(idleState), 2500);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setState(idleState);
        return;
      }
      console.error("Download failed:", err);
      setState({
        ...idleState,
        status: "error",
        errorMsg: err instanceof Error ? err.message : "Download failed",
      });
      setTimeout(() => setState(idleState), 4000);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
  };

  // ── Phase labels ──
  const phaseLabels: Record<string, string> = {
    connecting: "Connecting to server…",
    downloading: "Downloading from YouTube…",
    merging: "Fetching & merging video + audio…",
    finalizing: "Finalizing your file…",
  };

  // ── Downloading / done / error states show a progress card ──
  if (state.status !== "idle") {
    const isDone = state.status === "done";
    const isError = state.status === "error";
    const isIndeterminate = state.percent < 0 && !isDone;
    const isActive = !isDone && !isError;

    return (
      <div
        className={`rounded-xl border p-3.5 transition-all ${
          isDone
            ? "border-emerald-500/20 bg-emerald-500/[0.03]"
            : isError
              ? "border-red-500/20 bg-red-500/[0.03]"
              : "border-brand-500/20 bg-brand-500/[0.03]"
        }`}
      >
        {/* Header row */}
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-white">{quality}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-slate-300">
              {fmt.ext}
            </span>
            {isDone ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Downloaded
              </span>
            ) : isError ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Failed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-brand-300">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isIndeterminate ? phaseLabels[state.phase] : `${state.percent}%`}
              </span>
            )}
          </div>
          {isActive && (
            <button
              onClick={handleCancel}
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-red-400"
              aria-label="Cancel download"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/10">
          {isDone ? (
            <div className="progress-fill h-full w-full !from-emerald-500 !via-teal-400 !to-emerald-500" />
          ) : isError ? (
            <div className="h-full w-full rounded-full bg-gradient-to-r from-red-500 to-rose-500" />
          ) : isIndeterminate ? (
            <div className="progress-fill h-full w-1/4 animate-indeterminate" />
          ) : (
            <div
              className="progress-fill transition-all duration-150 ease-out"
              style={{ width: `${state.percent}%` }}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          {isError ? (
            <span className="truncate text-red-400/70">{state.errorMsg}</span>
          ) : isDone ? (
            <span className="text-emerald-400/70">Saved to your device</span>
          ) : (
            <>
              <span className="flex items-center gap-2">
                {isIndeterminate && (
                  <span className="text-slate-400">{phaseLabels[state.phase]}</span>
                )}
                <span className="tabular-nums">
                  {isIndeterminate
                    ? `${formatBytes(state.received)} streamed`
                    : `${formatBytes(state.received)} / ${formatBytes(state.total)}`}
                </span>
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                {state.speed > 0 && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Zap className="h-3 w-3 text-amber-400/70" />
                    {state.speed.toFixed(1)} MB/s
                  </span>
                )}
                {state.eta != null && state.eta > 0 && (
                  <span className="text-slate-400">{formatETA(state.eta)}</span>
                )}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Normal idle card ──
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-white/10 hover:bg-white/[0.05] animate-fade-in">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{quality}</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-slate-300">
            {fmt.ext}
          </span>
          {fmt.fps && fmt.fps > 30 && (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
              {fmt.fps}fps
            </span>
          )}
          <span className="text-xs text-slate-500">
            {formatBytes(fmt.filesize ?? fmt.filesize_approx ?? 0)}
          </span>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-600/20 transition-all hover:from-brand-500 hover:to-fuchsia-500 active:scale-95"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
  );
}

export default function FormatList({ info, url }: Props) {
  const videoFormats = info.formats
    .filter((f) => isVideo(f.category))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0) || (b.tbr ?? 0) - (a.tbr ?? 0));

  const audioFormats = info.formats
    .filter((f) => f.category === "audio_only")
    .sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0));

  return (
    <div className="animate-slide-up space-y-5">
      {/* Video meta card */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          {info.thumbnail && (
            <img
              src={info.thumbnail}
              alt={info.title}
              className="aspect-video w-full rounded-lg object-cover shadow-lg sm:h-24 sm:w-44 sm:aspect-auto"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-base font-bold text-white sm:text-lg">{info.title}</h2>
            {info.uploader && <p className="mt-1 text-sm text-slate-400">{info.uploader}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {info.duration != null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(info.duration)}
                </span>
              )}
              {info.view_count != null && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {info.view_count.toLocaleString()} views
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video + Audio section */}
      {videoFormats.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Film className="h-4 w-4 text-brand-400" />
            Video + Audio
          </h3>
          <div className="space-y-2">
            {videoFormats.map((fmt) => (
              <FormatCard key={fmt.format_id} fmt={fmt} url={url} title={info.title} />
            ))}
          </div>
        </div>
      )}

      {/* Audio Only section */}
      {audioFormats.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Music className="h-4 w-4 text-amber-400" />
            Audio Only
          </h3>
          <div className="space-y-2">
            {audioFormats.map((fmt) => (
              <FormatCard key={fmt.format_id} fmt={fmt} url={url} title={info.title} />
            ))}
          </div>
        </div>
      )}

      {/* No formats */}
      {videoFormats.length === 0 && audioFormats.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center">
          <Cpu className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">No downloadable formats found.</p>
        </div>
      )}
    </div>
  );
}
