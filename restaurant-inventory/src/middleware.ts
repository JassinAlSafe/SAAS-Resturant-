import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Check auth status
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/inventory",
    "/recipes",
    "/suppliers",
    "/shopping-list",
    "/sales",
    "/reports",
    "/settings",
    "/billing",
  ];

  // Define auth routes
  const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Handle protected routes
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle auth routes when already logged in
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle root route when logged in
  if (request.nextUrl.pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\\.svg).*)",
  ],
};
