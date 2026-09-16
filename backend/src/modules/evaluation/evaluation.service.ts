import { createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";

export function getRolloutBucket(
    userId: string,
    flagKey: string
): number {
    const input = `${userId}:${flagKey}`;

    const hash = createHash("sha256")
        .update(input)
        .digest("hex");

    const numericHash = parseInt(hash.slice(0, 8), 16);

    return numericHash % 100;
}

export function isBucketInRollout(
    bucket: number,
    rolloutPercentage: number
): boolean {
    if (rolloutPercentage <= 0) {
        return false;
    }

    if (rolloutPercentage >= 100) {
        return true;
    }

    return bucket < rolloutPercentage;
}

export async function evaluateFeatureFlag(
    environmentId: string,
    flagKey: string
) {
    const flag = await prisma.featureFlag.findUnique({
        where: {
            environmentId_key: {
                environmentId,
                key: flagKey,
            },
        },
    });

    if (!flag) {
        return {
            enabled: false,
            reason: "FLAG_NOT_FOUND",
        };
    }

    if (!flag.enabled) {
        return {
            enabled: false,
            reason: "FLAG_DISABLED",
        };
    }

    return {
        enabled: true,
        reason: "FLAG_ENABLED",
    };
}