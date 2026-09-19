import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import { authenticateApiKey } from "../../middleware/api-key-auth.js";

import {
    evaluateFeatureFlagHandler,
    evaluateFeatureFlagDashboardHandler,
} from "./evaluation.controller.js";

const router = Router();

// SDK / runtime evaluation
router.post(
    "/",
    authenticateApiKey,
    evaluateFeatureFlagHandler
);

// Dashboard evaluation
router.post(
    "/dashboard",
    authenticate,
    evaluateFeatureFlagDashboardHandler
);

export default router;