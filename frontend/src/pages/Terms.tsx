import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-fuchsia-500/10 p-3">
          <FileText className="h-6 w-6 text-fuchsia-400" />
        </div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>
      <div className="prose prose-invert max-w-none space-y-6 text-slate-400">
        <p className="text-lg text-slate-300">Last updated: October 1, 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By using Crazy Downloader, you agree to these Terms of Service. If you do not agree with
            any part of these terms, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Service Description</h2>
          <p>
            Crazy Downloader is a tool that extracts available formats from public YouTube videos
            using yt-dlp and streams the selected format to your device. The service does not host
            or store any video content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Acceptable Use</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Only download videos you have the right to download (e.g., your own content,
              public-domain works, or content licensed for reuse).
            </li>
            <li>Do not use the service to violate copyright laws or YouTube's Terms of Service.</li>
            <li>
              Do not use the service to download content for commercial redistribution without
              proper authorization.
            </li>
            <li>Do not attempt to overload, attack, or reverse-engineer the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. Copyright Disclaimer</h2>
          <p>
            Crazy Downloader is not affiliated with YouTube or Google. Users are solely responsible
            for ensuring that their use of downloaded content complies with applicable copyright
            laws. If you believe your copyrighted work is being infringed, please report it to
            YouTube directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">5. No Warranty</h2>
          <p>
            The service is provided "as is" without warranty of any kind. We do not guarantee that
            the service will be uninterrupted, error-free, or that any particular video will be
            downloadable. YouTube may change its infrastructure at any time, which could affect
            functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">6. Limitation of Liability</h2>
          <p>
            Crazy Downloader and its contributors shall not be liable for any damages arising from
            the use or inability to use the service, including but not limited to legal consequences
            resulting from copyright infringement by the user.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">7. Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. Continued use of the service
            after changes are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">8. Contact</h2>
          <p>
            Questions? Open an issue on our{" "}
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
