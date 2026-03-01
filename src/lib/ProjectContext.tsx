'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Activity } from './types';
import { getProjects, getActivities, addProject as dbAddProject, addActivity as dbAddActivity, updateActivityAction, updateProjectAction, importActivitiesBulk, deleteProjectAction, deleteActivityAction } from '@/app/actions/db';

interface ProjectContextType {
    projects: Project[];
    activities: Activity[];
    addProject: (project: Project) => Promise<void>;
    addActivity: (activity: Activity) => Promise<void>;
    updateActivity: (activity: Activity) => Promise<void>;
    updateProject: (project: Project) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    deleteActivity: (activityId: string, projectId: string) => Promise<void>;
    importActivities: (newActivities: Activity[]) => Promise<void>;
    filteredCountry: string | null;
    setFilteredCountry: (country: string | null) => void;
    isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [filteredCountry, setFilteredCountry] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load from Database on mount
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const [dbProjects, dbActivities] = await Promise.all([
                    getProjects(),
                    getActivities()
                ]);
                setProjects(dbProjects);
                setActivities(dbActivities);
            } catch (error) {
                console.error("Failed to load data from database", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInitialData();
    }, []);

    const addProject = async (project: Project) => {
        // Optimistic UI update
        setProjects(prev => [...prev, project]);
        try {
            await dbAddProject(project);
        } catch (error) {
            console.error("Database error adding project", error);
            // In a real app we'd revert the state here on error
        }
    };

    const addActivity = async (activity: Activity) => {
        setActivities(prev => [...prev, activity]);
        try {
            await dbAddActivity(activity);
        } catch (error) {
            console.error("Database error adding activity", error);
        }
    };

    const updateActivity = async (updatedActivity: Activity) => {
        setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
        try {
            await updateActivityAction(updatedActivity);
        } catch (error) {
            console.error("Database error updating activity", error);
        }
    };

    const updateProject = async (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        try {
            await updateProjectAction(updatedProject);
        } catch (error) {
            console.error("Database error updating project", error);
        }
    };

    const deleteProject = async (projectId: string) => {
        // Optimistic delete cascade
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setActivities(prev => prev.filter(a => a.projectId !== projectId));
        try {
            await deleteProjectAction(projectId);
        } catch (error) {
            console.error("Database error deleting project", error);
        }
    };

    const deleteActivity = async (activityId: string, projectId: string) => {
        setActivities(prev => prev.filter(a => a.id !== activityId));
        // Note: graph healing logic happens in the backend Action, 
        // a robust app would await the action and sync the returned healed activities payload back to state.
        // For simplicity and speed here we just rely on user refresh conceptually or an explicit refetch.
        try {
            await deleteActivityAction(activityId, projectId);
            // Refetch activities to get the healed graph state
            const healedActivities = await getActivities();
            setActivities(healedActivities);
        } catch (error) {
            console.error("Database error deleting activity", error);
        }
    };

    const importActivities = async (newActivities: Activity[]) => {
        // Prevent importing exact duplicates locally first
        setActivities(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNew = newActivities.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNew];
        });

        try {
            await importActivitiesBulk(newActivities);
        } catch (error) {
            console.error("Database error importing activities", error);
        }
    };

    if (isLoading) {
        return null; // Avoid rendering children before loading to prevent layout shifting or missing contexts
    }

    return (
        <ProjectContext.Provider value={{
            projects,
            activities,
            addProject,
            addActivity,
            updateActivity,
            updateProject,
            deleteProject,
            deleteActivity,
            importActivities,
            filteredCountry,
            setFilteredCountry,
            isLoading
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
}
