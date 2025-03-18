"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoginTransition } from "./LoginTransition";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerified?: boolean;
  publicOnly?: boolean;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireVerified = false,
  publicOnly = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get auth state from store
  const { isAuthenticated, isEmailVerified, isInitialized, isLoading } =
    useAuthStore();

  useEffect(() => {
    // Don't do anything until auth is initialized
    if (!isInitialized) return;

    // Handle redirect logic
    const handleAuthRedirect = () => {
      // If this is a public-only route (like login) and user is authenticated
      if (publicOnly && isAuthenticated) {
        router.replace("/dashboard");
        return;
      }

      // If route requires authentication and user is not authenticated
      if (requireAuth && !isAuthenticated) {
        // Store the current path to redirect back after login
        if (pathname !== "/login") {
          sessionStorage.setItem("redirectAfterLogin", pathname);
        }
        router.replace("/login");
        return;
      }

      // If route requires email verification and user's email is not verified
      if (requireAuth && requireVerified && !isEmailVerified) {
        // Only redirect if not already on a verification-related page
        if (
          !pathname.includes("/auth/callback") &&
          !pathname.includes("/verify-email")
        ) {
          router.replace("/verify-email");
          return;
        }
      }

      // If we reach here and it's a protected route, show a transition animation
      if (requireAuth && isAuthenticated && !isTransitioning) {
        setIsTransitioning(true);
      }
    };

    handleAuthRedirect();
  }, [
    isInitialized,
    isAuthenticated,
    isEmailVerified,
    requireAuth,
    requireVerified,
    publicOnly,
    router,
    pathname,
    isTransitioning,
  ]);

  // Show loading state when initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show transition animation when authenticated user is navigating to a protected route
  if (isTransitioning) {
    return (
      <LoginTransition onAnimationComplete={() => setIsTransitioning(false)} />
    );
  }

  // Render content when all conditions are met
  return <>{children}</>;
}
