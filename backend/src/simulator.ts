/**
 * DroneWatch — drone movement engine.
 *
 * The backend is the *only* mover. Each tick we advance every active drone along
 * its assigned route by linear interpolation between waypoints, recompute its
 * heading (bearing toward the next waypoint), and slowly drain its battery.
 * A patrol is a single lap: after the last waypoint the drone flies back to the
 * start point, parks there, and returns to `idle` (ready for a new mission).
 * Idle and offline drones never move.
 *
 * Per-drone progress (which segment, and 0..1 along it) lives here, not on the
 * Drone object — the contract only exposes derived state (position, heading,
 * routeIndex).
 */

import type { Drone, LatLng } from "../../shared/types.ts";
import { getDrones, getRoute, removeRoute } from "./state.ts";

export const TICK_MS = 500;

const BATTERY_DRAIN_PER_TICK = 0.05; // ~6% per minute while active

// segIndex = index of the waypoint the drone is leaving; it travels toward
// (segIndex + 1) % waypoints.length. `t` is fractional progress along that
// segment (0 = at segIndex, 1 = at the target).
interface Progress {
    segIndex: number;
    t: number;
}

const progress = new Map<string, Progress>();

// ─── Geo helpers ────────────────────────────────────────────────────────────

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Linear interpolation between two coordinates. */
export function lerp(from: LatLng, to: LatLng, t: number): LatLng {
    return {
        lat: from.lat + (to.lat - from.lat) * t,
        lng: from.lng + (to.lng - from.lng) * t,
    };
}

/** Initial bearing from `from` to `to`, in degrees 0..360 (0 = north). */
export function bearing(from: LatLng, to: LatLng): number {
    const phi1 = toRad(from.lat);
    const phi2 = toRad(to.lat);
    const dLng = toRad(to.lng - from.lng);
    const y = Math.sin(dLng) * Math.cos(phi2);
    const x =
        Math.cos(phi1) * Math.sin(phi2) -
        Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle distance between two coordinates, in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

// ─── Progress lifecycle ─────────────────────────────────────────────────────

/** (Re)start a drone at the beginning of its route. */
export function resetProgress(droneId: string): void {
    progress.set(droneId, { segIndex: 0, t: 0 });
}

/** Drop progress for a drone (e.g. when it stops). */
export function clearProgress(droneId: string): void {
    progress.delete(droneId);
}

/** Seed progress for every drone that starts active. Call once on startup. */
export function initProgress(): void {
    for (const drone of getDrones()) {
        if (drone.status === "active") {
            resetProgress(drone.id);
        }
    }
}

// ─── Tick ───────────────────────────────────────────────────────────────────

/**
 * Park the drone at the route's start point and return it to standby. The
 * flown route is removed — completed patrols shouldn't clutter the map.
 */
function completePatrol(drone: Drone, start: LatLng): void {
    drone.position = { ...start };
    drone.status = "idle";
    drone.speedKmh = 0;
    drone.routeIndex = 0;
    if (drone.missionId) removeRoute(drone.missionId);
    drone.missionId = null;
    clearProgress(drone.id);
}

function advanceDrone(drone: Drone): void {
    // Resolve via the drone's own mission, not a route→drone scan: after a
    // reassignment, multiple routes may name the same drone, but `missionId`
    // is always the current one.
    const route = drone.missionId ? getRoute(drone.missionId) : undefined;
    if (!route || route.waypoints.length < 2) return;

    const wps = route.waypoints;
    const n = wps.length;

    let prog = progress.get(drone.id);
    if (!prog) {
        prog = { segIndex: 0, t: 0 };
        progress.set(drone.id, prog);
    }

    // Distance to cover this tick, in km.
    let remainingKm = drone.speedKmh * (TICK_MS / 3_600_000);

    // Walk forward across as many segments as the tick distance spans. The lap
    // ends when the closing segment (last waypoint → start) is finished.
    let guard = n * 2; // safety against zero-length-segment loops
    while (remainingKm > 0 && guard-- > 0) {
        const from = wps[prog.segIndex];
        const to = wps[(prog.segIndex + 1) % n];
        const segLen = distanceKm(from, to);

        const finishesSegment =
            segLen === 0 || remainingKm >= segLen * (1 - prog.t);
        if (finishesSegment && prog.segIndex === n - 1) {
            completePatrol(drone, wps[0]);
            return;
        }

        if (segLen === 0) {
            prog.segIndex += 1;
            prog.t = 0;
            continue;
        }

        const remainingOnSeg = segLen * (1 - prog.t);
        if (remainingKm < remainingOnSeg) {
            prog.t += remainingKm / segLen;
            remainingKm = 0;
        } else {
            remainingKm -= remainingOnSeg;
            prog.segIndex += 1;
            prog.t = 0;
        }
    }

    const from = wps[prog.segIndex];
    const to = wps[(prog.segIndex + 1) % n];

    drone.position = lerp(from, to, prog.t);
    drone.heading = Math.round(bearing(from, to));
    drone.routeIndex = (prog.segIndex + 1) % n;
    drone.batteryPct = Math.max(0, drone.batteryPct - BATTERY_DRAIN_PER_TICK);
}

/** Advance the whole fleet by one tick. Mutates drones in place. */
export function tick(): void {
    for (const drone of getDrones()) {
        if (drone.status === "active") {
            advanceDrone(drone);
        }
    }
}
