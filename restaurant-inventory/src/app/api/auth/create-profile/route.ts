import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();
    
    // Validate required fields
    if (!profileData.id || !profileData.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update the profile using the admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert([profileData], {
        onConflict: 'id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in create-profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
