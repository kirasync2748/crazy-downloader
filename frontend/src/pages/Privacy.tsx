import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-brand-500/10 p-3">
          <Shield className="h-6 w-6 text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
        <p className="text-lg text-slate-300">Last updated: October 1, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white">1. Overview</h2>
          <p>
            Crazy Downloader is a tool that lets you paste a public YouTube URL and download the
            video in a format of your choice. We are committed to protecting your privacy. This
            policy explains what we do — and, more importantly, what we{" "}
            <strong className="text-white">do not</strong> do — with your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. No Account, No Tracking</h2>
          <p>
            Crazy Downloader does not require any sign-up or account. We do not use cookies to track
            you, do not employ analytics scripts, and do not collect personal information such as IP
            addresses for profiling purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. No Server-Side Storage</h2>
          <p>
            Downloaded videos are <strong className="text-white">never stored</strong> on our
            servers. When you request a download, the video stream is proxied directly from YouTube
            to your device and is never written to disk on the server. Once the stream completes, no
            trace remains.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Cookies You Provide</h2>
          <p>
            If you choose to provide cookies (for example, to access age-restricted content), those
            cookies are stored only in the server's temporary memory for as long as the process is
            running. They are never persisted to a database, never shared with third parties, and
            can be removed at any time from the Cookie Manager.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. Third-Party Services</h2>
          <p>
            Crazy Downloader interacts with YouTube's public API via yt-dlp to extract video
            metadata and streaming URLs. YouTube's own privacy policy applies to your use of their
            platform. We do not send your data to any other third-party service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Open Source</h2>
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
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Contact</h2>
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
        </section>
      </div>
    </div>
  );
}
