import { Router } from "express";
import {
    createFeatureFlagHandler,
    getFeatureFlagsHandler,
} from "./feature-flag.controller.js";

const router = Router();

router.post("/", createFeatureFlagHandler);
router.get("/environment/:environmentId", getFeatureFlagsHandler);

export default router;