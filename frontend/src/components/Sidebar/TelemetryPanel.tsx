/**
 * DroneWatch — telemetry readout.
 *
 * Live speed / altitude / heading / distance / battery for the selected drone,
 * with a heading compass. Shows a placeholder when nothing is selected.
 */

import { useTelemetry } from "../../hooks/useTelemetry.ts";
import { batteryColor } from "../../lib/status.ts";
import { Compass } from "./Compass.tsx";

function Row({
    label,
    value,
    unit,
}: {
    label: string;
    value: string | number;
    unit?: string;
}) {
    return (
        <div className="flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-[0.12em] text-muted">
                {label}
            </span>
            <span className="text-[13px] font-semibold text-text">
                {value}
                {unit && (
                    <span className="ml-0.5 text-[9px] font-normal text-dim">
                        {unit}
                    </span>
                )}
            </span>
        </div>
    );
}

export function TelemetryPanel() {
    const { drone, distanceKm } = useTelemetry();

    return (
        <div className="shrink-0 border-t border-border-base bg-bg px-3.5 py-3">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                    Telemetry
                </span>
                <span className="text-[10px] font-bold tracking-wider text-accent">
                    {drone
                        ? `${drone.id.toUpperCase()} / ${drone.callsign}`
                        : "— / —"}
                </span>
            </div>

            {drone ? (
                <div className="grid grid-cols-[1fr_82px] items-center gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <Row
                            label="Speed"
                            value={Math.round(drone.speedKmh)}
                            unit="km/h"
                        />
                        <Row
                            label="Altitude"
                            value={Math.round(drone.altitudeM)}
                            unit="m"
                        />
                        <Row
                            label="Heading"
                            value={Math.round(drone.heading)}
                            unit="°"
                        />
                        <Row
                            label="Dist"
                            value={distanceKm.toFixed(1)}
                            unit="km"
                        />
                        <div className="mt-1">
                            <div className="mb-1 flex justify-between">
                                <span className="text-[9px] uppercase tracking-[0.12em] text-muted">
                                    Battery
                                </span>
                                <span className="text-[13px] font-semibold text-text">
                                    {Math.round(drone.batteryPct)}
                                    <span className="ml-0.5 text-[9px] font-normal text-dim">
                                        %
                                    </span>
                                </span>
                            </div>
                            <div className="h-1.25 overflow-hidden rounded-[3px] bg-border-base">
                                <div
                                    className={`h-full rounded-[3px] transition-[width] duration-300 ${batteryColor(drone.batteryPct)}`}
                                    style={{ width: `${drone.batteryPct}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <Compass
                        heading={drone.status === "offline" ? 0 : drone.heading}
                    />
                </div>
            ) : (
                <div className="py-3 text-[10px] italic text-muted">
                    No unit selected — pick a drone from the roster or map.
                </div>
            )}
        </div>
    );
}
