"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Check, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createVerificationClient } from "@/lib/supabase/verification-client";

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

export const VerificationError = memo(
  ({
    errorMessage,
    email,
    setEmail,
    isResending,
    resendSuccess,
    setResendSuccess,
    onResendConfirmation,
  }: VerificationErrorProps) => {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(false);
    const [password, setPassword] = useState("");
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Reset success message after a timeout
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      if (resendSuccess) {
        timeoutId = setTimeout(() => {
          setResendSuccess(false);
        }, 5000); // Reset after 5 seconds
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [resendSuccess, setResendSuccess]);

    // Check if we should show login form based on error message
    useEffect(() => {
      if (
        errorMessage?.includes("taking longer than expected") ||
        errorMessage?.includes("appears to be active")
      ) {
        setShowLoginForm(true);
      }
    }, [errorMessage]);

    // Handle email input change
    const handleEmailChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setLoginError(null);
      },
      [setEmail]
    );

    // Handle password input change
    const handlePasswordChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setLoginError(null);
      },
      []
    );

    // Handle resend form submission
    const handleResendSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onResendConfirmation();
      },
      [onResendConfirmation]
    );

    // Handle direct login attempt
    const handleLoginSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
          setLoginError("Please enter both email and password");
          return;
        }

        setIsCheckingAuth(true);
        setLoginError(null);

        try {
          const supabase = createVerificationClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });

          if (error) {
            console.error("Login error:", error);
            setLoginError(error.message || "Invalid email or password");
            setIsCheckingAuth(false);
            return;
          }

          if (data.session) {
            // Successful login
            router.push("/dashboard");
          } else {
            setLoginError(
              "Login succeeded but no session was created. Please try again."
            );
            setIsCheckingAuth(false);
          }
        } catch (error) {
          console.error("Unexpected login error:", error);
          setLoginError("An unexpected error occurred. Please try again.");
          setIsCheckingAuth(false);
        }
      },
      [email, password, router]
    );

    // Handle redirection to login page
    const handleGoToLogin = useCallback(() => {
      router.push("/login");
    }, [router]);

    return (
      <div className="space-y-6">
        <div className="flex items-start space-x-3 text-left">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Verification Failed
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {errorMessage || "There was a problem verifying your email."}
            </p>
          </div>
        </div>

        {showLoginForm ? (
          // Direct login form
          <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-3 text-sm font-medium">Login directly</h3>
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isCheckingAuth}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isCheckingAuth}
                  required
                />
              </div>

              {loginError && (
                <div className="text-sm text-red-500">{loginError}</div>
              )}

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isCheckingAuth || !email || !password}
                  className="flex-1"
                >
                  {isCheckingAuth ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoToLogin}
                  disabled={isCheckingAuth}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Resend verification form
          <form onSubmit={handleResendSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Enter your email to resend the verification link:
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your.email@example.com"
                disabled={isResending}
                className="w-full"
                autoComplete="email"
                required
              />
            </div>

            {resendSuccess && (
              <div className="flex items-center space-x-2 rounded-md bg-green-50 p-3 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Check className="h-5 w-5" />
                <span className="text-sm">
                  Verification email sent! Please check your inbox.
                </span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isResending || !email}
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="link"
                className="text-xs text-gray-500"
                onClick={() => setShowLoginForm(true)}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            If you continue to have issues, please contact our support team for
            assistance.
          </p>
        </div>
      </div>
    );
  }
);

VerificationError.displayName = "VerificationError";

export default VerificationError;
