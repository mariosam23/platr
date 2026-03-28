import React, { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { type RegisterFormData, registerSchema } from '../application/models/auth';
import { setCredentials } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { PlatrRoutes } from '../application/routes';
import { AuthField } from '../presentation/auth/AuthField';
import { registerUser } from '../services/authService';
import '../styles/AuthForm.css';
import { getApiErrorMessage, getApiFieldErrors } from '../utils/apiErrors';

export const Register: React.FC = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
    });

    if (token) {
        return <Navigate to={PlatrRoutes.Recipes} replace />;
    }

    const onSubmit = async (formData: RegisterFormData) => {
        setServerError(null);

        try {
            const tokens = await registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            dispatch(setCredentials({ token: tokens.jwtToken, refreshToken: tokens.refreshToken }));
            navigate(PlatrRoutes.Recipes);
        } catch (error) {
            const fieldMap: Record<string, keyof RegisterFormData> = {
                username: 'username',
                email: 'email',
                password: 'password',
            };
            const fieldErrors = getApiFieldErrors(error);

            let hadFieldError = false;
            Object.entries(fieldErrors).forEach(([field, message]) => {
                const formField = fieldMap[field];
                if (formField) {
                    setError(formField, { message });
                    hadFieldError = true;
                }
            });

            if (!hadFieldError) {
                setServerError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
            }
        }
    };

    return (
        <div className="page">
            <h1>Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
                {serverError && (
                    <p role="alert" className="auth-server-error">
                        {serverError}
                    </p>
                )}

                <AuthField
                    id="username"
                    type="text"
                    autoComplete="username"
                    label="Username"
                    error={errors.username?.message}
                    {...register('username')}
                />

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
                    autoComplete="new-password"
                    label="Password"
                    error={errors.password?.message}
                    {...register('password')}
                />

                <AuthField
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    label="Confirm Password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                <button type="submit" disabled={isSubmitting} className="nav-btn nav-btn-primary">
                    {isSubmitting ? 'Registering…' : 'Register'}
                </button>

                <p className="auth-hint">
                    Already have an account? <Link to={PlatrRoutes.Login}>Log in</Link>
                </p>
            </form>
        </div>
    );
};