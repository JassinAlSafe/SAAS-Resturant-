/**
 * Business Profile Types
 * Contains all type definitions related to business profiles
 */

// Custom error types for better error handling
export class BusinessProfileError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'BusinessProfileError';
    }
}

// Enums for type safety
export enum BusinessType {
    CASUAL_DINING = 'casual_dining',
    FINE_DINING = 'fine_dining',
    FAST_FOOD = 'fast_food',
    CAFE = 'cafe',
    BAR = 'bar',
    FOOD_TRUCK = 'food_truck',
    GHOST_KITCHEN = 'ghost_kitchen',
    OTHER = 'other'
}

export enum CurrencyCode {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    AUD = 'AUD',
    CAD = 'CAD',
}

// Operating hours types
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type OperatingHours = Record<DayOfWeek, { open: string; close: string; closed: boolean }>;
export type PartialOperatingHours = Partial<OperatingHours>;

// Tax settings type
export interface TaxSettings {
    rate: number;
    enabled: boolean;
    name: string;
}

// Logo image transform options
export interface LogoTransformOptions {
    width?: number;
    height?: number;
    quality?: number;
    resize?: 'cover' | 'contain' | 'fill';
}

// Frontend business profile type
export interface BusinessProfile {
    id: string;
    name: string;
    type: BusinessType;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
    operatingHours: OperatingHours;
    defaultCurrency: CurrencyCode;
    taxRate: number;
    taxEnabled: boolean;
    taxName: string;
    taxSettings: TaxSettings;
    createdAt: string;
    updatedAt: string;
}

// Database schema structure
export interface BusinessProfileDatabase {
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
    logo_path?: string | null;
    operating_hours: OperatingHours;
    default_currency: string;
    tax_rate: number | null;
    tax_enabled: boolean | null;
    tax_name: string | null;
    created_at: string;
    updated_at: string;
}

// Cache types
export interface ProfileCache {
    data: BusinessProfile;
    timestamp: number;
} 