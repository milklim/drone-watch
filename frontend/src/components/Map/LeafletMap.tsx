/**
 * DroneWatch — Leaflet engine.
 *
 * Pure presentation: renders drones, routes, trails, and draft waypoints from
 * props and reports clicks back up. No drone/mission logic lives here.
 */

import { Fragment } from "react";
import L from "leaflet";
import {
    CircleMarker,
    MapContainer,
    Marker,
    Polyline,
    TileLayer,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Drone, DroneStatus } from "../../../../shared/types.ts";
import type { MapEngineProps } from "./types.ts";
import { toLatLngArray } from "./mapUtils.ts";
import { useDroneTrails } from "./useDroneTrails.ts";

const DNIPRO_CENTER: [number, number] = [48.45, 35.0];
const INITIAL_ZOOM = 12;

// Dark basemap — CartoDB Dark Matter, free, no token.
const TILE_URL =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const STATUS_COLOR: Record<DroneStatus, string> = {
    active: "#22c55e",
    idle: "#f59e0b",
    offline: "#4b5563",
};

const ROUTE_COLOR = "#7888a0";
const ROUTE_COLOR_SELECTED = "#3b82f6";
const DRAFT_COLOR = "#3b82f6";

function droneIcon(drone: Drone, selected: boolean): L.DivIcon {
    const size = selected ? 34 : 24;
    const color = STATUS_COLOR[drone.status];
    const stroke = selected ? "#ffffff" : "rgba(255,255,255,0.55)";
    const glow = selected ? 7 : 3;
    const html = `
        <div style="width:${size}px;height:${size}px;transform:rotate(${drone.heading}deg);filter:drop-shadow(0 0 ${glow}px ${color});">
            <svg viewBox="0 0 24 24" width="${size}" height="${size}">
                <path d="M12 2 L19 20 L12 15.5 L5 20 Z"
                      fill="${color}" stroke="${stroke}"
                      stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
        </div>`;
    return L.divIcon({
        html,
        className: "", // suppress Leaflet's default white-box icon styles
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function MapClickHandler({
    onMapClick,
}: {
    onMapClick: MapEngineProps["onMapClick"];
}) {
    useMapEvents({
        click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
    });
    return null;
}

export function LeafletMap({
    drones,
    routes,
    selectedDroneId,
    draftWaypoints,
    onMapClick,
    onDroneClick,
}: MapEngineProps) {
    const trails = useDroneTrails(drones);
    const droneById = new Map(drones.map((d) => [d.id, d]));

    return (
        <MapContainer
            center={DNIPRO_CENTER}
            zoom={INITIAL_ZOOM}
            className="h-full w-full"
            zoomControl={false}
        >
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <MapClickHandler onMapClick={onMapClick} />

            {routes.map((route) => {
                const selected = route.droneId === selectedDroneId;
                const color = selected ? ROUTE_COLOR_SELECTED : ROUTE_COLOR;
                return (
                    <Fragment key={route.id}>
                        <Polyline
                            positions={route.waypoints.map(toLatLngArray)}
                            pathOptions={{
                                color,
                                weight: selected ? 2.5 : 1.5,
                                opacity: selected ? 0.9 : 0.5,
                                dashArray: "6 8",
                            }}
                        />
                        {route.waypoints.map((wp, i) => (
                            <CircleMarker
                                key={i}
                                center={toLatLngArray(wp)}
                                radius={3}
                                pathOptions={{
                                    color,
                                    weight: 1,
                                    opacity: 0.9,
                                    fillColor: "#0a0c10",
                                    fillOpacity: 1,
                                }}
                            />
                        ))}
                    </Fragment>
                );
            })}

            {draftWaypoints.length > 0 && (
                <>
                    <Polyline
                        positions={draftWaypoints.map(toLatLngArray)}
                        pathOptions={{
                            color: DRAFT_COLOR,
                            weight: 2,
                            opacity: 0.9,
                        }}
                    />
                    {draftWaypoints.map((wp, i) => (
                        <CircleMarker
                            key={i}
                            center={toLatLngArray(wp)}
                            radius={4}
                            pathOptions={{
                                color: DRAFT_COLOR,
                                weight: 1.5,
                                fillColor: DRAFT_COLOR,
                                fillOpacity: 0.6,
                            }}
                        />
                    ))}
                </>
            )}

            {[...trails].map(([droneId, trail]) => {
                const drone = droneById.get(droneId);
                if (!drone || trail.length < 2) return null;
                const color = STATUS_COLOR[drone.status];
                // Per-segment polylines with rising opacity → fading tail.
                return trail.slice(1).map((point, i) => (
                    <Polyline
                        key={`${droneId}-${i}`}
                        positions={[
                            toLatLngArray(trail[i]),
                            toLatLngArray(point),
                        ]}
                        pathOptions={{
                            color,
                            weight: 2,
                            opacity: ((i + 1) / trail.length) * 0.7,
                        }}
                    />
                ));
            })}

            {drones.map((drone) => (
                <Marker
                    key={drone.id}
                    position={toLatLngArray(drone.position)}
                    icon={droneIcon(drone, drone.id === selectedDroneId)}
                    zIndexOffset={drone.id === selectedDroneId ? 1000 : 0}
                    eventHandlers={{ click: () => onDroneClick(drone.id) }}
                />
            ))}
        </MapContainer>
    );
}
