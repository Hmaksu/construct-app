'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { Role, User } from '@/lib/types';
import { addUser, updateUserAction, generateNextId, getUsers } from '@/app/actions/db';
import { Shield, UserPlus, Edit2, ShieldAlert } from 'lucide-react';
import './users.css';

export default function UsersAdminPage() {
    const { user: currentUser } = useAuth();
    const [usersList, setUsersList] = useState<User[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        // Fetch fresh users from DB on mount
        getUsers().then(setUsersList);
    }, []);

    // Only Admin or Owner can manage users
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'owner') {
        return (
            <DashboardLayout>
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <ShieldAlert size={64} style={{ color: 'var(--danger-color)', margin: '0 auto 20px auto' }} />
                    <h1 style={{ marginBottom: '16px' }}>Access Denied</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>You must be an Administrator or Owner to manage users.</p>
                </div>
            </DashboardLayout>
        );
    }

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (editingUser) {
            setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            if (usersList.some(u => u.id === editingUser.id)) {
                // Update existing user
                const updated = await updateUserAction(editingUser);
                setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
            } else {
                // Add new user
                const added = await addUser(editingUser);
                setUsersList(prev => [...prev, added]);
            }
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to save user", error);
            alert("An error occurred while saving the user.");
        }
    };

    const openNewUserModal = async () => {
        const nextId = await generateNextId('user');
        setEditingUser({
            id: nextId,
            name: '',
            role: 'site_manager' as Role, // default
            assignedLocationId: ''
        });
        setIsEditModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="directory-page">
                <div className="directory-header" style={{ marginBottom: '24px' }}>
                    <div>
                        <h1>User Management</h1>
                        <p>Manage roles, permissions, and location assignments.</p>
                    </div>
                    <button className="btn btn-primary" onClick={openNewUserModal}>
                        <UserPlus size={16} /> New User
                    </button>
                </div>

                <div className="directory-table-container card">
                    <table className="mp-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>System Role</th>
                                <th>Assigned Location/Territory</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((u) => (
                                <tr key={u.id}>
                                    <td><strong>{u.id}</strong></td>
                                    <td>{u.name}</td>
                                    <td>
                                        <span className={`badge badge-${u.role === 'admin' || u.role === 'owner' ? 'danger' : 'primary'}`} style={{ textTransform: 'capitalize' }}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ color: u.assignedLocationId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                            {u.assignedLocationId || 'Global (None)'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => {
                                                setEditingUser(u);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            <Edit2 size={14} style={{ marginRight: '6px' }} /> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {usersList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="empty-state">Loading users...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create / Edit Modal */}
                {isEditModalOpen && editingUser && (
                    <div className="modal-overlay">
                        <div className="modal-content card" style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
                                    <h2>{usersList.some(u => u.id === editingUser.id) ? 'Edit User' : 'New User'}</h2>
                                </div>
                                <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '20px' }}>
                                <div className="form-group">
                                    <label>User ID</label>
                                    <input type="text" value={editingUser.id} disabled style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }} />
                                </div>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input required type="text" name="name" value={editingUser.name} onChange={handleEditChange} placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label>System Role</label>
                                    <select name="role" value={editingUser.role} onChange={handleEditChange} required>
                                        <option value="site_manager">Site Manager</option>
                                        <option value="city_manager">City Manager</option>
                                        <option value="region_manager">Region Manager</option>
                                        <option value="country_manager">Country Manager</option>
                                        <option value="owner">Owner / Executive</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned Territory (Optional)</label>
                                    <input
                                        type="text"
                                        name="assignedLocationId"
                                        placeholder="e.g. Turkey, Istanbul, S-001"
                                        value={editingUser.assignedLocationId || ''}
                                        onChange={handleEditChange}
                                    />
                                    <small style={{ display: 'block', marginTop: '4px', color: 'var(--text-secondary)' }}>
                                        Leave blank for global admins/owners. For managers, insert the exact Country, Region, City, or Site ID they manage.
                                    </small>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                    <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save User</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
