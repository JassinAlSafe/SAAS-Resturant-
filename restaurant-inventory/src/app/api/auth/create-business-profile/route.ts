import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const businessData = await request.json();
    
    // Validate required fields
    if (!businessData.user_id) {
      return NextResponse.json(
        { error: 'Missing required user_id field' },
        { status: 400 }
      );
    }

    // Create or update the business profile using the admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('business_profiles')
      .upsert([businessData], {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error creating business profile:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error in create-business-profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
