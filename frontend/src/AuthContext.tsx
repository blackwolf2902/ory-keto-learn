import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@ory/client';
import { kratos } from './kratos';

interface AuthContextType {
    session: Session | null;
    loading: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true,
    logout: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        kratos.toSession()
            .then(({ data }) => {
                setSession(data);
                setLoading(false);
            })
            .catch(() => {
                setSession(null);
                setLoading(false);
            });
    }, []);

    const logout = () => {
        // Kratos logout usually requires a logout flow or redirection
        // Simplest is to redirect to the logout URL provided by Kratos
        kratos.createBrowserLogoutFlow()
            .then(({ data }) => {
                window.location.href = data.logout_url;
            })
            .catch(() => {
                // Fallback or error handling
                window.location.href = '/login';
            });
    };

    return (
        <AuthContext.Provider value={{ session, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
