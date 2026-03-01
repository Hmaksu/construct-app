'use client';

import React, { useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/ProjectContext';
import Link from 'next/link';
import { Briefcase, Building, MapPin, Search } from 'lucide-react';

export default function ProjectsPage() {
    const { user } = useAuth();
    const { projects } = useProjects();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredProjects = useMemo(() => {
        if (!user) return [];

        let accessibleProjects = projects;
        if (user.role !== 'admin' && user.role !== 'owner') {
            accessibleProjects = projects.filter((p) => {
                if (user.role === 'country_manager') return p.country === user.assignedLocationId;
                if (user.role === 'region_manager') return p.region === user.assignedLocationId;
                if (user.role === 'city_manager') return p.city === user.assignedLocationId;
                if (user.role === 'site_manager') return p.siteId === user.assignedLocationId;
                return false;
            });
        }

        if (statusFilter !== 'all') {
            accessibleProjects = accessibleProjects.filter(p => p.status === statusFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            accessibleProjects = accessibleProjects.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.id.toLowerCase().includes(q) ||
                (p.location && p.location.toLowerCase().includes(q))
            );
        }

        return accessibleProjects;
    }, [user, projects, search, statusFilter]);

    return (
        <DashboardLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Projects Directory</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>View and manage all accessible projects</p>
                    </div>
                    <Link href="/projects/new" className="btn btn-primary">
                        <Briefcase size={16} /> New Project
                    </Link>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="card" style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} color="var(--text-tertiary)" />
                        <input
                            type="text"
                            placeholder="Search projects by name, ID, or location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <div className="card" style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}
                        >
                            <option value="all">All Statuses</option>
                            <option value="planning">Planning</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delayed">Delayed</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredProjects.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No projects found.
                        </div>
                    ) : (
                        filteredProjects.map(project => (
                            <div key={project.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>{project.id}</div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{project.name}</h3>
                                    </div>
                                    <span className={`badge badge-${project.status === 'in_progress' ? 'success' : project.status === 'delayed' ? 'danger' : 'warning'}`}>
                                        {project.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} /> {project.location || `${project.city || ''}, ${project.country || ''}`}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building size={14} /> Site: {project.siteId}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', width: '60%' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Progress ({project.progress}%)</span>
                                        <div className="progress-bar-container large" style={{ marginTop: 0 }}>
                                            <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                    </div>
                                    <Link href={`/projects/${project.id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                        Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
