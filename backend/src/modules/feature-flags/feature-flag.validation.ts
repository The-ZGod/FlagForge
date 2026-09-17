export const RULE_OPERATORS = [
    "EQUALS",
    "NOT_EQUALS",
] as const;

export type RuleOperator =
    (typeof RULE_OPERATORS)[number];

export function isValidRuleOperator(
    operator: unknown
): operator is RuleOperator {
    return (
        typeof operator === "string" &&
        RULE_OPERATORS.includes(
            operator as RuleOperator
        )
    );
}

export function validateFeatureFlagUpdate(
    enabled: unknown,
    rolloutPercentage: unknown
): string | null {
    if (
        enabled !== undefined &&
        typeof enabled !== "boolean"
    ) {
        return "enabled must be a boolean";
    }

    if (
        rolloutPercentage !== undefined &&
        (
            typeof rolloutPercentage !== "number" ||
            !Number.isInteger(rolloutPercentage) ||
            rolloutPercentage < 0 ||
            rolloutPercentage > 100
        )
    ) {
        return "rolloutPercentage must be an integer between 0 and 100";
    }

    return null;
}

export function validateFeatureFlagCreation(
    environmentId: unknown,
    name: unknown,
    key: unknown,
    enabled: unknown,
    rolloutPercentage: unknown
): string | null {
    if (
        typeof environmentId !== "string" ||
        environmentId.trim().length === 0
    ) {
        return "environmentId is required";
    }

    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return "name is required";
    }

    if (
        typeof key !== "string" ||
        key.trim().length === 0
    ) {
        return "key is required";
    }

    if (
        enabled !== undefined &&
        typeof enabled !== "boolean"
    ) {
        return "enabled must be a boolean";
    }

    if (
        rolloutPercentage !== undefined &&
        (
            typeof rolloutPercentage !== "number" ||
            !Number.isInteger(rolloutPercentage) ||
            rolloutPercentage < 0 ||
            rolloutPercentage > 100
        )
    ) {
        return "rolloutPercentage must be an integer between 0 and 100";
    }

    return null;
}


export function validateFlagRuleCreation(
    featureFlagId: unknown,
    attribute: unknown,
    operator: unknown,
    value: unknown
): string | null {
    if (
        typeof featureFlagId !== "string" ||
        featureFlagId.trim().length === 0
    ) {
        return "featureFlagId is required";
    }

    if (
        typeof attribute !== "string" ||
        attribute.trim().length === 0
    ) {
        return "attribute is required";
    }

    if (!isValidRuleOperator(operator)) {
        return "operator must be EQUALS or NOT_EQUALS";
    }

    if (
        typeof value !== "string" ||
        value.trim().length === 0
    ) {
        return "value is required";
    }

    return null;
}