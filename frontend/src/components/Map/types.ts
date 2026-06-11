/**
 * DroneWatch — map engine prop contract.
 *
 * Both engines (`LeafletMap`, `MapboxMap`) receive exactly this shape from the
 * switcher in `index.tsx` — prop parity is what makes them interchangeable.
 * If a prop is added for one engine, it must be added here and to the other.
 */

import type { Drone, LatLng, Route } from "../../../../shared/types.ts";

export interface MapEngineProps {
    drones: Drone[];
    routes: Route[];
    selectedDroneId: string | null;
    draftWaypoints: LatLng[];
    onMapClick: (latlng: LatLng) => void;
    onDroneClick: (id: string) => void;
}
