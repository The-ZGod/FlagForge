import {
    generateEnvironmentApiKey,
    findEnvironmentByApiKey,
} from "./api-key.service.js";

import { prisma } from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({
    prisma: {
        environmentApiKey: {
            upsert: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

describe("API Key Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("generateEnvironmentApiKey", () => {
        it("should generate and store a hashed API key", async () => {
            (
                prisma.environmentApiKey.upsert as jest.Mock
            ).mockResolvedValue({
                id: "api-key-123",
                environmentId: "environment-123",
                keyHash: "hashed-key",
                keyPrefix: "ff_live_123456",
            });

            const result = await generateEnvironmentApiKey(
                "environment-123"
            );

            expect(result.apiKey).toMatch(/^ff_live_[a-f0-9]{64}$/);
            expect(result.keyPrefix).toBe(
                result.apiKey.slice(0, 16)
            );

            expect(
                prisma.environmentApiKey.upsert
            ).toHaveBeenCalledTimes(1);

            const call =
                (prisma.environmentApiKey.upsert as jest.Mock)
                    .mock.calls[0][0];

            expect(call.where).toEqual({
                environmentId: "environment-123",
            });

            expect(call.create.environmentId).toBe(
                "environment-123"
            );

            expect(call.create.keyHash).not.toBe(
                result.apiKey
            );

            expect(call.create.keyPrefix).toBe(
                result.keyPrefix
            );
        });

        it("should replace the existing key for the same environment", async () => {
            (
                prisma.environmentApiKey.upsert as jest.Mock
            ).mockResolvedValue({});

            await generateEnvironmentApiKey(
                "environment-123"
            );

            await generateEnvironmentApiKey(
                "environment-123"
            );

            expect(
                prisma.environmentApiKey.upsert
            ).toHaveBeenCalledTimes(2);

            const firstCall =
                (prisma.environmentApiKey.upsert as jest.Mock)
                    .mock.calls[0][0];

            const secondCall =
                (prisma.environmentApiKey.upsert as jest.Mock)
                    .mock.calls[1][0];

            expect(firstCall.where).toEqual({
                environmentId: "environment-123",
            });

            expect(secondCall.where).toEqual({
                environmentId: "environment-123",
            });

            expect(firstCall.update.keyHash).not.toBe(
                secondCall.update.keyHash
            );

            expect(firstCall.update.keyPrefix).not.toBe(
                secondCall.update.keyPrefix
            );
        });
    });

    describe("findEnvironmentByApiKey", () => {
        it("should return the environment for a valid API key", async () => {
            (
                prisma.environmentApiKey.findUnique as jest.Mock
            ).mockResolvedValue({
                environmentId: "environment-123",
            });

            const result = await findEnvironmentByApiKey(
                "ff_live_test-key"
            );

            expect(result).toEqual({
                environmentId: "environment-123",
            });

            expect(
                prisma.environmentApiKey.findUnique
            ).toHaveBeenCalledTimes(1);
        });

        it("should return null for an invalid API key", async () => {
            (
                prisma.environmentApiKey.findUnique as jest.Mock
            ).mockResolvedValue(null);

            const result = await findEnvironmentByApiKey(
                "ff_live_invalid-key"
            );

            expect(result).toBeNull();

            expect(
                prisma.environmentApiKey.findUnique
            ).toHaveBeenCalledTimes(1);
        });
    });
});