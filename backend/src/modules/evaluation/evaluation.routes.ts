import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import { authenticateApiKey } from "../../middleware/api-key-auth.js";

import {
    evaluateFeatureFlagHandler,
    evaluateFeatureFlagDashboardHandler,
    getEvaluationMetricsHandler,
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

router.get(
    "/metrics/:environmentId",
    authenticate,
    getEvaluationMetricsHandler
);

export default router;