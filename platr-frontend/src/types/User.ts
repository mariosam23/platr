export type Role = "USER" | "ADMIN"

export interface UserResponse {
    username: string;
    email: string;
    displayedName: string;
    roles: Role[];
    createdAt: string;
}