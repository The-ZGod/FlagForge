import express from "express";
import projectRoutes from "./modules/projects/project.routes.js";
import environmentRoutes from "./modules/environments/environment.routes.js";
import featureFlagRoutes from "./modules/feature-flags/feature-flag.routes.js";
import evaluationRoutes from "./modules/evaluation/evaluation.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import featureFlagRuleRoutes from "./modules/feature-flags/feature-flag-rule.routes.js";

const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (_req, res) => {
  res.json({
    message: "FlagForge API is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/environments", environmentRoutes);
app.use("/api/feature-flags", featureFlagRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/flag-rules", featureFlagRuleRoutes);

app.use(errorHandler);

export default app;