'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import './RoleSwitcher.css';

export default function RoleSwitcher() {
    const { user, login, allUsers } = useAuth();

    if (allUsers.length === 0) return null;

    return (
        <div className="role-switcher">
            <span className="role-switcher-label">Viewing as:</span>
            <select
                className="role-switcher-select"
                value={user?.id || ''}
                onChange={(e) => login(e.target.value)}
            >
                <option value="" disabled>Select Role</option>
                {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                    </option>
                ))}
            </select>
        </div>
    );
}
