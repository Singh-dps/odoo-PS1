import type { Product } from './product';
import type { Location } from './inventory';

export interface OperationType {
    id: string;
    name: string;
    type: string;
    sequenceCode: string;
}

export interface StockMove {
    id: string;
    productId: string;
    product?: Product;
    quantity: number;
    locationSrcId: string;
    locationSrc?: Location;
    locationDestId: string;
    locationDest?: Location;
    status: string;
}

export interface StockOperation {
    id: string;
    reference: string;
    operationTypeId: string;
    operationType?: OperationType;
    contact?: string;
    status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
    scheduledDate?: string;
    moves?: StockMove[];
    createdAt: string;
}
