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
    return {
        id: data.id,
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
        defaultCurrency: data.default_currency as CurrencyCode,
        taxRate: data.tax_rate || 0,
        taxEnabled: data.tax_enabled || false,
        taxName: data.tax_name || "",
        taxSettings: {
            rate: data.tax_rate || 0,
            enabled: data.tax_enabled || false,
            name: data.tax_name || "",
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
}

/**
 * Helper function to convert camelCase object to snake_case for database
 */
export function transformForDatabase(data: Partial<BusinessProfile>): Record<string, unknown> {
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
    if (data.taxRate !== undefined) result.tax_rate = data.taxRate;
    if (data.taxEnabled !== undefined) result.tax_enabled = data.taxEnabled;
    if (data.taxName !== undefined) result.tax_name = data.taxName;

    // Also handle the nested taxSettings object if present
    if (data.taxSettings) {
        if (data.taxSettings.rate !== undefined) result.tax_rate = data.taxSettings.rate;
        if (data.taxSettings.enabled !== undefined) result.tax_enabled = data.taxSettings.enabled;
        if (data.taxSettings.name !== undefined) result.tax_name = data.taxSettings.name;
    }

    return result;
} 