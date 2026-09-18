import { apiRequest } from "./api";

export interface FeatureFlag {
    id: string;
    name: string;
    key: string;
    enabled: boolean;
    rolloutPercentage: number;
    createdAt: string;
    updatedAt: string;
    environmentId: string;
}

export async function getFeatureFlags(
    environmentId: string
): Promise<FeatureFlag[]> {
    return apiRequest<FeatureFlag[]>(
        `/api/feature-flags/environment/${environmentId}`
    );
}

export async function createFeatureFlag(
    environmentId: string,
    name: string,
    key: string,
    enabled = false,
    rolloutPercentage = 100
): Promise<FeatureFlag> {
    return apiRequest<FeatureFlag>("/api/feature-flags", {
        method: "POST",
        body: JSON.stringify({
            environmentId,
            name,
            key,
            enabled,
            rolloutPercentage,
        }),
    });
}

export async function updateFeatureFlag(
    flagId: string,
    enabled?: boolean,
    rolloutPercentage?: number
): Promise<FeatureFlag> {
    return apiRequest<FeatureFlag>(
        `/api/feature-flags/${flagId}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                enabled,
                rolloutPercentage,
            }),
        }
    );
}

export async function deleteFeatureFlag(
    flagId: string
): Promise<void> {
    return apiRequest<void>(
        `/api/feature-flags/${flagId}`,
        {
            method: "DELETE",
        }
    );
}