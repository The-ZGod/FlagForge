export type UserAttributes = Record<string, string>;

export type EvaluationReason =
    | "FLAG_NOT_FOUND"
    | "FLAG_DISABLED"
    | "FULL_ROLLOUT"
    | "PERCENTAGE_ROLLOUT"
    | "PERCENTAGE_ROLLOUT_EXCLUDED"
    | "TARGETING_RULE_NOT_MATCHED";

export interface EvaluationResult {
    enabled: boolean;
    reason: EvaluationReason;
}