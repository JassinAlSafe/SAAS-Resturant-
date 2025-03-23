"use client";

import { Loader2 } from "lucide-react";

export function VerificationProcess() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-center text-gray-600 dark:text-gray-300">
        Verifying your email...
      </p>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        This should only take a moment.
      </p>
    </div>
  );
}

export default VerificationProcess;
