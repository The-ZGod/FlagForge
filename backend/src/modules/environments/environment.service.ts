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

export async function updateEnvironment(
    environmentId: string,
    name?: string,
    key?: string
) {
    return prisma.environment.update({
        where: {
            id: environmentId,
        },
        data: {
            ...(name !== undefined && { name }),
            ...(key !== undefined && { key }),
        },
    });
}

export async function deleteEnvironment(
    environmentId: string
) {
    const featureFlagCount = await prisma.featureFlag.count({
        where: {
            environmentId,
        },
    });

    if (featureFlagCount > 0) {
        throw new Error(
            "Cannot delete environment with existing feature flags"
        );
    }

    return prisma.environment.delete({
        where: {
            id: environmentId,
        },
    });
}

export async function getEnvironmentWithOwner(
    environmentId: string
) {
    return prisma.environment.findUnique({
        where: {
            id: environmentId,
        },
        include: {
            project: {
                select: {
                    ownerId: true,
                },
            },
        },
    });
}

export async function projectBelongsToUser(
    projectId: string,
    userId: string
) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            ownerId: userId,
        },
        select: {
            id: true,
        },
    });

    return project !== null;
}