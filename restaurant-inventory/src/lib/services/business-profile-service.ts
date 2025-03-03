import { BusinessProfile } from "@/lib/types";
import { CurrencyCode } from "@/lib/currency-context";
import { supabase } from "@/lib/supabase";

// Define the database schema structure
interface BusinessProfileDatabase {
    id: string;
    user_id: string;
    name: string;
    type: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo: string | null;
    operating_hours: {
        monday: { open: string; close: string; closed: boolean };
        tuesday: { open: string; close: string; closed: boolean };
        wednesday: { open: string; close: string; closed: boolean };
        thursday: { open: string; close: string; closed: boolean };
        friday: { open: string; close: string; closed: boolean };
        saturday: { open: string; close: string; closed: boolean };
        sunday: { open: string; close: string; closed: boolean };
    };
    default_currency: string;
    created_at: string;
    updated_at: string;
}

// Default profile template for new users
const defaultBusinessProfile: Omit<BusinessProfile, "id" | "created_at" | "updated_at" | "user_id"> = {
    name: "My Restaurant",
    type: "casual_dining",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
    operatingHours: {
        monday: { open: "11:00", close: "22:00", closed: false },
        tuesday: { open: "11:00", close: "22:00", closed: false },
        wednesday: { open: "11:00", close: "22:00", closed: false },
        thursday: { open: "11:00", close: "22:00", closed: false },
        friday: { open: "11:00", close: "23:00", closed: false },
        saturday: { open: "12:00", close: "23:00", closed: false },
        sunday: { open: "12:00", close: "21:00", closed: false },
    },
    defaultCurrency: "SEK",
};

