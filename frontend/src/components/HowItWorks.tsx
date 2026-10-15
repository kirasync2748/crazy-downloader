import {
  Clipboard,
  MousePointerClick,
  Download,
  ShieldCheck,
  EyeOff,
  Zap,
  Film,
} from "lucide-react";

const steps = [
  {
    icon: Clipboard,
    title: "Paste a URL",
    desc: "Copy any public YouTube video link and paste it into the search box above.",
  },
  {
    icon: MousePointerClick,
    title: "Pick a Format",
    desc: "Choose from all available video and audio qualities — from 144p up to 4K.",
  },
  {
    icon: Download,
    title: "Download",
    desc: "Your file streams directly to your device. Nothing is stored on our server.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "No Sign-up",
    desc: "No account, no tracking, no data collection — just paste and download.",
  },
  {
    icon: EyeOff,
    title: "No Server Storage",
    desc: "Files pipe through and are never saved. Your cookies stay in your browser only.",
  },
  {
    icon: Zap,
    title: "Fast & Free",
    desc: "Direct streaming with real-time progress. No waiting, no limits, no cost.",
  },
  {
    icon: Film,
    title: "All Formats",
    desc: "Video with audio, video-only, or audio-only — in MP4, WebM, M4A and more.",
  },
];

export default function HowItWorks() {
  return (
    <div className="mt-12 space-y-12 animate-fade-in">
      {/* How it works */}
      <section>
        <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="glow-card relative animate-slide-up rounded-2xl border border-white/5 bg-white/[0.02] p-5"
              style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/20 to-fuchsia-500/20 ring-1 ring-white/10">
                  <step.icon className="h-5 w-5 text-brand-400" />
                </div>
                <span className="text-3xl font-extrabold text-white/10">{i + 1}</span>
              </div>
              <h3 className="font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-6 text-center text-xl font-bold text-white sm:text-2xl">
          Why Crazy Downloader?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glow-card flex items-start gap-3 animate-slide-up rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              style={{ animationDelay: `${0.7 + i * 0.1}s` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/20 to-fuchsia-500/20 ring-1 ring-white/10">
                <f.icon className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-0.5 text-xs text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
