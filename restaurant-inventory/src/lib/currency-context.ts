export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'SEK';

export interface Currency {
    name: string;
    symbol: string;
    code: CurrencyCode;
}