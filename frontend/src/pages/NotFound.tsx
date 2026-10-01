import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <h1 className="text-[10rem] font-extrabold leading-none gradient-text sm:text-[14rem]">
          404
        </h1>
      </div>
      <div className="mb-3 flex items-center gap-2 text-amber-400">
        <AlertTriangle className="h-6 w-6" />
        <span className="text-lg font-semibold">Page Not Found</span>
      </div>
      <p className="mb-8 max-w-md text-slate-400">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link to="/" className="btn-primary">
        <Home className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
}
