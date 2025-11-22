import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

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

    // 4. Products
    const productsData = [
        { name: 'Gaming Laptop', sku: 'LAP-001', category: 'Electronics', cost: 800, price: 1200, barcode: '123456789' },
        { name: 'Mechanical Keyboard', sku: 'KEY-002', category: 'Accessories', cost: 50, price: 100, barcode: '987654321' },
        { name: 'Wireless Mouse', sku: 'MOU-003', category: 'Accessories', cost: 20, price: 45, barcode: '456123789' },
        { name: '4K Monitor', sku: 'MON-004', category: 'Electronics', cost: 200, price: 350, barcode: '789123456' },
    ];

    for (const p of productsData) {
        await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: p
        });
    }
    console.log('Created products');

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
