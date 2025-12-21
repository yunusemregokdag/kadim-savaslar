import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getAuthToken, setAuthToken } from '../utils/api';

interface User {
    id: string;
    username: string;
    email?: string;
    premiumUntil?: Date | null;
    vipLevel?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const checkAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const data = await authAPI.me();
                    setUser(data.user);
                } catch (error) {
                    // Token invalid, clear it
                    setAuthToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authAPI.login(email, password);
        setUser(data.user);
    };

    const register = async (username: string, email: string, password: string) => {
        const data = await authAPI.register(username, email, password);
        setUser(data.user);
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
