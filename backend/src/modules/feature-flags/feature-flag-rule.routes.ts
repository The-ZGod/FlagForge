import { Router } from "express";

import {
    createFlagRuleHandler,
    getFlagRulesHandler,
    deleteFlagRuleHandler,
} from "./feature-flag-rule.controller.js";

import { authenticate } from "../../middleware/auth.js";

const router = Router();

router.post(
    "/",
    authenticate,
    createFlagRuleHandler
);

router.get(
    "/flag/:featureFlagId",
    authenticate,
    getFlagRulesHandler
);

router.delete(
    "/:ruleId",
    authenticate,
    deleteFlagRuleHandler
);

export default router;