import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="settings-page">
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Settings</h1>
                <div className="card" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Preferences</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Email Notifications</label>
                            <select className="role-switcher-select" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <option>All events</option>
                                <option>Only assigned projects</option>
                                <option>None</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Theme</label>
                            <select className="role-switcher-select" style={{ padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <option>System Default</option>
                                <option>Light</option>
                                <option>Dark</option>
                            </select>
                        </div>
                        <button className="btn btn-primary" style={{ width: 'fit-content', marginTop: '16px' }}>Save Preferences</button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
