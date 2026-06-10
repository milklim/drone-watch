import express from "express";
import cors from "cors";
import type { HealthResponse } from "../../shared/types.ts";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// Liveness probe
app.get("/api/health", (_req, res) => {
    const body: HealthResponse = { status: "ok" };
    res.json(body);
});

// NOTE: REST routes, WebSocket server, and the simulator loop will be implemented later.

app.listen(PORT, () => {
    console.log(`[dronewatch] backend listening on http://localhost:${PORT}`);
});
