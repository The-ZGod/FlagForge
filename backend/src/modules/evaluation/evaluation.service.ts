import { createHash } from "node:crypto";

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