/**
 * DroneWatch — shared map constants.
 *
 * Values identical across both engines live here so Leaflet and Mapbox can't
 * drift apart. Coordinates stay canonical `{ lat, lng }`; each engine converts
 * to its own array/object order at the rendering boundary.
 */

import type { DroneStatus, LatLng } from "../../../../shared/types.ts";

export const DNIPRO_CENTER: LatLng = { lat: 48.45, lng: 35.0 };
export const INITIAL_ZOOM = 12;

export const STATUS_COLOR: Record<DroneStatus, string> = {
    active: "#22c55e",
    idle: "#f59e0b",
    offline: "#4b5563",
};

export const ROUTE_COLOR = "#7888a0";
export const ROUTE_COLOR_SELECTED = "#3b82f6";
export const DRAFT_COLOR = "#3b82f6";
