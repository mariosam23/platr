import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logout } from '../store/authSlice';
import { APIResponse } from '../utils/constants';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9023',
});

// attach token on every request
axiosInstance.interceptors.request.use((config) => {
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
        const original = error.config;

        if (error.response?.status !== APIResponse.UNAUTHORIZED || original._retry) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // queue this request until the refresh completes
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: (token) => {
                        original.headers.Authorization = `Bearer ${token}`;
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

            const { data } = await axios.post(
                'http://localhost:9023/api/auth/refresh',
                { refreshToken }
            );

            store.dispatch(
                setCredentials({ token: data.token, refreshToken: data.refreshToken })
            );

            drainQueue(data.token, null);
            original.headers.Authorization = `Bearer ${data.token}`;
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