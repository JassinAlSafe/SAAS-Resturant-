import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Check if we should force recreate policies
  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';

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

    let bucketCreated = false;
    let policiesUpdated = false;
    const bucketExists = buckets?.some(bucket => bucket.name === 'business_assets') || false;

    // Create the bucket if it doesn't exist
    if (!bucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('business_assets', {
        public: false,
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/gif',
          'image/webp',
          'image/svg+xml'
        ],
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create bucket', details: createError },
          { status: 500 }
        );
      }

      bucketCreated = true;
    }

    // Update or set up RLS policies if:
    // 1. The bucket was just created, or
    // 2. Force is true (explicit request to update policies)
    if (bucketCreated || force) {
      // First, get all existing policies on the bucket
      const { data: existingPolicies, error: policiesError } = await supabaseAdmin.rpc(
        'get_policies',
        {
          table_name: 'objects',
          schema_name: 'storage'
        }
      );

      if (policiesError) {
        return NextResponse.json(
          {
            error: 'Failed to get existing policies',
            details: policiesError,
            bucketCreated
          },
          { status: 500 }
        );
      }

      // Filter policies relevant to the business_assets bucket
      const businessAssetsPolicies = existingPolicies?.filter(
        (policy: any) => policy.definition?.includes('business_assets')
      ) || [];

      // Define the policies needed for proper operation
      const requiredPolicies = [
        // Policy to allow authenticated users to select objects
        {
          name: 'business_assets_select_policy',
          definition: `((bucket_id = 'business_assets') AND (auth.role() = 'authenticated'))`,
          check: 'SELECT',
          permissive: true
        },
        // Policy to allow authenticated users to insert objects
        {
          name: 'business_assets_insert_policy',
          definition: `((bucket_id = 'business_assets') AND (auth.role() = 'authenticated'))`,
          check: 'INSERT',
          permissive: true
        },
        // Policy to allow authenticated users to update their own objects
        {
          name: 'business_assets_update_policy',
          definition: `((bucket_id = 'business_assets') AND (auth.role() = 'authenticated'))`,
          check: 'UPDATE',
          permissive: true
        },
        // Policy to allow authenticated users to delete their own objects
        {
          name: 'business_assets_delete_policy',
          definition: `((bucket_id = 'business_assets') AND (auth.role() = 'authenticated'))`,
          check: 'DELETE',
          permissive: true
        }
      ];

      // Apply all policies
      const policyResults = [];

      for (const policy of requiredPolicies) {
        // Check if this policy already exists
        const existingPolicy = businessAssetsPolicies.find((p: any) =>
          p.policyname === policy.name
        );

        // If policy exists and we're not forcing update, skip it
        if (existingPolicy && !force) {
          policyResults.push({
            name: policy.name,
            result: 'skipped',
            existing: true
          });
          continue;
        }

        // If policy exists and we're forcing update, drop it first
        if (existingPolicy) {
          const { error: dropError } = await supabaseAdmin.rpc(
            'drop_policy',
            {
              policy_name: policy.name,
              table_name: 'objects',
              schema_name: 'storage'
            }
          );

          if (dropError) {
            policyResults.push({
              name: policy.name,
              result: 'error_dropping',
              error: dropError
            });
            continue;
          }
        }

        // Create the new policy
        const { error: createPolicyError } = await supabaseAdmin.rpc(
          'create_policy',
          {
            policy_name: policy.name,
            table_name: 'objects',
            schema_name: 'storage',
            definition: policy.definition,
            check_type: policy.check,
            permissive: policy.permissive
          }
        );

        if (createPolicyError) {
          policyResults.push({
            name: policy.name,
            result: 'error_creating',
            error: createPolicyError
          });
        } else {
          policyResults.push({
            name: policy.name,
            result: 'created',
            successful: true
          });
          policiesUpdated = true;
        }
      }

      // Create a folder for logos by uploading a zero-byte object 
      // without using a blob (to avoid MIME type issues)
      const logosPath = 'logos/.placeholder';
      const { error: folderError } = await supabaseAdmin.storage
        .from('business_assets')
        .upload(logosPath, new Uint8Array(0), {
          contentType: 'application/octet-stream',
          upsert: true
        });

      return NextResponse.json({
        success: true,
        message: bucketCreated
          ? 'Storage bucket created with security policies'
          : 'Storage bucket policies updated',
        details: {
          bucketCreated,
          policiesUpdated,
          policies: policyResults,
          folderCreated: !folderError,
          folderError: folderError || null
        }
      });
    }

    // If bucket exists and no force update, just return success
    return NextResponse.json({
      success: true,
      message: 'Storage bucket already exists',
      details: {
        bucketCreated: false,
        bucketName: 'business_assets'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set up storage bucket', details: error },
      { status: 500 }
    );
  }
}