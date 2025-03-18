import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
    try {
        // Get the URL from the query parameters
        const url = new URL(request.url);
        const imageUrl = url.searchParams.get('url');

        if (!imageUrl) {
            return new NextResponse('Missing URL parameter', { status: 400 });
        }

        // Fetch the image from the source
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            return new NextResponse(`Error fetching image: ${imageResponse.statusText}`, {
                status: imageResponse.status,
            });
        }

        // Get the image data
        const imageData = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';

        // Return the image with appropriate headers
        return new NextResponse(imageData, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return new NextResponse('Error processing image', { status: 500 });
    }
}

// Increase the maximum allowed duration for this route (optional)
export const config = {
    api: {
        responseLimit: '10mb',
        bodyParser: false,
    },
}; 