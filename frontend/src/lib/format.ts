/**
 * DroneWatch — display formatting helpers.
 *
 * Presentation-only: round noisy telemetry numbers and render coordinates in
 * the tactical degrees-minutes-seconds form the C2 theme uses.
 */

import type { LatLng } from "../../../shared/types.ts";

const pad = (n: number) => String(n).padStart(2, "0");

/** A signed decimal degree → `48°31'42"N` style, with seconds rollover. */
export function formatDMS(
    value: number,
    positive: string,
    negative: string,
): string {
    const hemi = value >= 0 ? positive : negative;
    const abs = Math.abs(value);

    let deg = Math.floor(abs);
    let min = Math.floor((abs - deg) * 60);
    let sec = Math.round(((abs - deg) * 60 - min) * 60);
    if (sec === 60) {
        sec = 0;
        min += 1;
    }
    if (min === 60) {
        min = 0;
        deg += 1;
    }
    return `${deg}°${pad(min)}'${pad(sec)}"${hemi}`;
}

/** `{lat,lng}` → `48°31'42"N  35°00'18"E`. */
export function formatLatLng(p: LatLng): string {
    return `${formatDMS(p.lat, "N", "S")}  ${formatDMS(p.lng, "E", "W")}`;
}

/** Seconds → `HH:MM:SS`. */
export function formatElapsed(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
