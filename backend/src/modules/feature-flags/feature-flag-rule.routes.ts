import { Router } from "express";
import {
    createFlagRuleHandler,
    getFlagRulesHandler,
    deleteFlagRuleHandler,
} from "./feature-flag-rule.controller.js";

const router = Router();

router.post("/", createFlagRuleHandler);
router.get("/flag/:featureFlagId", getFlagRulesHandler);
router.delete("/:ruleId", deleteFlagRuleHandler);

export default router;