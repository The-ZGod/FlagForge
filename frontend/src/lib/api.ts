const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "flagforge_access_token";

export function setAccessToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAccessToken();

    const headers = new Headers(options.headers);

    headers.set("Content-Type", "application/json");

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null);

        if (response.status === 401 && token) {
            clearAccessToken();
            localStorage.removeItem("flagforge_user");
            localStorage.removeItem("flagforge_active_project_id");
            localStorage.removeItem("flagforge_active_env_id");
            window.location.href = "/login";
            return Promise.reject(
                new Error("Your session has expired. Please sign in again.")
            );
        }

        throw new Error(
            errorBody?.message ??
            `Request failed with status ${response.status}`
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}