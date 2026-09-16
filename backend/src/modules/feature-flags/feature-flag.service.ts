import { prisma } from "../../lib/prisma.js";

export async function createFeatureFlag(
    environmentId: string,
    name: string,
    key: string,
    enabled: boolean = false
) {
    return prisma.featureFlag.create({
        data: {
            environmentId,
            name,
            key,
            enabled,
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