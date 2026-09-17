import { prisma } from "../../lib/prisma.js";
import { getFeatureFlagById } from "./feature-flag.service.js";

describe("getFeatureFlagById", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns a feature flag when it exists", async () => {
        const mockFeatureFlag = {
            id: "flag-123",
            name: "Test Flag",
            key: "test_flag",
            enabled: true,
            rolloutPercentage: 50,
            environmentId: "env-123",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        jest
            .spyOn(prisma.featureFlag, "findUnique")
            .mockResolvedValue(mockFeatureFlag);

        const result = await getFeatureFlagById("flag-123");

        expect(result).toEqual(mockFeatureFlag);

        expect(prisma.featureFlag.findUnique).toHaveBeenCalledWith({
            where: {
                id: "flag-123",
            },
        });
    });
});

it("returns null when the feature flag does not exist", async () => {
    jest
        .spyOn(prisma.featureFlag, "findUnique")
        .mockResolvedValue(null);

    const result = await getFeatureFlagById("nonexistent-flag");

    expect(result).toBeNull();

    expect(prisma.featureFlag.findUnique).toHaveBeenCalledWith({
        where: {
            id: "nonexistent-flag",
        },
    });
});