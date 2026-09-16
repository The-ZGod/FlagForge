import { prisma } from "../../lib/prisma.js";

export async function createEnvironment(
    projectId: string,
    name: string,
    key: string
) {
    return prisma.environment.create({
        data: {
            projectId,
            name,
            key,
        },
    });
}

export async function getEnvironmentsByProject(projectId: string) {
    return prisma.environment.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}