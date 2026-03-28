import React, { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { type LoginFormData, loginSchema } from '../application/models/auth';
import { setCredentials } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { PlatrRoutes } from '../application/routes';
import { AuthField } from '../presentation/auth/AuthField';
import { loginUser } from '../services/authService';
import '../styles/AuthForm.css';
import { getApiErrorMessage } from '../utils/apiErrors';

export const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    if (token) {
        return <Navigate to={PlatrRoutes.Recipes} replace />;
    }

    const onSubmit = async (formData: LoginFormData) => {
        setServerError(null);

        try {
            const tokens = await loginUser(formData);

            dispatch(setCredentials({ token: tokens.jwtToken, refreshToken: tokens.refreshToken }));
            navigate(PlatrRoutes.Recipes);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                setServerError('Invalid credentials. Please try again.');
            } else {
                setServerError(getApiErrorMessage(error, 'An unexpected error occurred. Please try again.'));
            }
        }
    };

    return (
        <div className="page">
            <h1>Login</h1>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
                {serverError && (
                    <p role="alert" className="auth-server-error">
                        {serverError}
                    </p>
                )}

                <AuthField
                    id="email"
                    type="email"
                    autoComplete="email"
                    label="Email"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <AuthField
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    label="Password"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <button type="submit" disabled={isSubmitting} className="nav-btn nav-btn-primary">
                    {isSubmitting ? 'Logging in…' : 'Log in'}
                </button>

                <p className="auth-hint">
                    Don't have an account? <Link to={PlatrRoutes.Register}>Register</Link>
                </p>
            </form>
        </div>
    );
};
