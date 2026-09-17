import { Router } from "express";
import {
    createFeatureFlagHandler,
    getFeatureFlagsHandler,
    updateFeatureFlagHandler,
} from "./feature-flag.controller.js";

const router = Router();

router.post("/", createFeatureFlagHandler);
router.get("/environment/:environmentId", getFeatureFlagsHandler);
router.patch("/:flagId", updateFeatureFlagHandler);

export default router;