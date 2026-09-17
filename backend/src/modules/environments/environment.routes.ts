import { Router } from "express";
import {
    createEnvironmentHandler,
    getEnvironmentsHandler,
    updateEnvironmentHandler,
    deleteEnvironmentHandler,
} from "./environment.controller.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post("/", authenticate, createEnvironmentHandler);
router.get("/project/:projectId", authenticate, getEnvironmentsHandler);
router.patch("/:environmentId", authenticate, updateEnvironmentHandler);
router.delete("/:environmentId", authenticate, deleteEnvironmentHandler);

export default router;