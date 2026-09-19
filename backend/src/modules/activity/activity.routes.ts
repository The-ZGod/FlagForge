import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { getActivitiesHandler } from "./activity.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    getActivitiesHandler
);

export default router;