import { createHash, randomBytes } from "node:crypto";

import { prisma } from "../../lib/prisma.js";

function generateRawApiKey(): string {
    const randomPart = randomBytes(32).toString("hex");

    return `ff_live_${randomPart}`;
}

function hashApiKey(apiKey: string): string {
    return createHash("sha256")
        .update(apiKey)
        .digest("hex");
}

function getKeyPrefix(apiKey: string): string {
    return apiKey.slice(0, 16);
}

export async function generateEnvironmentApiKey(
    environmentId: string
) {
    const apiKey = generateRawApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    await prisma.environmentApiKey.upsert({
        where: {
            environmentId,
        },
        update: {
            keyHash,
            keyPrefix,
        },
        create: {
            environmentId,
            keyHash,
            keyPrefix,
        },
    });

    return {
        apiKey,
        keyPrefix,
    };
}

export async function findEnvironmentByApiKey(
    apiKey: string
) {
    const keyHash = hashApiKey(apiKey);

    return prisma.environmentApiKey.findUnique({
        where: {
            keyHash,
        },
        select: {
            environmentId: true,
        },
    });
}