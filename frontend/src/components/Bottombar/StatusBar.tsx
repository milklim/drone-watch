/**
 * DroneWatch — bottom status bar.
 *
 * Session elapsed time, total distance across the fleet, active-mission count,
 * current engine, WebSocket health, and live cursor coordinates.
 */

import { useEffect, useState } from "react";
import type { ConnectionStatus } from "../../hooks/useWebSocket.ts";
import { useDroneStore } from "../../store/droneStore.ts";
import { useMetricsStore } from "../../store/metricsStore.ts";
import { useSettingsStore } from "../../store/settingsStore.ts";
import { useUiStore } from "../../store/uiStore.ts";
import { formatElapsed, formatLatLng } from "../../lib/format.ts";

const WS_COLOR: Record<ConnectionStatus, string> = {
    open: "text-active",
    connecting: "text-idle",
    closed: "text-danger",
};

const WS_LABEL: Record<ConnectionStatus, string> = {
    open: "WS CONNECTED",
    connecting: "WS CONNECTING",
    closed: "WS DISCONNECTED",
};

function Segment({
    label,
    value,
    className = "",
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div
            className={`h-full items-center gap-1.5 border-r border-border-base px-3.5 first:pl-0 ${className}`}
        >
            <span className="text-[9px] uppercase tracking-widest text-muted">
                {label}
            </span>
            <span className="font-semibold text-text">{value}</span>
        </div>
    );
}

export function StatusBar({ status }: { status: ConnectionStatus }) {
    const drones = useDroneStore((s) => s.drones);
    const distanceKm = useMetricsStore((s) => s.distanceKm);
    const mapEngine = useSettingsStore((s) => s.mapEngine);
    const cursor = useUiStore((s) => s.cursor);

    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const totalKm = Object.values(distanceKm).reduce((a, b) => a + b, 0);
    const activeMissions = drones.filter((d) => d.status === "active").length;

    return (
        <footer className="flex h-botbar shrink-0 items-center overflow-hidden border-t border-border-base bg-surface px-3.5 text-[10px] text-dim">
            <Segment
                label="Elapsed"
                value={formatElapsed(elapsed)}
                className="flex"
            />
            <Segment
                label="Total Dist"
                value={`${totalKm.toFixed(1)} km`}
                className="flex"
            />
            <Segment
                label="Missions"
                value={`${activeMissions} ACTIVE`}
                className="flex"
            />
            <Segment
                label="Engine"
                value={mapEngine.toUpperCase()}
                className="hidden md:flex"
            />

            <div
                className={`ml-auto flex items-center gap-2 border-r border-border-base px-3.5 ${WS_COLOR[status]}`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${
                        status === "closed"
                            ? "bg-danger"
                            : status === "open"
                              ? "bg-active animate-pulse"
                              : "bg-idle animate-pulse"
                    }`}
                />
                <span className="text-[9px] tracking-widest">
                    {WS_LABEL[status]}
                </span>
            </div>

            <div className="hidden items-center gap-2 pl-3.5 lg:flex">
                <span className="text-[9px] uppercase tracking-widest text-muted">
                    Cursor
                </span>
                <span className="font-semibold text-text">
                    {cursor ? formatLatLng(cursor) : "—"}
                </span>
            </div>
        </footer>
    );
}
