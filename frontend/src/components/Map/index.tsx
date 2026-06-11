/**
 * DroneWatch — map engine switcher.
 *
 * The single place where store state is turned into the engine prop contract
 * (`MapEngineProps`). Reads `mapEngine` from settings and renders the matching
 * engine; both engines receive identical props, so switching engines never
 * touches drone/route state.
 */

import { useDroneStore } from "../../store/droneStore.ts";
import { useRouteStore } from "../../store/routeStore.ts";
import { useSettingsStore } from "../../store/settingsStore.ts";
import type { MapEngineProps } from "./types.ts";
import { LeafletMap } from "./LeafletMap.tsx";

function MapboxPlaceholder() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-bg text-dim">
            Mapbox engine arrives in Phase 4 — switch back to Leaflet.
        </div>
    );
}

export function MapView() {
    const drones = useDroneStore((s) => s.drones);
    const selectedDroneId = useDroneStore((s) => s.selectedDroneId);
    const selectDrone = useDroneStore((s) => s.selectDrone);
    const routes = useRouteStore((s) => s.routes);
    const draftWaypoints = useRouteStore((s) => s.draftWaypoints);
    const addDraftWaypoint = useRouteStore((s) => s.addDraftWaypoint);
    const mapEngine = useSettingsStore((s) => s.mapEngine);

    const engineProps: MapEngineProps = {
        drones,
        routes,
        selectedDroneId,
        draftWaypoints,
        onMapClick: addDraftWaypoint,
        onDroneClick: selectDrone,
    };

    return mapEngine === "leaflet" ? (
        <LeafletMap {...engineProps} />
    ) : (
        <MapboxPlaceholder />
    );
}
