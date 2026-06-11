/**
 * DroneWatch — rolling per-drone position history.
 *
 * Derived UI state for the fading trail effect: every position from the live
 * feed is appended to a bounded per-drone array. Engine-independent so both
 * Leaflet and Mapbox render trails from the same data.
 */

import { useEffect, useRef, useState } from "react";
import type { Drone, LatLng } from "../../../../shared/types.ts";

const MAX_TRAIL_POINTS = 30;

export function useDroneTrails(drones: Drone[]): ReadonlyMap<string, LatLng[]> {
    const historyRef = useRef(new Map<string, LatLng[]>());
    const [trails, setTrails] = useState<ReadonlyMap<string, LatLng[]>>(
        () => new Map(),
    );

    useEffect(() => {
        const history = historyRef.current;
        const seen = new Set<string>();

        for (const drone of drones) {
            seen.add(drone.id);
            const trail = history.get(drone.id) ?? [];
            const last = trail[trail.length - 1];
            // Skip unchanged positions — also keeps StrictMode's double render
            // from appending the same point twice.
            if (
                !last ||
                last.lat !== drone.position.lat ||
                last.lng !== drone.position.lng
            ) {
                trail.push({ ...drone.position });
                if (trail.length > MAX_TRAIL_POINTS) {
                    trail.splice(0, trail.length - MAX_TRAIL_POINTS);
                }
            }
            history.set(drone.id, trail);
        }

        for (const id of history.keys()) {
            if (!seen.has(id)) history.delete(id);
        }

        // Hand out copies so consumers see fresh references per update.
        setTrails(
            new Map([...history].map(([id, trail]) => [id, [...trail]])),
        );
    }, [drones]);

    return trails;
}
