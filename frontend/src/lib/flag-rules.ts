import { apiRequest } from "./api";

export type RuleOperator = "EQUALS" | "NOT_EQUALS";

export interface FlagRule {
    id: string;
    attribute: string;
    operator: RuleOperator;
    value: string;
    featureFlagId: string;
    createdAt: string;
}

export async function getFlagRules(
    featureFlagId: string
): Promise<FlagRule[]> {
    return apiRequest<FlagRule[]>(
        `/api/flag-rules/flag/${featureFlagId}`
    );
}

export async function createFlagRule(
    featureFlagId: string,
    attribute: string,
    operator: RuleOperator,
    value: string
): Promise<FlagRule> {
    return apiRequest<FlagRule>("/api/flag-rules", {
        method: "POST",
        body: JSON.stringify({
            featureFlagId,
            attribute,
            operator,
            value,
        }),
    });
}

export async function deleteFlagRule(
    ruleId: string
): Promise<void> {
    return apiRequest<void>(
        `/api/flag-rules/${ruleId}`,
        {
            method: "DELETE",
        }
    );
}