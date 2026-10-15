import { Shield } from "lucide-react";

const sections = [
  {
    title: "1. Overview",
    body: (
      <p>
        Crazy Downloader is a tool that lets you paste a public YouTube URL and download the video
        in a format of your choice. We are committed to protecting your privacy. This policy
        explains what we do — and, more importantly, what we{" "}
        <strong className="text-white">do not</strong> do with your data.
      </p>
    ),
  },
  {
    title: "2. No Account, No Tracking",
    body: (
      <p>
        Crazy Downloader does not require any sign-up or account. We do not use cookies to track
        you, do not employ analytics scripts, and do not collect personal information such as IP
        addresses for profiling purposes.
      </p>
    ),
  },
  {
    title: "3. No Server-Side Storage",
    body: (
      <p>
        Downloaded videos are <strong className="text-white">never stored</strong> on our servers.
        When you request a download, the video stream is proxied directly from YouTube to your
        device and is never written to disk on the server. Once the stream completes, no trace
        remains.
      </p>
    ),
  },
  {
    title: "4. Cookies You Provide",
    body: (
      <p>
        If you choose to provide cookies (for example, to access age-restricted content), those
        cookies are stored{" "}
        <strong className="text-white">only in your browser's local storage (localStorage)</strong>.
        They are sent to our server solely for the duration of a single download or
        format-extraction request, used in a temporary file that is deleted immediately after, and{" "}
        <strong className="text-white">never persisted on the server</strong>. Clearing your browser
        data permanently removes them. We never share cookies with any third party.
      </p>
    ),
  },
  {
    title: "5. Third-Party Services",
    body: (
      <p>
        Crazy Downloader interacts with YouTube's public API via yt-dlp to extract video metadata
        and streaming URLs. YouTube's own privacy policy applies to your use of their platform. We
        do not send your data to any other third-party service.
      </p>
    ),
  },
  {
    title: "6. Open Source",
    body: (
      <p>
        Crazy Downloader is open-source software. The entire codebase is available at{" "}
        <a
          href="https://github.com/kirasync2748/crazy-downloader"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          github.com/kirasync2748/crazy-downloader
        </a>{" "}
        for anyone to audit.
      </p>
    ),
  },
  {
    title: "7. Contact",
    body: (
      <p>
        Questions about this policy? Open an issue on our{" "}
        <a
          href="https://github.com/kirasync2748/crazy-downloader/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          GitHub repository
        </a>
        .
      </p>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3 animate-slide-up">
        <div className="rounded-xl bg-brand-500/10 p-3 ring-1 ring-brand-500/20">
          <Shield className="h-6 w-6 text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      <p
        className="mb-8 text-lg text-slate-300 animate-slide-up"
        style={{ animationDelay: "0.05s" }}
      >
        Last updated: October 15, 2026
      </p>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <section
            key={s.title}
            className="section-card animate-slide-up"
            style={{ animationDelay: `${0.1 + i * 0.07}s` }}
          >
            <h2 className="mb-2 text-xl font-semibold text-white">{s.title}</h2>
            <div className="text-slate-400">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
