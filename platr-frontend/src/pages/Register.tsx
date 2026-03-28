import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { isAxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { setCredentials } from '../store/authSlice';
import { useAppDispatch } from '../hooks/useAppStore';
import { PlatrRoutes } from '../application/routes';
import '../styles/AuthForm.css';

const schema = yup.object({
    username: yup
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be at most 50 characters')
        .required('Username is required'),
    email: yup
        .string()
        .email('Must be a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must be at most 72 characters')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

type RegisterFormData = yup.InferType<typeof schema>;

export const Register: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setServerError(null);

        try {
            const { data: res } = await axiosInstance.post<{
                jwtToken: string;
                refreshToken: string;
            }>('/api/auth/register', {
                username: data.username,
                email: data.email,
                password: data.password,
            });

            dispatch(setCredentials({ token: res.jwtToken, refreshToken: res.refreshToken }));
            navigate(PlatrRoutes.Login);
        } catch (err) {
            if (isAxiosError(err) && err.response?.data) {
                const body = err.response.data as {
                    message?: string;
                    errors?: Record<string, string>;
                };

                const fieldMap: Record<string, keyof RegisterFormData> = {
                    username: 'username',
                    email: 'email',
                    password: 'password',
                };

                if (body.errors && typeof body.errors === 'object') {
                    let hadFieldError = false;
                    
                    for (const [field, message] of Object.entries(body.errors)) {
                        const formField = fieldMap[field];
                        if (formField) {
                            setError(formField, { message });
                            hadFieldError = true;
                        }
                    }
                    
                    if (!hadFieldError) {
                        setServerError(body.message ?? 'Registration failed. Please try again.');
                    }
                } else {
                    setServerError(body.message ?? 'Registration failed. Please try again.');
                }
            } else {
                setServerError('An unexpected error occurred. Please try again.');
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

                <div className="auth-field">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        autoComplete="username"
                        {...register('username')}
                    />
                    {errors.username && (
                        <p role="alert" className="auth-field-error">
                            {errors.username.message}
                        </p>
                    )}
                </div>

                <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register('email')}
                    />
                    {errors.email && (
                        <p role="alert" className="auth-field-error">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p role="alert" className="auth-field-error">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                        <p role="alert" className="auth-field-error">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

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