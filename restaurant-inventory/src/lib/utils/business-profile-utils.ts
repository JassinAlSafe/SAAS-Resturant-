import {
    BusinessProfile,
    BusinessProfileDatabase,
    BusinessType,
    CurrencyCode,
    ProfileCache
} from "../types/business-profile";

/**
 * Constants for validation
 */
export const CONSTANTS = {
    MAX_TAX_RATE: 100,
    MIN_TAX_RATE: 0,
    MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
    VALID_MIME_TYPES: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'] as const,
    LOGO_BUCKET: 'restaurant-icons',
} as const;

// Cache implementation
export const profileCache = new Map<string, ProfileCache>();
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Default business profile template
 */
export const defaultBusinessProfile: Omit<BusinessProfile, "id" | "createdAt" | "updatedAt"> = {
    name: "My Restaurant",
    type: BusinessType.CASUAL_DINING,
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
    defaultCurrency: CurrencyCode.USD,
    taxRate: 0,
    taxEnabled: false,
    taxName: "Sales Tax",
    taxSettings: {
        rate: 0,
        enabled: false,
        name: "Sales Tax"
    }
};

/**
 * Helper function to validate tax rate
 */
export function validateTaxRate(rate: number): boolean {
    return rate >= CONSTANTS.MIN_TAX_RATE && rate <= CONSTANTS.MAX_TAX_RATE;
}

/**
 * Helper function to validate currency code
 */
export function validateCurrencyCode(currency: string): boolean {
    return Object.values(CurrencyCode).includes(currency as CurrencyCode);
}

/**
 * Helper function to get cached profile
 */
export function getCachedProfile(userId: string): BusinessProfile | null {
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

/**
 * Helper function to set cached profile
 */
export function setCachedProfile(userId: string, profile: BusinessProfile): void {
    profileCache.set(userId, {
        data: profile,
        timestamp: Date.now()
    });
}

/**
 * Helper function to convert snake_case database fields to camelCase
 */
export function transformDatabaseResponse(data: BusinessProfileDatabase): BusinessProfile {
    // Create the taxSettings object from individual fields
    const taxSettings = {
        enabled: data.tax_enabled,
        rate: data.tax_rate,
        name: data.tax_name
    };

    return {
        id: data.id,
        name: data.name,
        type: data.type,
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zip_code || '',
        country: data.country || '',
        logo: data.logo || null,
        operatingHours: data.operating_hours,
        defaultCurrency: data.default_currency,
        taxRate: data.tax_rate,
        taxEnabled: data.tax_enabled,
        taxName: data.tax_name,
        // Add the computed taxSettings based on individual fields
        taxSettings: taxSettings,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        subscriptionPlan: data.subscription_plan,
        subscriptionStatus: data.subscription_status,
        maxUsers: data.max_users
    };
}

/**
 * Helper function to convert camelCase object to snake_case for database
 */
export function transformForDatabase(profile: Partial<BusinessProfile>): Partial<BusinessProfileDatabase> {
    const result: Partial<BusinessProfileDatabase> = {};

    // Handle the mapping of fields
    if (profile.name !== undefined) result.name = profile.name;
    if (profile.type !== undefined) result.type = profile.type;
    if (profile.email !== undefined) result.email = profile.email || null;
    if (profile.phone !== undefined) result.phone = profile.phone || null;
    if (profile.website !== undefined) result.website = profile.website || null;
    if (profile.address !== undefined) result.address = profile.address || null;
    if (profile.city !== undefined) result.city = profile.city || null;
    if (profile.state !== undefined) result.state = profile.state || null;
    if (profile.zipCode !== undefined) result.zip_code = profile.zipCode || null;
    if (profile.country !== undefined) result.country = profile.country || null;
    if (profile.logo !== undefined) result.logo = profile.logo;
    if (profile.operatingHours !== undefined) result.operating_hours = profile.operatingHours;
    if (profile.defaultCurrency !== undefined) result.default_currency = profile.defaultCurrency;

    // Handle tax fields directly
    if (profile.taxEnabled !== undefined) result.tax_enabled = profile.taxEnabled;
    if (profile.taxRate !== undefined) result.tax_rate = profile.taxRate;
    if (profile.taxName !== undefined) result.tax_name = profile.taxName;

    // If taxSettings is provided, extract its properties
    if (profile.taxSettings) {
        if (profile.taxSettings.enabled !== undefined && profile.taxEnabled === undefined) {
            result.tax_enabled = profile.taxSettings.enabled;
        }
        if (profile.taxSettings.rate !== undefined && profile.taxRate === undefined) {
            result.tax_rate = profile.taxSettings.rate;
        }
        if (profile.taxSettings.name !== undefined && profile.taxName === undefined) {
            result.tax_name = profile.taxSettings.name;
        }
    }

    return result;
}