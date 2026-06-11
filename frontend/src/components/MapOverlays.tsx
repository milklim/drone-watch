/**
 * DroneWatch — map-area overlays for empty / error states.
 *
 * Non-interactive hints layered over the map: a prominent banner when the
 * telemetry feed isn't live, and a nudge to plot a route once the fleet is
 * connected but no patrols exist. Both are pointer-events-none so they never
 * block map clicks (e.g. dropping mission waypoints underneath).
 */

import type { ConnectionStatus } from "../hooks/useWebSocket.ts";
import { useDroneStore } from "../store/droneStore.ts";
import { useRouteStore } from "../store/routeStore.ts";

function ConnectionBanner({ status }: { status: ConnectionStatus }) {
    if (status === "open") return null;
    const connecting = status === "connecting";

    return (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-1000 flex justify-center pt-3">
            <div
                className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-[11px] font-semibold tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur ${
                    connecting
                        ? "border-idle/40 bg-idle-dim text-idle"
                        : "border-danger/40 bg-danger/15 text-danger"
                }`}
            >
                <span
                    className={`h-2 w-2 rounded-full ${
                        connecting ? "bg-idle animate-pulse" : "bg-danger"
                    }`}
                />
                {connecting
                    ? "Connecting to telemetry feed…"
                    : "Telemetry feed lost — reconnecting…"}
            </div>
        </div>
    );
}

function NoRoutesHint({ status }: { status: ConnectionStatus }) {
    const drones = useDroneStore((s) => s.drones);
    const routes = useRouteStore((s) => s.routes);

    // Only once the feed is live and the fleet snapshot has arrived — otherwise
    // this flashes during the initial connect when everything is still empty.
    if (status !== "open" || drones.length === 0 || routes.length > 0) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-1000 flex justify-center px-4">
            <div className="rounded-sm border border-border-hi bg-surface/90 px-4 py-2 text-center text-[11px] text-dim backdrop-blur">
                No active patrols — hit{" "}
                <span className="font-bold text-accent">+ NEW MISSION</span> to
                plot a route.
            </div>
        </div>
    );
}

export function MapOverlays({ status }: { status: ConnectionStatus }) {
    return (
        <>
            <ConnectionBanner status={status} />
            <NoRoutesHint status={status} />
        </>
    );
}
