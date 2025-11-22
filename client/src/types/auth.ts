export interface User {
    id: string;
    username: string;
    role: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}
