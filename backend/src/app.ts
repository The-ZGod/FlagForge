import express from "express";
import projectRoutes from "./modules/projects/project.routes.js";
import environmentRoutes from "./modules/environments/environment.routes.js";
import featureFlagRoutes from "./modules/feature-flags/feature-flag.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "FlagForge API is running",
    });
});

app.use("/api/projects", projectRoutes);
app.use("/api/environments", environmentRoutes);
app.use("/api/feature-flags", featureFlagRoutes);

export default app;