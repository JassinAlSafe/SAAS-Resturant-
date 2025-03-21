"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { useTransition } from "@/components/ui/transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiArrowLeft } from "react-icons/fi";
import { gsap } from "gsap";
import { LoginTransition } from "@/components/auth/LoginTransition";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthError {
  message: string;
}

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
  const router = useRouter();
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const { error: showError, success: showSuccess } = useNotificationHelpers();
  const { startTransition } = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

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

      const authError = error as AuthError;
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
    if (redirectTo && redirectTo.startsWith('/')) {
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
    <div className="relative min-h-screen flex">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative">
        <AuthBackground />
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div
          ref={cardRef}
          className="w-full max-w-md mx-auto rounded-xl shadow-lg bg-white dark:bg-slate-900 overflow-hidden"
        >
          {/* Form content */}
          <div className="p-6 md:p-8">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome!
              </h1>
              <div className="flex gap-1 text-base text-slate-600 dark:text-slate-400">
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  Create a free account
                </Link>
                <span>or log in to get started</span>
              </div>
            </div>

            {needsEmailConfirmation && (
              <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">
                  Email confirmation required
                </AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                  <p className="mb-2">
                    Please check your email and confirm your account before
                    logging in.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail || resendSuccess}
                      className="h-8 text-xs border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-800/50"
                    >
                      {resendingEmail ? (
                        <>
                          <div className="animate-spin mr-1 h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full" />
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
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
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
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors"
                type="button"
              >
                <Image
                  src="/assets/logo/google-icon-logo-svgrepo-com.svg"
                  alt="Google"
                  width={18}
                  height={18}
                  className="mr-2 opacity-75"
                />
                <span className="text-sm font-medium">
                  Continue with Google
                </span>
              </Button>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
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
