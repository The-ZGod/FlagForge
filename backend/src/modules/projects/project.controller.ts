import type { Request, Response } from "express";
import {
    createProject,
    getProjectsByOwner,
} from "./project.service.js";

export async function createProjectHandler(
    req: Request,
    res: Response
) {
    const { name, ownerId } = req.body;

    const project = await createProject(name, ownerId);

    res.status(201).json(project);
}

export async function getProjectsHandler(
    req: Request,
    res: Response
) {
    const { ownerId } = req.params;

    if (typeof ownerId !== "string") {
        res.status(400).json({
            message: "Invalid ownerId",
        });
        return;
    }

    const projects = await getProjectsByOwner(ownerId);

    res.json(projects);
}