"use client";

export default function RecipeLoading() {
  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="skeleton h-8 w-64 mb-2"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <div className="skeleton h-9 w-24"></div>
          <div className="skeleton h-9 w-24"></div>
        </div>
      </div>

      <div className="card bg-base-100 shadow mb-6">
        <div className="p-4">
          <div className="skeleton h-10 w-full max-w-md"></div>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="p-4">
          <div className="skeleton h-8 w-full mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="skeleton h-16 w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
