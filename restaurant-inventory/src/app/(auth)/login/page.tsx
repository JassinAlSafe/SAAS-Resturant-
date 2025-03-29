"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/services/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gsap } from "gsap";
import { LoginTransition } from "@/components/auth/LoginTransition";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { createBrowserClient } from "@supabase/ssr";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Create Supabase browser client for email verification
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
  const { setTheme } = useTheme();
  const { signIn } = useAuth();
  const { error: showError, success: showSuccess } = useNotificationHelpers();
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Ensure light theme is set on page load
  useEffect(() => {
    setTheme("light");
    setIsPageLoaded(true);
  }, [setTheme]);

  // Initial entrance animation - only run after page is loaded
  useEffect(() => {
    if (!isPageLoaded) return;

    const tl = gsap.timeline();

    // Ensure elements are hidden initially
    gsap.set([cardRef.current, formRef.current], {
      opacity: 0,
      y: 20,
    });

    tl.to(cardRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
    });

    tl.to(
      formRef.current,
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.4"
    );
  }, [isPageLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNeedsEmailConfirmation(false);
    setResendSuccess(false);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Fade out the form
      await gsap.to(formRef.current, {
        opacity: 0.5,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.inOut",
      });

      // Show the transition animation
      setShowTransition(true);
    } catch (error: unknown) {
      // Reset the form animation if there's an error
      gsap.to(formRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      const authError = error as { message: string };
      if (authError.message?.includes("Email not confirmed")) {
        setNeedsEmailConfirmation(true);
        setEmailForResend(email);
        showError(
          "Email Not Confirmed",
          "Please check your email and confirm your account before logging in."
        );
      } else {
        showError(
          "Authentication Failed",
          authError.message || "Failed to sign in"
        );
      }
      setIsLoading(false);
    }
  };

  // Function to resend confirmation email
  const handleResendConfirmation = useCallback(async () => {
    if (!emailForResend || resendingEmail) return;

    setResendingEmail(true);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailForResend,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setResendSuccess(true);
      showSuccess(
        "Confirmation Email Sent",
        "Please check your email for the confirmation link."
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to resend confirmation email";
      showError("Failed to Resend", errorMessage);
    } finally {
      setResendingEmail(false);
    }
  }, [emailForResend, resendingEmail, showSuccess, showError]);

  const handleTransitionComplete = () => {
    // Get redirect URL from query params if available
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get("redirectTo");

    // Force a hard navigation to dashboard to ensure a full page reload
    // This helps clear any stale state and ensures proper redirection
    if (redirectTo && redirectTo.startsWith("/")) {
      window.location.href = redirectTo;
    } else {
      window.location.href = "/dashboard";
    }
  };

  // Check for URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const logoutParam = urlParams.get("logout");
    const errorParam = urlParams.get("error");

    if (logoutParam === "success") {
      // Clear any logout cookies to ensure clean state
      document.cookie =
        "logout-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      document.cookie =
        "just-logged-out=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";

      showSuccess(
        "Logged Out Successfully",
        "You have been securely logged out of your account."
      );
    } else if (errorParam === "logout_failed") {
      showError(
        "Logout Issue",
        "There was an issue during logout. Please try again or clear your browser cookies."
      );
    }
  }, [showSuccess, showError]);

  return (
    <div className="relative min-h-screen flex bg-gray-50">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative">
        <AuthBackground />
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div
          ref={cardRef}
          className="w-full max-w-md mx-auto rounded-lg shadow-sm bg-white overflow-hidden"
        >
          {/* Form content */}
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-medium text-slate-900 mb-3">
                Welcome!
              </h1>
              <div className="text-base text-slate-600">
                <Link
                  href="/signup"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Create a free account
                </Link>
                <span> or log in to get started</span>
              </div>
            </div>

            {needsEmailConfirmation && (
              <Alert className="mb-6 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-800 font-medium">
                  Email confirmation required
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  <p className="mb-3">
                    Please check your email and confirm your account before
                    logging in.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail || resendSuccess}
                      className="h-9 px-4 text-sm border-amber-300 hover:bg-amber-100 rounded-md"
                    >
                      {resendingEmail ? (
                        <>
                          <div className="animate-spin mr-2 h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full" />
                          Sending...
                        </>
                      ) : resendSuccess ? (
                        "Email sent!"
                      ) : (
                        "Resend confirmation email"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" ref={formRef}>
              <div className="mb-6">
                <Label
                  htmlFor="email"
                  className="block text-base font-medium text-slate-700 mb-2"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || !isPageLoaded}
                  className="w-full h-12 px-4 py-3 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Label
                    htmlFor="password"
                    className="block text-base font-medium text-slate-700"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-slate-600 hover:text-slate-900"
                    tabIndex={!isPageLoaded ? -1 : undefined}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !isPageLoaded}
                  className="w-full h-12 px-4 py-3 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium"
                disabled={isLoading || !isPageLoaded}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Signing in...
                  </div>
                ) : (
                  "Log in"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center"
                type="button"
              >
                <Image
                  src="/assets/logo/google-icon-logo-svgrepo-com.svg"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                <span>Continue with Google</span>
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-orange-600 hover:text-orange-700"
                  tabIndex={!isPageLoaded ? -1 : undefined}
                >
                  Create a free account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showTransition && (
        <LoginTransition onAnimationComplete={handleTransitionComplete} />
      )}
    </div>
  );
}
