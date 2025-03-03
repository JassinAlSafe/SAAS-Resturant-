import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
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

        // Get the form data from the request
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate a unique filename
        const fileName = `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${file.name.split('.').pop()}`;
        const filePath = `logos/${fileName}`;

        // Upload the file to Supabase Storage
        const { error } = await supabaseAdmin.storage
            .from('business_assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to upload file', details: error },
                { status: 500 }
            );
        }

        // Get the public URL for the uploaded file
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('business_assets')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            message: 'File uploaded successfully',
            filePath,
            publicUrl: publicUrlData.publicUrl
        });
    } catch (error) {
        console.error('Error in test-storage-upload:', error);
        return NextResponse.json(
            { error: 'Failed to process upload', details: error },
            { status: 500 }
        );
    }
} 