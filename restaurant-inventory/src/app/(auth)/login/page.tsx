"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { useTransition } from "@/components/ui/transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FiShield } from "react-icons/fi";
import { gsap } from "gsap";
import { LoginTransition } from "@/components/auth/LoginTransition";

interface AuthError {
  message: string;
}

interface SignInResult {
  isEmailConfirmed?: boolean;
  // Add other properties if needed
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { signIn } = useAuth();
  const { error: showError } = useNotificationHelpers();
  const { startTransition } = useTransition();

  // Handle initial page load
  useEffect(() => {
    // Set a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
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

    try {
      const result = (await signIn(email, password)) as unknown as SignInResult;
      const isEmailConfirmed = result?.isEmailConfirmed ?? true;

      if (!isEmailConfirmed) {
        showError(
          "Email Not Confirmed",
          "Please confirm your email before logging in."
        );
        setIsLoading(false);
        return;
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

  const handleTransitionComplete = () => {
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md" ref={cardRef}>
        <Card
          className={`border-border shadow-lg transition-opacity duration-300 ${
            !isPageLoaded ? "opacity-0" : ""
          }`}
        >
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <span className="text-lg font-bold">S</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to ShelfWise
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your inventory management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || !isPageLoaded}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:text-primary/90"
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
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isPageLoaded}
              >
                <div className="flex items-center">
                  <FiShield className="mr-2 h-4 w-4" />
                  Sign In
                </div>
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/90"
                tabIndex={!isPageLoaded ? -1 : undefined}
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      {showTransition && (
        <LoginTransition onAnimationComplete={handleTransitionComplete} />
      )}
    </div>
  );
}
