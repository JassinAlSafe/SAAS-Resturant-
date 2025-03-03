import { NextResponse } from 'next/server';

export async function GET() {
    // Simple check to see if the keys are the same
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if the keys are defined and if they are the same
    const keysAreSame =
        anonKey &&
        serviceRoleKey &&
        anonKey === serviceRoleKey;

    return NextResponse.json({
        keysAreSame,
        serviceRoleKeyExists: !!serviceRoleKey,
        anonKeyExists: !!anonKey,
    });
} 