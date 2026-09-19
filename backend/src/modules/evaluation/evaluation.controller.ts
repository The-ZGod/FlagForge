import type { Request, Response } from "express";
import { evaluateFeatureFlag } from "./evaluation.service.js";

export async function evaluateFeatureFlagHandler(
    req: Request,
    res: Response
) {
    const {
        flagKey,
        userId,
        attributes,
    } = req.body;

    const environmentId = req.environmentId;

    if (
        typeof environmentId !== "string" ||
        environmentId.trim().length === 0
    ) {
        res.status(401).json({
            message: "Invalid API key",
        });
        return;
    }

    if (
        typeof flagKey !== "string" ||
        flagKey.trim().length === 0
    ) {
        res.status(400).json({
            message: "flagKey is required",
        });
        return;
    }

    if (
        typeof userId !== "string" ||
        userId.trim().length === 0
    ) {
        res.status(400).json({
            message: "userId is required",
        });
        return;
    }

    if (
        attributes !== undefined &&
        (
            typeof attributes !== "object" ||
            attributes === null ||
            Array.isArray(attributes)
        )
    ) {
        res.status(400).json({
            message: "attributes must be an object",
        });
        return;
    }

    if (attributes !== undefined) {
        for (const value of Object.values(attributes)) {
            if (typeof value !== "string") {
                res.status(400).json({
                    message: "attribute values must be strings",
                });
                return;
            }
        }
    }

    const result = await evaluateFeatureFlag(
        environmentId,
        flagKey,
        userId,
        attributes
    );

    res.json(result);
}