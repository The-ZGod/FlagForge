import { validateFeatureFlagUpdate, validateFeatureFlagCreation } from "./feature-flag.validation.js";

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

describe("validateFeatureFlagCreation", () => {
    it("should accept valid feature flag data", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                50
            )
        ).toBeNull();
    });

    it("should accept optional enabled and rolloutPercentage", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                undefined,
                undefined
            )
        ).toBeNull();
    });

    it("should reject missing environmentId", () => {
        expect(
            validateFeatureFlagCreation(
                undefined,
                "New Checkout",
                "new_checkout",
                true,
                50
            )
        ).toBe("environmentId is required");
    });

    it("should reject empty environmentId", () => {
        expect(
            validateFeatureFlagCreation(
                "",
                "New Checkout",
                "new_checkout",
                true,
                50
            )
        ).toBe("environmentId is required");
    });

    it("should reject missing name", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                undefined,
                "new_checkout",
                true,
                50
            )
        ).toBe("name is required");
    });

    it("should reject empty name", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "",
                "new_checkout",
                true,
                50
            )
        ).toBe("name is required");
    });

    it("should reject missing key", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                undefined,
                true,
                50
            )
        ).toBe("key is required");
    });

    it("should reject empty key", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "",
                true,
                50
            )
        ).toBe("key is required");
    });

    it("should reject non-boolean enabled", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                "true",
                50
            )
        ).toBe("enabled must be a boolean");
    });

    it("should reject rolloutPercentage below 0", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                -1
            )
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should reject rolloutPercentage above 100", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                101
            )
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should reject non-integer rolloutPercentage", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                25.5
            )
        ).toBe(
            "rolloutPercentage must be an integer between 0 and 100"
        );
    });

    it("should accept 0% rollout", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                0
            )
        ).toBeNull();
    });

    it("should accept 100% rollout", () => {
        expect(
            validateFeatureFlagCreation(
                "environment-123",
                "New Checkout",
                "new_checkout",
                true,
                100
            )
        ).toBeNull();
    });
});