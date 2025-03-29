"use client";

import { memo } from "react";

/**
 * VerificationProcess Component
 *
 * Displays a loading spinner and message while verification is in progress
 */
export const VerificationProcess = memo(() => {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          Verifying your email
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please wait while we verify your email address...
        </p>
      </div>
    </div>
  );
});

VerificationProcess.displayName = "VerificationProcess";

export default VerificationProcess;
