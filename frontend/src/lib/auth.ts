import {
    apiRequest,
    clearAccessToken,
    setAccessToken,
} from "./api";

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
}

interface LoginResponse {
    user: AuthUser;
    accessToken: string;
}

interface RegisterResponse {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
}

export async function login(
    email: string,
    password: string
): Promise<AuthUser> {
    const response = await apiRequest<LoginResponse>(
        "/api/auth/login",
        {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    setAccessToken(response.accessToken);

    return response.user;
}

export async function register(
    email: string,
    password: string,
    name: string
): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>(
        "/api/auth/register",
        {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
                name,
            }),
        }
    );
}

export function logout() {
    clearAccessToken();
}