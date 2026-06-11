/**
 * DroneWatch — WebSocket server.
 *
 * Attaches a `ws` server to the existing HTTP server. On connect, a client
 * immediately receives a `drones:update` snapshot; thereafter the simulator loop
 * calls `broadcastDrones()` every tick to push fresh state to all clients.
 *
 * Inbound `mission:*` messages mutate state and the simulator: create registers
 * a route and assigns it to a reachable drone, start activates that drone (with
 * cruise defaults if it was parked), stop returns it to idle.
 */

import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import type {
    ClientMessage,
    DronesUpdateMessage,
    RoutesUpdateMessage,
} from "../../shared/types.ts";
import {
    addRoute,
    findIdleDrone,
    getDrone,
    getDrones,
    getRoutes,
    getRoutesVersion,
    removeRoute,
} from "./state.ts";
import { clearProgress, resetProgress } from "./simulator.ts";

// Defaults for a drone launched from standby (seeded idle drones park with
// zero speed/altitude, and the simulator advances by speedKmh).
const CRUISE_SPEED_KMH = 60;
const CRUISE_ALTITUDE_M = 300;

export interface WsHub {
    broadcastDrones: () => void;
    /** Push a routes snapshot to all clients if the route set changed. */
    broadcastRoutesIfChanged: () => void;
}

function snapshotMessage(): string {
    const msg: DronesUpdateMessage = {
        type: "drones:update",
        timestamp: Date.now(),
        drones: getDrones(),
    };
    return JSON.stringify(msg);
}

function routesMessage(): string {
    const msg: RoutesUpdateMessage = {
        type: "routes:update",
        routes: getRoutes(),
    };
    return JSON.stringify(msg);
}

function handleClientMessage(raw: string): void {
    let msg: ClientMessage;
    try {
        msg = JSON.parse(raw) as ClientMessage;
    } catch {
        console.warn("[ws] ignoring non-JSON message");
        return;
    }

    switch (msg.type) {
        case "mission:create": {
            const route = addRoute(msg.route);
            // Assign to the route's named drone if it's reachable, else any
            // idle one. Offline drones can't accept missions.
            const named = getDrone(route.droneId);
            const drone =
                (named && named.status !== "offline" ? named : undefined) ??
                findIdleDrone();
            if (drone) {
                drone.missionId = route.id;
                route.droneId = drone.id;
                // Drop superseded routes: nothing will ever fly them, so they
                // would only clutter the map.
                for (const r of [...getRoutes()]) {
                    if (r.droneId === drone.id && r.id !== route.id) {
                        removeRoute(r.id);
                    }
                }
            }
            console.log(`[ws] mission:create ${route.id} -> ${drone?.id ?? "unassigned"}`);
            break;
        }
        case "mission:start": {
            const drone = getDrones().find((d) => d.missionId === msg.missionId);
            if (drone) {
                drone.status = "active";
                if (drone.speedKmh === 0) drone.speedKmh = CRUISE_SPEED_KMH;
                if (drone.altitudeM === 0) drone.altitudeM = CRUISE_ALTITUDE_M;
                resetProgress(drone.id);
                console.log(`[ws] mission:start ${msg.missionId} -> ${drone.id} active`);
            }
            break;
        }
        case "mission:stop": {
            const drone = getDrones().find((d) => d.missionId === msg.missionId);
            if (drone) {
                drone.status = "idle";
                drone.speedKmh = 0;
                clearProgress(drone.id);
                console.log(`[ws] mission:stop ${msg.missionId} -> ${drone.id} idle`);
            }
            break;
        }
        default:
            console.warn("[ws] unknown message type", (msg as { type?: string }).type);
    }
}

export function attachWebSocketServer(server: Server): WsHub {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (socket) => {
        console.log(`[ws] client connected (${wss.clients.size} total)`);
        socket.send(snapshotMessage()); // immediate snapshots
        socket.send(routesMessage());

        socket.on("message", (data) => handleClientMessage(data.toString()));
        socket.on("close", () => {
            console.log(`[ws] client disconnected (${wss.clients.size} total)`);
        });
        socket.on("error", (err) => console.warn("[ws] socket error", err.message));
    });

    function broadcast(payload: string): void {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

    function broadcastDrones(): void {
        broadcast(snapshotMessage());
    }

    // Routes change rarely (mission created / patrol completed), so instead of
    // pushing every tick we compare the state version between calls.
    let lastRoutesVersion = getRoutesVersion();
    function broadcastRoutesIfChanged(): void {
        const version = getRoutesVersion();
        if (version === lastRoutesVersion) return;
        lastRoutesVersion = version;
        broadcast(routesMessage());
    }

    return { broadcastDrones, broadcastRoutesIfChanged };
}
