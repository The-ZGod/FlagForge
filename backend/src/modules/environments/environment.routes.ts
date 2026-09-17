import { Router } from "express";
import {
    createEnvironmentHandler,
    getEnvironmentsHandler,
    updateEnvironmentHandler,
} from "./environment.controller.js";

const router = Router();

router.post("/", createEnvironmentHandler);
router.get("/project/:projectId", getEnvironmentsHandler);
router.patch("/:environmentId", updateEnvironmentHandler);

export default router;