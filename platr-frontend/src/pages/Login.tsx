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
import { APIEndpoint } from '../utils/constants';

const schema = yup.object({
    email: yup
        .string()
        .email('Must be a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required'),
});

type LoginFormData = yup.InferType<typeof schema>;

export const Login: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);

        try {
            const { data: res } = await axiosInstance.post<{
                jwtToken: string;
                refreshToken: string;
            }>(APIEndpoint.LOGIN, {
                email: data.email,
                password: data.password,
            });

            dispatch(setCredentials({ token: res.jwtToken, refreshToken: res.refreshToken }));
            navigate(PlatrRoutes.Recipes);
        } catch (err) {
            if (isAxiosError(err) && err.response) {
                setServerError('Invalid credentials. Please try again.');
            } else {
                setServerError('An unexpected error occurred. Please try again.');
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
                        autoComplete="current-password"
                        {...register('password')}
                    />
                    {errors.password && (
                        <p role="alert" className="auth-field-error">
                            {errors.password.message}
                        </p>
                    )}
                </div>

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
