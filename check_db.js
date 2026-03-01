const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.project.findMany().then(res => {
    console.log(JSON.stringify(res.map(p => ({
        id: p.id,
        country: p.country,
        location: p.location
    })), null, 2));
}).finally(() => prisma.$disconnect());
