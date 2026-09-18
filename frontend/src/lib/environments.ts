import { apiRequest } from "./api";

export interface Environment {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    updatedAt: string;
    projectId: string;
}

export async function getEnvironments(
    projectId: string
): Promise<Environment[]> {
    return apiRequest<Environment[]>(
        `/api/environments/project/${projectId}`
    );
}

export async function createEnvironment(
    projectId: string,
    name: string,
    key: string
): Promise<Environment> {
    return apiRequest<Environment>("/api/environments", {
        method: "POST",
        body: JSON.stringify({
            projectId,
            name,
            key,
        }),
    });
}

export async function updateEnvironment(
    environmentId: string,
    name?: string,
    key?: string
): Promise<Environment> {
    return apiRequest<Environment>(
        `/api/environments/${environmentId}`,
        {
            method: "PATCH",
            body: JSON.stringify({
                name,
                key,
            }),
        }
    );
}

export async function deleteEnvironment(
    environmentId: string
): Promise<void> {
    return apiRequest<void>(
        `/api/environments/${environmentId}`,
        {
            method: "DELETE",
        }
    );
}