"use client";

import { Loader2 } from "lucide-react";

export function LoadingVerification() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h1>
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-center text-gray-600 dark:text-gray-300">
            Loading verification...
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingVerification;
