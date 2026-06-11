/**
 * DroneWatch — backend bootstrap.
 *
 * Wires Express (CORS + REST routers), creates the HTTP server, attaches the
 * WebSocket server, seeds simulator progress, and starts the tick loop that
 * advances the fleet and broadcasts `drones:update` every TICK_MS.
 */

import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import type { HealthResponse } from "../../shared/types.ts";
import dronesRouter from "./routes/drones.ts";
import routesRouter from "./routes/routes.ts";
import { attachWebSocketServer } from "./wsServer.ts";
import { initProgress, tick, TICK_MS } from "./simulator.ts";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());

// Liveness probe
app.get("/api/health", (_req, res) => {
    const body: HealthResponse = { status: "ok" };
    res.json(body);
});

// REST routes
app.use("/api/drones", dronesRouter);
app.use("/api/routes", routesRouter);

// HTTP server + WebSocket
const server = createServer(app);
const hub = attachWebSocketServer(server);

// Simulator loop: advance the fleet, then push to all clients. Route changes
// (mission created, patrol completed) piggyback on the same cadence.
initProgress();
setInterval(() => {
    tick();
    hub.broadcastDrones();
    hub.broadcastRoutesIfChanged();
}, TICK_MS);

server.listen(PORT, () => {
    console.log(`[dronewatch] backend listening on http://localhost:${PORT}`);
    console.log(`[dronewatch] simulator ticking every ${TICK_MS}ms`);
});
