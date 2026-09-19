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

const USER_KEY = "flagforge_user";

export function getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function setCurrentUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
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
    setCurrentUser(response.user);

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
    clearCurrentUser();
}