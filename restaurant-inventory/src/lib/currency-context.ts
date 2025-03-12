export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'SEK';

export interface Currency {
    name: string;
    symbol: string;
    code: CurrencyCode;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    USD: { name: 'US Dollar', symbol: '$', code: 'USD' },
    EUR: { name: 'Euro', symbol: '€', code: 'EUR' },
    GBP: { name: 'British Pound', symbol: '£', code: 'GBP' },
    JPY: { name: 'Japanese Yen', symbol: '¥', code: 'JPY' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', code: 'CAD' },
    AUD: { name: 'Australian Dollar', symbol: 'A$', code: 'AUD' },
    SEK: { name: 'Swedish Krona', symbol: 'kr', code: 'SEK' }
};