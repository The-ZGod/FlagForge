import { Router } from "express";
import {
    createEnvironmentHandler,
    getEnvironmentsHandler,
    updateEnvironmentHandler,
    deleteEnvironmentHandler,
} from "./environment.controller.js";

const router = Router();

router.post("/", createEnvironmentHandler);
router.get("/project/:projectId", getEnvironmentsHandler);
router.patch("/:environmentId", updateEnvironmentHandler);
router.delete("/:environmentId", deleteEnvironmentHandler);

export default router;