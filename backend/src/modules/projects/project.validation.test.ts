import { validateProjectCreation } from "./project.validation.js";

describe("validateProjectCreation", () => {
    it("should accept valid project data", () => {
        expect(
            validateProjectCreation(
                "FlagForge Demo",
                "user-123"
            )
        ).toBeNull();
    });

    it("should reject missing name", () => {
        expect(
            validateProjectCreation(
                undefined,
                "user-123"
            )
        ).toBe("name is required");
    });

    it("should reject empty name", () => {
        expect(
            validateProjectCreation(
                "",
                "user-123"
            )
        ).toBe("name is required");
    });

    it("should reject whitespace-only name", () => {
        expect(
            validateProjectCreation(
                "   ",
                "user-123"
            )
        ).toBe("name is required");
    });

    it("should reject missing ownerId", () => {
        expect(
            validateProjectCreation(
                "FlagForge Demo",
                undefined
            )
        ).toBe("ownerId is required");
    });

    it("should reject empty ownerId", () => {
        expect(
            validateProjectCreation(
                "FlagForge Demo",
                ""
            )
        ).toBe("ownerId is required");
    });
});