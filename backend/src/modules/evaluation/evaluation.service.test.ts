import {
    getRolloutBucket,
    isBucketInRollout,
    evaluateFeatureFlag,
} from "./evaluation.service.js";

import { prisma } from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
    prisma: {
        featureFlag: {
            findUnique: jest.fn(),
        },
    },
}));

describe("Evaluation Service", () => {
    describe("getRolloutBucket", () => {
        it("should return the same bucket for the same user and flag", () => {
            const first = getRolloutBucket(
                "user-123",
                "new_checkout"
            );

            const second = getRolloutBucket(
                "user-123",
                "new_checkout"
            );

            expect(first).toBe(second);
        });

        it("should return a bucket between 0 and 99", () => {
            const bucket = getRolloutBucket(
                "user-123",
                "new_checkout"
            );

            expect(bucket).toBeGreaterThanOrEqual(0);
            expect(bucket).toBeLessThan(100);
        });

        it("should produce different buckets for different users", () => {
            const userA = getRolloutBucket(
                "user-123",
                "new_checkout"
            );

            const userB = getRolloutBucket(
                "user-456",
                "new_checkout"
            );

            expect(userA).not.toBe(userB);
        });

        it("should approximately match a 10% rollout across many users", () => {
            const totalUsers = 10_000;
            const rolloutPercentage = 10;

            let enabledUsers = 0;

            for (let i = 0; i < totalUsers; i++) {
                const bucket = getRolloutBucket(
                    `user-${i}`,
                    "new_checkout"
                );

                if (isBucketInRollout(bucket, rolloutPercentage)) {
                    enabledUsers++;
                }
            }

            const actualPercentage =
                (enabledUsers / totalUsers) * 100;

            console.log(
                `Configured rollout: ${rolloutPercentage}%`
            );
            console.log(
                `Users tested: ${totalUsers}`
            );
            console.log(
                `Users enabled: ${enabledUsers}`
            );
            console.log(
                `Actual rollout: ${actualPercentage.toFixed(2)}%`
            );

            expect(actualPercentage).toBeGreaterThan(8);
            expect(actualPercentage).toBeLessThan(12);
        });
    });

    describe("isBucketInRollout", () => {
        it("should disable everyone for 0% rollout", () => {
            expect(isBucketInRollout(0, 0)).toBe(false);
            expect(isBucketInRollout(50, 0)).toBe(false);
            expect(isBucketInRollout(99, 0)).toBe(false);
        });

        it("should enable everyone for 100% rollout", () => {
            expect(isBucketInRollout(0, 100)).toBe(true);
            expect(isBucketInRollout(50, 100)).toBe(true);
            expect(isBucketInRollout(99, 100)).toBe(true);
        });

        it("should correctly evaluate a 20% rollout", () => {
            expect(isBucketInRollout(0, 20)).toBe(true);
            expect(isBucketInRollout(19, 20)).toBe(true);
            expect(isBucketInRollout(20, 20)).toBe(false);
            expect(isBucketInRollout(99, 20)).toBe(false);
        });

        it("should enable every bucket for 100% rollout", () => {
            for (let bucket = 0; bucket < 100; bucket++) {
                expect(isBucketInRollout(bucket, 100)).toBe(true);
            }
        });

        it("should disable every bucket for 0% rollout", () => {
            for (let bucket = 0; bucket < 100; bucket++) {
                expect(isBucketInRollout(bucket, 0)).toBe(false);
            }
        });
        
    });

    describe("evaluateFeatureFlag - targeting rules", () => {
        it("should enable the flag when targeting rules match", async () => {
            (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
                key: "new_checkout",
                enabled: true,
                rolloutPercentage: 100,
                rules: [
                    {
                        attribute: "country",
                        operator: "EQUALS",
                        value: "IN",
                    },
                ],
            });

            const result = await evaluateFeatureFlag(
                "environment-123",
                "new_checkout",
                "user-123",
                {
                    country: "IN",
                }
            );

            expect(result).toEqual({
                enabled: true,
                reason: "FULL_ROLLOUT",
            });
        });

        it("should disable the flag when targeting rules do not match", async () => {
            (prisma.featureFlag.findUnique as jest.Mock).mockResolvedValue({
                key: "new_checkout",
                enabled: true,
                rolloutPercentage: 100,
                rules: [
                    {
                        attribute: "country",
                        operator: "EQUALS",
                        value: "IN",
                    },
                ],
            });

            const result = await evaluateFeatureFlag(
                "environment-123",
                "new_checkout",
                "user-123",
                {
                    country: "US",
                }
            );

            expect(result).toEqual({
                enabled: false,
                reason: "TARGETING_RULE_NOT_MATCHED",
            });
        });
    });
});