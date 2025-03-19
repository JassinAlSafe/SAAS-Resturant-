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

// Business type enum
export enum BusinessType {
    CASUAL_DINING = 'CASUAL_DINING',
    FINE_DINING = 'FINE_DINING',
    FAST_FOOD = 'FAST_FOOD',
    CAFE = 'CAFE',
    BAR = 'BAR',
    FOOD_TRUCK = 'FOOD_TRUCK',
    CATERING = 'CATERING',
    GHOST_KITCHEN = 'GHOST_KITCHEN',
    OTHER = 'OTHER'
}

// Currency code enum
export enum CurrencyCode {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    CAD = 'CAD',
    AUD = 'AUD',
    JPY = 'JPY',
    CNY = 'CNY',
    INR = 'INR'
}

// Operating hours type
export interface DayHours {
    open: string;
    close: string;
    closed: boolean;
}

export interface OperatingHours {
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
    sunday: DayHours;
}

// Tax settings type
export interface TaxSettings {
    enabled: boolean;
    rate: number;
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
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    logo: string | null;
    operatingHours: OperatingHours;
    defaultCurrency: CurrencyCode;
    taxRate: number;
    taxEnabled: boolean;
    taxName: string;
    taxSettings: TaxSettings;
    createdAt: string;
    updatedAt: string;
    userId: string;
    subscriptionPlan: 'free' | 'pro' | 'enterprise';
    subscriptionStatus: 'active' | 'inactive' | 'cancelled';
    maxUsers: number;
}

// Database business profile type
export interface BusinessProfileDatabase {
    id: string;
    name: string;
    type: BusinessType;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo: string | null;
    operating_hours: OperatingHours;
    default_currency: CurrencyCode;
    tax_rate: number;
    tax_enabled: boolean;
    tax_name: string;
    tax_settings: TaxSettings;
    created_at: string;
    updated_at: string;
    user_id: string;
    subscription_plan: 'free' | 'pro' | 'enterprise';
    subscription_status: 'active' | 'inactive' | 'cancelled';
    max_users: number;
}

// Cache types
export interface ProfileCache {
    data: BusinessProfile;
    timestamp: number;
} 