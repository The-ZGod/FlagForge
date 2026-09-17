export function validateEnvironmentCreation(
    projectId: unknown,
    name: unknown,
    key: unknown
): string | null {
    if (
        typeof projectId !== "string" ||
        projectId.trim().length === 0
    ) {
        return "projectId is required";
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

    return null;
}