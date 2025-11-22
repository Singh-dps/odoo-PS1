import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStockLedger = async (req: Request, res: Response) => {
    try {
        const moves = await prisma.stockMove.findMany({
            where: { status: 'done' },
            include: {
                product: true,
                locationSrc: true,
                locationDest: true,
                operation: {
                    include: {
                        operationType: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(moves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ledger', error });
    }
};

export const getStockLevels = async (req: Request, res: Response) => {
    try {
        // This is a naive implementation. For production, use SQL aggregation or a dedicated stock table.
        const moves = await prisma.stockMove.findMany({
            where: { status: 'done' },
            include: { product: true, locationDest: true, locationSrc: true }
        });

        const stockMap: Record<string, { product: any, location: any, quantity: number }> = {};

        for (const move of moves) {
            // Add to destination
            if (move.locationDest.type === 'internal') {
                const key = `${move.productId}-${move.locationDestId}`;
                if (!stockMap[key]) {
                    stockMap[key] = {
                        product: move.product,
                        location: move.locationDest,
                        quantity: 0
                    };
                }
                stockMap[key].quantity += move.quantity;
            }

            // Subtract from source
            if (move.locationSrc.type === 'internal') {
                const key = `${move.productId}-${move.locationSrcId}`;
                if (!stockMap[key]) {
                    stockMap[key] = {
                        product: move.product,
                        location: move.locationSrc,
                        quantity: 0
                    };
                }
                stockMap[key].quantity -= move.quantity;
            }
        }

        // Filter out zero or negative stock (optional, but usually we want to see what's on hand)
        // Also flatten the map
        const levels = Object.values(stockMap).filter(item => item.quantity !== 0);

        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating stock levels', error });
    }
};
