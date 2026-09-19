import type { Request, Response } from "express";
import { getActivitiesByUser } from "./activity.service.js";

export async function getActivitiesHandler(
    req: Request,
    res: Response
) {
    const activities = await getActivitiesByUser(req.userId);

    res.json(activities);
}