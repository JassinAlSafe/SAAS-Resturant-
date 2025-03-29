"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/services/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const { setTheme } = useTheme();
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

    // Contains numbers
    if (/[0-9]/.test(password)) {
      strength += 15;
    } else {
      feedback.push("Add numbers");
    }

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength += 10;
    } else {
      feedback.push("Add special characters");
    }

    // Ensure strength is capped at 100
    strength = Math.min(strength, 100);

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

  // This is the updated verification success view within the SignupPage component

  if (signupComplete) {
    return (
      <div className="relative min-h-screen flex">
        {/* Left side - pattern */}
        <div className="hidden lg:block w-1/2 relative bg-gray-50">
          <AuthBackground />
        </div>

        {/* Right side - verification message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-medium text-slate-900 mb-2">
                Verify Your Email
              </h1>
              <p className="text-slate-600">
                We&apos;ve sent a verification link to{" "}
                <strong>{userEmail}</strong>
              </p>
            </div>

            <div className="mb-8 p-4 bg-green-50 rounded-md border-0">
              <div className="flex gap-3">
                <div className="shrink-0 text-green-500 mt-1">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-green-800 font-medium mb-2">Next steps:</p>
                  <ol className="list-decimal ml-5 text-green-700 space-y-2">
                    <li>
                      Check your email inbox (and spam folder) for the
                      verification link
                    </li>
                    <li>Click the link to verify your email address</li>
                    <li>
                      Complete your business profile setup in the onboarding
                      process
                    </li>
                  </ol>
                  <p className="text-green-700 mt-3 text-sm">
                    The verification link will expire in 1 hour. Please verify
                    your email to access all features of your account.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/login")}
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium mb-3"
            >
              Go to Login
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                window.open(`mailto:${userEmail}`);
              }}
              className="w-full h-11 mb-6 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Open Email App
            </Button>

            <p className="text-center text-slate-600">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={() =>
                  router.push(
                    `/auth/verification?email=${encodeURIComponent(userEmail)}`
                  )
                }
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Resend verification link
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex">
      {/* Left side - pattern */}
      <div className="hidden lg:block w-1/2 relative bg-gray-50">
        <AuthBackground />
      </div>

      {/* Right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white">
        <div ref={cardRef} className="w-full max-w-md mx-auto">
          {/* Form content */}
          <div className="p-8 md:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-medium text-slate-900 mb-2">
                Welcome!
              </h1>
              <p className="text-slate-600">
                Create a free account to get started
              </p>
            </div>

            {/* Email verification info box */}
            <div className="mb-8 p-4 bg-blue-50 rounded-md border-0">
              <div className="flex gap-3">
                <div className="shrink-0 text-blue-500">
                  <Info className="h-5 w-5" />
                </div>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>Email verification required</strong>
                  </p>
                  <p>
                    For your security, you&apos;ll need to verify your email
                    address before accessing all features. After signing up,
                    check your inbox for a verification link.
                  </p>
                </div>
              </div>
            </div>

            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="mb-6">
                <Label
                  htmlFor="name"
                  className="block text-base text-slate-700 mb-2"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...form.register("name")}
                  className="w-full h-11 px-4 py-2 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <Label
                  htmlFor="email"
                  className="block text-base text-slate-700 mb-2"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register("email")}
                  className="w-full h-11 px-4 py-2 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <Label
                  htmlFor="password"
                  className="block text-base text-slate-700 mb-2"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  className="w-full h-11 px-4 py-2 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />

                {/* Password strength indicator */}
                {form.watch("password") && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
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
                      <p className="text-xs text-slate-500 mt-1">
                        {passwordFeedback}
                      </p>
                    )}
                  </div>
                )}
                {form.formState.errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <Label
                  htmlFor="confirmPassword"
                  className="block text-base text-slate-700 mb-2"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("confirmPassword")}
                  className="w-full h-11 px-4 py-2 rounded-md bg-white border border-slate-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium"
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

            <div className="text-center mt-6">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-600 hover:text-orange-700"
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
