import { apiRequest } from "./api";

export interface EnvironmentApiKey {
    apiKey: string;
    keyPrefix: string;
}

export async function generateEnvironmentApiKey(
    environmentId: string
): Promise<EnvironmentApiKey> {
    return apiRequest<EnvironmentApiKey>(
        `/api/api-keys/environment/${environmentId}`,
        {
            method: "POST",
        }
    );
}