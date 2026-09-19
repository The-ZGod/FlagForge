import { Prisma } from "../../generated/client.js";
import { prisma } from "../../lib/prisma.js";

export interface CreateActivityInput {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
}

export async function createActivity(input: CreateActivityInput) {
    return prisma.activity.create({
        data: {
            userId: input.userId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            ...(input.metadata !== undefined && {
                metadata: input.metadata,
            }),
        },
    });
}

export async function getActivitiesByUser(userId: string) {
    return prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
}