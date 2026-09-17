import type { Request, Response } from "express";
import {
    createFeatureFlag,
    getFeatureFlagsByEnvironment,
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