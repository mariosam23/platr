export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Recipe {
    id: string;
    title: string;
    description: string;
    userId: string;
}
