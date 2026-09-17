import { validateEnvironmentCreation } from "./environment.validation.js";

describe("validateEnvironmentCreation", () => {
    it("should accept valid environment data", () => {
        expect(
            validateEnvironmentCreation(
                "project-123",
                "Development",
                "development"
            )
        ).toBeNull();
    });

    it("should reject missing projectId", () => {
        expect(
            validateEnvironmentCreation(
                undefined,
                "Development",
                "development"
            )
        ).toBe("projectId is required");
    });

    it("should reject empty projectId", () => {
        expect(
            validateEnvironmentCreation(
                "",
                "Development",
                "development"
            )
        ).toBe("projectId is required");
    });

    it("should reject missing name", () => {
        expect(
            validateEnvironmentCreation(
                "project-123",
                undefined,
                "development"
            )
        ).toBe("name is required");
    });

    it("should reject empty name", () => {
        expect(
            validateEnvironmentCreation(
                "project-123",
                "",
                "development"
            )
        ).toBe("name is required");
    });

    it("should reject missing key", () => {
        expect(
            validateEnvironmentCreation(
                "project-123",
                "Development",
                undefined
            )
        ).toBe("key is required");
    });

    it("should reject empty key", () => {
        expect(
            validateEnvironmentCreation(
                "project-123",
                "Development",
                ""
            )
        ).toBe("key is required");
    });

    it("should reject whitespace-only values", () => {
        expect(
            validateEnvironmentCreation(
                "   ",
                "   ",
                "   "
            )
        ).toBe("projectId is required");
    });
});