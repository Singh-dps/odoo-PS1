import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                stockMoves: {
                    include: {
                        locationSrc: true,
                        locationDest: true,
                        operation: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const productsWithStock = products.map(product => {
            let onHand = 0;
            let reserved = 0;

            product.stockMoves.forEach(move => {
                // Calculate On Hand (Done moves)
                if (move.status === 'done') {
                    if (move.locationDest.type === 'internal') {
                        onHand += move.quantity;
                    }
                    if (move.locationSrc.type === 'internal') {
                        onHand -= move.quantity;
                    }
                }

                // Calculate Reserved (Draft moves from internal)
                // Reserved means it's planned to leave but hasn't left yet
                // Typically linked to an operation that is 'waiting' or 'ready'
                // And the move itself is not 'done'
                if (move.status !== 'done' && move.locationSrc.type === 'internal') {
                    // Check operation status if available, otherwise assume reserved if move exists
                    if (move.operation && ['waiting', 'ready'].includes(move.operation.status)) {
                        reserved += move.quantity;
                    }
                }
            });

            return {
                ...product,
                onHand,
                freeToUse: onHand - reserved
            };
        });

        res.json(productsWithStock);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, sku, category, cost, price, barcode } = req.body;

        const existingProduct = await prisma.product.findUnique({ where: { sku } });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this SKU already exists' });
        }

        const product = await prisma.product.create({
            data: { name, sku, category, cost, price, barcode }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, sku, category, cost, price, barcode } = req.body;

        const product = await prisma.product.update({
            where: { id },
            data: { name, sku, category, cost, price, barcode }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
