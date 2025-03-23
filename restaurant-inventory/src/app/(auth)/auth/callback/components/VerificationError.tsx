"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface VerificationErrorProps {
  errorMessage: string | null;
  email: string;
  setEmail: (email: string) => void;
  isResending: boolean;
  setIsResending: (isResending: boolean) => void;
  resendSuccess: boolean;
  setResendSuccess: (resendSuccess: boolean) => void;
  onResendConfirmation: () => Promise<void>;
}

export function VerificationError({
  errorMessage,
  email,
  setEmail,
  isResending,
  resendSuccess,
  onResendConfirmation,
}: VerificationErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8">
      <AlertCircle className="h-16 w-16 text-red-500" />
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verification Failed
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {errorMessage || "We couldn't verify your email. Please try again."}
        </p>
      </div>

      {resendSuccess ? (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-green-600 dark:text-green-400">
            A new verification email has been sent. Please check your inbox.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      ) : (
        <div className="w-full space-y-4 pt-4">
          <div className="space-y-2 px-4 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              If you&apos;re having trouble with automatic verification, you can
              try to:
            </p>
            <div className="flex flex-col space-y-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Return to Login</Link>
              </Button>
              <p className="text-xs text-gray-500">or</p>
              <p className="text-sm font-medium">
                Request a new verification email:
              </p>
            </div>
          </div>

          <div className="space-y-3 px-4">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isResending}
              className="w-full"
            />
            <Button
              onClick={onResendConfirmation}
              disabled={isResending || !email}
              className="w-full"
            >
              {isResending ? (
                <>
                  <span className="mr-2">Sending...</span>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerificationError;
