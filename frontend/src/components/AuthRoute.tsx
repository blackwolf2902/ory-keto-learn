import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export const AuthRoute: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div>Verifying session...</div>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
