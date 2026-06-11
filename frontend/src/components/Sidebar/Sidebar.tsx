/**
 * DroneWatch — left command rail.
 *
 * The asset roster over the telemetry readout. Both read straight from the
 * stores; the sidebar only owns layout.
 */

import { DroneList } from "./DroneList.tsx";
import { TelemetryPanel } from "./TelemetryPanel.tsx";

export function Sidebar() {
    return (
        <aside className="flex w-sidebar shrink-0 flex-col overflow-hidden border-r border-border-base bg-surface">
            <DroneList />
            <TelemetryPanel />
        </aside>
    );
}
