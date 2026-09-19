import { apiRequest } from "./api";

export interface Activity {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    metadata: Record<string, unknown> | null;
    userId: string;
    createdAt: string;
}

export async function getActivities(): Promise<Activity[]> {
    return apiRequest<Activity[]>("/api/activity");
}