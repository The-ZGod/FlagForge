import { validateFeatureFlagUpdate } from "./feature-flag.validation.js";

describe("validateFeatureFlagUpdate", () => {
    it("should accept valid values", () => {
        expect(
            validateFeatureFlagUpdate(true, 50)
        ).toBeNull();
    });

    it("should accept only rolloutPercentage", () => {
        expect(
            validateFeatureFlagUpdate(undefined, 20)
        ).toBeNull();
    });

    it("should accept only enabled", () => {
        expect(
            validateFeatureFlagUpdate(false, undefined)
        ).toBeNull();
    });

    it("should reject non-boolean enabled", () => {
        expect(
            validateFeatureFlagUpdate("true", 50)
        ).toBe("enabled must be a boolean");
    });

    it("should reject rolloutPercentage below 0", () => {
        expect(
            validateFeatureFlagUpdate(true, -1)
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should reject rolloutPercentage above 100", () => {
        expect(
            validateFeatureFlagUpdate(true, 101)
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should reject non-integer rolloutPercentage", () => {
        expect(
            validateFeatureFlagUpdate(true, 25.5)
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should accept 0% rollout", () => {
        expect(
            validateFeatureFlagUpdate(true, 0)
        ).toBeNull();
    });

    it("should accept 100% rollout", () => {
        expect(
            validateFeatureFlagUpdate(true, 100)
        ).toBeNull();
    });
});