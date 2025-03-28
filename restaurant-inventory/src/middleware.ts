import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define the paths that should be protected
const protectedPaths = [
  "/dashboard",
  "/inventory",
  "/recipes",
  "/suppliers",
  "/reports",
  "/settings",
  "/profile",
  "/billing",
];

// Define the paths that should be redirected if the user is already authenticated
const authPaths = ["/login", "/signup", "/verify", "/reset-password"];

// Define the paths that should always be accessible
const publicPaths = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/privacy",
  "/terms",
  "/api",
  "/legal",
  "/_next",
  "/assets",
  "/favicon.ico",
];

/**
 * Middleware function to handle authentication and redirects
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname, search } = request.nextUrl;
  const path = pathname + search;

  console.log(`Middleware processing: ${path}`);

  // Create the response early so we can modify headers
  const response = NextResponse.next({
    request,
  });

  // Define path patterns for different route types
  const authCallbackPattern = /^\/auth\/callback/;
  const publicPattern = /^\/(api|_next\/static|_next\/image|favicon\.ico|.*\.(svg|png|jpg|jpeg|gif|webp)$)/;

  // Important: Special handling for auth callback to ensure it works properly
  if (authCallbackPattern.test(pathname)) {
    console.log('Auth callback request detected, permitting access');
    return response;
  }

  // Skip middleware for public paths and static assets
  if (
    publicPaths.some((publicPath) => pathname.startsWith(publicPath)) ||
    publicPattern.test(pathname)
  ) {
    console.log(`Skipping middleware for public path: ${pathname}`);
    return NextResponse.next();
  }

  // Check for special logout cookie to prevent redirect loops
  const logoutInProgress = request.cookies.get("logout-in-progress")?.value === "true";
  if (logoutInProgress) {
    console.log("Logout in progress, skipping auth checks");
    // Allow the request to continue without auth checks
    return NextResponse.next();
  }

  // Create a Supabase client with the correct SSR pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // First set on the request object
            request.cookies.set(name, value);

            // Then set on the response object
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get the user's session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated
  if (user) {
    // Set a cookie to indicate authentication status (for client-side checks)
    response.cookies.set("is-authenticated", "true", {
      httpOnly: false, // Make it accessible to JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Set user ID cookie for client-side access
    response.cookies.set("user-id", user.id, {
      httpOnly: false, // Make it accessible to JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // If user is trying to access auth pages (login, signup, etc.) redirect to dashboard
    if (authPaths.some((authPath) => pathname.startsWith(authPath))) {
      console.log(`Authenticated user trying to access auth path: ${pathname}, redirecting to dashboard`);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // User is authenticated and accessing a protected or public path, allow access
    console.log(`Authenticated user accessing: ${pathname}`);
    return response;
  }

  // If user is not authenticated
  console.log(`User not authenticated, checking path: ${pathname}`);

  // Clear any authentication cookies that might be present
  response.cookies.set("is-authenticated", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set("user-id", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  // If user is trying to access a protected path, redirect to login
  if (protectedPaths.some((protectedPath) => pathname.startsWith(protectedPath))) {
    console.log(`Unauthenticated user trying to access protected path: ${pathname}, redirecting to login`);
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectTo", encodeURIComponent(path));
    return NextResponse.redirect(url);
  }

  // User is not authenticated but accessing a public or auth path, allow access
  console.log(`Unauthenticated user accessing non-protected path: ${pathname}`);
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};