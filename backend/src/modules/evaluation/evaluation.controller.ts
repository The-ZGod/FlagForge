import type { Request, Response } from "express";
import { evaluateFeatureFlag } from "./evaluation.service.js";

export async function evaluateFeatureFlagHandler(
    req: Request,
    res: Response
) {
    const {
        environmentId,
        flagKey,
        userId,
        attributes,
    } = req.body;

    if (
        typeof environmentId !== "string" ||
        environmentId.trim().length === 0
    ) {
        res.status(400).json({
            message: "environmentId is required",
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

    const result = await evaluateFeatureFlag(
        environmentId,
        flagKey,
        userId,
        attributes
    );

    res.json(result);
}