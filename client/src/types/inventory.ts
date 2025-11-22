export interface Warehouse {
    id: string;
    name: string;
    shortCode: string;
    locations?: Location[];
}

export interface Location {
    id: string;
    name: string;
    type: string;
    warehouseId?: string;
    warehouse?: Warehouse;
}
