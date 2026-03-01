'use client';

import React, { useState, useRef } from 'react';
import { useProjects } from '@/lib/ProjectContext';
import { Activity } from '@/lib/types';
import { Download, Upload, Plus, X } from 'lucide-react';
import { PROJECT_TEMPLATES } from '@/lib/activityTemplates';
import './ActivityManagementActions.css';

interface ActivityManagementActionsProps {
    projectId: string;
    projectName: string;
    projectType: string;
}

export default function ActivityManagementActions({ projectId, projectName, projectType }: ActivityManagementActionsProps) {
    const { activities, addActivity, importActivities } = useProjects();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        category: 'General',
        status: 'pending',
        startDate: '',
        endDate: '',
        predecessors: '',
        successors: ''
    });

    const projectActivities = activities.filter(a => a.projectId === projectId);
    const templates = PROJECT_TEMPLATES[projectType?.toLowerCase()] || [];

    const handleExport = () => {
        const dataStr = JSON.stringify(projectActivities, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activities_${projectId}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (Array.isArray(parsed)) {
                    // Add some basic validation
                    const validActivities = parsed.filter(a => a.id && a.name && a.status).map(a => ({
                        ...a,
                        projectId // Force imported activities to belong to this project
                    }));

                    if (validActivities.length > 0) {
                        importActivities(validActivities as Activity[]);
                        alert(`Successfully imported ${validActivities.length} activities.`);
                    } else {
                        alert('No valid activities found in the file.');
                    }
                } else {
                    alert('Invalid JSON format. Expected an array of activities.');
                }
            } catch (err) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert comma-separated string to array
        const processIds = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

        const newActivity: Activity = {
            id: formData.id || 'ACT', // Pass specific template code or fallback to ACT
            projectId,
            name: formData.name,
            category: formData.category,
            status: formData.status as any,
            startDate: formData.startDate,
            endDate: formData.endDate,
            predecessors: processIds(formData.predecessors),
            successors: processIds(formData.successors),
        };

        addActivity(newActivity);
        setIsModalOpen(false);
        // Reset form
        setFormData({
            id: '', name: '', category: 'General', status: 'pending', startDate: '', endDate: '', predecessors: '', successors: ''
        });
    };

    return (
        <div className="activity-actions">
            <button className="btn btn-outline" onClick={handleExport} title="Export Activities to JSON">
                <Download size={16} /> Export JSON
            </button>

            <button className="btn btn-outline" onClick={handleImportClick} title="Import Activities from JSON">
                <Upload size={16} /> Import JSON
            </button>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Add Activity
            </button>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2>Add Activity to {projectName}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="modal-form">
                            {templates.length > 0 ? (
                                <div className="form-row">
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label>Select Activity Template</label>
                                        <select
                                            required
                                            value={formData.id}
                                            onChange={(e) => {
                                                const selected = templates.find(t => t.code === e.target.value);
                                                if (selected) {
                                                    setFormData({
                                                        ...formData,
                                                        id: selected.code,
                                                        name: selected.name,
                                                        category: selected.category
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Choose an activity...</option>
                                            {templates.map(t => (
                                                <option key={t.code} value={t.code}>
                                                    {t.code} - {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Category</label>
                                        <input type="text" disabled value={formData.category} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>Activity Name</label>
                                        <input required type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Foundation Pouring" />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <div style={{ display: 'none' }}>{/* Placeholder to keep layout intact if needed */}</div>
                                        <select name="category" value={formData.category} onChange={handleFormChange}>
                                            <option value="General">General</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select required name="status" value={formData.status} onChange={handleFormChange}>
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
                                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input required type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Predecessors (Comma separated ID list)</label>
                                <input type="text" name="predecessors" value={formData.predecessors} onChange={handleFormChange} placeholder="e.g. ACT-001, ACT-002" />
                            </div>
                            <div className="form-group">
                                <label>Successors (Comma separated ID list)</label>
                                <input type="text" name="successors" value={formData.successors} onChange={handleFormChange} placeholder="e.g. ACT-004" />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Activity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
