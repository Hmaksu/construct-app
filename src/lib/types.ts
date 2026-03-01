export type Role = 'admin' | 'owner' | 'country_manager' | 'region_manager' | 'city_manager' | 'site_manager';

export interface User {
    id: string;
    name: string;
    role: Role;
    assignedLocationId?: string; // Could be country "TR", region "Marmara", city "Istanbul", or site "S-001"
}

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'delayed';

export interface Project {
    id: string;
    name: string;
    type: string;
    location: string;
    country?: string;
    region?: string;
    city?: string;
    siteId?: string; // Specific location ID, e.g., "S-001"
    status: ProjectStatus;
    budget: number;
    startDate: string;
    endDate: string;
    progress: number; // 0-100
    assigneeId?: string | null;
}

export interface Activity {
    id: string; // Specific ID for the activity, e.g. "ACT-001"
    projectId: string;
    assigneeId?: string; // ID of assigned user
    name: string;
    status: 'pending' | 'active' | 'completed' | 'delayed';
    startDate: string;
    endDate: string;
    predecessors: string[]; // Array of Activity IDs that must finish before this one
    successors: string[]; // Array of Activity IDs that follow
    category?: string; // Optional category for classification and ID generation
}
