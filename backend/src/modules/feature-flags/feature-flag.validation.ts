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