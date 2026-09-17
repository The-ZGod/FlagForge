import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";

import {
    createProjectHandler,
    getProjectsHandler,
} from "./project.controller.js";

const router = Router();

router.post("/", authenticate, createProjectHandler);
router.get("/", authenticate, getProjectsHandler);

export default router;