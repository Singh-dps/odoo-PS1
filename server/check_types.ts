
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const types = await prisma.operationType.findMany();
    console.log('Operation Types:', types);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
