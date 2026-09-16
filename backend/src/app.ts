import express from "express";
import projectRoutes from "./modules/projects/project.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "FlagForge API is running",
    });
});

app.use("/api/projects", projectRoutes);

export default app;