/**
 * DroneWatch — in-memory state store.
 *
 * The single authoritative store for drones and routes. No database; everything
 * lives in process memory and is initialized from the seed on startup. All
 * mutation goes through these helpers so the simulator and WS/REST layers share
 * one source of truth.
 */

import type { Drone, Route } from "../../shared/types.ts";
import { seedDrones, seedRoutes } from "./seed.ts";

// Clone the seed so the exported seed arrays remain pristine references.
const drones: Drone[] = structuredClone(seedDrones);
const routes: Route[] = structuredClone(seedRoutes);

// ─── Drones ─────────────────────────────────────────────────────────────────

export function getDrones(): Drone[] {
    return drones;
}

export function getDrone(id: string): Drone | undefined {
    return drones.find((d) => d.id === id);
}

export function findIdleDrone(): Drone | undefined {
    return drones.find((d) => d.status === "idle");
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Bumped on every route mutation; the WS layer compares it between ticks to
// know when to broadcast a fresh `routes:update` snapshot.
let routesVersion = 0;

export function getRoutesVersion(): number {
    return routesVersion;
}

export function getRoutes(): Route[] {
    return routes;
}

export function getRoute(id: string): Route | undefined {
    return routes.find((r) => r.id === id);
}

export function addRoute(route: Route): Route {
    const existing = routes.findIndex((r) => r.id === route.id);
    if (existing >= 0) {
        routes[existing] = route;
    } else {
        routes.push(route);
    }
    routesVersion += 1;
    return route;
}

/** Drop a route (e.g. a completed patrol) so it no longer clutters the map. */
export function removeRoute(id: string): void {
    const index = routes.findIndex((r) => r.id === id);
    if (index >= 0) {
        routes.splice(index, 1);
        routesVersion += 1;
    }
}
