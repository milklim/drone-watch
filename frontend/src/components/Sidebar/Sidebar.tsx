/**
 * DroneWatch — left command rail.
 *
 * The asset roster over the telemetry readout. Both read straight from the
 * stores; the sidebar only owns layout.
 *
 * Responsive: below 768px it is a bottom sheet that peeks above the status bar
 * and slides up when tapped (`open`). From 768px up it reverts to a static
 * left rail and the drawer props are inert. While the mission sheet is up it
 * hides on mobile (`hiddenOnMobile`) so the map stays clear for waypoint taps.
 */

import { useDroneStore } from "../../store/droneStore.ts";
import { DroneList } from "./DroneList.tsx";
import { TelemetryPanel } from "./TelemetryPanel.tsx";

export function Sidebar({
    open,
    onToggle,
    hiddenOnMobile,
}: {
    open: boolean;
    onToggle: () => void;
    hiddenOnMobile: boolean;
}) {
    const count = useDroneStore((s) => s.drones.length);

    return (
        <aside
            className={`absolute inset-x-0 bottom-0 z-40 flex max-h-[72vh] flex-col border-t border-border-hi bg-surface shadow-[0_-14px_34px_rgba(0,0,0,0.55)] transition-transform duration-300 ${
                open ? "translate-y-0" : "translate-y-[calc(100%-2.5rem)]"
            } ${
                hiddenOnMobile ? "max-md:hidden" : ""
            } md:static md:z-auto md:max-h-none md:w-56 md:translate-y-0 md:border-r md:border-t-0 md:border-border-base md:shadow-none lg:w-sidebar`}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="relative flex h-10 shrink-0 select-none items-center justify-between border-b border-border-base px-3.5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted md:h-auto md:cursor-default md:py-2.5"
            >
                <span className="absolute left-1/2 top-1.5 h-0.75 w-9 -translate-x-1/2 rounded-full bg-border-hi md:hidden" />
                <span>Assets — {count} Units</span>
                <svg
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`h-2.5 w-2.5 text-dim transition-transform duration-300 md:hidden ${
                        open ? "rotate-180" : ""
                    }`}
                >
                    <path
                        d="M1 6.5L5 2.5L9 6.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            </button>
            <DroneList />
            <TelemetryPanel />
        </aside>
    );
}
