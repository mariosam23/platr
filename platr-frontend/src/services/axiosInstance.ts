import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logout } from '../store/authSlice';
import { APIEndpoint } from '../utils/constants';

const API_BASE_URL = 'http://localhost:9023';
const RETRYABLE_AUTH_STATUSES = new Set([401, 403]);

type RetryableRequestConfig = {
    _retry?: boolean;
    headers?: Record<string, string>;
    url?: string;
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// attach token on every request
axiosInstance.interceptors.request.use((config) => {
    if (config.url?.includes(APIEndpoint.REFRESH)) {
        return config;
    }

    const token = store.getState().auth.token ?? localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// on 401, attempt refresh then retry once
let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string | null, error: unknown) {
    pendingQueue.forEach(({ resolve, reject }) =>
        token ? resolve(token) : reject(error)
    );
    pendingQueue = [];
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config as RetryableRequestConfig | undefined;
        const status = error.response?.status;
        const accessToken = store.getState().auth.token ?? localStorage.getItem('token');
        const isRefreshRequest = original?.url?.includes(APIEndpoint.REFRESH) ?? false;

        if (
            !original ||
            !accessToken ||
            !status ||
            !RETRYABLE_AUTH_STATUSES.has(status) ||
            original._retry ||
            isRefreshRequest
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // queue this request until the refresh completes
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: (token) => {
                        original.headers = {
                            ...original.headers,
                            Authorization: `Bearer ${token}`,
                        };
                        resolve(axiosInstance(original));
                    },
                    reject,
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const refreshToken =
                store.getState().auth.refreshToken ??
                localStorage.getItem('refreshToken');

            if (!refreshToken) {
                store.dispatch(logout());
                return Promise.reject(error);
            }

            const { data } = await axios.post(
                `${API_BASE_URL}${APIEndpoint.REFRESH}`,
                { refreshToken }
            );

            store.dispatch(
                setCredentials({ token: data.jwtToken, refreshToken: data.refreshToken })
            );

            drainQueue(data.jwtToken, null);
            original.headers = {
                ...original.headers,
                Authorization: `Bearer ${data.jwtToken}`,
            };
            return axiosInstance(original);
        } catch (refreshError) {
            drainQueue(null, refreshError);
            store.dispatch(logout());
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default axiosInstance;