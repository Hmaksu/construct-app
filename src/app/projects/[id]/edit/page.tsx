'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useProjects } from '@/lib/ProjectContext';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import SmartLocationInput from '@/components/shared/SmartLocationInput';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    const { projects, updateProject } = useProjects();
    const { allUsers } = useAuth();
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'other',
        location: '',
        budget: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        assigneeId: '',
    });

    useEffect(() => {
        const found = projects.find(p => p.id === id);
        if (found) {
            setProject(found);
            setFormData({
                name: found.name,
                type: found.type || 'other',
                location: found.location || `${found.city || ''}, ${found.country || ''}`.replace(/^, | , $/g, '').trim(),
                budget: found.budget.toString(),
                startDate: found.startDate,
                endDate: found.endDate,
                status: found.status,
                assigneeId: found.assigneeId || '',
            });
        }
    }, [id, projects]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        const parsedCountry = formData.location.includes(',')
            ? formData.location.split(',').pop()?.trim() || ''
            : formData.location;

        const updatedProject: Project = {
            ...project,
            name: formData.name,
            type: formData.type,
            location: formData.location,
            country: parsedCountry,
            budget: Number(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status as any,
            assigneeId: formData.assigneeId || undefined,
        };

        await updateProject(updatedProject);
        router.push(`/projects/${id}`);
    };

    if (!project) {
        return (
            <DashboardLayout>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    Loading project...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Edit Project</h1>
                    <span className="badge badge-warning" style={{ fontSize: '12px' }}>{project.id}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Update the detailed metadata and configuration for this project.</p>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Project Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Project Type</label>
                            <select required name="type" value={formData.type} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }}>
                                <option value="road">Road</option>
                                <option value="sewage">Sewage</option>
                                <option value="gas">Natural Gas</option>
                                <option value="electricity">Electricity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Location</label>
                        <SmartLocationInput
                            value={formData.location}
                            onChange={(val) => setFormData({ ...formData, location: val })}
                            required
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                            <AlertCircle size={12} /> Start typing to see smart suggestions for global locations.
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Status</label>
                            <select required name="status" value={formData.status} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }}>
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Assign Manager (Optional)</label>
                            <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }}>
                                <option value="">Unassigned</option>
                                {allUsers.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.role.replace('_', ' ')})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Total Budget (USD)</label>
                            <input required type="number" name="budget" value={formData.budget} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Estimated End Date</label>
                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                        <button type="button" onClick={() => router.back()} className="btn btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Save Changes</button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
