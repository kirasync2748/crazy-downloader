import { Mail } from "lucide-react";
import { activeSponsor, sponsorContactLink } from "../config/sponsors";

/**
 * Sponsor / Ad banner section.
 * - When a sponsor is configured in `config/sponsors.ts`, their banner
 *   image is shown and links to the sponsor's URL in a new tab.
 * - When no sponsor is active (`activeSponsor` is `null`), a polished
 *   placeholder card invites potential sponsors to get in touch.
 */
export default function AdSection() {
  return (
    <section className="mt-6 animate-fade-in" aria-label="Sponsored">
      {activeSponsor ? (
        <>
          <a
            href={activeSponsor.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group relative block overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-brand-400/40 hover:shadow-[0_0_30px_-8px] hover:shadow-brand-500/30 active:scale-[0.98]"
          >
            <img
              src={activeSponsor.image}
              alt={activeSponsor.alt}
              className="h-auto w-full select-none transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              draggable={false}
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-500/0 via-brand-500/0 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </a>
          <p className="mt-2 text-center text-xs text-slate-600">Sponsored</p>
        </>
      ) : (
        <div className="group relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.04]">
          {/* Subtle glow accent */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-64 -translate-x-1/2 rounded-full bg-brand-500/[0.06] blur-3xl transition-opacity duration-300 group-hover:opacity-150" />

          <div className="relative flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Your ad could be here</p>
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              This space is available for sponsors. Reach thousands of users who download videos
              every day.
            </p>
            <a
              href={sponsorContactLink}
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition-all hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-white active:scale-[0.98]"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact for ads
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
