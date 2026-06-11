/**
 * DroneWatch — Mapbox engine.
 *
 * Fully interchangeable with `LeafletMap`: same `MapEngineProps` contract, same
 * canonical `{ lat, lng }` data, converted to Mapbox/GeoJSON `[lng, lat]` order
 * only here at the rendering boundary. Pure presentation — no drone/mission
 * logic. Adds 3D buildings, a dark style, and (opt-in) follow-camera tracking.
 */

import { useEffect, useMemo, useRef } from "react";
import type { FeatureCollection, LineString, Point } from "geojson";
import {
    Layer,
    Map as MapGL,
    Marker,
    Source,
    type MapRef,
} from "react-map-gl/mapbox";
import type {
    CircleLayerSpecification,
    FillExtrusionLayerSpecification,
    LineLayerSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Drone, LatLng } from "../../../../shared/types.ts";
import { useSettingsStore } from "../../store/settingsStore.ts";
import type { MapEngineProps } from "./types.ts";
import { toLngLatArray } from "./mapUtils.ts";
import { useDroneTrails } from "./useDroneTrails.ts";
import {
    DNIPRO_CENTER,
    DRAFT_COLOR,
    INITIAL_ZOOM,
    ROUTE_COLOR,
    ROUTE_COLOR_SELECTED,
    STATUS_COLOR,
} from "./const.ts";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// ─── Data-driven layer specs (sources supplied below) ───────────────────────

const routeLineLayer: LineLayerSpecification = {
    id: "routes-line",
    type: "line",
    source: "routes",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
        "line-color": [
            "case",
            ["get", "selected"],
            ROUTE_COLOR_SELECTED,
            ROUTE_COLOR,
        ],
        "line-width": ["case", ["get", "selected"], 2.5, 1.5],
        "line-opacity": ["case", ["get", "selected"], 0.9, 0.5],
        "line-dasharray": [2, 2.5],
    },
};

const routeWaypointLayer: CircleLayerSpecification = {
    id: "routes-waypoints",
    type: "circle",
    source: "route-waypoints",
    paint: {
        "circle-radius": 3,
        "circle-color": "#0a0c10",
        "circle-stroke-width": 1,
        "circle-stroke-color": [
            "case",
            ["get", "selected"],
            ROUTE_COLOR_SELECTED,
            ROUTE_COLOR,
        ],
        "circle-stroke-opacity": 0.9,
    },
};

const trailLayer: LineLayerSpecification = {
    id: "trails-line",
    type: "line",
    source: "trails",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
        "line-color": ["get", "color"],
        "line-width": 2,
        "line-opacity": 0.6,
    },
};

const draftLineLayer: LineLayerSpecification = {
    id: "draft-line",
    type: "line",
    source: "draft",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": DRAFT_COLOR, "line-width": 2, "line-opacity": 0.9 },
};

const draftWaypointLayer: CircleLayerSpecification = {
    id: "draft-waypoints",
    type: "circle",
    source: "draft-waypoints",
    paint: {
        "circle-radius": 4,
        "circle-color": DRAFT_COLOR,
        "circle-opacity": 0.6,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": DRAFT_COLOR,
    },
};

const buildingsLayer: FillExtrusionLayerSpecification = {
    id: "3d-buildings",
    type: "fill-extrusion",
    source: "composite",
    "source-layer": "building",
    filter: ["==", ["get", "extrude"], "true"],
    minzoom: 14,
    paint: {
        "fill-extrusion-color": "#1a2030",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.6,
    },
};

// ─── GeoJSON builders ───────────────────────────────────────────────────────

function lineFeatures(
    lines: { coords: LatLng[]; props: Record<string, unknown> }[],
): FeatureCollection<LineString> {
    return {
        type: "FeatureCollection",
        features: lines.map(({ coords, props }) => ({
            type: "Feature",
            properties: props,
            geometry: {
                type: "LineString",
                coordinates: coords.map(toLngLatArray),
            },
        })),
    };
}

function pointFeatures(
    points: { coord: LatLng; props: Record<string, unknown> }[],
): FeatureCollection<Point> {
    return {
        type: "FeatureCollection",
        features: points.map(({ coord, props }) => ({
            type: "Feature",
            properties: props,
            geometry: { type: "Point", coordinates: toLngLatArray(coord) },
        })),
    };
}

// ─── Drone marker (rotated by heading, matches the Leaflet icon) ─────────────

function DroneMarker({
    drone,
    selected,
    onClick,
}: {
    drone: Drone;
    selected: boolean;
    onClick: (id: string) => void;
}) {
    const size = selected ? 34 : 24;
    const color = STATUS_COLOR[drone.status];
    const stroke = selected ? "#ffffff" : "rgba(255,255,255,0.55)";
    const glow = selected ? 7 : 3;
    return (
        <Marker
            longitude={drone.position.lng}
            latitude={drone.position.lat}
            anchor="center"
            onClick={(e) => {
                // Keep the click from also registering as a map click.
                e.originalEvent.stopPropagation();
                onClick(drone.id);
            }}
        >
            <div
                style={{
                    width: size,
                    height: size,
                    cursor: "pointer",
                    transform: `rotate(${drone.heading}deg)`,
                    filter: `drop-shadow(0 0 ${glow}px ${color})`,
                }}
            >
                <svg viewBox="0 0 24 24" width={size} height={size}>
                    <path
                        d="M12 2 L19 20 L12 15.5 L5 20 Z"
                        fill={color}
                        stroke={stroke}
                        strokeWidth={1.2}
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </Marker>
    );
}

