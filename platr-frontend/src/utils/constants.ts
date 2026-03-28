const APIResponse = {
    UNAUTHORIZED: 401,
} as const;

const APIEndpoint = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
}

export { APIResponse, APIEndpoint };
