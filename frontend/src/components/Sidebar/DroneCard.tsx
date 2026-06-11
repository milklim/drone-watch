/**
 * DroneWatch — drone roster card.
 *
 * One asset row: callsign, status badge, mission/telemetry summary, battery.
 * Pure presentation — clicking reports up via `onSelect`.
 */

import type { Drone, DroneStatus } from "../../../../shared/types.ts";
import { batteryColor } from "../../lib/status.ts";

const BADGE: Record<DroneStatus, string> = {
    active: "text-active bg-active-dim",
    idle: "text-idle bg-idle-dim",
    offline: "text-offline bg-offline/15",
};

function missionLine(drone: Drone): string {
    const unit = drone.id.toUpperCase();
    if (drone.status === "offline") return `DISCONNECTED · ${unit}`;
    if (drone.status === "idle") return `STANDBY · ${unit}`;
    return `${drone.missionId ?? "—"} · ${unit}`;
}

export function DroneCard({
    drone,
    selected,
    onSelect,
}: {
    drone: Drone;
    selected: boolean;
    onSelect: (id: string) => void;
}) {
    const offline = drone.status === "offline";

    return (
        <button
            type="button"
            onClick={() => onSelect(drone.id)}
            className={`w-full rounded border px-3 py-2.5 text-left transition-colors ${
                selected
                    ? "border-accent bg-accent-dim"
                    : "border-border-base bg-bg hover:border-border-hi hover:bg-surface-2"
            }`}
        >
            <div className="mb-1.5 flex items-center justify-between">
                <span
                    className={`text-[13px] font-bold tracking-[0.04em] ${
                        selected
                            ? "text-accent"
                            : offline
                              ? "text-offline"
                              : "text-[#e2e8f0]"
                    }`}
                >
                    {drone.callsign}
                </span>
                <span
                    className={`rounded-xs px-1.5 py-0.5 text-[8px] font-bold tracking-[0.15em] ${BADGE[drone.status]}`}
                >
                    {drone.status.toUpperCase()}
                </span>
            </div>

            <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[9px] tracking-[0.04em] text-muted">
                    {missionLine(drone)}
                </span>
                <span className="text-[10px] text-dim">
                    {offline ? (
                        <span className="text-muted">— · —</span>
                    ) : (
                        <>
                            <span className="font-medium text-text">
                                {Math.round(drone.speedKmh)}
                            </span>{" "}
                            km/h ·{" "}
                            <span className="font-medium text-text">
                                {Math.round(drone.altitudeM)}
                            </span>
                            m
                        </>
                    )}
                </span>
            </div>

            <div className="h-0.75 overflow-hidden rounded-xs bg-border-base">
                <div
                    className={`h-full rounded-xs transition-[width] duration-300 ${batteryColor(drone.batteryPct)}`}
                    style={{ width: `${drone.batteryPct}%` }}
                />
            </div>
        </button>
    );
}
