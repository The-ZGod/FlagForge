import { Router } from "express";
import { evaluateFeatureFlagHandler } from "./evaluation.controller.js";

const router = Router();

router.post("/", evaluateFeatureFlagHandler);

export default router;