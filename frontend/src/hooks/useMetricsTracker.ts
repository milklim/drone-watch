/**
 * DroneWatch — metrics tracker.
 *
 * Mounted once near the app root: feeds every `drones:update` into the metrics
 * store so distance accumulates regardless of which components are visible.
 */

import { useEffect } from "react";
import { useDroneStore } from "../store/droneStore.ts";
import { useMetricsStore } from "../store/metricsStore.ts";

export function useMetricsTracker(): void {
    const drones = useDroneStore((s) => s.drones);
    const record = useMetricsStore((s) => s.record);

    useEffect(() => {
        record(drones);
    }, [drones, record]);
}
