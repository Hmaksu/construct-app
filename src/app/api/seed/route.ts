import { NextResponse } from 'next/server';
import { seedDatabase } from '../../../../../prisma/reset-seed';

export async function GET() {
    try {
        console.log('Initiating remote database seed...');
        await seedDatabase();
        return NextResponse.json({ message: 'Database seeded successfully with 96 projects and 1200+ activities!' }, { status: 200 });
    } catch (error) {
        console.error('Failed to seed database:', error);
        return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
    }
}
