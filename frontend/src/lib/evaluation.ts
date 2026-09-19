import { apiRequest } from "./api";

export type UserAttributes = Record<string, string>;

export interface EvaluationResult {
    enabled: boolean;
    reason:
    | "FLAG_NOT_FOUND"
    | "FLAG_DISABLED"
    | "FULL_ROLLOUT"
    | "PERCENTAGE_ROLLOUT"
    | "PERCENTAGE_ROLLOUT_EXCLUDED"
    | "TARGETING_RULE_NOT_MATCHED";
}

export interface EvaluateFlagRequest {
    environmentId: string;
    flagKey: string;
    userId: string;
    attributes?: UserAttributes;
}

export interface EvaluationMetrics {
    totalEvaluations: number;
    enabledEvaluations: number;
    disabledEvaluations: number;
    averageLatencyMs: number;
    reasons: Record<EvaluationResult["reason"], number>;
}

export async function evaluateFlag(
    data: EvaluateFlagRequest
): Promise<EvaluationResult> {
    return apiRequest<EvaluationResult>(
        "/api/evaluation/dashboard",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
}

export async function getEvaluationMetrics(
    environmentId: string
): Promise<EvaluationMetrics> {
    return apiRequest<EvaluationMetrics>(
        `/api/evaluation/metrics/${environmentId}`
    );
}