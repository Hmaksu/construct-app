'use server';

import { prisma } from '@/lib/prisma';
import { Project, Activity, User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// --- ID Generation Utilities ---

export async function generateNextId(type: 'project' | 'activity' | 'user', prefix?: string): Promise<string> {
    if (type === 'project') {
        const prfx = prefix || 'PRJ';
        const last = await prisma.project.findFirst({
            orderBy: { id: 'desc' },
            where: { id: { startsWith: `${prfx}-` } }
        });
        if (!last) return `${prfx}-01`;

        // Extract the number part from TR-IST-01 or PRJ-01
        const parts = last.id.split('-');
        const numPart = parts[parts.length - 1];
        const num = parseInt(numPart || '0');

        // Use 2 digits for semantic project IDs like TR-IST-01, but 4 digits for fallback PRJ-0001
        const padLength = prefix ? 2 : 4;
        return `${prfx}-${String(num + 1).padStart(padLength, '0')}`;
    }

    if (type === 'activity') {
        const prfx = prefix || 'ACT';
        const last = await prisma.activity.findFirst({
            orderBy: { id: 'desc' },
            where: { id: { startsWith: `${prfx}-` } }
        });
        if (!last) return `${prfx}-0001`;
        const parts = last.id.split('-');
        const numPart = parts[parts.length - 1];
        const num = parseInt(numPart || '0');
        return `${prfx}-${String(num + 1).padStart(4, '0')}`;
    }

    if (type === 'user') {
        const last = await prisma.user.findFirst({
            orderBy: { id: 'desc' },
            where: { id: { startsWith: 'USR-' } }
        });
        if (!last) return 'USR-0001';
        const num = parseInt(last.id.split('-')[1] || '0');
        return `USR-${String(num + 1).padStart(4, '0')}`;
    }

    return 'SYS-0000';
}

// --- Users ---

export async function getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users as User[];
}

export async function addUser(userData: User) {
    const user = await prisma.user.create({
        data: {
            id: userData.id,
            name: userData.name,
            role: userData.role,
            assignedLocationId: userData.assignedLocationId
        }
    });
    revalidatePath('/users');
    revalidatePath('/'); // For auth switcher updates
    return user as User;
}

export async function updateUserAction(userData: User) {
    const user = await prisma.user.update({
        where: { id: userData.id },
        data: {
            name: userData.name,
            role: userData.role,
            assignedLocationId: userData.assignedLocationId
        }
    });
    revalidatePath('/users');
    revalidatePath('/');
    return user as User;
}

// --- Projects ---

export async function getProjects(): Promise<Project[]> {
    const projects = await prisma.project.findMany();
    return projects as Project[];
}

export async function addProject(projectData: Project) {
    // If frontend passed something like "TUR-IST", use it as a prefix instead of "PRJ"
    const prefix = projectData.id && projectData.id !== 'temp-id' ? projectData.id : 'PRJ';
    const generatedId = await generateNextId('project', prefix);

    // We are overriding projectData.id with our semantic server-generated ID
    const project = await prisma.project.create({
        data: {
            id: generatedId,
            name: projectData.name,
            location: projectData.location || '',
            country: projectData.country || '',
            region: projectData.region || '',
            city: projectData.city || '',
            siteId: projectData.siteId || '',
            status: projectData.status,
            budget: projectData.budget,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            progress: projectData.progress,
            assigneeId: projectData.assigneeId || null,
        }
    });
    revalidatePath('/');
    revalidatePath('/projects');
    return project;
}

