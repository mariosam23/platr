const APIResponse = {
    UNAUTHORIZED: 401,
} as const;

const APIEndpoint = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    RECIPES: '/api/recipes',
    CATEGORIES: '/api/categories',
    INGREDIENTS: '/api/ingredients',
} as const;

export { APIResponse, APIEndpoint };
