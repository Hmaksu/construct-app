import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Header />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
