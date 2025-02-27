import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This middleware protects routes that require authentication
export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Create a Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    const { data: { session } } = await supabase.auth.getSession();

    // Get the pathname from the request
    const { pathname } = req.nextUrl;

    // If the user is not authenticated, redirect to login
    if (!session) {
        const redirectUrl = new URL('/login', req.url);
        return NextResponse.redirect(redirectUrl);
    }

    // If the user is authenticated, allow access to protected routes
    return res;
}

// Configure the middleware to run on specific paths
export const config = {
    matcher: [
        // Match all routes except for static files, api routes, _next, and auth group
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api|\\(auth\\)|login|signup|forgot-password|reset-password).*)',
    ],
}; 