export async function updateProjectAction(projectData: Project) {
    const project = await prisma.project.update({
        where: { id: projectData.id },
        data: {
            name: projectData.name,
            location: projectData.location || '',
            country: projectData.country || '',
            region: projectData.region || '',
            city: projectData.city || '',
            siteId: projectData.siteId || '',
            status: projectData.status,
            budget: projectData.budget,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            progress: projectData.progress,
            assigneeId: projectData.assigneeId || null,
        }
    });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectData.id}`);
    return project;
}

// --- Activities ---

export async function getActivities(): Promise<Activity[]> {
    const activitiesDb = await prisma.activity.findMany();

    // Transform DB strings back into arrays for the frontend
    return activitiesDb.map((act: any) => ({
        ...act,
        category: act.category === null ? undefined : act.category,
        assigneeId: act.assigneeId === null ? undefined : act.assigneeId,
        status: act.status as Activity['status'],
        predecessors: act.predecessors ? act.predecessors.split(',').filter(Boolean) : [],
        successors: act.successors ? act.successors.split(',').filter(Boolean) : []
    })) as Activity[];
}

export async function addActivity(activityData: Activity) {
    const prefix = activityData.id && activityData.id !== 'temp-id' && activityData.id !== 'ACT' ? activityData.id : 'ACT';
    const generatedId = await generateNextId('activity', prefix);

    const act = await prisma.activity.create({
        data: {
            id: generatedId,
            projectId: activityData.projectId,
            name: activityData.name,
            category: activityData.category,
            status: activityData.status,
            startDate: activityData.startDate,
            endDate: activityData.endDate,
            predecessors: activityData.predecessors.join(','),
            successors: activityData.successors.join(',')
        }
    });
    revalidatePath(`/projects/${activityData.projectId}`);
    revalidatePath('/activities');
    return act;
}

export async function updateActivityAction(activityData: Activity) {
    const act = await prisma.activity.update({
        where: { id: activityData.id },
        data: {
            name: activityData.name,
            category: activityData.category,
            status: activityData.status,
            startDate: activityData.startDate,
            endDate: activityData.endDate,
            predecessors: activityData.predecessors.join(','),
            successors: activityData.successors.join(',')
        }
    });
    revalidatePath(`/projects/${activityData.projectId}`);
    revalidatePath('/activities');
    return act;
}

export async function importActivitiesBulk(activitiesData: Activity[]) {
    const createdActivities = [];

    // Using a simple loop instead of createMany to handle potential ID conflicts
    // gracefully without crashing the whole batch if one already exists.
    for (const actData of activitiesData) {
        try {
            const act = await prisma.activity.create({
                data: {
                    id: actData.id,
                    projectId: actData.projectId,
                    name: actData.name,
                    category: actData.category,
                    status: actData.status,
                    startDate: actData.startDate,
                    endDate: actData.endDate,
                    predecessors: actData.predecessors.join(','),
                    successors: actData.successors.join(', ')
                }
            });
            createdActivities.push(act);
        } catch (e) {
            // Likely a Unique constraint violation on ID, skip
            console.warn(`Failed to insert activity ${actData.id}, likely duplicate.`, e);
        }
    }

    if (activitiesData.length > 0) {
        revalidatePath(`/projects/${activitiesData[0].projectId}`);
    }
    revalidatePath('/activities');
    return createdActivities;
}

// --- Deletion & Graph Healing ---

export async function deleteProjectAction(projectId: string) {
    // Prisma Schema already has onDelete: Cascade for Project -> Activity
    const deleted = await prisma.project.delete({
        where: { id: projectId }
    });

    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/activities');
    return deleted;
}

export async function deleteActivityAction(activityId: string, projectId: string) {
    // 1. Fetch the activity to know its predecessors and successors BEFORE deleting
    const target = await prisma.activity.findUnique({
        where: { id: activityId }
    });

    if (!target) return null;

    const targetPreds = target.predecessors ? target.predecessors.split(',').map(s => s.trim()).filter(Boolean) : [];
    const targetSuccs = target.successors ? target.successors.split(',').map(s => s.trim()).filter(Boolean) : [];

    // 2. Perform the actual deletion
    const deleted = await prisma.activity.delete({
        where: { id: activityId }
    });

    // 3. Graph Healing logic
    // We need to bypass the deleted node by stitching its predecessors directly to its successors

    // 3a. Update all immediate predecessors of the deleted node
    for (const predId of targetPreds) {
        const p = await prisma.activity.findUnique({ where: { id: predId } });
        if (p) {
            let succArray = p.successors ? p.successors.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
            // Remove the deleted node
            succArray = succArray.filter((s: string) => s !== activityId);
            // Add the deleted node's successors (making them the new successors of this predecessor)
            const newSuccs = Array.from(new Set([...succArray, ...targetSuccs]));

            await prisma.activity.update({
                where: { id: predId },
                data: { successors: newSuccs.join(',') }
            });
        }
    }

    // 3b. Update all immediate successors of the deleted node
    for (const succId of targetSuccs) {
        const s = await prisma.activity.findUnique({ where: { id: succId } });
        if (s) {
            let predArray = s.predecessors ? s.predecessors.split(',').map((str: string) => str.trim()).filter(Boolean) : [];
            // Remove the deleted node
            predArray = predArray.filter((p: string) => p !== activityId);
            // Add the deleted node's predecessors
            const newPreds = Array.from(new Set([...predArray, ...targetPreds]));

            await prisma.activity.update({
                where: { id: succId },
                data: { predecessors: newPreds.join(',') }
            });
        }
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/activities');
    return deleted;
}
