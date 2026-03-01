import { prisma } from '../src/lib/prisma';

const initialProjects = [
    {
        id: 'P-TR-001',
        name: 'Istanbul Financial Center',
        country: 'TR',
        region: 'Marmara',
        city: 'Istanbul',
        siteId: 'S-TR-001',
        status: 'in_progress',
        budget: 1500000000,
        startDate: '2023-01-15',
        endDate: '2026-12-30',
        progress: 45
    },
    {
        id: 'P-DE-001',
        name: 'Berlin New Airport Terminal',
        country: 'DE',
        region: 'Brandenburg',
        city: 'Berlin',
        siteId: 'S-DE-001',
        status: 'planning',
        budget: 850000000,
        startDate: '2024-06-01',
        endDate: '2027-05-31',
        progress: 10
    },
    {
        id: 'P-AE-001',
        name: 'Dubai Marina Luxury Complex',
        country: 'AE',
        region: 'Dubai Emirate',
        city: 'Dubai',
        siteId: 'S-AE-001',
        status: 'in_progress',
        budget: 2200000000,
        startDate: '2022-03-01',
        endDate: '2026-06-30',
        progress: 60
    },
    {
        id: 'P-US-001',
        name: 'New York Tech Hub',
        country: 'US',
        region: 'New York State',
        city: 'New York',
        siteId: 'S-US-001',
        status: 'delayed',
        budget: 3100000000,
        startDate: '2023-09-15',
        endDate: '2028-12-31',
        progress: 25
    },
    {
        id: 'P-CN-001',
        name: 'Shanghai High-Speed Rail Terminal',
        country: 'CN',
        region: 'East China',
        city: 'Shanghai',
        siteId: 'S-CN-001',
        status: 'completed',
        budget: 4500000000,
        startDate: '2019-02-01',
        endDate: '2024-01-15',
        progress: 100
    },
    {
        id: 'P-TR-002',
        name: 'Ankara Metro Extension',
        country: 'TR',
        region: 'Central Anatolia',
        city: 'Ankara',
        siteId: 'S-TR-002',
        status: 'in_progress',
        budget: 650000000,
        startDate: '2024-01-01',
        endDate: '2026-08-30',
        progress: 15
    },
    {
        id: 'P-UK-001',
        name: 'London Crossrail Station',
        country: 'UK',
        region: 'Greater London',
        city: 'London',
        siteId: 'S-UK-001',
        status: 'in_progress',
        budget: 1200000000,
        startDate: '2023-11-01',
        endDate: '2027-04-15',
        progress: 35
    },
    {
        id: 'P-JP-001',
        name: 'Tokyo Olympic Village Legacy',
        country: 'JP',
        region: 'Kanto',
        city: 'Tokyo',
        siteId: 'S-JP-001',
        status: 'completed',
        budget: 500000000,
        startDate: '2022-01-01',
        endDate: '2024-12-30',
        progress: 100
    }
];

const initialActivities = [
    {
        id: 'ACT-TR-001',
        projectId: 'P-TR-001',
        name: 'Foundation Pouring',
        category: 'Foundation',
        status: 'completed',
        startDate: '2023-01-15',
        endDate: '2023-04-15',
        predecessors: '',
        successors: 'ACT-TR-002, ACT-TR-003'
    },
    {
        id: 'ACT-TR-002',
        projectId: 'P-TR-001',
        name: 'Steel Framing',
        category: 'Structural',
        status: 'active',
        startDate: '2023-04-16',
        endDate: '2024-12-30',
        predecessors: 'ACT-TR-001',
        successors: 'ACT-TR-004'
    },
    {
        id: 'ACT-TR-003',
        projectId: 'P-TR-001',
        name: 'Concrete Core',
        category: 'Structural',
        status: 'active',
        startDate: '2023-04-16',
        endDate: '2024-10-30',
        predecessors: 'ACT-TR-001',
        successors: 'ACT-TR-004'
    },
    {
        id: 'ACT-TR-004',
        projectId: 'P-TR-001',
        name: 'Exterior Glass Facade',
        category: 'Finishing',
        status: 'pending',
        startDate: '2025-01-15',
        endDate: '2025-11-30',
        predecessors: 'ACT-TR-002, ACT-TR-003',
        successors: 'ACT-TR-005'
    },
    {
        id: 'ACT-TR-005',
        projectId: 'P-TR-001',
        name: 'Interior Fit-out',
        category: 'Finishing',
        status: 'pending',
        startDate: '2025-12-01',
        endDate: '2026-10-30',
        predecessors: 'ACT-TR-004',
        successors: 'ACT-TR-006'
    },
    {
        id: 'ACT-TR-006',
        projectId: 'P-TR-001',
        name: 'Final Inspection & Handover',
        category: 'General',
        status: 'pending',
        startDate: '2026-11-01',
        endDate: '2026-12-30',
        predecessors: 'ACT-TR-005',
        successors: ''
    }
];

async function main() {
    console.log('Start seeding...');

    // Delete existing to avoid conflicts on re-runs
    await prisma.activity.deleteMany({});
    await prisma.project.deleteMany({});

    for (const p of initialProjects) {
        const project = await prisma.project.create({
            data: p
        });
        console.log(`Created project with id: ${project.id}`);
    }

    for (const a of initialActivities) {
        const activity = await prisma.activity.create({
            data: a
        });
        console.log(`Created activity with id: ${activity.id}`);
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
