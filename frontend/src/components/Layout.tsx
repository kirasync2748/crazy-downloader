import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 shadow-lg shadow-brand-500/30">
              <Download className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Crazy<span className="gradient-text">Downloader</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <a
              href="https://github.com/kirasync2748/crazy-downloader"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-slate-950">
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
