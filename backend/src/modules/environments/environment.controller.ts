import type { Request, Response } from "express";
import {
    createEnvironment,
    getEnvironmentsByProject,
    updateEnvironment,
} from "./environment.service.js";

export async function createEnvironmentHandler(
    req: Request,
    res: Response
) {
    const { projectId, name, key } = req.body;

    const environment = await createEnvironment(
        projectId,
        name,
        key
    );

    res.status(201).json(environment);
}

export async function getEnvironmentsHandler(
    req: Request,
    res: Response
) {
    const { projectId } = req.params;

    if (typeof projectId !== "string") {
        res.status(400).json({
            message: "Invalid projectId",
        });
        return;
    }

    const environments =
        await getEnvironmentsByProject(projectId);

    res.json(environments);
}

export async function updateEnvironmentHandler(
    req: Request,
    res: Response
) {
    const { environmentId } = req.params;
    const { name, key } = req.body;

    if (typeof environmentId !== "string") {
        res.status(400).json({
            message: "Invalid environmentId",
        });
        return;
    }

    const environment = await updateEnvironment(
        environmentId,
        name,
        key
    );

    res.json(environment);
}