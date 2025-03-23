"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface VerificationSuccessfulProps {
  redirectPath: string;
}

export function VerificationSuccessful({ redirectPath }: VerificationSuccessfulProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Email Verified Successfully
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your email has been verified. You&apos;ll be redirected to the dashboard shortly.
        </p>
      </div>
      <Button asChild className="mt-4">
        <Link href={redirectPath}>
          Continue to Dashboard
        </Link>
      </Button>
    </div>
  );
}

export default VerificationSuccessful;
