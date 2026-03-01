'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useProjects } from '@/lib/ProjectContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Briefcase, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import WorldMap from './WorldMap';
import './MasterPlan.css';

export default function MasterPlan() {
    const { user } = useAuth();
    const { projects, filteredCountry } = useProjects();
    const router = useRouter();

    const filteredProjects = useMemo(() => {
        if (!user) return [];

        // First apply Role-Based Access Control
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

        // Then apply Map Filter
        if (filteredCountry) {
            const filterLower = filteredCountry.toLowerCase();
            accessibleProjects = accessibleProjects.filter(p => {
                const fullLocationString = `${p.location || ''} ${p.country || ''} ${p.city || ''} ${p.region || ''}`.toLowerCase();
                // Special checks for US/UK/UAE common formats
                if (filterLower === 'united states of america' && (fullLocationString.includes('usa') || fullLocationString.includes('us') || fullLocationString.includes('amerika'))) return true;
                if (filterLower === 'united kingdom' && (fullLocationString.includes('uk') || fullLocationString.includes('london'))) return true;
                if (filterLower === 'united arab emirates' && (fullLocationString.includes('uae') || fullLocationString.includes('dubai') || fullLocationString.includes('birleşik arap'))) return true;
                if (filterLower === 'turkey' && (fullLocationString.includes('türkiye') || fullLocationString.includes('istanbul') || fullLocationString.includes('turk'))) return true;
                if (filterLower === 'germany' && (fullLocationString.includes('de') || fullLocationString.includes('berlin') || fullLocationString.includes('almanya'))) return true;
                if (filterLower === 'japan' && (fullLocationString.includes('jp') || fullLocationString.includes('tokyo') || fullLocationString.includes('japonya'))) return true;
                if (filterLower === 'france' && (fullLocationString.includes('fr') || fullLocationString.includes('paris') || fullLocationString.includes('fransa'))) return true;
                if (filterLower === 'india' && (fullLocationString.includes('hindistan') || fullLocationString.includes('india'))) return true;
                if (filterLower === 'armenia' && (fullLocationString.includes('ermenistan') || fullLocationString.includes('armenia'))) return true;
                if (filterLower === 'kenya' && fullLocationString.includes('kenya')) return true;

                return fullLocationString.includes(filterLower);
            });
        }

        return accessibleProjects;
    }, [user, projects, filteredCountry]);

    const totalBudget = filteredProjects.reduce((acc, p) => acc + p.budget, 0);
    const activeProjects = filteredProjects.filter(p => p.status === 'in_progress').length;
    const delayedProjects = filteredProjects.filter(p => p.status === 'delayed').length;

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    });

    return (
        <div className="master-plan">
            <div className="mp-header">
                <div>
                    <h1 className="mp-title">Master Plan</h1>
                    <p className="mp-subtitle">Overview of construction projects and key metrics</p>
                </div>
                <Link href="/projects/new" className="btn btn-primary">
                    <Briefcase size={16} /> New Project
                </Link>
            </div>

            <div className="mp-stats">
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-primary)' }}>
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Projects</span>
                        <span className="stat-value">{filteredProjects.length}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active Projects</span>
                        <span className="stat-value">{activeProjects}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Delayed Projects</span>
                        <span className="stat-value">{delayedProjects}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Budget</span>
                        <span className="stat-value">{formatter.format(totalBudget)}</span>
                    </div>
                </div>
            </div>

            {user?.role === 'admin' || user?.role === 'owner' ? (
                <WorldMap />
            ) : null}

            <div className="mp-table-container card">
                <div className="table-header">
                    <h2>Project Portfolio {filteredCountry && `(${filteredCountry})`}</h2>
                    <div className="table-actions">
                        <Link href="/projects" className="btn btn-outline">View All Directories</Link>
                    </div>
                </div>
                <table className="mp-table">
                    <thead>
                        <tr>
                            <th>ID & Name</th>
                            <th>Type</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Budget</th>
                            <th>Timeline</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="empty-state">No projects found.</td>
                            </tr>
                        ) : (
                            filteredProjects.map((project) => (
                                <tr
                                    key={project.id}
                                    onClick={() => router.push(`/projects/${project.id}`)}
                                    style={{ cursor: 'pointer' }}
                                    className="clickable-row"
                                >
                                    <td>
                                        <div className="project-cell">
                                            <span className="project-id">{project.id}</span>
                                            <span className="project-name">{project.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-outline" style={{ textTransform: 'capitalize' }}>
                                            {(project.type || 'other').replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="project-location">{project.location || `${project.city}, ${project.country}`}</span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${project.status === 'in_progress' ? 'success' : project.status === 'delayed' ? 'danger' : 'warning'}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                        <span className="progress-text">{project.progress}%</span>
                                    </td>
                                    <td>{formatter.format(project.budget)}</td>
                                    <td>
                                        <div className="timeline-cell">
                                            <Clock size={14} />
                                            <span>{project.startDate} to {project.endDate}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/projects/${project.id}`);
                                            }}
                                        >
                                            View details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
