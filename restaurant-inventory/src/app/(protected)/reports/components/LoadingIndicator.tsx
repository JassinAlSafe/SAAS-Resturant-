"use client";

export const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] md:h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-primary"></div>
    <p className="text-sm text-muted-foreground mt-4">Loading data...</p>
  </div>
);
