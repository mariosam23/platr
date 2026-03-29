import type { AuthTokens, LoginRequest, RegisterRequest } from '../application/models/auth';
import type { components } from '../types/api';
import axiosInstance from './axiosInstance';
import { APIEndpoint } from '../utils/constants';

function normalizeAuthResponse(data: components['schemas']['AuthResponse']): AuthTokens {
    if (!data.jwtToken || !data.refreshToken) {
        throw new Error('Authentication response did not include both tokens.');
    }

    return {
        jwtToken: data.jwtToken,
        refreshToken: data.refreshToken,
    };
}

export async function loginUser(request: LoginRequest): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<components['schemas']['AuthResponse']>(APIEndpoint.LOGIN, request);
    return normalizeAuthResponse(data);
}

export async function registerUser(request: RegisterRequest): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<components['schemas']['AuthResponse']>(APIEndpoint.REGISTER, request);
    return normalizeAuthResponse(data);
}