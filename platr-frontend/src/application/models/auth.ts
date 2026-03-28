import * as yup from 'yup';
import type { components } from '../../types/api';

export interface AuthTokens {
    jwtToken: string;
    refreshToken: string;
}

export type LoginRequest = components['schemas']['LoginRequest'];
export type RegisterRequest = components['schemas']['RegisterRequest'];

export const loginSchema = yup.object({
    email: yup
        .string()
        .email('Must be a valid email address')
        .required('Email is required'),
    password: yup.string().required('Password is required'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
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

export type RegisterFormData = yup.InferType<typeof registerSchema>;