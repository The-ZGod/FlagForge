import type { Request, Response } from "express";
import { validateProjectCreation } from "./project.validation.js";
import {
    createProject,
    getProjectsByOwner,
} from "./project.service.js";

export async function createProjectHandler(
    req: Request,
    res: Response
) {
    const { name } = req.body;
    const ownerId = req.userId;

    const validationError = validateProjectCreation(
        name,
        ownerId
    );

    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    const project = await createProject(
        name,
        ownerId
    );

    res.status(201).json(project);
}

export async function getProjectsHandler(
    req: Request,
    res: Response
) {
    const projects = await getProjectsByOwner(req.userId);

    res.json(projects);
}