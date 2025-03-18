"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if auth is initialized and user is not authenticated
    if (isInitialized && !isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      router.push("/login");
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  // Show nothing while checking auth state
  if (isLoading || !isInitialized) {
    return null;
  }

  // If there's no authenticated user, the useEffect will handle redirect
  if (!isAuthenticated) {
    return null;
  }

  // If we have an authenticated user (whether email is verified or not), show the layout
  return (
    <>
      <EmailVerificationBanner />
      <Sidebar>{children}</Sidebar>
    </>
  );
}
