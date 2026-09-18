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

export async function evaluateFlag(
    data: EvaluateFlagRequest
): Promise<EvaluationResult> {
    return apiRequest<EvaluationResult>("/api/evaluation", {
        method: "POST",
        body: JSON.stringify(data),
    });
}