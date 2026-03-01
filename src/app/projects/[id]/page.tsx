import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProjectDetails from '@/components/dashboard/ProjectDetails';

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    return (
        <DashboardLayout>
            <ProjectDetails projectId={id} />
        </DashboardLayout>
    );
}
