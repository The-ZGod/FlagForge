import { prisma } from "../../lib/prisma.js";
import { createActivity } from "../activity/activity.service.js";

export async function createFeatureFlag(
    environmentId: string,
    name: string,
    key: string,
    enabled: boolean = false,
    rolloutPercentage: number = 100,
    userId: string
) {
    const flag = await prisma.featureFlag.create({
        data: {
            environmentId,
            name,
            key,
            enabled,
            rolloutPercentage,
        },
    });

    await createActivity({
        userId,
        action: "CREATED",
        entity: "FEATURE_FLAG",
        entityId: flag.id,
        metadata: {
            name: flag.name,
            key: flag.key,
            enabled: flag.enabled,
            rolloutPercentage: flag.rolloutPercentage,
        },
    });

    return flag;
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
    enabled: boolean | undefined,
    rolloutPercentage: number | undefined,
    userId: string
) {
    const flag = await prisma.featureFlag.update({
        where: {
            id: flagId,
        },
        data: {
            ...(enabled !== undefined && { enabled }),
            ...(rolloutPercentage !== undefined && {
                rolloutPercentage,
            }),
        },
    });

    await createActivity({
        userId,
        action: "UPDATED",
        entity: "FEATURE_FLAG",
        entityId: flag.id,
        metadata: {
            name: flag.name,
            key: flag.key,
            enabled: flag.enabled,
            rolloutPercentage: flag.rolloutPercentage,
        },
    });

    return flag;
}

export async function deleteFeatureFlag(
    flagId: string,
    userId: string
) {
    const flag = await prisma.featureFlag.delete({
        where: {
            id: flagId,
        },
    });

    await createActivity({
        userId,
        action: "DELETED",
        entity: "FEATURE_FLAG",
        entityId: flag.id,
        metadata: {
            name: flag.name,
            key: flag.key,
        },
    });

    return flag;
}

export async function getFeatureFlagById(
    flagId: string
) {
    return prisma.featureFlag.findUnique({
        where: {
            id: flagId,
        },
    });
}

export async function featureFlagBelongsToUser(
    flagId: string,
    userId: string
) {
    const featureFlag = await prisma.featureFlag.findFirst({
        where: {
            id: flagId,
            environment: {
                project: {
                    ownerId: userId,
                },
            },
        },
        select: {
            id: true,
        },
    });

    return featureFlag !== null;
}

export async function environmentBelongsToUser(
    environmentId: string,
    userId: string
) {
    const environment = await prisma.environment.findFirst({
        where: {
            id: environmentId,
            project: {
                ownerId: userId,
            },
        },
        select: {
            id: true,
        },
    });

    return environment !== null;
}