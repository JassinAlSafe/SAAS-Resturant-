"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BusinessProfile } from "@/lib/types";

// Define a type for the database profile
interface DbBusinessProfile {
    id: string;
    name: string;
    type: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    logo?: string;
    operatingHours: Record<string, { open: string; close: string; closed: boolean }>;
    defaultCurrency: string;
    taxSettings?: { rate: number; enabled: boolean; name: string };
    taxRate?: number;
    taxEnabled?: boolean;
    taxName?: string;
    created_at: string;
    updated_at: string;
    user_id?: string;
}

async function fetchBusinessProfile(): Promise<BusinessProfile> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // First try to get the business profile through the join table
        try {
            const { data, error } = await supabase
                .from("business_profile_users")
                .select(`
                    business_profiles (
                        id,
                        name,
                        type,
                        email,
                        phone,
                        website,
                        address,
                        city,
                        state,
                        zipCode,
                        country,
                        logo,
                        operatingHours,
                        defaultCurrency,
                        taxSettings,
                        taxRate,
                        taxEnabled,
                        taxName,
                        created_at,
                        updated_at
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (!error && data?.business_profiles) {
                // Extract the first business profile from the array
                const [profile] = Array.isArray(data.business_profiles)
                    ? data.business_profiles
                    : [data.business_profiles];

                if (profile) {
                    console.log("Found business profile through join table:", profile.id);
                    return mapProfileToBusinessProfile(profile as DbBusinessProfile);
                }
            }
        } catch (joinError) {
            console.warn("Error fetching through join table, trying direct query:", joinError);
        }

        // If the join table approach fails, try direct query to business_profiles
        const { data: directProfiles, error: directError } = await supabase
            .from("business_profiles")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1);

        if (directError) throw new Error(directError.message);
        if (!directProfiles || directProfiles.length === 0) throw new Error("No business profile found");

        const profile = directProfiles[0];
        console.log("Found business profile through direct query:", profile.id);
        return mapProfileToBusinessProfile(profile as DbBusinessProfile);
    } catch (error) {
        console.error("Error fetching business profile:", error);
        throw error;
    }
}

// Helper function to map database profile to BusinessProfile type
function mapProfileToBusinessProfile(profile: DbBusinessProfile): BusinessProfile {
    return {
        id: profile.id,
        name: profile.name,
        type: profile.type,
        email: profile.email,
        phone: profile.phone,
        website: profile.website,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        country: profile.country,
        logo: profile.logo,
        operatingHours: profile.operatingHours as Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday', { open: string; close: string; closed: boolean }>,
        defaultCurrency: profile.defaultCurrency,
        taxSettings: profile.taxSettings || {
            rate: 0,
            enabled: false,
            name: "Tax"
        },
        taxRate: profile.taxRate || 0,
        taxEnabled: profile.taxEnabled || false,
        taxName: profile.taxName || "Tax",
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
    };
}

export function useBusinessProfile() {
    const { data: businessProfile, error, isLoading } = useQuery({
        queryKey: ["businessProfile"],
        queryFn: fetchBusinessProfile,
        retry: 1, // Only retry once to avoid excessive failed requests
    });

    return {
        businessProfile,
        error,
        isLoading,
    };
} 