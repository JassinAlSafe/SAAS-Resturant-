"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FiArrowLeft } from "react-icons/fi";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { gsap } from "gsap";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

// Define the form schema with validation
const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { error: showError } = useNotificationHelpers();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const { theme } = useTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Set page loaded state
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

  // Function to check password strength
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push("Password should be at least 8 characters long");
    }

    // Contains lowercase
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add lowercase letters");
    }

    // Contains uppercase
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add uppercase letters");
    }

    // Contains numbers or special characters
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 25;
    } else {
      feedback.push("Add numbers or special characters");
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.join(", "));
  };

  // Update password strength when password changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "password") {
        checkPasswordStrength(value.password || "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { email, password, name } = values;
      setUserEmail(email);

      // Fade out the form
      await gsap.to(formRef.current, {
        opacity: 0.5,
        scale: 0.98,
        duration: 0.3,
        ease: "power2.inOut",
      });

      const result = await signUp(email, password, name);

      if (result.isEmailConfirmationRequired) {
        setSignupComplete(true);
      }
    } catch (error) {
      console.error("Signup error:", error);

      // Reset the form animation if there's an error
      gsap.to(formRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      showError(
        "Signup Failed",
        error instanceof Error
          ? error.message
          : "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If signup is complete, show success message
  if (signupComplete) {
    return (
      <div className="relative min-h-screen flex">
        {/* Left side - pattern */}
        <div className="hidden lg:block w-1/2 relative">
          <AuthBackground />
        </div>

        {/* Right side - success message */}
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

          {/* Success content - centered vertically and horizontally */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[440px] px-8">
              <div className="space-y-2 mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Verify Your Email
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  We&apos;ve sent a verification link to{" "}
                  <strong>{userEmail}</strong>
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p className="font-medium mb-1">Next steps:</p>
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>
                        Check your email inbox (and spam folder) for the
                        verification link
                      </li>
                      <li>Click the link to verify your email address</li>
                      <li>
                        Once verified, you&apos;ll have full access to all
                        features
                      </li>
                    </ol>
                    <p className="mt-2">
                      You can continue to the dashboard now, but some features
                      may be limited until you verify your email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
                >
                  Continue to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Open email client if possible
                    window.open(`mailto:${userEmail}`);
                  }}
                  className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Open Email App
                </Button>
                <div className="pt-2">
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Didn&apos;t receive the email?{" "}
                    <Button
                      variant="link"
                      onClick={() => router.push("/auth/callback")}
                      className="p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                    >
                      Resend verification link
                    </Button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative">
        <AuthBackground />
      </div>

      {/* Right side - signup form */}
      <div
        className="w-full lg:w-1/2 bg-white dark:bg-slate-900 flex flex-col"
        ref={cardRef}
      >
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

            {/* Security notice */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">
                    Email verification required
                  </p>
                  <p>
                    For your security, you&apos;ll need to verify your email
                    address before accessing all features. After signing up,
                    check your inbox for a verification link from us.
                  </p>
                </div>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
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
                  {...form.register("name")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.name.message}
                  </p>
                )}
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
                  {...form.register("email")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </p>
                )}
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
                  {...form.register("password")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />

                {/* Password strength indicator */}
                {form.watch("password") && (
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Password strength
                      </span>
                      <span className="text-xs font-medium">
                        {passwordStrength <= 25 && "Weak"}
                        {passwordStrength > 25 &&
                          passwordStrength <= 50 &&
                          "Fair"}
                        {passwordStrength > 50 &&
                          passwordStrength <= 75 &&
                          "Good"}
                        {passwordStrength > 75 && "Strong"}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-1.5"
                      indicatorClassName={`${
                        passwordStrength <= 25
                          ? "bg-red-500"
                          : passwordStrength <= 50
                          ? "bg-orange-500"
                          : passwordStrength <= 75
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    />
                    {passwordFeedback && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {passwordFeedback}
                      </p>
                    )}
                  </div>
                )}
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.password.message}
                  </p>
                )}
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
                  {...form.register("confirmPassword")}
                  className="h-11 px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-black hover:bg-black/90 text-white dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg font-medium shadow-xs"
                disabled={isLoading}
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
  