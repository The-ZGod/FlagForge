import type { NextFunction, Request, Response } from "express";

import { authenticateApiKey } from "./api-key-auth.js";
import { findEnvironmentByApiKey } from "../modules/api-keys/api-key.service.js";

jest.mock(
    "../modules/api-keys/api-key.service.js",
    () => ({
        findEnvironmentByApiKey: jest.fn(),
    })
);

describe("API Key Authentication Middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function createMockResponse() {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        return res as unknown as Response;
    }

    it("should reject requests without an API key", async () => {
        const req = {
            headers: {},
        } as Request;

        const res = createMockResponse();
        const next = jest.fn() as NextFunction;

        await authenticateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "API key is required",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should reject requests with an invalid API key", async () => {
        (
            findEnvironmentByApiKey as jest.Mock
        ).mockResolvedValue(null);

        const req = {
            headers: {
                "x-flagforge-key": "ff_live_invalid",
            },
        } as Request;

        const res = createMockResponse();
        const next = jest.fn() as NextFunction;

        await authenticateApiKey(req, res, next);

        expect(findEnvironmentByApiKey).toHaveBeenCalledWith(
            "ff_live_invalid"
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid API key",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should authenticate a valid API key", async () => {
        (
            findEnvironmentByApiKey as jest.Mock
        ).mockResolvedValue({
            environmentId: "environment-123",
        });

        const req = {
            headers: {
                "x-flagforge-key": "ff_live_valid",
            },
        } as Request;

        const res = createMockResponse();
        const next = jest.fn() as NextFunction;

        await authenticateApiKey(req, res, next);

        expect(req.environmentId).toBe(
            "environment-123"
        );

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });
});