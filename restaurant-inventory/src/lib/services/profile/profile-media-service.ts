import { BusinessProfile } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
    BusinessProfileError,
    BusinessProfileDatabase,
    LogoTransformOptions
} from "@/lib/types/business-profile";
import {
    transformDatabaseResponse,
    setCachedProfile,
    CONSTANTS
} from "@/lib/utils/business-profile-utils";

/**
 * Profile Media Service
 * Operations for managing media (logos, photos, etc.)
 */
export const profileMediaService = {
    /**
     * Upload logo for a business profile
     */
    uploadLogo: async (
        userId: string,
        logoFile: File
    ): Promise<BusinessProfile> => {
        try {
            // Validate the file type
            if (!CONSTANTS.VALID_MIME_TYPES.includes(logoFile.type as any)) {
                throw new BusinessProfileError(
                    `Unsupported file type: ${logoFile.type}. Please use PNG, JPEG, GIF, WebP, or SVG.`,
                    'INVALID_FILE_TYPE'
                );
            }

            // Check file size (max 2MB)
            if (logoFile.size > CONSTANTS.MAX_FILE_SIZE) {
                throw new BusinessProfileError(
                    `File size exceeds the 2MB limit. Please compress your image or choose a smaller file.`,
                    'FILE_TOO_LARGE'
                );
            }

            console.log(`Processing logo upload for user ${userId}, file type: ${logoFile.type}, size: ${logoFile.size} bytes`);

            // Get the current profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profile = profiles[0];

            // Generate a unique file name with timestamp and random string
            const timestamp = new Date().getTime();
            const randomString = Math.random().toString(36).substring(2, 10);
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${userId}/logo-${timestamp}-${randomString}.${fileExt}`;

            // Upload the file to the restaurant-icons bucket
            const { error: uploadError } = await supabase.storage
                .from(CONSTANTS.LOGO_BUCKET)
                .upload(fileName, logoFile, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: logoFile.type
                });

            if (uploadError) {
                console.error('Error uploading logo:', uploadError);
                throw new BusinessProfileError(
                    `Failed to upload logo: ${uploadError.message}`,
                    'LOGO_UPLOAD_ERROR'
                );
            }

            // Generate a signed URL for the uploaded file
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from(CONSTANTS.LOGO_BUCKET)
                .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days expiry

            if (signedUrlError) {
                console.error('Error generating signed URL:', signedUrlError);
                throw new BusinessProfileError(
                    `Failed to generate signed URL: ${signedUrlError.message}`,
                    'SIGNED_URL_ERROR'
                );
            }

            const logoUrl = signedUrlData.signedUrl;

            // Update the profile with the new logo URL and file path
            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    logo: logoUrl,
                    logo_path: fileName, // Store the path for future reference
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating logo in profile:', error);
                throw new BusinessProfileError(
                    `Failed to update logo: ${error.message}`,
                    'LOGO_UPDATE_ERROR'
                );
            }

            console.log('Successfully updated profile with new logo URL');
            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, transformedProfile);
            return transformedProfile;
        } catch (error) {
            console.error('Error in uploadLogo:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to upload logo',
                    'LOGO_UPLOAD_ERROR'
                );
        }
    },

    /**
     * Get a fresh signed URL for a logo
     */
    getLogoSignedUrl: async (
        logoPath: string,
        expiresIn: number = 3600
    ): Promise<string> => {
        try {
            if (!logoPath) {
                throw new BusinessProfileError(
                    'No logo path provided',
                    'INVALID_LOGO_PATH'
                );
            }

            // Generate a signed URL for the file
            const { data, error } = await supabase.storage
                .from(CONSTANTS.LOGO_BUCKET)
                .createSignedUrl(logoPath, expiresIn);

            if (error) {
                console.error('Error generating signed URL:', error);
                throw new BusinessProfileError(
                    `Failed to generate signed URL: ${error.message}`,
                    'SIGNED_URL_ERROR'
                );
            }

            return data.signedUrl;
        } catch (error) {
            console.error('Error in getLogoSignedUrl:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to get logo signed URL',
                    'SIGNED_URL_ERROR'
                );
        }
    },

    /**
     * Get a fresh signed URL with transformations (for image optimization)
     */
    getLogoSignedUrlWithTransform: async (
        logoPath: string,
        options: LogoTransformOptions,
        expiresIn: number = 3600
    ): Promise<string> => {
        try {
            if (!logoPath) {
                throw new BusinessProfileError(
                    'No logo path provided',
                    'INVALID_LOGO_PATH'
                );
            }

            // Generate a signed URL with transformations
            const { data, error } = await supabase.storage
                .from(CONSTANTS.LOGO_BUCKET)
                .createSignedUrl(logoPath, expiresIn, {
                    transform: {
                        width: options.width,
                        height: options.height,
                        quality: options.quality,
                        resize: options.resize,
                    }
                });

            if (error) {
                console.error('Error generating transformed signed URL:', error);
                throw new BusinessProfileError(
                    `Failed to generate transformed signed URL: ${error.message}`,
                    'TRANSFORM_URL_ERROR'
                );
            }

            return data.signedUrl;
        } catch (error) {
            console.error('Error in getLogoSignedUrlWithTransform:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to get transformed logo signed URL',
                    'TRANSFORM_URL_ERROR'
                );
        }
    },

    /**
     * Upload logo using a placeholder image (temporary solution)
     */
    uploadLogoWithPlaceholder: async (
        userId: string,
        logoFile: File
    ): Promise<BusinessProfile> => {
        try {
            // Validate the file type
            if (!CONSTANTS.VALID_MIME_TYPES.includes(logoFile.type as any)) {
                throw new BusinessProfileError(
                    `Unsupported file type: ${logoFile.type}. Please use PNG, JPEG, GIF, WebP, or SVG.`,
                    'INVALID_FILE_TYPE'
                );
            }

            console.log(`Processing placeholder logo for user ${userId}, file type: ${logoFile.type}`);

            // Get the current profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new BusinessProfileError(
                    `No profile found for user ${userId}`,
                    'PROFILE_NOT_FOUND'
                );
            }

            const profile = profiles[0];

            // For now, use a placeholder image service instead of actual uploads
            // This avoids storage permission issues until they can be properly configured
            const width = 300;
            const height = 300;
            const logoUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;

            // Log that we're using a placeholder
            console.log('Using placeholder image URL due to storage permission issues:', logoUrl);

            // Update the profile with the new logo URL
            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    logo: logoUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating logo in profile:', error);
                throw new BusinessProfileError(
                    `Failed to update logo: ${error.message}`,
                    'LOGO_UPDATE_ERROR'
                );
            }

            console.log('Successfully updated profile with placeholder logo URL');
            const transformedProfile = transformDatabaseResponse(data as BusinessProfileDatabase);
            setCachedProfile(userId, transformedProfile);
            return transformedProfile;
        } catch (error) {
            console.error('Error in uploadLogoWithPlaceholder:', error);
            throw error instanceof BusinessProfileError
                ? error
                : new BusinessProfileError(
                    'Failed to upload logo',
                    'LOGO_UPLOAD_ERROR'
                );
        }
    }
};