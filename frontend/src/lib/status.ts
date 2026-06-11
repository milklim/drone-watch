/**
 * DroneWatch — status presentation tokens.
 *
 * Maps domain status to the theme's Tailwind utilities so the roster and
 * telemetry read battery the same way.
 */

/** Battery bar colour by remaining charge. */
export function batteryColor(pct: number): string {
    if (pct >= 50) return "bg-active";
    if (pct >= 20) return "bg-idle";
    return "bg-danger";
}
