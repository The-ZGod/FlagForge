import { Router } from "express";
import {
    createEnvironmentHandler,
    getEnvironmentsHandler,
} from "./environment.controller.js";

const router = Router();

router.post("/", createEnvironmentHandler);
router.get("/project/:projectId", getEnvironmentsHandler);

export default router;