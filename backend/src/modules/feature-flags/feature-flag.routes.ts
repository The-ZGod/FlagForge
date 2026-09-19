import { Router } from "express";

import {
    createFeatureFlagHandler,
    getFeatureFlagsHandler,
    getFeatureFlagByIdHandler,
    updateFeatureFlagHandler,
    deleteFeatureFlagHandler,
} from "./feature-flag.controller.js";

import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post(
    "/",
    authenticate,
    createFeatureFlagHandler
);

router.get(
    "/environment/:environmentId",
    authenticate,
    getFeatureFlagsHandler
);

router.get(
    "/:flagId",
    authenticate,
    getFeatureFlagByIdHandler
);

router.patch(
    "/:flagId",
    authenticate,
    updateFeatureFlagHandler
);

router.delete(
    "/:flagId",
    authenticate,
    deleteFeatureFlagHandler
);

export default router;