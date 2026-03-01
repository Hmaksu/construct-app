const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mockUsers = [
    { id: 'USR-001', name: 'Admin User', role: 'admin' },
    { id: 'USR-002', name: 'Owner', role: 'owner' },
    { id: 'USR-003', name: 'Country Manager TR', role: 'country_manager', assignedLocationId: 'Turkey' },
    { id: 'USR-004', name: 'Country Manager DE', role: 'country_manager', assignedLocationId: 'Germany' },
    { id: 'USR-005', name: 'Country Manager US', role: 'country_manager', assignedLocationId: 'United States of America' },
    { id: 'USR-006', name: 'Region Manager Marmara', role: 'region_manager', assignedLocationId: 'Marmara' },
    { id: 'USR-007', name: 'City Manager Istanbul', role: 'city_manager', assignedLocationId: 'Istanbul' },
    { id: 'USR-008', name: 'Site Manager S-001', role: 'site_manager', assignedLocationId: 'S-001' },
];

async function main() {
    console.log(`Start seeding users...`);
    for (const u of mockUsers) {
        const user = await prisma.user.upsert({
            where: { id: u.id },
            update: {},
            create: {
                id: u.id,
                name: u.name,
                role: u.role,
                assignedLocationId: u.assignedLocationId,
            },
        });
        console.log(`Created user with id: ${user.id}`);
    }
    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
