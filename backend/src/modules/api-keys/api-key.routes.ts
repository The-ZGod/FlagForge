import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import {
    generateEnvironmentApiKeyHandler,
} from "./api-key.controller.js";

const router = Router();

router.post(
    "/environment/:environmentId",
    authenticate,
    generateEnvironmentApiKeyHandler
);

export default router;
