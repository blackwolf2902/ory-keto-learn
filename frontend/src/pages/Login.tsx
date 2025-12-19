import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { LoginFlow } from '@ory/client';
import { Lock, Loader2 } from 'lucide-react';
import { kratos } from '../kratos';
import { KratosForm } from '../components/KratosForm';
import { useAuth } from '../AuthContext';

export const Login: React.FC = () => {
    const [flow, setFlow] = useState<LoginFlow | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            navigate('/');
            return;
        }

        const flowId = searchParams.get('flow');

        if (flowId) {
            kratos.getLoginFlow({ id: flowId })
                .then(({ data }) => setFlow(data))
                .catch(() => navigate('/login', { replace: true }));
        } else {
            kratos.createBrowserLoginFlow()
                .then(({ data }) => setFlow(data));
        }
    }, [searchParams, navigate, session]);

    const handleSubmit = (_: React.FormEvent<HTMLFormElement>) => {
        // Kratos handles the submission via the form action and method
    };

    if (!flow) {
        return (
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Lock size={24} />
                    </div>
                    <h1>Keto Learn</h1>
                </div>
                <div className="auth-loading">
                    <Loader2 size={32} className="spin" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-logo">
                <div className="auth-logo-icon">
                    <Lock size={24} />
                </div>
                <h1>Keto Learn</h1>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue to your dashboard</p>

            <KratosForm ui={flow.ui} onSubmit={handleSubmit} />

            <div className="auth-divider">
                <span>or</span>
            </div>

            <p className="auth-footer">
                Don't have an account? <Link to="/registration">Create one</Link>
            </p>
        </div>
    );
};
