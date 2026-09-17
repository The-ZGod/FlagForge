import { validateRegistration } from "./auth.validation.js";

describe("validateRegistration", () => {
    it("accepts valid registration data", () => {
        expect(
            validateRegistration(
                "user@example.com",
                "password123",
                "Test User"
            )
        ).toBeNull();
    });

    it("rejects missing email", () => {
        expect(
            validateRegistration(
                undefined,
                "password123",
                "Test User"
            )
        ).toBe("email is required");
    });

    it("rejects empty email", () => {
        expect(
            validateRegistration(
                "",
                "password123",
                "Test User"
            )
        ).toBe("email is required");
    });

    it("rejects missing password", () => {
        expect(
            validateRegistration(
                "user@example.com",
                undefined,
                "Test User"
            )
        ).toBe("password is required");
    });

    it("rejects passwords shorter than 8 characters", () => {
        expect(
            validateRegistration(
                "user@example.com",
                "1234567",
                "Test User"
            )
        ).toBe("password must be at least 8 characters");
    });

    it("accepts registration without a name", () => {
        expect(
            validateRegistration(
                "user@example.com",
                "password123",
                undefined
            )
        ).toBeNull();
    });

    it("rejects a non-string name", () => {
        expect(
            validateRegistration(
                "user@example.com",
                "password123",
                123
            )
        ).toBe("name must be a string");
    });
});