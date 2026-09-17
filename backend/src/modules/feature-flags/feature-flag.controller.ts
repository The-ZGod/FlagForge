import type { Request, Response } from "express";
import {
    validateFeatureFlagCreation,
    validateFeatureFlagUpdate,
} from "./feature-flag.validation.js";

import {
    createFeatureFlag,
    getFeatureFlagsByEnvironment,
    updateFeatureFlag,
    deleteFeatureFlag,
    getFeatureFlagById,
} from "./feature-flag.service.js";

export async function createFeatureFlagHandler(
    req: Request,
    res: Response
) {
    const {
        environmentId,
        name,
        key,
        enabled,
        rolloutPercentage,
    } = req.body;

    const validationError = validateFeatureFlagCreation(
        environmentId,
        name,
        key,
        enabled,
        rolloutPercentage
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    const featureFlag = await createFeatureFlag(
        environmentId,
        name,
        key,
        enabled,
        rolloutPercentage
    );

    res.status(201).json(featureFlag);
}

export async function getFeatureFlagsHandler(
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

    const featureFlags =
        await getFeatureFlagsByEnvironment(environmentId);

    res.json(featureFlags);
}

export async function updateFeatureFlagHandler(
    req: Request,
    res: Response
) {
    const { flagId } = req.params;
    const { enabled, rolloutPercentage } = req.body;

    const validationError = validateFeatureFlagUpdate(
        enabled,
        rolloutPercentage
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    if (typeof flagId !== "string") {
        res.status(400).json({
            message: "Invalid flagId",
        });
        return;
    }

    const featureFlag = await updateFeatureFlag(
        flagId,
        enabled,
        rolloutPercentage
    );

    res.json(featureFlag);
}

export async function deleteFeatureFlagHandler(
    req: Request,
    res: Response
) {
    const { flagId } = req.params;

    if (typeof flagId !== "string") {
        res.status(400).json({
            message: "Invalid flagId",
        });
        return;
    }

    await deleteFeatureFlag(flagId);

    res.status(204).send();
}

export async function getFeatureFlagByIdHandler(
    req: Request,
    res: Response
) {
    const { flagId } = req.params;

    if (typeof flagId !== "string") {
        res.status(400).json({
            message: "Invalid flagId",
        });
        return;
    }

    const featureFlag = await getFeatureFlagById(flagId);

    if (!featureFlag) {
        res.status(404).json({
            message: "Feature flag not found",
        });
        return;
    }

    res.json(featureFlag);
}

