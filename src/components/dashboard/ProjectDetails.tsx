'use client';

import React, { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/ProjectContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import NetworkDiagram from './NetworkDiagram';
import ActivityManagementActions from './ActivityManagementActions';
import './ProjectDetails.css';

interface ProjectDetailsProps {
    projectId: string;
}

export default function ProjectDetails({ projectId }: ProjectDetailsProps) {
    const { user } = useAuth();
    const { projects, activities, deleteProject, deleteActivity } = useProjects();
    const router = useRouter();

    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'project' | 'activity', name: string } | null>(null);

    const project = useMemo(() => {
        return projects.find(p => p.id === projectId);
    }, [projectId, projects]);

    if (!project) {
        return (
            <div className="project-not-found">
                <h2>Project not found</h2>
                <Link href="/" className="btn btn-primary">Return to Dashboard</Link>
            </div>
        );
    }

    // Check mock permissions
    const canView = user?.role === 'admin' || user?.role === 'owner' ||
        (user?.role === 'country_manager' && project.country === user.assignedLocationId) ||
        (user?.role === 'region_manager' && project.region === user.assignedLocationId) ||
        (user?.role === 'city_manager' && project.city === user.assignedLocationId) ||
        (user?.role === 'site_manager' && project.siteId === user.assignedLocationId);

    if (!canView) {
        return (
            <div className="project-forbidden">
                <h2>Access Denied</h2>
                <p>You don't have permission to view {project.name}.</p>
                <Link href="/" className="btn btn-primary">Return to Dashboard</Link>
            </div>
        );
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    return (
        <div className="project-details">
            <div className="pd-header">
                <Link href="/" className="btn btn-outline back-btn">
                    <ArrowLeft size={16} /> Back
                </Link>
                <div className="pd-title-area">
                    <div className="pd-title-row">
                        <h1>{project.name}</h1>
                        <span className={`badge badge-${project.status === 'in_progress' ? 'success' : project.status === 'delayed' ? 'danger' : 'warning'}`}>
                            {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <span className="pd-id">Project ID: {project.id}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href={`/projects/${project.id}/edit`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Edit Project Configure
                    </Link>
                    <button
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                        onClick={() => setItemToDelete({ id: project.id, type: 'project', name: project.name })}
                    >
                        <Trash2 size={16} /> Delete Project
                    </button>
                </div>
                <ActivityManagementActions projectId={project.id} projectName={project.name} projectType={project.type || 'other'} />
            </div>

            <div className="pd-info-cards">
                <div className="card pd-card">
                    <MapPin size={20} className="pd-card-icon" />
                    <div className="pd-card-text">
                        <span>Location</span>
                        <strong>{project.location || `${project.city || ''}, ${project.country || ''}`} {project.siteId ? `(Site: ${project.siteId})` : ''}</strong>
                    </div>
                </div>
                <div className="card pd-card">
                    <Calendar size={20} className="pd-card-icon" />
                    <div className="pd-card-text">
                        <span>Timeline</span>
                        <strong>{project.startDate} to {project.endDate}</strong>
                    </div>
                </div>
                <div className="card pd-card">
                    <DollarSign size={20} className="pd-card-icon" />
                    <div className="pd-card-text">
                        <span>Budget</span>
                        <strong>{formatter.format(project.budget)}</strong>
                    </div>
                </div>
                <div className="card pd-card">
                    <div className="pd-card-text">
                        <span>Progress: {project.progress}%</span>
                        <div className="progress-bar-container large">
                            <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pd-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '24px' }}>
                <div className="pd-activities-section card">
                    <div className="diagram-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Project Activities</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tabular view of all activities</p>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '16px 24px', fontWeight: '500' }}>ID & Name</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '500' }}>Status</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '500' }}>Timeline</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '500' }}>Assignee</th>
                                    <th style={{ padding: '16px 24px', fontWeight: '500', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.filter(a => a.projectId === project.id).map(activity => (
                                    <tr key={activity.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontWeight: '500' }}>{activity.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{activity.id}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)' }}>
                                                {activity.category || 'General'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span className={`badge badge-${activity.status === 'completed' ? 'success' : activity.status === 'delayed' ? 'danger' : activity.status === 'active' ? 'primary' : 'warning'}`}>
                                                {activity.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: '13px' }}>{activity.startDate} to</div>
                                            <div style={{ fontSize: '13px' }}>{activity.endDate}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                            {activity.assigneeId || 'Unassigned'}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '6px', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                                                onClick={() => setItemToDelete({ id: activity.id, type: 'activity', name: activity.name })}
                                                title="Delete Activity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pd-diagram-section card">
                    <div className="diagram-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Activity Network Diagram</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Visualizing relationships</p>
                        </div>
                    </div>
                    <NetworkDiagram projectId={project.id} />
                </div>
            </div>

            {itemToDelete && (
                <div className="modal-overlay">
                    <div className="modal-content card" style={{ maxWidth: '400px' }}>
                        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger-color)' }}>
                                <AlertTriangle size={24} />
                                <h2>Confirm Deletion</h2>
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p>Are you sure you want to delete the {itemToDelete.type} <strong>{itemToDelete.name}</strong>?</p>
                            {itemToDelete.type === 'project' && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    This will also permanently delete all activities associated with this project.
                                </p>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button className="btn btn-outline" onClick={() => setItemToDelete(null)}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ backgroundColor: 'var(--danger-color)' }}
                                    onClick={async () => {
                                        if (itemToDelete.type === 'project') {
                                            await deleteProject(itemToDelete.id);
                                            router.push('/projects');
                                        } else {
                                            await deleteActivity(itemToDelete.id, project.id);
                                            setItemToDelete(null);
                                        }
                                    }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
