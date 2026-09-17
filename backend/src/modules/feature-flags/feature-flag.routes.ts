import { Router } from "express";
import {
    createFeatureFlagHandler,
    getFeatureFlagsHandler,
    getFeatureFlagByIdHandler,
    updateFeatureFlagHandler,
    deleteFeatureFlagHandler,
} from "./feature-flag.controller.js";

const router = Router();

router.post("/", createFeatureFlagHandler);
router.get("/environment/:environmentId", getFeatureFlagsHandler);
router.get("/:flagId", getFeatureFlagByIdHandler);
router.patch("/:flagId", updateFeatureFlagHandler);
router.delete("/:flagId", deleteFeatureFlagHandler);

export default router;