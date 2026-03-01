'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './types';
import { getUsers } from '@/app/actions/db';

interface AuthContextType {
    user: User | null;
    allUsers: User[];
    login: (userId: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const dbUsers = await getUsers();
                setAllUsers(dbUsers);
                // Default to first user if available for dev purposes
                if (dbUsers.length > 0) {
                    setUser(dbUsers[0]);
                }
            } catch (error) {
                console.error("Failed to load users for auth", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []);

    const login = (userId: string) => {
        const foundUser = allUsers.find(u => u.id === userId);
        if (foundUser) {
            setUser(foundUser);
        }
    };

    const logout = () => {
        setUser(null);
    };

    if (isLoading) return null;

    return (
        <AuthContext.Provider value={{ user, allUsers, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