export function MapboxMap({
    drones,
    routes,
    selectedDroneId,
    draftWaypoints,
    onMapClick,
    onDroneClick,
    onCursorMove,
}: MapEngineProps) {
    const mapRef = useRef<MapRef>(null);
    const trails = useDroneTrails(drones);
    const followSelected = useSettingsStore((s) => s.followSelected);
    const dronesRef = useRef(drones);
    useEffect(() => {
        dronesRef.current = drones;
    }, [drones]);

    const routeLines = useMemo(
        () =>
            lineFeatures(
                routes.map((r) => ({
                    coords: r.waypoints,
                    props: { selected: r.droneId === selectedDroneId },
                })),
            ),
        [routes, selectedDroneId],
    );

    const routeWaypoints = useMemo(
        () =>
            pointFeatures(
                routes.flatMap((r) =>
                    r.waypoints.map((wp) => ({
                        coord: wp,
                        props: { selected: r.droneId === selectedDroneId },
                    })),
                ),
            ),
        [routes, selectedDroneId],
    );

    const trailLines = useMemo(
        () =>
            lineFeatures(
                [...trails].flatMap(([droneId, trail]) => {
                    const drone = drones.find((d) => d.id === droneId);
                    if (!drone || trail.length < 2) return [];
                    return [
                        {
                            coords: trail,
                            props: { color: STATUS_COLOR[drone.status] },
                        },
                    ];
                }),
            ),
        [trails, drones],
    );

    const draftLine = useMemo(
        () =>
            lineFeatures(
                draftWaypoints.length > 1
                    ? [{ coords: draftWaypoints, props: {} }]
                    : [],
            ),
        [draftWaypoints],
    );
    const draftPoints = useMemo(
        () =>
            pointFeatures(
                draftWaypoints.map((coord) => ({ coord, props: {} })),
            ),
        [draftWaypoints],
    );

    // Follow mode: ease camera (center + bearing + pitch) to the selection.
    const selectedDrone = drones.find((d) => d.id === selectedDroneId);
    useEffect(() => {
        if (!followSelected || !selectedDrone) return;
        mapRef.current?.easeTo({
            center: [selectedDrone.position.lng, selectedDrone.position.lat],
            bearing: selectedDrone.heading,
            pitch: 55,
            duration: 500,
        });
    }, [
        followSelected,
        selectedDrone?.position.lat,
        selectedDrone?.position.lng,
        selectedDrone?.heading,
        selectedDrone,
    ]);

    // Recenter once when the selection changes (independent of follow mode).
    useEffect(() => {
        if (!selectedDroneId) return;
        const drone = dronesRef.current.find((d) => d.id === selectedDroneId);
        const map = mapRef.current;
        if (drone && map) {
            map.easeTo({
                center: [drone.position.lng, drone.position.lat],
                zoom: Math.max(map.getZoom(), 13),
                duration: 600,
            });
        }
    }, [selectedDroneId]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-bg px-6 text-center text-dim">
                Mapbox engine needs a token. Set VITE_MAPBOX_TOKEN in
                frontend/.env and restart the dev server.
            </div>
        );
    }

    return (
        <MapGL
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
                longitude: DNIPRO_CENTER.lng,
                latitude: DNIPRO_CENTER.lat,
                zoom: INITIAL_ZOOM,
            }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            style={{ height: "100%", width: "100%" }}
            onClick={(e) =>
                onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng })
            }
            onMouseMove={(e) =>
                onCursorMove({ lat: e.lngLat.lat, lng: e.lngLat.lng })
            }
            onMouseOut={() => onCursorMove(null)}
        >
            <Layer {...buildingsLayer} />

            <Source id="routes" type="geojson" data={routeLines}>
                <Layer {...routeLineLayer} />
            </Source>
            <Source id="route-waypoints" type="geojson" data={routeWaypoints}>
                <Layer {...routeWaypointLayer} />
            </Source>

            <Source id="trails" type="geojson" data={trailLines}>
                <Layer {...trailLayer} />
            </Source>

            {draftWaypoints.length > 0 && (
                <>
                    <Source id="draft" type="geojson" data={draftLine}>
                        <Layer {...draftLineLayer} />
                    </Source>
                    <Source
                        id="draft-waypoints"
                        type="geojson"
                        data={draftPoints}
                    >
                        <Layer {...draftWaypointLayer} />
                    </Source>
                </>
            )}

            {drones.map((drone) => (
                <DroneMarker
                    key={drone.id}
                    drone={drone}
                    selected={drone.id === selectedDroneId}
                    onClick={onDroneClick}
                />
            ))}
        </MapGL>
    );
}
