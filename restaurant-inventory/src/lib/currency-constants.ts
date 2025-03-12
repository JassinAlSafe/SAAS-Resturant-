import { Currency, CurrencyCode } from './currency-context';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    USD: { name: 'US Dollar', symbol: '$', code: 'USD' },
    EUR: { name: 'Euro', symbol: '€', code: 'EUR' },
    GBP: { name: 'British Pound', symbol: '£', code: 'GBP' },
    JPY: { name: 'Japanese Yen', symbol: '¥', code: 'JPY' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$', code: 'CAD' },
    AUD: { name: 'Australian Dollar', symbol: 'A$', code: 'AUD' },
    SEK: { name: 'Swedish Krona', symbol: 'kr', code: 'SEK' }
}; 