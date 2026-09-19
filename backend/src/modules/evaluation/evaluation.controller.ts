import type { Request, Response } from "express";

import { evaluateFeatureFlag } from "./evaluation.service.js";
import { getEvaluationMetrics } from "./evaluation.metrics.js";
import { environmentBelongsToUser } from "../feature-flags/feature-flag.service.js";


function validateEvaluationInput(
    flagKey: unknown,
    userId: unknown,
    attributes: unknown
): string | null {
    if (
        typeof flagKey !== "string" ||
        flagKey.trim().length === 0
    ) {
        return "flagKey is required";
    }

    if (
        typeof userId !== "string" ||
        userId.trim().length === 0
    ) {
        return "userId is required";
    }

    if (
        attributes !== undefined &&
        (
            typeof attributes !== "object" ||
            attributes === null ||
            Array.isArray(attributes)
        )
    ) {
        return "attributes must be an object";
    }

    if (attributes !== undefined) {
        for (const value of Object.values(
            attributes as Record<string, unknown>
        )) {
            if (typeof value !== "string") {
                return "attribute values must be strings";
            }
        }
    }

    return null;
}

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

    const validationError = validateEvaluationInput(
        flagKey,
        userId,
        attributes
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
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

export async function evaluateFeatureFlagDashboardHandler(
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

    const validationError = validateEvaluationInput(
        flagKey,
        userId,
        attributes
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    const hasAccess = await environmentBelongsToUser(
        environmentId,
        req.userId
    );

    if (!hasAccess) {
        res.status(403).json({
            message: "You do not have access to this environment",
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

export async function getEvaluationMetricsHandler(
    req: Request,
    res: Response
) {
    const { environmentId } = req.params;

    if (
        typeof environmentId !== "string" ||
        environmentId.trim().length === 0
    ) {
        res.status(400).json({
            message: "Invalid environmentId",
        });
        return;
    }

    const hasAccess = await environmentBelongsToUser(
        environmentId,
        req.userId
    );

    if (!hasAccess) {
        res.status(403).json({
            message: "You do not have access to this environment",
        });
        return;
    }

    const metrics = getEvaluationMetrics(environmentId);

    res.json(metrics);
}