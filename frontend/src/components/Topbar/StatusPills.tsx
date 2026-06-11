/**
 * DroneWatch — fleet status pills.
 *
 * Live counts of active / idle / offline drones, derived from the drone store.
 */

import { useDroneStore } from "../../store/droneStore.ts";
import type { DroneStatus } from "../../../../shared/types.ts";

const PILLS: {
    status: DroneStatus;
    label: string;
    text: string;
    dot: string;
}[] = [
    {
        status: "active",
        label: "ACTIVE",
        text: "text-active",
        dot: "bg-active",
    },
    { status: "idle", label: "IDLE", text: "text-idle", dot: "bg-idle" },
    {
        status: "offline",
        label: "OFFLINE",
        text: "text-offline",
        dot: "bg-offline",
    },
];

export function StatusPills() {
    const drones = useDroneStore((s) => s.drones);
    const counts = drones.reduce<Record<DroneStatus, number>>(
        (acc, d) => {
            acc[d.status] += 1;
            return acc;
        },
        { active: 0, idle: 0, offline: 0 },
    );

    return (
        <div className="flex h-full shrink-0 items-center gap-4.5 border-r border-border-base px-5">
            {PILLS.map(({ status, label, text, dot }) => (
                <span
                    key={status}
                    className={`flex items-center gap-1.5 text-[10px] font-semibold tracking-widest ${text}`}
                >
                    <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot} ${
                            status === "active" ? "animate-pulse" : ""
                        }`}
                    />
                    {counts[status]} {label}
                </span>
            ))}
        </div>
    );
}
