"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { cn } from "@/lib/utils";

interface TokenErrorBoundaryProps {
  children: ReactNode;
  className?: string;
}

// Custom event type for token errors
interface TokenErrorEventDetail {
  message?: string;
  code?: string;
}

interface TokenErrorEvent extends CustomEvent<TokenErrorEventDetail> {
  type: "token-error";
}

export default function TokenErrorBoundary({
  children,
  className,
}: TokenErrorBoundaryProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [hasTokenError, setHasTokenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Type guard for TokenErrorEvent
    const isTokenErrorEvent = (event: Event): event is TokenErrorEvent => {
      return event.type === "token-error";
    };

    // Handle token error events
    const handleTokenError = (event: Event) => {
      if (!isTokenErrorEvent(event)) return;

      setHasTokenError(true);
      setErrorMessage(event.detail?.message || "Your session has expired");

      // Save current path for redirect after login
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        sessionStorage.setItem("auth_redirect", currentPath);
      }

      // Delay redirect to show error message
      setTimeout(() => {
        router.push(
          `/login?error=session_expired${
            event.detail?.code ? `&code=${event.detail.code}` : ""
          }`
        );
      }, 2000);
    };

    window.addEventListener("token-error", handleTokenError);
    return () => {
      window.removeEventListener("token-error", handleTokenError);
    };
  }, [router]);

  // Handle protected routes
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = (path: string): boolean => {
      return (
        path.startsWith("/public") ||
        path.startsWith("/auth") ||
        path === "/" ||
        path === "/login" ||
        path === "/signup" ||
        path === "/reset-password"
      );
    };

    if (!isAuthenticated && typeof window !== "undefined") {
      const currentPath = window.location.pathname;

      if (!isPublicRoute(currentPath)) {
        const redirectPath = encodeURIComponent(
          currentPath + window.location.search
        );
        router.push(`/login?redirect=${redirectPath}`);
      }
    }
  }, [isInitialized, isAuthenticated, router]);

  if (hasTokenError) {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="rounded-lg bg-card p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Session Expired
          </h2>
          <p className="text-muted-foreground">{errorMessage}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
