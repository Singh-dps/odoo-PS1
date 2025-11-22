import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate reference
const generateReference = async (typeId: string) => {
    const type = await prisma.operationType.findUnique({ where: { id: typeId } });
    if (!type) throw new Error('Invalid operation type');

    const count = await prisma.stockOperation.count({
        where: { operationTypeId: typeId }
    });

    return `${type.sequenceCode}/${(count + 1).toString().padStart(5, '0')}`;
};

export const getOperations = async (req: Request, res: Response) => {
    try {
        const operations = await prisma.stockOperation.findMany({
            include: {
                operationType: true,
                moves: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(operations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching operations', error });
    }
};

export const getOperation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const operation = await prisma.stockOperation.findUnique({
            where: { id },
            include: {
                operationType: true,
                moves: {
                    include: {
                        product: true,
                        locationSrc: true,
                        locationDest: true
                    }
                }
            }
        });
        if (!operation) return res.status(404).json({ message: 'Operation not found' });
        res.json(operation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching operation', error });
    }
};

export const createOperation = async (req: Request, res: Response) => {
    try {
        const { operationTypeId, moves } = req.body; // moves: [{ productId, quantity, locationSrcId, locationDestId }]

        const reference = await generateReference(operationTypeId);

        const operation = await prisma.stockOperation.create({
            data: {
                reference,
                operationTypeId,
                status: 'draft',
                moves: {
                    create: moves.map((move: any) => ({
                        productId: move.productId,
                        quantity: move.quantity,
                        locationSrcId: move.locationSrcId,
                        locationDestId: move.locationDestId,
                        status: 'draft'
                    }))
                }
            },
            include: { moves: true }
        });

        res.status(201).json(operation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating operation', error });
    }
};

export const validateOperation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Transaction to update operation and moves
        const operation = await prisma.$transaction(async (tx) => {
            const op = await tx.stockOperation.findUnique({
                where: { id },
                include: { moves: true }
            });

            if (!op) throw new Error('Operation not found');
            if (op.status === 'done') throw new Error('Operation already done');

            // Update moves to done
            await tx.stockMove.updateMany({
                where: { operationId: id },
                data: { status: 'done' }
            });

            // Update operation to done
            return await tx.stockOperation.update({
                where: { id },
                data: { status: 'done' },
                include: { moves: true }
            });
        });

        res.json(operation);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error validating operation' });
    }
};

export const getOperationTypes = async (req: Request, res: Response) => {
    try {
        const types = await prisma.operationType.findMany();
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching operation types', error });
    }
};

// Initialize default types (helper for setup)
export const initOperationTypes = async (req: Request, res: Response) => {
    try {
        const types = [
            { name: 'Receipts', type: 'receipt', sequenceCode: 'WH/IN' },
            { name: 'Deliveries', type: 'delivery', sequenceCode: 'WH/OUT' },
            { name: 'Internal Transfers', type: 'internal', sequenceCode: 'WH/INT' },
        ];

        for (const t of types) {
            const exists = await prisma.operationType.findFirst({ where: { type: t.type } });
            if (!exists) {
                await prisma.operationType.create({ data: t });
            }
        }
        res.json({ message: 'Operation types initialized' });
    } catch (error) {
        res.status(500).json({ message: 'Error initializing types', error });
    }
};
