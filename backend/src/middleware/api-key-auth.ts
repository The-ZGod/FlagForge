import type { NextFunction, Request, Response } from "express";

import { findEnvironmentByApiKey } from "../modules/api-keys/api-key.service.js";

declare global {
    namespace Express {
        interface Request {
            environmentId?: string;
        }
    }
}

export async function authenticateApiKey(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.headers["x-flagforge-key"];

    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
        res.status(401).json({
            message: "API key is required",
        });
        return;
    }

    const environment =
        await findEnvironmentByApiKey(apiKey);

    if (!environment) {
        res.status(401).json({
            message: "Invalid API key",
        });
        return;
    }

    req.environmentId = environment.environmentId;

    next();
}