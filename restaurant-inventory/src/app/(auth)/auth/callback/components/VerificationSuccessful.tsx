"use client";

import { memo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

interface VerificationSuccessfulProps {
  redirectPath: string;
  redirectDelay?: number;
}

/**
 * VerificationSuccessful Component
 *
 * Displays a success message and redirects the user to the specified path
 */
export const VerificationSuccessful = memo(
  ({ redirectPath, redirectDelay = 3000 }: VerificationSuccessfulProps) => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(
      Math.floor(redirectDelay / 1000)
    );

    useEffect(() => {
      // Set up countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      // Redirect after delay
      const redirectTimeout = setTimeout(() => {
        router.push(redirectPath);
      }, redirectDelay);

      // Clean up timers
      return () => {
        clearInterval(countdownInterval);
        clearTimeout(redirectTimeout);
      };
    }, [redirectPath, redirectDelay, router]);

    return (
      <div className="flex flex-col items-center space-y-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Email Verified Successfully
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your email has been successfully verified. You will be redirected to
            the dashboard in <span className="font-medium">{countdown}</span>{" "}
            seconds.
          </p>
        </div>
        <button
          onClick={() => router.push(redirectPath)}
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Go to Dashboard Now
        </button>
      </div>
    );
  }
);

VerificationSuccessful.displayName = "VerificationSuccessful";

export default VerificationSuccessful;
