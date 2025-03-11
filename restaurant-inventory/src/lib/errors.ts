export class InventoryServiceError extends Error {
    code?: string;
    details?: string;

    constructor(message: string, details?: { code?: string; details?: string }) {
        super(message);
        this.name = 'InventoryServiceError';
        if (details) {
            this.code = details.code;
            this.details = details.details;
        }
    }
} 