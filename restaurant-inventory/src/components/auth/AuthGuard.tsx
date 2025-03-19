"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";

// Function to check if current page is an auth page
const isAuthPage = () => {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return (
    pathname.includes("/login") ||
    pathname.includes("/signup") ||
    pathname.includes("/register") ||
    pathname.includes("/forgot-password") ||
    pathname.includes("/reset-password") ||
    pathname.includes("/auth/") ||
    pathname === "/"
  );
};

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

/**
 * AuthGuard ensures that authentication is initialized before rendering children.
 * It can optionally require the user to be authenticated.
 *
 * @param children Content to render once auth is initialized
 * @param fallback Optional component to show while waiting (defaults to a spinner)
 * @param requireAuth Whether authentication is required (defaults to false)
 */
export function AuthGuard({
  children,
  fallback = <AuthLoadingFallback />,
  requireAuth = false,
}: AuthGuardProps) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { status, waitForAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Don't wait for auth if we're on an auth page and don't require auth
        if (isAuthPage() && !requireAuth) {
          if (isMounted) {
            console.log(
              "On auth page without auth requirement, skipping auth check"
            );
            setIsReady(true);
          }
          return;
        }

        // Wait for auth to initialize with a reasonable timeout
        const isAuthenticated = await waitForAuth(5000);

        if (!isMounted) return;

        // If auth is required but user is not authenticated, redirect to login
        // But don't redirect if we're already on an auth page
        if (requireAuth && !isAuthenticated && !isAuthPage()) {
          console.log(
            "Authentication required but not authenticated, redirecting to login"
          );
          router.push("/login");
          return;
        }

        // Mark component as ready to render
        setIsReady(true);
      } catch (error) {
        console.error("Error in AuthGuard:", error);
        // If there was an error waiting for auth but we need auth, redirect to login
        // But don't redirect if we're already on an auth page
        if (requireAuth && !isAuthPage()) {
          router.push("/login");
        } else {
          // Otherwise just render content anyway
          setIsReady(true);
        }
      }
    };

    // Always check auth when component mounts or status changes
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [status, requireAuth, router, waitForAuth]);

  // Show fallback while loading or not ready
  if (status === "initializing" || !isReady) {
    return fallback;
  }

  // Otherwise render children
  return <>{children}</>;
}

function AuthLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">
        Loading authentication...
      </span>
    </div>
  );
}

/**
 * Custom hook to check if authentication is ready
 * Can be used in components that need to wait for auth initialization
 */
export function useAuthGuard(requireAuth = false): {
  isReady: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const { status, isAuthenticated, waitForAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Don't wait for auth if we're on an auth page and don't require auth
        if (isAuthPage() && !requireAuth) {
          if (isMounted) {
            console.log(
              "On auth page without auth requirement, skipping auth check"
            );
            setIsReady(true);
          }
          return;
        }

        // Wait for auth to initialize with a reasonable timeout
        await waitForAuth(5000);

        if (!isMounted) return;

        // If auth is required but user is not authenticated, redirect to login
        // But don't redirect if we're already on an auth page
        if (requireAuth && !isAuthenticated && !isAuthPage()) {
          console.log(
            "Authentication required but not authenticated, redirecting to login"
          );
          router.push("/login");
          return;
        }

        // Mark hook as ready
        setIsReady(true);
      } catch (error) {
        console.error("Error in useAuthGuard:", error);
        // If there was an error waiting for auth but we need auth, redirect to login
        // But don't redirect if we're already on an auth page
        if (requireAuth && !isAuthPage()) {
          router.push("/login");
        } else {
          // Otherwise just mark ready anyway
          setIsReady(true);
        }
      }
    };

    // Always check auth when hook mounts or status changes
    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [status, isAuthenticated, requireAuth, router, waitForAuth]);

  return {
    isReady,
    isLoading: status === "initializing",
    isAuthenticated,
  };
}
