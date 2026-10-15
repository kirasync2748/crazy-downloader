import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import GitHubBadge from "./GitHubBadge";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Ambient background glow ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand-600/[0.07] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[400px] rounded-full bg-fuchsia-600/[0.05] blur-[100px] animate-float" />
        <div
          className="absolute left-0 top-2/3 h-[250px] w-[350px] rounded-full bg-pink-600/[0.04] blur-[100px] animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-lg shadow-brand-500/30 transition-all duration-300 group-hover:shadow-fuchsia-500/50 group-hover:scale-105">
              <div className="absolute inset-px rounded-[10px] ring-1 ring-inset ring-white/20" />
              <Download className="relative h-[18px] w-[18px] text-white drop-shadow-sm" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">Crazy</span>
              <span className="animate-gradient-text ml-0.5">Downloader</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <GitHubBadge />
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-slate-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Download className="h-4 w-4" />
              <span>Crazy Downloader © 2026</span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <Link to="/privacy" className="text-slate-500 transition-colors hover:text-white">
                Privacy
              </Link>
              <Link to="/terms" className="text-slate-500 transition-colors hover:text-white">
                Terms
              </Link>
              <a
                href="https://github.com/kirasync2748/crazy-downloader"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 transition-colors hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            For personal use only. Please respect YouTube's Terms of Service and copyright laws. No
            video data is stored on the server.
          </p>
        </div>
      </footer>
    </div>
  );
}
