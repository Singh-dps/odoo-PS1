export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category?: string;
    cost: number;
    price: number;
    createdAt: string;
    updatedAt: string;
    onHand?: number;
    freeToUse?: number;
}
