import express from "express";
import projectRoutes from "./modules/projects/project.routes.js";
import environmentRoutes from "./modules/environments/environment.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "FlagForge API is running",
    });
});

app.use("/api/projects", projectRoutes);
app.use("/api/environments", environmentRoutes);

export default app;