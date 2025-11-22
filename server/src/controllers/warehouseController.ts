import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Warehouses
export const getWarehouses = async (req: Request, res: Response) => {
    try {
        const warehouses = await prisma.warehouse.findMany({
            include: { locations: true }
        });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching warehouses', error });
    }
};

export const createWarehouse = async (req: Request, res: Response) => {
    try {
        const { name, shortCode } = req.body;
        const warehouse = await prisma.warehouse.create({
            data: { name, shortCode }
        });

        // Create default locations for the warehouse
        await prisma.location.createMany({
            data: [
                { name: 'Stock', type: 'internal', warehouseId: warehouse.id },
                { name: 'Input', type: 'internal', warehouseId: warehouse.id },
                { name: 'Output', type: 'internal', warehouseId: warehouse.id },
            ]
        });

        res.status(201).json(warehouse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating warehouse', error });
    }
};

// Locations
export const getLocations = async (req: Request, res: Response) => {
    try {
        const locations = await prisma.location.findMany({
            include: { warehouse: true }
        });
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching locations', error });
    }
};

export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name, type, warehouseId } = req.body;
        const location = await prisma.location.create({
            data: { name, type, warehouseId }
        });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Error creating location', error });
    }
};
