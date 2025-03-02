import { BusinessProfile } from "@/lib/types";
import { CurrencyCode } from "@/lib/currency-context";

// Mock business profile data
const mockBusinessProfile: BusinessProfile = {
    id: "profile-1",
    name: "ShelfWise Restaurant",
    type: "casual_dining",
    address: "123 Main Street",
    city: "Stockholm",
    state: "Stockholm County",
    zipCode: "10044",
    country: "Sweden",
    phone: "+46 70 123 4567",
    email: "contact@shelfwise.example.com",
    website: "https://shelfwise.example.com",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1",
};

// Business profile service
export const businessProfileService = {
    // Get business profile
    getBusinessProfile: async (userId: string): Promise<BusinessProfile> => {
        // In a real app, this would be an API call to fetch the profile for the specific user
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ...mockBusinessProfile,
                    userId,
                });
            }, 500);
        });
    },

    // Update business profile
    updateBusinessProfile: async (
        userId: string,
        profileData: Partial<Omit<BusinessProfile, "id" | "createdAt" | "updatedAt" | "userId">>
    ): Promise<BusinessProfile> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedProfile: BusinessProfile = {
                    ...mockBusinessProfile,
                    ...profileData,
                    updatedAt: new Date().toISOString(),
                    userId,
                };

                // In a real app, this would update the database
                Object.assign(mockBusinessProfile, updatedProfile);

                resolve(updatedProfile);
            }, 300);
        });
    },

    // Update operating hours
    updateOperatingHours: async (
        userId: string,
        day: keyof BusinessProfile["operatingHours"],
        hours: { open: string; close: string; closed: boolean }
    ): Promise<BusinessProfile> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedProfile: BusinessProfile = {
                    ...mockBusinessProfile,
                    operatingHours: {
                        ...mockBusinessProfile.operatingHours,
                        [day]: hours,
                    },
                    updatedAt: new Date().toISOString(),
                    userId,
                };

                // In a real app, this would update the database
                Object.assign(mockBusinessProfile, updatedProfile);

                resolve(updatedProfile);
            }, 300);
        });
    },

    // Update default currency
    updateDefaultCurrency: async (
        userId: string,
        currency: CurrencyCode
    ): Promise<BusinessProfile> => {
        // In a real app, this would be an API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const updatedProfile: BusinessProfile = {
                    ...mockBusinessProfile,
                    defaultCurrency: currency,
                    updatedAt: new Date().toISOString(),
                    userId,
                };

                // In a real app, this would update the database
                Object.assign(mockBusinessProfile, updatedProfile);

                resolve(updatedProfile);
            }, 300);
        });
    },

    // Upload logo
    uploadLogo: async (
        userId: string,
        logoFile: File
    ): Promise<BusinessProfile> => {
        // In a real app, this would upload the file to storage and get a URL
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock file upload - in a real app, this would be a URL to the uploaded file
                const logoUrl = `https://example.com/logos/${logoFile.name}`;

                const updatedProfile: BusinessProfile = {
                    ...mockBusinessProfile,
                    logo: logoUrl,
                    updatedAt: new Date().toISOString(),
                    userId,
                };

                // In a real app, this would update the database
                Object.assign(mockBusinessProfile, updatedProfile);

                resolve(updatedProfile);
            }, 500);
        });
    },
}; 