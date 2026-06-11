/**
 * DroneWatch — coordinate conversion helpers.
 *
 * The canonical form everywhere in the app is `{ lat, lng }`. Convert to an
 * engine-specific array order only at the rendering boundary, via these two.
 */

import type { LatLng } from "../../../../shared/types.ts";

/** Mapbox / GeoJSON order. */
export function toLngLatArray({ lat, lng }: LatLng): [number, number] {
    return [lng, lat];
}

/** Leaflet order. */
export function toLatLngArray({ lat, lng }: LatLng): [number, number] {
    return [lat, lng];
}
