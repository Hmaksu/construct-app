'use client';

import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useProjects } from '@/lib/ProjectContext';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Search, Filter, Edit2, X, Trash2, AlertTriangle } from 'lucide-react';
import { Activity } from '@/lib/types';
import './activities.css';

export default function ActivitiesPage() {
    const { user } = useAuth();
    const { activities, projects, updateActivity, deleteActivity } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Activity | null>(null);

    // Apply RBAC (only show activities for projects the user has access to)
    const accessibleProjectIds = useMemo(() => {
        if (!user) return new Set();
        if (user.role === 'admin' || user.role === 'owner') return new Set(projects.map(p => p.id));

        return new Set(projects.filter((p) => {
            if (user.role === 'country_manager') return p.country === user.assignedLocationId;
            if (user.role === 'region_manager') return p.region === user.assignedLocationId;
            if (user.role === 'city_manager') return p.city === user.assignedLocationId;
            if (user.role === 'site_manager') return p.siteId === user.assignedLocationId;
            return false;
        }).map(p => p.id));
    }, [user, projects]);

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            // RBAC Check
            if (!accessibleProjectIds.has(activity.projectId)) return false;

            // Search Filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = activity.id.toLowerCase().includes(searchLower) ||
                activity.name.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;

            // Status Filter
            if (statusFilter !== 'all' && activity.status !== statusFilter) return false;

            // Category Filter
            const actCategory = activity.category || 'General';
            if (categoryFilter !== 'all' && actCategory !== categoryFilter) return false;

            return true;
        });
    }, [activities, accessibleProjectIds, searchQuery, statusFilter, categoryFilter]);

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (editingActivity) {
            setEditingActivity({ ...editingActivity, [e.target.name]: e.target.value });
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingActivity) {
            // Convert comma strings back to arrays
            const preds = typeof editingActivity.predecessors === 'string'
                ? (editingActivity.predecessors as string).split(',').map(s => s.trim()).filter(Boolean)
                : editingActivity.predecessors;

            const succs = typeof editingActivity.successors === 'string'
                ? (editingActivity.successors as string).split(',').map(s => s.trim()).filter(Boolean)
                : editingActivity.successors;

            updateActivity({
                ...editingActivity,
                predecessors: preds,
                successors: succs
            });
            setEditingActivity(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <span className="badge badge-success">COMPLETED</span>;
            case 'active': return <span className="badge badge-primary">ACTIVE</span>;
            case 'delayed': return <span className="badge badge-danger">DELAYED</span>;
            case 'pending':
            default: return <span className="badge badge-warning">PENDING</span>;
        }
    };

    return (
        <DashboardLayout>
            <div className="directory-page">
                <div className="directory-header">
                    <div>
                        <h1>Global Activities Directory</h1>
                        <p>Manage and search across all project activities</p>
                    </div>
                </div>

                <div className="directory-controls card">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by Activity ID or Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="filters-group">
                        <div className="filter-item">
                            <Filter size={16} />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="delayed">Delayed</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="all">All Categories</option>
                                <option value="General">General</option>
                                <option value="Design">Design</option>
                                <option value="Foundation">Foundation</option>
                                <option value="Structural">Structural</option>
                                <option value="Finishing">Finishing</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="directory-table-container card">
                    <table className="mp-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Project ID</th>
                                <th>Location</th>
                                <th>Assignee</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Timeline</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivities.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="empty-state">No activities found matching your criteria.</td>
                                </tr>
                            ) : (
                                filteredActivities.map(activity => {
                                    const proj = projects.find(p => p.id === activity.projectId);
                                    let locationStr = 'Unknown';
                                    if (proj) {
                                        locationStr = proj.location || [proj.city, proj.country].filter(Boolean).join(', ') || 'Unknown';
                                    }

                                    return (
                                        <tr key={activity.id}>
                                            <td><strong>{activity.id}</strong></td>
                                            <td>{activity.name}</td>
                                            <td>
                                                <Link href={`/projects/${activity.projectId}`} className="project-link">
                                                    {activity.projectId}
                                                </Link>
                                            </td>
                                            <td><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{locationStr}</span></td>
                                            <td><span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{activity.assigneeId || 'Unassigned'}</span></td>
                                            <td>{activity.category || 'General'}</td>
                                            <td>{getStatusBadge(activity.status)}</td>
                                            <td>{activity.startDate} to {activity.endDate}</td>
                                            <td>
                                                {itemToDelete && itemToDelete.id === activity.id && (
                                                    <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '8px' }}>
                                                        <p>Are you sure you want to delete the activity <strong>{itemToDelete.name}</strong>?</p>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                                            <button className="btn btn-outline" onClick={() => setItemToDelete(null)}>Cancel</button>
                                                            <button
                                                                className="btn btn-primary"
                                                                style={{ backgroundColor: 'var(--danger-color)' }}
                                                                onClick={async () => {
                                                                    await deleteActivity(itemToDelete.id, itemToDelete.projectId);
                                                                    setItemToDelete(null);
                                                                }}
                                                            >
                                                                Confirm
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {!itemToDelete || itemToDelete.id !== activity.id ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => setEditingActivity({
                                                                ...activity,
                                                                predecessors: activity.predecessors.join(', ') as any,
                                                                successors: activity.successors.join(', ') as any
                                                            })}
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            className="btn btn-outline btn-sm"
                                                            style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                                                            onClick={() => setItemToDelete(activity)}
                                                            title="Delete Activity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Activity Modal */}
            {editingActivity && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2>Edit Activity: {editingActivity.id}</h2>
                            <button className="close-btn" onClick={() => setEditingActivity(null)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Activity Name</label>
                                <input required type="text" name="name" value={editingActivity.name} onChange={handleEditChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={editingActivity.category || 'General'} onChange={handleEditChange}>
                                        <option value="General">General</option>
                                        <option value="Design">Design</option>
                                        <option value="Foundation">Foundation</option>
                                        <option value="Structural">Structural</option>
                                        <option value="Finishing">Finishing</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select required name="status" value={editingActivity.status} onChange={handleEditChange}>
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="delayed">Delayed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input required type="date" name="startDate" value={editingActivity.startDate} onChange={handleEditChange} />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input required type="date" name="endDate" value={editingActivity.endDate} onChange={handleEditChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Predecessors (Comma separated ID list)</label>
                                <input type="text" name="predecessors" value={editingActivity.predecessors as any} onChange={handleEditChange} />
                            </div>
                            <div className="form-group">
                                <label>Successors (Comma separated ID list)</label>
                                <input type="text" name="successors" value={editingActivity.successors as any} onChange={handleEditChange} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setEditingActivity(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
