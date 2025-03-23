import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Define allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    // Add your production domains here
];

export async function GET() {
    try {
        // Log that the API route was called
        console.log('API route /api/setup-restaurant-icons called');

        const headersList = await headers();
        const origin = headersList.get('origin') || '';
        const authHeader = headersList.get('Authorization');

        // Log available headers for debugging
        console.log('Headers available:', Array.from(headersList.keys()));
        console.log('Origin:', origin);

        // Set default CORS headers - allow requests even if origin is empty in development
        const corsHeaders = {
            'Access-Control-Allow-Origin': origin || 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
        };

        // CORS check
        if (origin && !allowedOrigins.includes(origin)) {
            console.error('Invalid origin:', origin);
            return NextResponse.json({
                error: 'CORS error: Invalid origin',
                details: `Origin ${origin} is not allowed`
            }, {
                status: 403,
                headers: corsHeaders
            });
        } else if (!origin || origin === '') {
            console.log('Empty origin, allowing request in development mode');
            // Continue with the request
        }

        // Create Supabase client
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Check if user is authenticated via cookies
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // If no session from cookies but we have an auth header, try to use it
        if (!session && authHeader && authHeader.startsWith('Bearer ')) {
            console.log('No session from cookies, trying Authorization header');
            const token = authHeader.split(' ')[1];

            // Verify the token
            const { data: authData, error: authError } = await supabase.auth.getUser(token);

            if (authError) {
                console.error('Auth header verification error:', authError);
                return NextResponse.json({
                    error: 'Invalid authorization token',
                    details: authError
                }, {
                    status: 401,
                    headers: corsHeaders
                });
            }

            if (authData?.user) {
                console.log('User authenticated via Authorization header:', authData.user.id);
                // Continue with the authenticated user
            } else {
                console.error('No user found with provided token');
                return NextResponse.json({
                    error: 'Unauthorized: Invalid token',
                    details: 'The provided authentication token is not valid.'
                }, {
                    status: 401,
                    headers: corsHeaders
                });
            }
        } else if (sessionError) {
            console.error('Session error:', sessionError);
            return NextResponse.json({
                error: 'Authentication error: ' + sessionError.message,
                details: sessionError
            }, {
                status: 401,
                headers: corsHeaders
            });
        } else if (!session) {
            console.error('No session found');
            // Log the cookies for debugging
            console.log('No valid session found in cookies');
            return NextResponse.json({
                error: 'Unauthorized: No session found',
                details: 'No valid authentication session was found. Please log in again.'
            }, {
                status: 401,
                headers: corsHeaders
            });
        } else {
            console.log('User authenticated via cookies:', session.user.id);
        }

        // Check if the bucket exists
        try {
            const { data: buckets, error: bucketsError } = await supabase
                .storage
                .listBuckets();

            if (bucketsError) {
                console.error('Error listing buckets:', bucketsError);
                return NextResponse.json({
                    error: bucketsError.message,
                    details: bucketsError
                }, {
                    status: 500,
                    headers: corsHeaders
                });
            }

            const bucketExists = buckets.some(bucket => bucket.name === 'restaurant-icons');
            console.log('Bucket exists:', bucketExists);

            // If bucket doesn\'t exist, create it
            if (!bucketExists) {
                console.log('Creating restaurant-icons bucket');
                try {
                    const { error: createError } = await supabase
                        .storage
                        .createBucket('restaurant-icons', {
                            public: false,
                            fileSizeLimit: 2097152, // 2MB
                            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
                        });

                    if (createError) {
                        console.error('Error creating bucket:', createError);

                        // Check if this is an RLS policy error
                        if (createError.message.includes('row-level security policy')) {
                            console.error('RLS policy error detected. This may require running the fix_restaurant_icons_rls.sql script.');
                            return NextResponse.json({
                                error: 'Row-Level Security Policy Error',
                                details: {
                                    message: 'The operation was blocked by Supabase RLS policies. Please run the fix_restaurant_icons_rls.sql script in the Supabase SQL editor.',
                                    originalError: createError
                                },
                                solution: 'Run the fix_restaurant_icons_rls.sql script in your Supabase SQL editor to fix the RLS policies.'
                            }, {
                                status: 400,
                                headers: corsHeaders
                            });
                        }

                        return NextResponse.json({
                            error: createError.message,
                            details: createError
                        }, {
                            status: 500,
                            headers: corsHeaders
                        });
                    }
                    console.log('Bucket created successfully');
                } catch (createBucketError) {
                    console.error('Exception creating bucket:', createBucketError);

                    // Check if this is an RLS policy error
                    if (createBucketError instanceof Error &&
                        createBucketError.message.includes('row-level security policy')) {
                        console.error('RLS policy error detected in exception');
                        return NextResponse.json({
                            error: 'Row-Level Security Policy Error',
                            details: {
                                message: 'The operation was blocked by Supabase RLS policies. Please run the fix_restaurant_icons_rls.sql script in the Supabase SQL editor.',
                                originalError: createBucketError instanceof Error ? createBucketError.message : String(createBucketError)
                            },
                            solution: 'Run the fix_restaurant_icons_rls.sql script in your Supabase SQL editor to fix the RLS policies.'
                        }, {
                            status: 400,
                            headers: corsHeaders
                        });
                    }

                    return NextResponse.json({
                        error: 'Error creating bucket',
                        details: createBucketError instanceof Error ? createBucketError.message : String(createBucketError)
                    }, {
                        status: 500,
                        headers: corsHeaders
                    });
                }
            }

            // Create user folder if it doesn\'t exist
            const userId = session.user.id;
            const folderPath = `${userId}/`;

            // Check if folder exists by listing objects with the prefix
            const { data: folderCheck, error: folderCheckError } = await supabase
                .storage
                .from('restaurant-icons')
                .list(folderPath, {
                    limit: 1
                });

            if (folderCheckError && folderCheckError.message !== 'The resource was not found') {
                return NextResponse.json(
                    {
                        error: 'Folder Check Error',
                        details: {
                            message: 'Failed to check if user folder exists',
                            originalError: folderCheckError
                        }
                    },
                    { status: 500 }
                );
            }

            // If folder doesn\'t exist, create an empty placeholder file to establish the folder
            if (!folderCheck || folderCheck.length === 0) {
                const placeholderContent = new Uint8Array([]);
                const placeholderPath = `${folderPath}.placeholder`;

                const { error: uploadError } = await supabase
                    .storage
                    .from('restaurant-icons')
                    .upload(placeholderPath, placeholderContent, {
                        contentType: 'application/octet-stream',
                        upsert: true
                    });

                if (uploadError) {
                    return NextResponse.json(
                        {
                            error: 'Folder Creation Error',
                            details: {
                                message: 'Failed to create user folder in restaurant-icons bucket',
                                originalError: uploadError
                            }
                        },
                        { status: 500 }
                    );
                }
            }

            // Get the RLS policies for the bucket
            let policies = [];
            try {
                // Check if the get_policies_for_bucket function exists
                const { error: functionCheckError } = await supabase
                    .rpc('get_policies_for_bucket', { bucket_name: 'restaurant-icons' })
                    .maybeSingle();

                if (functionCheckError && functionCheckError.message.includes('function get_policies_for_bucket')) {
                    console.log('get_policies_for_bucket function does not exist, skipping policy check');
                    // Function doesn\'t exist, return empty policies
                    policies = [];
                } else {
                    // Function exists, get the policies
                    const { data: policiesData, error: policiesError } = await supabase
                        .rpc('get_policies_for_bucket', { bucket_name: 'restaurant-icons' });

                    if (policiesError) {
                        console.error('Error getting policies:', policiesError);
                        // Continue without policies data
                        policies = [];
                    } else {
                        policies = policiesData || [];
                    }
                }
            } catch (policiesError) {
                console.error('Exception getting policies:', policiesError);
                // Continue without policies data
                policies = [];
            }

            return NextResponse.json({
                success: true,
                message: 'Restaurant icons bucket is ready',
                bucketExists,
                userId,
                policies
            });
        } catch (bucketsError) {
            console.error('Exception listing buckets:', bucketsError);

            // Check if this is an RLS policy error
            if (bucketsError instanceof Error &&
                bucketsError.message.includes('row-level security policy')) {
                console.error('RLS policy error detected in buckets operation');
                return NextResponse.json({
                    error: 'Row-Level Security Policy Error',
                    details: {
                        message: 'The operation was blocked by Supabase RLS policies. Please run the fix_restaurant_icons_rls.sql script in the Supabase SQL editor.',
                        originalError: bucketsError instanceof Error ? bucketsError.message : String(bucketsError)
                    },
                    solution: 'Run the fix_restaurant_icons_rls.sql script in your Supabase SQL editor to fix the RLS policies.'
                }, {
                    status: 400,
                    headers: corsHeaders
                });
            }

            return NextResponse.json({
                error: 'Error listing buckets',
                details: bucketsError instanceof Error ? bucketsError.message : String(bucketsError)
            }, {
                status: 500,
                headers: corsHeaders
            });
        }
    } catch (error) {
        console.error('Error setting up restaurant-icons bucket:', error);

        // Check if this is an RLS policy error
        if (error instanceof Error &&
            error.message.includes('row-level security policy')) {
            console.error('RLS policy error detected in main try/catch');
            return NextResponse.json({
                error: 'Row-Level Security Policy Error',
                details: {
                    message: 'The operation was blocked by Supabase RLS policies. Please run the fix_restaurant_icons_rls.sql script in the Supabase SQL editor.',
                    originalError: error instanceof Error ? error.message : String(error)
                },
                solution: 'Run the fix_restaurant_icons_rls.sql script in your Supabase SQL editor to fix the RLS policies.'
            }, {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }

        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS() {
    const headersList = await headers();
    const origin = headersList.get('origin') || '';

    // Always respond to OPTIONS requests in development
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin || 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400', // 24 hours
        },
    });
}

// Helper RPC function to get policies for a bucket
// This needs to be created in Supabase SQL editor:
/*
CREATE OR REPLACE FUNCTION get_policies_for_bucket(bucket_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'policyname', p.policyname,
            'permissive', p.permissive,
            'roles', p.roles,
            'cmd', p.cmd,
            'using_expr', p.using_expr,
            'with_check_expr', p.with_check_expr
        )
    )
    INTO result
    FROM pg_policies p
    JOIN pg_class c ON p.tablename = c.relname
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'storage'
    AND p.tablename = 'objects'
    AND p.using_expr::text LIKE '%' || bucket_name || '%'
    OR p.with_check_expr::text LIKE '%' || bucket_name || '%';

    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
*/ 