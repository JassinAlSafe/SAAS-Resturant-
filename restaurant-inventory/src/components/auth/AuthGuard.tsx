// "use client";

// import { useEffect, useState, type ReactNode } from "react";
// import { useRouter, usePathname } from "next/navigation";
// import { useAuth } from "@/lib/contexts/auth-context";

// interface AuthGuardProps {
//   children: ReactNode;
//   requireAuth?: boolean;
//   redirectTo?: string;
// }

// export function AuthGuard({
//   children,
//   requireAuth = true,
//   redirectTo = "/login",
// }: AuthGuardProps) {
//   const { isAuthenticated, isLoading, status } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();
//   const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);
//   const [renderContent, setRenderContent] = useState(false);

//   // Debug logging function
//   const logAuthState = () => {
//     console.log("Auth Guard State:", {
//       pathname,
//       requireAuth,
//       isAuthenticated,
//       status,
//       isLoading,
//       hasAttemptedRedirect,
//       shouldRender:
//         (requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated),
//     });
//   };

//   useEffect(() => {
//     // Reset the redirect flag when pathname changes
//     if (pathname) {
//       setHasAttemptedRedirect(false);
//       logAuthState();
//     }
//   }, [pathname]);

//   useEffect(() => {
//     // Don't make auth decisions while still loading or initializing
//     if (isLoading || status === "initializing") {
//       logAuthState();
//       return;
//     }

//     // Avoid redirect loops
//     if (hasAttemptedRedirect) {
//       logAuthState();
//       return;
//     }

//     // Check if we're already on the target redirection page
//     const isOnRedirectPage = pathname === redirectTo;
//     const isOnDashboard = pathname === "/dashboard";

//     // Case 1: Page requires auth but user is not authenticated
//     if (requireAuth && !isAuthenticated) {
//       logAuthState();
//       console.log(`User not authenticated, redirecting to ${redirectTo}`);

//       // Don't redirect if already on the redirect page
//       if (!isOnRedirectPage) {
//         // Save current path for redirecting back after login
//         if (typeof window !== "undefined") {
//           sessionStorage.setItem("redirectAfterLogin", pathname || "");
//         }
//         setHasAttemptedRedirect(true);
//         router.push(redirectTo);
//       }

//       setRenderContent(false);
//       return;
//     }

//     // Case 2: Page doesn't require auth (like login page) but user is already authenticated
//     if (!requireAuth && isAuthenticated) {
//       logAuthState();
//       console.log("User already authenticated, redirecting to dashboard");

//       // Don't redirect if already on the dashboard
//       if (!isOnDashboard) {
//         setHasAttemptedRedirect(true);
//         router.push("/dashboard");
//       }

//       setRenderContent(false);
//       return;
//     }

//     // Case 3: Auth state matches requirements - render the children
//     setRenderContent(true);
//     logAuthState();
//   }, [
//     isAuthenticated,
//     isLoading,
//     status,
//     pathname,
//     redirectTo,
//     requireAuth,
//     router,
//     hasAttemptedRedirect,
//   ]);

//   // Show loading state while auth is initializing or loading
//   if (isLoading || status === "initializing") {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   // Render children only if conditions are met
//   if (renderContent) {
//     return <>{children}</>;
//   }

//   // Show a loading indicator during redirects instead of a blank screen
//   return (
//     <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
//       <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
//       <p className="text-sm text-gray-500">Redirecting...</p>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);
  const [renderContent, setRenderContent] = useState(false);

  // Debug logging function
  const logAuthState = () => {
    console.log("AuthGuard State:", {
      pathname,
      requireAuth,
      isAuthenticated,
      status,
      isLoading,
      hasAttemptedRedirect,
      shouldRender:
        (requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated),
    });
  };

  // Function to check if current page is an auth page
  const isAuthPage = () => {
    if (!pathname) return false;
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

  // Reset redirect flag when pathname changes
  useEffect(() => {
    if (pathname) {
      setHasAttemptedRedirect(false);
      setRenderContent(false); // Reset render state on path change
      logAuthState();
    }
  }, [pathname]);

  // Main auth logic
  useEffect(() => {
    // Wait for auth to initialize before making any decisions
    if (isLoading || status === "initializing") {
      logAuthState();
      return;
    }

    // Skip redirect logic if we've already attempted a redirect for this path
    if (hasAttemptedRedirect) {
      logAuthState();
      // Once a redirect has been attempted, we can render the content if we're still here
      setRenderContent(true);
      return;
    }

    // Get the current page type
    const currentIsAuthPage = isAuthPage();

    // Check if we're already on target pages to prevent loops
    const isOnLoginPage = pathname?.includes("/login");
    const isOnDashboardPage = pathname?.includes("/dashboard");

    // Case 1: Page requires auth but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      logAuthState();
      console.log(
        `[AuthGuard] User not authenticated, should redirect to ${redirectTo}`
      );

      // Only redirect if not already on the login page
      if (!isOnLoginPage) {
        // Save current path for redirecting back after login
        if (typeof window !== "undefined") {
          sessionStorage.setItem("redirectAfterLogin", pathname || "");
        }
        setHasAttemptedRedirect(true);
        router.push(redirectTo);
      } else {
        // Already on login page, just render content
        setRenderContent(true);
      }
      return;
    }

    // Case 2: Page doesn't require auth (like login page) but user is already authenticated
    if (!requireAuth && isAuthenticated) {
      logAuthState();
      console.log(
        "[AuthGuard] User already authenticated, should redirect to dashboard"
      );

      // Only redirect if not already on dashboard
      if (!isOnDashboardPage) {
        setHasAttemptedRedirect(true);
        router.push("/dashboard");
      } else {
        // Already on dashboard, just render content
        setRenderContent(true);
      }
      return;
    }

    // Case 3: Auth requirements match current state - render the children
    logAuthState();
    console.log("[AuthGuard] Auth requirements met, rendering content");
    setRenderContent(true);
  }, [
    isAuthenticated,
    isLoading,
    status,
    pathname,
    redirectTo,
    requireAuth,
    router,
    hasAttemptedRedirect,
  ]);

  // Show loading state while auth is initializing or loading
  if (isLoading || status === "initializing") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Render children only if conditions are met
  if (renderContent) {
    return <>{children}</>;
  }

  // Show a loading indicator during redirects instead of a blank screen
  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-gray-500">Redirecting...</p>
    </div>
  );
}
