const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Wiping Activities...");
    await prisma.activity.deleteMany({});

    console.log("Wiping Projects...");
    await prisma.project.deleteMany({});

    console.log("Database successfully wiped.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
