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