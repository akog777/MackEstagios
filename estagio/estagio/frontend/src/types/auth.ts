export interface LoginCredentials {
    email: string;
    senha: string;
    role: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        nome: string;
        role: string;
    };
}

export interface User {
    id: number;
    nome: string;
    email: string;
    role: string;
}
