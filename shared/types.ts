/**
 * DroneWatch — shared data contracts.
 *
 * Single source of truth for the shapes exchanged between backend and frontend.
 */

// ─── Core geometry ──────────────────────────────────────────────────────────

export interface LatLng {
    lat: number;
    lng: number;
}

// ─── Drone ──────────────────────────────────────────────────────────────────

export type DroneStatus = "active" | "idle" | "offline";

export interface Drone {
    id: string;
    callsign: string;
    status: DroneStatus;
    position: LatLng;
    heading: number; // degrees, 0 = north
    speedKmh: number;
    altitudeM: number;
    batteryPct: number;
    missionId: string | null;
    routeIndex: number; // index of current target waypoint
}

// ─── Route ──────────────────────────────────────────────────────────────────

export interface Route {
    id: string;
    name: string;
    droneId: string;
    waypoints: LatLng[]; // ordered
}

// ─── WebSocket messages: server → client ────────────────────────────────────

export interface DronesUpdateMessage {
    type: "drones:update";
    timestamp: number; // ms
    drones: Drone[];
}

export type ServerMessage = DronesUpdateMessage;

// ─── WebSocket messages: client → server ────────────────────────────────────

export interface MissionCreateMessage {
    type: "mission:create";
    route: Route;
}

export interface MissionStartMessage {
    type: "mission:start";
    missionId: string;
}

export interface MissionStopMessage {
    type: "mission:stop";
    missionId: string;
}

export type ClientMessage =
    | MissionCreateMessage
    | MissionStartMessage
    | MissionStopMessage;

// ─── REST response shapes ───────────────────────────────────────────────────

export interface HealthResponse {
    status: "ok";
}

export interface DronesResponse {
    drones: Drone[];
}

export interface RoutesResponse {
    routes: Route[];
}
