import React from 'react';
import Link from 'next/link';
import { Home, Briefcase, Settings, Activity } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">C</div>
                    <span className="logo-text">ConstructApp</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                <Link href="/" className="nav-item active">
                    <Home size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/projects" className="nav-item">
                    <Briefcase size={20} />
                    <span>Projects</span>
                </Link>
                <Link href="/activities" className="nav-item">
                    <Activity size={20} />
                    <span>Activities</span>
                </Link>
                <div className="nav-divider"></div>
                <Link href="/settings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </nav>
        </aside>
    );
}
