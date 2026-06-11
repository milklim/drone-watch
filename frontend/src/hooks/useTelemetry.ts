/**
 * DroneWatch — selected-drone telemetry.
 *
 * Derives the currently-selected drone plus its accumulated distance. Returns
 * live values (re-evaluated on each feed update) for the telemetry panel.
 */

import { useDroneStore } from "../store/droneStore.ts";
import { useMetricsStore } from "../store/metricsStore.ts";
import type { Drone } from "../../../shared/types.ts";

export interface Telemetry {
    drone: Drone | null;
    distanceKm: number;
}

export function useTelemetry(): Telemetry {
    const selectedId = useDroneStore((s) => s.selectedDroneId);
    const drone = useDroneStore(
        (s) => s.drones.find((d) => d.id === selectedId) ?? null,
    );
    const distanceKm = useMetricsStore((s) =>
        selectedId ? (s.distanceKm[selectedId] ?? 0) : 0,
    );

    return { drone, distanceKm };
}
