import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";

import { prisma } from "../../lib/prisma.js";
import { recordEvaluation } from "./evaluation.metrics.js";

import type {
    EvaluationResult,
    UserAttributes,
} from "./evaluation.types.js";

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

function evaluateRules(
    rules: {
        attribute: string;
        operator: string;
        value: string;
    }[],
    attributes: Record<string, string>
): boolean {
    if (rules.length === 0) {
        return true;
    }

    return rules.every((rule) => {
        const attributeValue = attributes[rule.attribute];

        if (attributeValue === undefined) {
            return false;
        }

        if (rule.operator === "EQUALS") {
            return attributeValue === rule.value;
        }

        if (rule.operator === "NOT_EQUALS") {
            return attributeValue !== rule.value;
        }

        return false;
    });
}

export async function evaluateFeatureFlag(
    environmentId: string,
    flagKey: string,
    userId: string,
    attributes: UserAttributes = {}
): Promise<EvaluationResult> {
    const startTime = performance.now();

    function finishEvaluation(
        result: EvaluationResult
    ): EvaluationResult {
        const latencyMs = performance.now() - startTime;

        recordEvaluation(
            environmentId,
            result,
            latencyMs
        );

        return result;
    }

    const flag = await prisma.featureFlag.findUnique({
        where: {
            environmentId_key: {
                environmentId,
                key: flagKey,
            },
        },
        include: {
            rules: true,
        },
    });

    if (!flag) {
        return finishEvaluation({
            enabled: false,
            reason: "FLAG_NOT_FOUND",
        });
    }

    if (!flag.enabled) {
        return finishEvaluation({
            enabled: false,
            reason: "FLAG_DISABLED",
        });
    }

    const rulesMatch = evaluateRules(
        flag.rules,
        attributes
    );

    if (!rulesMatch) {
        return finishEvaluation({
            enabled: false,
            reason: "TARGETING_RULE_NOT_MATCHED",
        });
    }

    if (flag.rolloutPercentage >= 100) {
        return finishEvaluation({
            enabled: true,
            reason: "FULL_ROLLOUT",
        });
    }

    const bucket = getRolloutBucket(
        userId,
        flag.key
    );

    const enabled = isBucketInRollout(
        bucket,
        flag.rolloutPercentage
    );

    return finishEvaluation({
        enabled,
        reason: enabled
            ? "PERCENTAGE_ROLLOUT"
            : "PERCENTAGE_ROLLOUT_EXCLUDED",
    });
}