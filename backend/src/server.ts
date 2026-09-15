import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (_req, res) => {
    res.json({
        message: "FlagForge API is running",
    });
});

app.listen(PORT, () => {
    console.log(`FlagForge API running on port ${PORT}`);
});