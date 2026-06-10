/**
 * DroneWatch — REST router for drones.
 *
 * GET /api/drones → initial fleet snapshot
 */

import { Router } from "express";
import type { DronesResponse } from "../../../shared/types.ts";
import { getDrones } from "../state.ts";

const router = Router();

router.get("/", (_req, res) => {
    const body: DronesResponse = { drones: getDrones() };
    res.json(body);
});

export default router;
