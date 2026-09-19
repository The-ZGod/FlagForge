import type { EvaluationReason, EvaluationResult } from "./evaluation.types.js";

interface EnvironmentMetrics {
    totalEvaluations: number;
    enabledEvaluations: number;
    disabledEvaluations: number;
    totalLatencyMs: number;
    reasons: Record<EvaluationReason, number>;
}

const metrics = new Map<string, EnvironmentMetrics>();

const evaluationReasons: EvaluationReason[] = [
    "FLAG_NOT_FOUND",
    "FLAG_DISABLED",
    "FULL_ROLLOUT",
    "PERCENTAGE_ROLLOUT",
    "PERCENTAGE_ROLLOUT_EXCLUDED",
    "TARGETING_RULE_NOT_MATCHED",
];

function createEmptyMetrics(): EnvironmentMetrics {
    return {
        totalEvaluations: 0,
        enabledEvaluations: 0,
        disabledEvaluations: 0,
        totalLatencyMs: 0,
        reasons: Object.fromEntries(
            evaluationReasons.map((reason) => [reason, 0])
        ) as Record<EvaluationReason, number>,
    };
}

function getMetrics(environmentId: string): EnvironmentMetrics {
    let environmentMetrics = metrics.get(environmentId);

    if (!environmentMetrics) {
        environmentMetrics = createEmptyMetrics();
        metrics.set(environmentId, environmentMetrics);
    }

    return environmentMetrics;
}

export function recordEvaluation(
    environmentId: string,
    result: EvaluationResult,
    latencyMs: number
) {
    const environmentMetrics = getMetrics(environmentId);

    environmentMetrics.totalEvaluations += 1;
    environmentMetrics.totalLatencyMs += latencyMs;

    if (result.enabled) {
        environmentMetrics.enabledEvaluations += 1;
    } else {
        environmentMetrics.disabledEvaluations += 1;
    }

    environmentMetrics.reasons[result.reason] += 1;
}

export function getEvaluationMetrics(environmentId: string) {
    const environmentMetrics = getMetrics(environmentId);

    const averageLatencyMs =
        environmentMetrics.totalEvaluations === 0
            ? 0
            : environmentMetrics.totalLatencyMs /
            environmentMetrics.totalEvaluations;

    return {
        totalEvaluations: environmentMetrics.totalEvaluations,
        enabledEvaluations: environmentMetrics.enabledEvaluations,
        disabledEvaluations: environmentMetrics.disabledEvaluations,
        averageLatencyMs: Number(averageLatencyMs.toFixed(2)),
        reasons: environmentMetrics.reasons,
    };
}