// Helper function to convert snake_case database fields to camelCase
function transformDatabaseResponse(data: BusinessProfileDatabase): BusinessProfile {
    return {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        type: data.type as BusinessProfile["type"],
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zipCode: data.zip_code || "",
        country: data.country || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        logo: data.logo || "",
        operatingHours: data.operating_hours,
        defaultCurrency: data.default_currency,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

// Helper function to convert camelCase object to snake_case for database
function transformForDatabase(data: Partial<BusinessProfile>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (data.name !== undefined) result.name = data.name;
    if (data.type !== undefined) result.type = data.type;
    if (data.address !== undefined) result.address = data.address;
    if (data.city !== undefined) result.city = data.city;
    if (data.state !== undefined) result.state = data.state;
    if (data.zipCode !== undefined) result.zip_code = data.zipCode;
    if (data.country !== undefined) result.country = data.country;
    if (data.phone !== undefined) result.phone = data.phone;
    if (data.email !== undefined) result.email = data.email;
    if (data.website !== undefined) result.website = data.website;
    if (data.logo !== undefined) result.logo = data.logo;
    if (data.operatingHours !== undefined) result.operating_hours = data.operatingHours;
    if (data.defaultCurrency !== undefined) result.default_currency = data.defaultCurrency;

    return result;
}

// Business profile service
export const businessProfileService = {
    // Clean up duplicate profiles
    cleanupDuplicateProfiles: async (userId: string): Promise<void> => {
        try {
            console.log("Cleaning up duplicate profiles for user:", userId);

            // First get all profiles for this user
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                console.error('Error fetching profiles for cleanup:', fetchError);
                return;
            }

            console.log(`Found ${profiles?.length || 0} profiles for user ${userId}`);

            // Keep the most recent one and delete the rest
            if (profiles && profiles.length > 1) {
                const mostRecentId = profiles[0].id;
                const idsToDelete = profiles.slice(1).map(p => p.id);

                console.log(`Keeping most recent profile ${mostRecentId}, deleting ${idsToDelete.length} older profiles`);

                const { error: deleteError } = await supabase
                    .from('business_profiles')
                    .delete()
                    .in('id', idsToDelete);

                if (deleteError) {
                    console.error('Error deleting duplicate profiles:', deleteError);
                } else {
                    console.log(`Successfully deleted ${idsToDelete.length} duplicate profiles`);
                }
            }
        } catch (error) {
            console.error('Error cleaning up duplicate profiles:', error);
        }
    },

    // Get business profile - now gets the most recent one
    getBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        try {
            console.log("Fetching business profile for user:", userId);

            // Get all profiles for this user, ordered by most recent first
            const { data: profiles, error } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching profiles:', error);
                throw new Error(`Failed to fetch business profile: ${error.message}`);
            }

            console.log(`Found ${profiles?.length || 0} profiles for user`);

            // If there are multiple profiles, schedule a cleanup
            if (profiles && profiles.length > 1) {
                console.log(`Found ${profiles.length} profiles for user, will clean up duplicates`);
                // Schedule cleanup for after this operation completes
                setTimeout(() => businessProfileService.cleanupDuplicateProfiles(userId), 1000);
            }

            // If we have any profiles, return the most recent one
            if (profiles && profiles.length > 0) {
                const mostRecent = profiles[0];
                console.log("Using most recent profile:", mostRecent.id);
                return transformDatabaseResponse(mostRecent as BusinessProfileDatabase);
            }

            // No profile found, create a new one
            console.log("No profiles found, creating new one");
            return businessProfileService.createBusinessProfile(userId);
        } catch (error) {
            console.error('Error in getBusinessProfile:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch business profile');
        }
    },

    // Create a new business profile
    createBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        try {
            console.log("Creating new business profile for user:", userId);

            // Use a simplified profile for more reliable creation
            const newProfile = {
                user_id: userId,
                name: "My Restaurant",
                type: "casual_dining",
                operating_hours: defaultBusinessProfile.operatingHours,
                default_currency: defaultBusinessProfile.defaultCurrency,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log("New profile data:", newProfile);

            const { data, error } = await supabase
                .from('business_profiles')
                .insert(newProfile)
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                throw new Error(`Failed to create business profile: ${error.message}`);
            }

            console.log("Successfully created profile:", data);
            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error in createBusinessProfile:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to create business profile');
        }
    },

    // Update business profile - now handles multiple profiles
    updateBusinessProfile: async (
        userId: string,
        profileData: Partial<Omit<BusinessProfile, "id" | "created_at" | "updated_at" | "user_id">>
    ): Promise<BusinessProfile> => {
        try {
            console.log("Updating business profile for user:", userId);
            console.log("Update data:", profileData);

            // First get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                console.log("No profile found to update, creating a new one");
                return businessProfileService.createBusinessProfile(userId);
            }

            const profileId = profiles[0].id;
            console.log("Updating profile with ID:", profileId);

            // Prepare the update data
            const updates = {
                ...transformForDatabase(profileData),
                updated_at: new Date().toISOString(),
            };

            // Update the profile using its ID (more precise than user_id)
            const { data, error } = await supabase
                .from('business_profiles')
                .update(updates)
                .eq('id', profileId)  // Use ID instead of user_id
                .select()
                .single();

            if (error) {
                console.error('Error updating profile:', error);

                // In case of error, try with minimal data
                const minimalUpdate = {
                    name: profileData.name || "Updated Restaurant",
                    updated_at: new Date().toISOString()
                };

                console.log("Retrying with minimal update:", minimalUpdate);

                const { data: retryData, error: retryError } = await supabase
                    .from('business_profiles')
                    .update(minimalUpdate)
                    .eq('id', profileId)
                    .select()
                    .single();

                if (retryError) {
                    console.error('Retry update failed:', retryError);
                    throw new Error(`Failed to update business profile: ${retryError.message}`);
                }

                console.log("Retry update succeeded:", retryData);
                return transformDatabaseResponse(retryData as BusinessProfileDatabase);
            }

            console.log("Update succeeded:", data);
            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error in updateBusinessProfile:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to update business profile');
        }
    },

    // Time validation utility
    validateOperatingHours: (hours: { open: string; close: string; closed: boolean }): { valid: boolean; error?: string } => {
        // If the day is marked as closed, no need to validate times
        if (hours.closed) {
            return { valid: true };
        }

        // Check for 24-hour open flag
        if (hours.open === "24hours" && hours.close === "24hours") {
            return { valid: true };
        }

        // Validate time format (HH:MM in 24-hour format)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (!timeRegex.test(hours.open)) {
            return {
                valid: false,
                error: `Invalid opening time format: ${hours.open}. Use HH:MM in 24-hour format.`
            };
        }

        if (!timeRegex.test(hours.close)) {
            return {
                valid: false,
                error: `Invalid closing time format: ${hours.close}. Use HH:MM in 24-hour format.`
            };
        }

        // Allow overnight hours (where closing time is earlier than opening time)
        // This accommodates businesses that close after midnight
        // For example: Open 22:00, Close 02:00 (next day)

        // We're removing this validation because restaurants often operate overnight
        // If needed, we can add a more sophisticated check that detects unreasonable
        // hours rather than just checking if opening time is before closing time

        // if (hours.open >= hours.close) {
        //     return {
        //         valid: false,
        //         error: "Opening time must be before closing time."
        //     };
        // }

        return { valid: true };
    },

    // Update operating hours - with validation
    updateOperatingHours: async (
        userId: string,
        day: keyof BusinessProfile["operatingHours"],
        hours: { open: string; close: string; closed: boolean }
    ): Promise<BusinessProfile> => {
        try {
            // Validate the hours unless marked as closed
            if (!hours.closed) {
                const validation = businessProfileService.validateOperatingHours(hours);
                if (!validation.valid) {
                    throw new Error(validation.error || "Invalid operating hours");
                }
            }

            // First get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profile = profiles[0];

            // Update the operating hours for the specified day
            const updatedHours = {
                ...profile.operating_hours,
                [day]: hours
            };

            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    operating_hours: updatedHours,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)  // Use ID instead of user_id
                .select()
                .single();

            if (error) {
                console.error('Error updating hours:', error);
                throw new Error(`Failed to update operating hours: ${error.message}`);
            }

            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error updating operating hours:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to update operating hours');
        }
    },

    // Update multiple days' operating hours at once
    updateMultipleDaysHours: async (
        userId: string,
        updates: Partial<Record<keyof BusinessProfile["operatingHours"], { open: string; close: string; closed: boolean }>>
    ): Promise<BusinessProfile> => {
        try {
            // Validate all updates
            for (const [day, hours] of Object.entries(updates)) {
                if (!hours) continue;
                if (!hours.closed) {
                    const validation = businessProfileService.validateOperatingHours(hours);
                    if (!validation.valid) {
                        throw new Error(`${day}: ${validation.error || "Invalid operating hours"}`);
                    }
                }
            }

            // Get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profile = profiles[0];

            // Update all specified days
            const updatedHours = {
                ...profile.operating_hours,
                ...updates
            };

            console.log(`Updating operating hours for ${Object.keys(updates).length} days`);

            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    operating_hours: updatedHours,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating multiple days:', error);
                throw new Error(`Failed to update operating hours: ${error.message}`);
            }

            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error updating multiple days operating hours:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to update operating hours');
        }
    },

    // Set all days to the same operating hours
    setAllDaysOperatingHours: async (
        userId: string,
        hours: { open: string; close: string; closed: boolean }
    ): Promise<BusinessProfile> => {
        try {
            // Validate the hours
            if (!hours.closed) {
                const validation = businessProfileService.validateOperatingHours(hours);
                if (!validation.valid) {
                    throw new Error(validation.error || "Invalid operating hours");
                }
            }

            // Create an update object for all days
            const allDaysUpdate = {
                monday: hours,
                tuesday: hours,
                wednesday: hours,
                thursday: hours,
                friday: hours,
                saturday: hours,
                sunday: hours
            };

            // Use the batch update method
            return businessProfileService.updateMultipleDaysHours(userId, allDaysUpdate);
        } catch (error) {
            console.error('Error setting all days operating hours:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to set all days operating hours');
        }
    },

    // Copy operating hours from one day to others
    copyOperatingHours: async (
        userId: string,
        sourceDay: keyof BusinessProfile["operatingHours"],
        targetDays: Array<keyof BusinessProfile["operatingHours"]>
    ): Promise<BusinessProfile> => {
        try {
            // Get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id, operating_hours')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profile = profiles[0];

            // Get source day hours
            const sourceHours = profile.operating_hours[sourceDay];
            if (!sourceHours) {
                throw new Error(`Source day ${sourceDay} not found in operating hours`);
            }

            // Create update object for target days
            const updates: Record<string, typeof sourceHours> = {};
            for (const day of targetDays) {
                updates[day] = { ...sourceHours };
            }

            console.log(`Copying hours from ${sourceDay} to ${targetDays.length} days`);

            // Use the batch update method
            return businessProfileService.updateMultipleDaysHours(userId, updates);
        } catch (error) {
            console.error('Error copying operating hours:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to copy operating hours');
        }
    },

    // Update default currency
    updateDefaultCurrency: async (
        userId: string,
        currency: CurrencyCode
    ): Promise<BusinessProfile> => {
        try {
            // First get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profileId = profiles[0].id;

            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    default_currency: currency,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profileId)  // Use ID instead of user_id
                .select()
                .single();

            if (error) {
                console.error('Error updating currency:', error);
                throw new Error(`Failed to update default currency: ${error.message}`);
            }

            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error updating default currency:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to update default currency');
        }
    },

    // Upload logo
    uploadLogo: async (
        userId: string,
        logoFile: File
    ): Promise<BusinessProfile> => {
        try {
            // Validate the file type
            const validMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
            if (!validMimeTypes.includes(logoFile.type)) {
                throw new Error(`Unsupported file type: ${logoFile.type}. Please use PNG, JPEG, GIF, WebP, or SVG.`);
            }

            console.log(`Starting logo upload process for user ${userId}, file type: ${logoFile.type}`);

            // Check storage policies before attempting upload
            try {
                console.log('Checking storage policies...');
                const policiesResponse = await fetch('/api/check-storage-policies');

                if (!policiesResponse.ok) {
                    console.error('Error checking policies:', await policiesResponse.text());
                } else {
                    const policiesData = await policiesResponse.json();
                    console.log('Current policies:', policiesData.policies?.length || 0);
                    console.log('Permission test result:', policiesData.permissionTest?.success);

                    // If we can't upload, force a policy update
                    if (!policiesData.permissionTest?.success) {
                        console.log('Upload permission test failed, forcing policy update...');
                        const setupResponse = await fetch('/api/setup-storage-bucket?force=true');

                        if (!setupResponse.ok) {
                            console.error('Failed to update policies:', await setupResponse.text());
                        } else {
                            console.log('Successfully updated storage policies');
                        }
                    }
                }
            } catch (policyError) {
                console.error('Error checking policies:', policyError);
                // Continue anyway, we'll handle upload errors if they occur
            }

            // First check if the bucket exists using regular client
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

            if (bucketsError) {
                console.error('Error checking buckets:', bucketsError);
                throw new Error(`Failed to check storage buckets: ${bucketsError.message}`);
            }

            const bucketExists = buckets?.some(bucket => bucket.name === 'business_assets');

            // Create the bucket if it doesn't exist - use API endpoint instead of direct admin access
            if (!bucketExists) {
                console.log('Bucket does not exist, setting up through API...');

                // Use the API endpoint instead of direct admin client
                try {
                    const response = await fetch('/api/setup-storage-bucket?force=true');
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(`Failed to create storage bucket: ${errorData.message || errorData.error || 'Unknown error'}`);
                    }

                    console.log('Successfully created business_assets bucket via API.');
                } catch (setupError) {
                    console.error('Error setting up bucket via API:', setupError);
                    throw setupError instanceof Error
                        ? setupError
                        : new Error('Failed to set up storage bucket');
                }
            }

            // Get the most recent profile
            const { data: profiles, error: fetchError } = await supabase
                .from('business_profiles')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (fetchError || !profiles || profiles.length === 0) {
                throw new Error(`No profile found for user ${userId}`);
            }

            const profileId = profiles[0].id;

            // Upload the file to Supabase Storage
            const fileName = `${userId}_logo_${Date.now()}`;
            const fileExt = logoFile.name.split('.').pop();
            const filePath = `logos/${fileName}.${fileExt}`;

            console.log(`Attempting to upload file to path: ${filePath} with type: ${logoFile.type}`);

            // Try to upload with specific options
            const uploadOptions = {
                cacheControl: '3600',
                upsert: true,
                contentType: logoFile.type // Explicitly set the content type
            };

            // Try multiple approaches to uploading
            let uploadError = null;

            // First attempt - directly upload the file
            console.log('Attempt 1: Direct upload');
            let uploadResult = await supabase.storage
                .from('business_assets')
                .upload(filePath, logoFile, uploadOptions);

            if (uploadResult.error) {
                uploadError = uploadResult.error;
                console.error('Direct upload failed:', uploadError);

                // Second attempt - ensure policies are set correctly
                console.log('Attempt 2: Fixing policies and retrying');
                const fixResponse = await fetch('/api/setup-storage-bucket?force=true');

                if (!fixResponse.ok) {
                    console.error('Failed to fix policies:', await fixResponse.text());
                } else {
                    console.log('Policies updated, retrying upload');

                    // Wait a short time for policies to take effect
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Try upload again
                    uploadResult = await supabase.storage
                        .from('business_assets')
                        .upload(filePath, logoFile, uploadOptions);

                    if (uploadResult.error) {
                        uploadError = uploadResult.error;
                        console.error('Second upload attempt failed:', uploadError);
                    } else {
                        console.log('Second upload attempt succeeded');
                        uploadError = null;
                    }
                }
            } else {
                console.log('Direct upload succeeded');
            }

            // If we still have an error after all attempts, throw an error
            if (uploadError) {
                throw new Error(`Failed to upload logo: ${uploadError.message}`);
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('business_assets')
                .getPublicUrl(filePath);

            console.log(`Successfully uploaded logo, public URL: ${publicUrl}`);

            // Update the business profile with the logo URL
            const { data, error } = await supabase
                .from('business_profiles')
                .update({
                    logo: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', profileId)  // Use ID instead of user_id
                .select()
                .single();

            if (error) {
                console.error('Error updating logo in profile:', error);
                throw new Error(`Failed to update logo: ${error.message}`);
            }

            console.log('Successfully updated profile with new logo URL');
            return transformDatabaseResponse(data as BusinessProfileDatabase);
        } catch (error) {
            console.error('Error in uploadLogo:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to upload logo');
        }
    },
}; 