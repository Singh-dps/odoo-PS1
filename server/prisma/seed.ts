import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Cleanup existing operational data
    await prisma.stockMove.deleteMany({});
    await prisma.stockOperation.deleteMany({});
    console.log('Cleared existing operations and moves');

    // 1. Users
    const password = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@nexusims.com',
            password_hash: password,
            role: 'manager',
        },
    });
    console.log('Created user: admin / admin123');

    // 2. Warehouses & Locations
    const wh = await prisma.warehouse.upsert({
        where: { shortCode: 'SF' },
        update: {},
        create: {
            name: 'San Francisco Main',
            shortCode: 'SF',
            locations: {
                create: [
                    { name: 'Stock', type: 'internal' },
                    { name: 'Input', type: 'internal' },
                    { name: 'Output', type: 'internal' },
                    { name: 'Vendors', type: 'supplier' },
                    { name: 'Customers', type: 'customer' },
                ]
            }
        },
        include: { locations: true }
    });
    console.log('Created warehouse: San Francisco Main');

    // 3. Operation Types
    const types = [
        { name: 'Receipts', type: 'receipt', sequenceCode: 'WH/IN' },
        { name: 'Deliveries', type: 'delivery', sequenceCode: 'WH/OUT' },
        { name: 'Internal Transfers', type: 'internal', sequenceCode: 'WH/INT' },
    ];

    for (const t of types) {
        await prisma.operationType.upsert({
            where: { sequenceCode: t.sequenceCode },
            update: {},
            create: t
        });
    }
    console.log('Created operation types');

    // 4. Products - Real-world Indian market data
    const productsData = [
        {
            name: 'Desk',
            sku: 'DESK-001',
            category: 'Office Furniture',
            cost: 4500,
            price: 7500,
            barcode: 'DESK001BAR'
        },
        {
            name: '4K Monitor',
            sku: 'MON-004',
            category: 'Electronics',
            cost: 15000,
            price: 22000,
            barcode: 'MON004BAR'
        },
        {
            name: 'Office Chair',
            sku: 'CHAIR-005',
            category: 'Office Furniture',
            cost: 3500,
            price: 6500,
            barcode: 'CHAIR005BAR'
        },
        {
            name: 'Wireless Keyboard',
            sku: 'KEY-002',
            category: 'Computer Accessories',
            cost: 800,
            price: 1500,
            barcode: 'KEY002BAR'
        },
        {
            name: 'Wireless Mouse',
            sku: 'MOU-003',
            category: 'Computer Accessories',
            cost: 450,
            price: 850,
            barcode: 'MOU003BAR'
        },
    ];

    for (const p of productsData) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: p
        });
    }
    console.log('Created 5 products with realistic Indian pricing');

    // 5. Initial Stock - Create stock for each product (100-200 qty)
    const stockLocation = wh.locations.find(l => l.name === 'Stock');
    const vendorLocation = wh.locations.find(l => l.name === 'Vendors');

    if (stockLocation && vendorLocation) {
        const products = await prisma.product.findMany();
        const receiptType = await prisma.operationType.findFirst({ where: { type: 'receipt' } });

        if (receiptType) {
            // Create initial stock operations
            const initialQuantities = [150, 120, 180, 200, 165]; // Different qty for each product

            // Only create stock for the first 5 products
            const productsToStock = products.slice(0, 5);

            for (let i = 0; i < productsToStock.length; i++) {
                const product = productsToStock[i];
                const qty = initialQuantities[i];

                // Create receipt operation
                const operation = await prisma.stockOperation.create({
                    data: {
                        reference: `WH/IN/${String(i + 1).padStart(4, '0')}`,
                        operationTypeId: receiptType.id,
                        status: 'done',
                        scheduledDate: new Date('2025-01-01'),
                        moves: {
                            create: {
                                productId: product.id,
                                quantity: qty,
                                locationSrcId: vendorLocation.id,
                                locationDestId: stockLocation.id
                            }
                        }
                    }
                });

                console.log(`Created initial stock for ${product.name}: ${qty} units`);
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
