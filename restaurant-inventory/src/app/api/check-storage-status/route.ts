import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Create a server-side admin client for this specific API call
        // This properly types the client without needing to rely on the shared module
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({
                error: "Missing Supabase credentials",
                message: "Server is not configured correctly"
            }, { status: 500 });
        }

        const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Check if the bucket exists
        const { data: buckets, error: bucketsError } = await adminClient.storage.listBuckets();

        if (bucketsError) {
            return NextResponse.json(
                {
                    error: "Failed to list buckets",
                    message: bucketsError.message,
                    details: bucketsError
                },
                { status: 500 }
            );
        }

        const bucketExists = buckets?.some((bucket) => bucket.name === "business_assets");

        // If the bucket exists, check if the logos folder exists
        let folderExists = false;
        if (bucketExists) {
            try {
                const { data: folderData } = await adminClient.storage
                    .from("business_assets")
                    .list("logos");

                folderExists = !!folderData && folderData.length > 0;
            } catch (folderError) {
                console.warn("Error checking folder:", folderError);
                // Continue even if folder check fails
            }
        }

        return NextResponse.json({
            bucketExists,
            folderExists,
            bucketsCount: buckets?.length || 0,
            bucketsList: buckets?.map(b => b.name) || [],
        });
    } catch (error) {
        console.error("Error checking storage status:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: "Error checking storage status",
                message: errorMessage,
            },
            { status: 500 }
        );
    }
} 