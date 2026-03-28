import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    exp: number;
}

interface AuthUser {
    email: string;
    displayName: string;
    role: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
}

function parseUser(token: string): AuthUser | null {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return { email: decoded.sub, displayName: decoded.username, role: decoded.role };
    } catch {
        return null;
    }
}

const storedToken = localStorage.getItem('token');
const storedRefresh = localStorage.getItem('refreshToken');

const initialState: AuthState = {
    token: storedToken,
    refreshToken: storedRefresh,
    user: storedToken ? parseUser(storedToken) : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(
            state,
            action: PayloadAction<{ token: string; refreshToken: string }>
        ) {
            const { token, refreshToken } = action.payload;
            state.token = token;
            state.refreshToken = refreshToken;
            state.user = parseUser(token);

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
        },
        logout(state) {
            state.token = null;
            state.refreshToken = null;
            state.user = null;

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
