import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function UrlInput({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const isValidYouTubeUrl = (val: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\/.+/i.test(val.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please paste a YouTube URL.");
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setError("That doesn't look like a valid YouTube URL.");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex flex-col gap-3 rounded-2xl glass p-2 transition-all sm:flex-row sm:items-center ${
          error ? "ring-2 ring-red-500/50" : "focus-within:ring-2 focus-within:ring-brand-500/50"
        }`}
      >
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube URL (https://youtube.com/watch?v=… or youtu.be/…)"
            className="w-full bg-transparent py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none sm:text-base"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Extracting…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Get Formats
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-400 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </form>
  );
}
