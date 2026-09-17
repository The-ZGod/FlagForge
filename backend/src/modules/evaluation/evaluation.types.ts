export type EvaluationReason =
    | "FLAG_NOT_FOUND"
    | "FLAG_DISABLED"
    | "FULL_ROLLOUT"
    | "PERCENTAGE_ROLLOUT"
    | "PERCENTAGE_ROLLOUT_EXCLUDED";

export interface EvaluationResult {
    enabled: boolean;
    reason: EvaluationReason;
}