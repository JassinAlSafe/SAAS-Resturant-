import React from "react";

export const AuthBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Left side geometric pattern */}
      <div className="h-full w-full">
        <div className="h-full w-full relative">
          {/* Main grid */}
          <div className="grid grid-cols-8 h-full w-full p-8 gap-4">
            {Array.from({ length: 64 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-full transition-all duration-700 ease-in-out hover:scale-110 ${
                  i % 6 === 0
                    ? "bg-orange-200/60 hover:bg-orange-200/80"
                    : i % 6 === 1
                    ? "bg-blue-100/60 hover:bg-blue-100/80"
                    : i % 6 === 2
                    ? "bg-purple-100/60 hover:bg-purple-100/80"
                    : i % 6 === 3
                    ? "bg-orange-100/50 hover:bg-orange-100/70"
                    : i % 6 === 4
                    ? "bg-blue-50/50 hover:bg-blue-50/70"
                    : "bg-purple-50/50 hover:bg-purple-50/70"
                } ${
                  // Add random sizes to create depth
                  i % 7 === 0
                    ? "scale-130"
                    : i % 7 === 1
                    ? "scale-60"
                    : i % 7 === 2
                    ? "scale-110"
                    : i % 7 === 3
                    ? "scale-85"
                    : i % 7 === 4
                    ? "scale-75"
                    : "scale-100"
                }`}
              />
            ))}
          </div>

          {/* Floating circles overlay - more subtle */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-4 top-1/4 w-36 h-36 bg-orange-100/40 rounded-full blur-2xl animate-pulse [animation-duration:12s]" />
            <div className="absolute right-1/3 top-1/3 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl animate-pulse [animation-duration:15s] [animation-delay:3s]" />
            <div className="absolute left-1/3 bottom-1/4 w-40 h-40 bg-purple-100/40 rounded-full blur-2xl animate-pulse [animation-duration:18s] [animation-delay:6s]" />
            <div className="absolute right-1/4 bottom-1/3 w-32 h-32 bg-orange-100/30 rounded-full blur-2xl animate-pulse [animation-duration:20s] [animation-delay:4s]" />
          </div>

          {/* Subtle gradient overlay to enhance legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50/40 via-transparent to-gray-50/40" />
        </div>
      </div>
    </div>
  );
};
