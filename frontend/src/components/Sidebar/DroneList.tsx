/**
 * DroneWatch — asset roster.
 *
 * Lists every drone from the store; selecting one updates the shared selection
 * (which also recenters the map, handled inside the engines). The "Assets — N
 * Units" header lives in Sidebar, which doubles as the mobile drawer handle.
 */

import { useDroneStore } from "../../store/droneStore.ts";
import { DroneCard } from "./DroneCard.tsx";

export function DroneList() {
    const drones = useDroneStore((s) => s.drones);
    const selectedDroneId = useDroneStore((s) => s.selectedDroneId);
    const selectDrone = useDroneStore((s) => s.selectDrone);

    return (
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {drones.length === 0 ? (
                <div className="px-2 py-4 text-[10px] italic text-muted">
                    Awaiting fleet telemetry…
                </div>
            ) : (
                drones.map((drone) => (
                    <DroneCard
                        key={drone.id}
                        drone={drone}
                        selected={drone.id === selectedDroneId}
                        onSelect={selectDrone}
                    />
                ))
            )}
        </div>
    );
}
