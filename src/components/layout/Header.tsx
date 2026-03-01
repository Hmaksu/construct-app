'use client';

import React from 'react';
import RoleSwitcher from '../RoleSwitcher';
import { useAuth } from '@/lib/auth';
import { Bell, Search, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';
import './Header.css';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="header">
            <div className="header-search">
                <Search className="search-icon" size={18} />
                <input type="text" placeholder="Search projects or activities..." />
            </div>
            <div className="header-actions">
                <Link href="/users" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} /> Users
                </Link>
                <RoleSwitcher />
                <button className="icon-btn">
                    <Bell size={20} />
                </button>
                <div className="user-profile">
                    <UserCircle size={24} className="profile-icon" />
                    <div className="profile-info">
                        <span className="profile-name">{user?.name || 'Guest'}</span>
                        <span className="profile-role">{user?.role || 'No Role'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
