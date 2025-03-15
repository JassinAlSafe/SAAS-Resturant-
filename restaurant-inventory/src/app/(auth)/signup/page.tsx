"use client";

import { useState } from "react";
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
import { AuthBackground } from "@/components/auth/AuthBackground";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();
  const { error: showError, success: showSuccess } = useNotificationHelpers();
  const { startTransition } = useTransition();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      showError("Validation Error", "Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      showError(
        "Validation Error",
        "Password must be at least 8 characters long"
      );
      setIsLoading(false);
      return;
    }

    try {
      const { isEmailConfirmationRequired } = await signUp(
        email,
        password,
        name
      );
      setSuccess(true);

      if (isEmailConfirmationRequired) {
        showSuccess(
          "Email Confirmation Required",
          "Please check your email to confirm your account before logging in."
        );
      } else {
        showSuccess(
          "Account Created",
          "Your account has been created successfully. Redirecting to login page..."
        );
        setTimeout(() => {
          startTransition(() => {
            router.push("/login");
          }, "signup");
        }, 3000);
      }
    } catch (error: any) {
      showError("Registration Failed", error.message || "Failed to sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative">
        <AuthBackground />
      </div>

      {/* Right side - signup form */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col">
        {/* Back to website link */}
        <Link
          href="/"
          className="absolute top-8 left-8 text-sm text-slate-500 hover:text-slate-600 flex items-center gap-2 transition-colors dark:text-slate-400 dark:hover:text-slate-300"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to website
        </Link>

        {/* Logo - positioned in top right */}
        <div className="absolute top-8 right-8">
          <div className="relative h-8 w-8">
            <Image
              src={
                theme === "dark"
                  ? "/assets/brand/logo-light.png"
                  : "/assets/brand/logo-dark.png"
              }
              alt="ShelfWise Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Form content - centered vertically and horizontally */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-[440px] px-8">
            <div className="space-y-2 mb-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Welcome!
              </h1>
              <div className="flex gap-1 text-base text-slate-600 dark:text-slate-400">
                <span>Create a free account to get started</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
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
                  disabled={isLoading || success}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || success}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
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
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
