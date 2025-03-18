import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/auth/callback'];

// Define API routes that require authentication
const protectedApiRoutes = ['/api/setup-restaurant-icons'];

// Define routes that should bypass onboarding check
const bypassOnboardingCheck = ['/onboarding', '/api', '/_next', '/static'];

// This middleware protects routes that require authentication
export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Get the pathname from the request
    const { pathname } = req.nextUrl;

    // Skip middleware for public routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        return res;
    }

    // Check if this is a protected API route
    const isProtectedApiRoute = protectedApiRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Skip middleware for API routes that are not explicitly protected
    if (pathname.startsWith('/api/') && !isProtectedApiRoute) {
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

        // If the user is not authenticated, redirect to login or return 401 for API routes
        if (!session) {
            if (isProtectedApiRoute) {
                return NextResponse.json(
                    { error: 'Unauthorized: Authentication required' },
                    { status: 401 }
                );
            } else {
                const redirectUrl = new URL('/login', req.url);
                return NextResponse.redirect(redirectUrl);
            }
        }

        // Skip onboarding check for specific routes
        if (bypassOnboardingCheck.some(route => pathname.startsWith(route))) {
            return res;
        }

        // Check if user has completed onboarding
        const { data: profiles, error } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .limit(1);

        // If no profile exists and not on onboarding page, redirect to onboarding
        if ((!profiles || profiles.length === 0) && !pathname.startsWith('/onboarding')) {
            const redirectUrl = new URL('/onboarding', req.url);
            return NextResponse.redirect(redirectUrl);
        }

        // If profile exists and trying to access onboarding, redirect to dashboard
        if (profiles && profiles.length > 0 && pathname.startsWith('/onboarding')) {
            const redirectUrl = new URL('/dashboard', req.url);
            return NextResponse.redirect(redirectUrl);
        }

        // If the user is authenticated, allow access to protected routes
        return res;
    } catch (error) {
        console.error('Middleware error:', error);

        // For API routes, return a proper error response
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
                { status: 500 }
            );
        }

        // For other routes, allow the request to proceed
        return res;
    }
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all routes except for static files, _next
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}; 