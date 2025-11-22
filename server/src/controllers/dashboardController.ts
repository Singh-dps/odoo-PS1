import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            productCount,
            operationCount,
            pendingOperations,
            stockMoves,
            operationTypes
        ] = await Promise.all([
            prisma.product.count(),
            prisma.stockOperation.count(),
            prisma.stockOperation.count({ where: { status: { in: ['draft', 'waiting', 'ready'] } } }),
            prisma.stockMove.findMany({
                where: { status: 'done' },
                include: { product: true, locationDest: true, locationSrc: true }
            }),
            prisma.operationType.findMany({
                include: {
                    _count: {
                        select: { operations: { where: { status: { in: ['draft', 'waiting', 'ready'] } } } }
                    }
                }
            })
        ]);

        // Calculate Total Stock Value (Naive implementation)
        let totalValue = 0;
        for (const move of stockMoves) {
            if (move.locationDest.type === 'internal') {
                totalValue += move.quantity * move.product.cost;
            }
            if (move.locationSrc.type === 'internal') {
                totalValue -= move.quantity * move.product.cost;
            }
        }

        res.json({
            productCount,
            operationCount,
            pendingOperations,
            totalValue: Math.max(0, totalValue), // Ensure non-negative
            operationTypes: operationTypes.map(t => ({
                ...t,
                pendingCount: t._count.operations
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats', error });
    }
};
