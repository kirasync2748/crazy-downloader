import { Link } from "react-router-dom";
import { Home, ServerCrash } from "lucide-react";

export default function ServerError() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <h1 className="text-[10rem] font-extrabold leading-none bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent sm:text-[14rem]">
          500
        </h1>
      </div>
      <div className="mb-3 flex items-center gap-2 text-red-400">
        <ServerCrash className="h-6 w-6" />
        <span className="text-lg font-semibold">Server Error</span>
      </div>
      <p className="mb-8 max-w-md text-slate-400">
        Something went wrong on our end. The issue has been logged — please try again in a moment.
      </p>
      <Link to="/" className="btn-primary">
        <Home className="h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
}
