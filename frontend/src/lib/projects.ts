import { apiRequest } from "./api";

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export async function getProjects(): Promise<Project[]> {
    return apiRequest<Project[]>("/api/projects");
}

export async function createProject(name: string): Promise<Project> {
    return apiRequest<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}