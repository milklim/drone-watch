/**
 * DroneWatch — seed data.
 *
 * Initial demo fleet and patrol routes near Dnipro, UA (≈48.45, 35.0).
 * Loaded into the in-memory store on startup.
 */

import type { Drone, Route } from "../../shared/types.ts";

// ─── Routes ─────────────────────────────────────────────────────────────────
// Each route is a sequence of ordered waypoints; the simulator flies one lap
// (closing back to the start point, where the drone parks and goes idle).
// Spacing is ~1–1.5 km so motion is clearly visible at realistic drone speeds.

export const seedRoutes: Route[] = [
    {
        id: "patrol-n7",
        name: "Patrol N-7",
        droneId: "uav-01",
        waypoints: [
            { lat: 48.4647, lng: 35.0102 },
            { lat: 48.4712, lng: 35.0291 },
            { lat: 48.4685, lng: 35.0488 },
            { lat: 48.4566, lng: 35.0521 },
            { lat: 48.4498, lng: 35.0334 },
            { lat: 48.4541, lng: 35.0148 },
        ],
    },
    {
        id: "patrol-e3",
        name: "Patrol E-3",
        droneId: "uav-02",
        waypoints: [
            { lat: 48.4423, lng: 35.0556 },
            { lat: 48.4509, lng: 35.0689 },
            { lat: 48.4631, lng: 35.0724 },
            { lat: 48.4688, lng: 35.0587 },
            { lat: 48.4572, lng: 35.0479 },
        ],
    },
    {
        id: "patrol-s1",
        name: "Patrol S-1",
        droneId: "uav-03",
        waypoints: [
            { lat: 48.4312, lng: 35.0205 },
            { lat: 48.4256, lng: 35.0398 },
            { lat: 48.4288, lng: 35.0581 },
            { lat: 48.4401, lng: 35.0497 },
            { lat: 48.4419, lng: 35.0301 },
        ],
    },
];

// ─── Drones ─────────────────────────────────────────────────────────────────
export const seedDrones: Drone[] = [
    {
        id: "uav-01",
        callsign: "Sokil",
        status: "active",
        position: { lat: 48.4647, lng: 35.0102 },
        heading: 0,
        speedKmh: 64,
        altitudeM: 320,
        batteryPct: 87,
        missionId: "patrol-n7",
        routeIndex: 1,
    },
    {
        id: "uav-02",
        callsign: "Berkut",
        status: "active",
        position: { lat: 48.4423, lng: 35.0556 },
        heading: 0,
        speedKmh: 78,
        altitudeM: 410,
        batteryPct: 72,
        missionId: "patrol-e3",
        routeIndex: 1,
    },
    {
        id: "uav-03",
        callsign: "Lelya",
        status: "active",
        position: { lat: 48.4312, lng: 35.0205 },
        heading: 0,
        speedKmh: 55,
        altitudeM: 260,
        batteryPct: 64,
        missionId: "patrol-s1",
        routeIndex: 1,
    },
    {
        id: "uav-04",
        callsign: "Pugach",
        status: "idle",
        position: { lat: 48.4521, lng: 35.0167 },
        heading: 90,
        speedKmh: 0,
        altitudeM: 0,
        batteryPct: 95,
        missionId: null,
        routeIndex: 0,
    },
    {
        id: "uav-05",
        callsign: "Crow",
        status: "offline",
        position: { lat: 48.4498, lng: 35.0712 },
        heading: 215,
        speedKmh: 0,
        altitudeM: 0,
        batteryPct: 12,
        missionId: null,
        routeIndex: 0,
    },
];
