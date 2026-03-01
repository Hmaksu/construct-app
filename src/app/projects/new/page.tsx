'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useProjects } from '@/lib/ProjectContext';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/types';
import SmartLocationInput from '@/components/shared/SmartLocationInput';
import { useAuth } from '@/lib/auth';

export default function NewProjectPage() {
    const { addProject, projects } = useProjects();
    const { allUsers } = useAuth();
    const router = useRouter();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure robust country string parsing from the SmartLocationInput
        const parsedCountry = formData.location.includes(',')
            ? formData.location.split(',').pop()?.trim() || ''
            : formData.location;

        const parsedCity = formData.location.includes(',')
            ? formData.location.split(',')[0]?.trim() || ''
            : formData.location;

        // Generate a semantic prefix (e.g. TR-IST-ROA for Turkey, Istanbul, Road)
        const countryCode = parsedCountry.substring(0, 3).toUpperCase() || 'XXX';
        const cityCode = parsedCity.substring(0, 3).toUpperCase() || 'XXX';

        let typeCode = 'OTH';
        if (formData.type === 'road') typeCode = 'ROA';
        if (formData.type === 'sewage') typeCode = 'SEW';
        if (formData.type === 'gas') typeCode = 'GAS';
        if (formData.type === 'electricity') typeCode = 'ELE';

        const semanticPrefix = `${countryCode}-${cityCode}-${typeCode}`;

        const newProject: Project = {
            id: semanticPrefix, // We pass the prefix, `db.ts` will fetch the next ID for it
            name: formData.name,
            type: formData.type,
            location: formData.location,
            country: parsedCountry,
            region: '',
            city: parsedCity,
            siteId: '',
            budget: Number(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status as any,
            progress: 0,
            assigneeId: formData.assigneeId || undefined,
        };

        await addProject(newProject);
        router.push('/projects');
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Create New Project</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Fill out the details below to initialize a new construction project and assign responsible locations.</p>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Project Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} placeholder="e.g. London Tech Hub" />
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Status</label>
                            <select required name="status" value={formData.status} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }}>
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Budget (USD)</label>
                            <input required type="number" name="budget" value={formData.budget} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} placeholder="e.g. 50000000" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '500' }}>End Date</label>
                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="role-switcher-select" style={{ border: '1px solid var(--border-color)', padding: '10px' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                        <button type="button" onClick={() => router.back()} className="btn btn-outline" style={{ padding: '10px 24px' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Create Project</button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
