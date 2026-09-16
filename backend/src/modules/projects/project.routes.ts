import { Router } from "express";
import {
    createProjectHandler,
    getProjectsHandler,
} from "./project.controller.js";

const router = Router();

router.post("/", createProjectHandler);
router.get("/owner/:ownerId", getProjectsHandler);

export default router;