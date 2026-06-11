/**
 * DroneWatch — derived flight metrics.
 *
 * Accumulates distance travelled per drone from the live feed. This is derived
 * UI state, not simulation — the backend stays authoritative for positions; we
 * only sum the deltas it sends so telemetry and the status bar can show km.
 *
 * `lastPos` is kept module-local (not in store state) so per-tick updates don't
 * churn subscribers; only `distanceKm` is reactive.
 */

import { create } from "zustand";
import type { Drone, LatLng } from "../../../shared/types.ts";

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

function haversineKm(a: LatLng, b: LatLng): number {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

const lastPos = new Map<string, LatLng>();

interface MetricsState {
    distanceKm: Record<string, number>;
    /** Fold one `drones:update` into the running per-drone distances. */
    record: (drones: Drone[]) => void;
}

export const useMetricsStore = create<MetricsState>()((set) => ({
    distanceKm: {},
    record: (drones) =>
        set((state) => {
            const next = { ...state.distanceKm };
            for (const d of drones) {
                const prev = lastPos.get(d.id);
                // Only active drones travel; identical positions add 0, so a
                // StrictMode double-record with the same array is a no-op.
                if (prev && d.status === "active") {
                    next[d.id] =
                        (next[d.id] ?? 0) + haversineKm(prev, d.position);
                }
                lastPos.set(d.id, d.position);
            }
            return { distanceKm: next };
        }),
}));
