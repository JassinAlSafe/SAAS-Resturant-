import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/suppliers',
  '/recipes',
  '/reports',
  '/settings',
  '/profile',
];

// Define routes that should be accessible only to non-authenticated users
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Define public routes that are accessible to everyone
const publicRoutes = [
  '/logout',
];

// Function to check if a route is protected
const isProtectedRoute = (path: string): boolean => {
  return protectedRoutes.some(route => path.startsWith(route));
};

// Function to check if a route is an auth route
const isAuthRoute = (path: string): boolean => {
  return authRoutes.some(route => path.startsWith(route));
};

// Function to check if a route is a public route
const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some(route => path.startsWith(route));
};

// Function to check if a route is an API route
const isApiRoute = (path: string): boolean => {
  return path.startsWith('/api/');
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create a Supabase client for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get: (name) => {
          return request.cookies.get(name)?.value;
        },
        set: (name, value, options) => {
          // If the cookie is being deleted, pass the options directly
          if (!value) {
            response.cookies.set(name, '', options);
            return;
          }

          // If the cookie is being set, ensure it has the right options
          response.cookies.set(name, value, {
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          });
        },
        remove: (name, options) => {
          response.cookies.set(name, '', {
            ...options,
            maxAge: -1,
          });
        },
      },
    }
  );

  try {
    // Get the user's session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const path = request.nextUrl.pathname;

    // Check for the just-logged-out cookie
    const justLoggedOut = request.cookies.get('just-logged-out')?.value === 'true';

    // Handle public routes (like logout)
    if (isPublicRoute(path)) {
      return response;
    }

    // Handle protected routes
    if (isProtectedRoute(path)) {
      if (!session) {
        // Redirect to login if no session
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Handle auth routes (login, register, etc.)
    else if (isAuthRoute(path)) {
      // If just logged out, allow access to login page
      if (justLoggedOut) {
        // Clear the flag after use
        response.cookies.set('just-logged-out', '', { maxAge: -1 });
        return response;
      }

      if (session) {
        // Redirect to dashboard if already authenticated
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Handle API routes that require authentication
    else if (isApiRoute(path) && path.startsWith('/api/protected/')) {
      if (!session) {
        // Return 401 for API routes requiring authentication
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // For all other routes, just continue
    return response;
  } catch (error) {
    console.error('Error in middleware:', error);

    // If there's an error, allow the request to continue
    // This prevents users from being locked out due to auth errors
    return response;
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};