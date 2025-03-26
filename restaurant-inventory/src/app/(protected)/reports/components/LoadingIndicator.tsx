"use client";

export function LoadingIndicator() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4 space-y-3">
              <div className="skeleton h-4 w-[120px]"></div>
              <div className="skeleton h-8 w-[140px]"></div>
              <div className="flex items-center gap-2">
                <div className="skeleton h-4 w-[60px]"></div>
                <div className="skeleton h-4 w-[40px]"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6">
            <div className="skeleton h-4 w-[100px] mb-4"></div>
            <div className="skeleton h-[300px] w-full"></div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-6">
            <div className="skeleton h-4 w-[120px] mb-4"></div>
            <div className="flex items-center justify-center">
              <div className="skeleton h-[240px] w-[240px] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
