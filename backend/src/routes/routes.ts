/**
 * DroneWatch — REST router for routes.
 *
 * GET  /api/routes → all known routes.
 * POST /api/routes → register a route, returns the stored Route.
 */

import { Router } from "express";
import type { Route, RoutesResponse } from "../../../shared/types.ts";
import { addRoute, getRoutes } from "../state.ts";

const router = Router();

router.get("/", (_req, res) => {
    const body: RoutesResponse = { routes: getRoutes() };
    res.json(body);
});

router.post("/", (req, res) => {
    const route = req.body as Partial<Route>;

    if (
        !route ||
        typeof route.id !== "string" ||
        typeof route.name !== "string" ||
        typeof route.droneId !== "string" ||
        !Array.isArray(route.waypoints) ||
        route.waypoints.length < 2
    ) {
        res.status(400).json({ error: "Invalid route payload" });
        return;
    }

    const stored = addRoute(route as Route);
    res.status(201).json(stored);
});

export default router;
