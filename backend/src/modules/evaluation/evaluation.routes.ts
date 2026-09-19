import { Router } from "express";

import { authenticateApiKey } from "../../middleware/api-key-auth.js";
import { evaluateFeatureFlagHandler } from "./evaluation.controller.js";

const router = Router();

router.post(
    "/",
    authenticateApiKey,
    evaluateFeatureFlagHandler
);

export default router;