import React from "react";

export const AuthBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Left side geometric pattern */}
      <div className="h-full w-full bg-linear-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="h-full w-full relative">
          {/* Main grid */}
          <div className="grid grid-cols-8 h-full w-full p-8 gap-4">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full transition-all duration-700 ease-in-out hover:scale-110 ${
                  i % 4 === 0
                    ? "bg-blue-500/40 hover:bg-blue-500/60"
                    : i % 4 === 1
                    ? "bg-emerald-500/40 hover:bg-emerald-500/60"
                    : i % 4 === 2
                    ? "bg-amber-500/40 hover:bg-amber-500/60"
                    : "bg-purple-500/40 hover:bg-purple-500/60"
                } ${
                  // Add random sizes to create depth
                  i % 5 === 0
                    ? "scale-125"
                    : i % 5 === 1
                    ? "scale-75"
                    : "scale-100"
                }`}
              />
            ))}
          </div>

          {/* Floating circles overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-4 top-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute right-1/3 top-1/3 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-pulse [animation-delay:1s]" />
            <div className="absolute left-1/3 bottom-1/4 w-28 h-28 bg-amber-500/20 rounded-full blur-xl animate-pulse [animation-delay:2s]" />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-white/50 via-transparent to-white/50 dark:from-slate-900/50 dark:to-slate-900/50" />
        </div>
      </div>

      {/* Right side subtle gradient */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs" />
    </div>
  );
};
