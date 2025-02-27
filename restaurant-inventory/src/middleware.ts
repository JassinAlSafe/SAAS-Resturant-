import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];

// This middleware protects routes that require authentication
export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Get the pathname from the request
    const { pathname } = req.nextUrl;

    // Skip middleware for public routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        return res;
    }

    try {
        // Create a Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            {
                cookies: {
                    get: (name) => req.cookies.get(name)?.value,
                    set: (name, value, options) => {
                        res.cookies.set(name, value, options);
                    },
                    remove: (name, options) => {
                        res.cookies.set(name, '', { ...options, maxAge: 0 });
                    },
                },
            }
        );

        // Check if the user is authenticated
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        // If the user is not authenticated, redirect to login
        if (!session) {
            const redirectUrl = new URL('/login', req.url);
            return NextResponse.redirect(redirectUrl);
        }

        // If the user is authenticated, allow access to protected routes
        return res;
    } catch (error) {
        console.error('Middleware error:', error);
        // In case of an error, allow the request to proceed
        // This prevents 500 errors in production
        return res;
    }
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all routes except for static files, api routes, _next
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
    ],
}; 