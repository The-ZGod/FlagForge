import type { Request, Response } from "express";

import { generateEnvironmentApiKey } from "./api-key.service.js";
import { getEnvironmentWithOwner } from "../environments/environment.service.js";

export async function generateEnvironmentApiKeyHandler(
    req: Request,
    res: Response
) {
    const { environmentId } = req.params;

    if (typeof environmentId !== "string") {
        res.status(400).json({
            message: "Invalid environmentId",
        });
        return;
    }

    const environment =
        await getEnvironmentWithOwner(environmentId);

    if (!environment) {
        res.status(404).json({
            message: "Environment not found",
        });
        return;
    }

    if (environment.project.ownerId !== req.userId) {
        res.status(403).json({
            message: "You do not have access to this environment",
        });
        return;
    }

    const result =
        await generateEnvironmentApiKey(environmentId);

    res.status(201).json(result);
}