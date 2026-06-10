/**
 * DroneWatch — WebSocket server.
 *
 * Attaches a `ws` server to the existing HTTP server. On connect, a client
 * immediately receives a `drones:update` snapshot; thereafter the simulator loop
 * calls `broadcastDrones()` every tick to push fresh state to all clients.
 *
 * Inbound `mission:*` messages mutate state and the simulator (Phase 7 refines
 * the flow; the handlers here satisfy the contract).
 */

import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import type {
    ClientMessage,
    DronesUpdateMessage,
} from "../../shared/types.ts";
import {
    addRoute,
    findIdleDrone,
    getDrone,
    getDrones,
} from "./state.ts";
import { clearProgress, resetProgress } from "./simulator.ts";

export interface WsHub {
    broadcastDrones: () => void;
}

function snapshotMessage(): string {
    const msg: DronesUpdateMessage = {
        type: "drones:update",
        timestamp: Date.now(),
        drones: getDrones(),
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
            // Assign to the route's named drone if present, else any idle one.
            const drone = getDrone(route.droneId) ?? findIdleDrone();
            if (drone) {
                drone.missionId = route.id;
                route.droneId = drone.id;
            }
            console.log(`[ws] mission:create ${route.id} -> ${drone?.id ?? "unassigned"}`);
            break;
        }
        case "mission:start": {
            const drone = getDrones().find((d) => d.missionId === msg.missionId);
            if (drone) {
                drone.status = "active";
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
        socket.send(snapshotMessage()); // immediate snapshot

        socket.on("message", (data) => handleClientMessage(data.toString()));
        socket.on("close", () => {
            console.log(`[ws] client disconnected (${wss.clients.size} total)`);
        });
        socket.on("error", (err) => console.warn("[ws] socket error", err.message));
    });

    function broadcastDrones(): void {
        const payload = snapshotMessage();
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

    return { broadcastDrones };
}
