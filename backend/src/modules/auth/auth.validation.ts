export function validateRegistration(
    email: unknown,
    password: unknown,
    name: unknown
): string | null {
    if (
        typeof email !== "string" ||
        email.trim().length === 0
    ) {
        return "email is required";
    }

    if (
        typeof password !== "string" ||
        password.length === 0
    ) {
        return "password is required";
    }

    if (password.length < 8) {
        return "password must be at least 8 characters";
    }

    if (
        name !== undefined &&
        name !== null &&
        typeof name !== "string"
    ) {
        return "name must be a string";
    }

    return null;
}

export function validateLogin(
    email: unknown,
    password: unknown
): string | null {
    if (
        typeof email !== "string" ||
        email.trim().length === 0
    ) {
        return "email is required";
    }

    if (
        typeof password !== "string" ||
        password.length === 0
    ) {
        return "password is required";
    }

    return null;
}