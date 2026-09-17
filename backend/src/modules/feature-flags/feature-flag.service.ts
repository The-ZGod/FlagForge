import { prisma } from "../../lib/prisma.js";

export async function createFeatureFlag(
    environmentId: string,
    name: string,
    key: string,
    enabled: boolean = false,
    rolloutPercentage: number = 100
) {
    return prisma.featureFlag.create({
        data: {
            environmentId,
            name,
            key,
            enabled,
            rolloutPercentage,
        },
    });
}

export async function getFeatureFlagsByEnvironment(
    environmentId: string
) {
    return prisma.featureFlag.findMany({
        where: {
            environmentId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function updateFeatureFlag(
    flagId: string,
    enabled?: boolean,
    rolloutPercentage?: number
) {
    return prisma.featureFlag.update({
        where: {
            id: flagId,
        },
        data: {
            ...(enabled !== undefined && { enabled }),
            ...(rolloutPercentage !== undefined && { rolloutPercentage }),
        },
    });
}

export async function deleteFeatureFlag(
    flagId: string
) {
    return prisma.featureFlag.delete({
        where: {
            id: flagId,
        },
    });
}