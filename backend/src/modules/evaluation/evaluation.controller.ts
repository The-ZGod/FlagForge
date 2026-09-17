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
        typeof flagKey !== "string" ||
        typeof userId !== "string"
    ) {
        res.status(400).json({
            message: "environmentId and flagKey are required",
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