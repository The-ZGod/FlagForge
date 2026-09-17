export function validateProjectCreation(
    name: unknown,
    ownerId: unknown
): string | null {
    if (
        typeof name !== "string" ||
        name.trim().length === 0
    ) {
        return "name is required";
    }

    if (typeof ownerId !== "string" || ownerId.trim().length === 0) {
        return "ownerId is required";
    }

    return null;
}