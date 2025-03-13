import { Dish, Sale } from '../types';

export interface SalesService {
    getSales(): Promise<Sale[]>;
    getSalesByDate(date: Date): Promise<Sale[]>;
    addSales(entries: Omit<Sale, 'id' | 'createdAt'>[]): Promise<Sale[]>;
    getDishes(): Promise<Dish[]>;
    getIngredientDetails(ids: string[]): Promise<{ id: string, name: string, unit: string }[]>;
    updateInventoryFromSales(sales: Sale[]): Promise<boolean>;
    updateSale(sale: Sale): Promise<boolean>;
    deleteSale(saleId: string): Promise<boolean>;
    exportSalesToExcel(startDate: string, endDate: string): Promise<{
        success: boolean;
        data?: Array<{
            id: string;
            date: string;
            items: Array<{
                date: string;
                dish_name: string;
                quantity: number;
                price: number;
                total: number;
                category: string;
            }>;
            total: number;
        }>;
        error?: Error;
    }>;
}

export const salesService: SalesService; 