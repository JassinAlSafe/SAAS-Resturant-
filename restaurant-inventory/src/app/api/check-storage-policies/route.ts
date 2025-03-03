import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    );
  }

  // Create a Supabase admin client
  const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Check if the business_assets bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      return NextResponse.json(
        { error: 'Failed to list buckets', details: bucketsError },
        { status: 500 }
      );
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'business_assets') || false;

    // Get all storage policies using RPC call
    const { data: allPolicies, error: policiesError } = await supabaseAdmin.rpc(
      'get_policies',
      {
        table_name: 'objects',
        schema_name: 'storage'
      }
    );

    if (policiesError) {
      return NextResponse.json(
        {
          error: 'Failed to get policies',
          details: policiesError,
          bucketExists,
          buckets
        },
        { status: 500 }
      );
    }

    // Filter policies relevant to the business_assets bucket
    const relevantPolicies = allPolicies?.filter(
      (policy: any) => policy.definition?.includes('business_assets')
    ) || [];

    // Get the current user to test permissions
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const isAuthenticated = !!session?.user;
    let permissionTestResult = null;

    // Test if we can upload (only if the bucket exists)
    if (bucketExists) {
      try {
        // Try to upload a zero-byte test file
        const testFilePath = `test-${Date.now()}.txt`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('business_assets')
          .upload(testFilePath, new Uint8Array(0), {
            contentType: 'application/octet-stream',
            upsert: true
          });

        if (uploadError) {
          permissionTestResult = {
            success: false,
            error: uploadError
          };
        } else {
          // If upload succeeded, remove the test file
          await supabaseAdmin.storage
            .from('business_assets')
            .remove([testFilePath]);

          permissionTestResult = {
            success: true
          };
        }
      } catch (error) {
        permissionTestResult = {
          success: false,
          error
        };
      }
    }

    // Return all the information
    return NextResponse.json({
      bucketExists,
      buckets: buckets?.map(b => b.name) || [],
      policies: relevantPolicies,
      allPoliciesCount: allPolicies?.length || 0,
      permissionTest: permissionTestResult,
      isAuthenticated,
      currentTime: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check storage policies', details: error },
      { status: 500 }
    );
  }
} 