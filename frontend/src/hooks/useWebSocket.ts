/**
 * DroneWatch — WebSocket hook.
 *
 * Opens a single connection to the backend, pipes `drones:update` snapshots
 * into the drone store, and auto-reconnects with exponential backoff. Exposes
 * the live connection status and a typed `send()` for outbound messages.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "../../../shared/types.ts";
import { useDroneStore } from "../store/droneStore.ts";
import { useRouteStore } from "../store/routeStore.ts";

const MAX_BACKOFF_MS = 10_000;

/**
 * Resolve the WebSocket endpoint. An absolute `ws://`/`wss://` value (e.g. a
 * production backend) is used verbatim; otherwise the value is treated as a
 * same-origin path (default `/ws`) so the dev server can proxy it — this sidesteps
 * WSL2 not forwarding the backend's own port to the Windows-side browser.
 */
function resolveWsUrl(): string {
    const configured = import.meta.env.VITE_WS_URL as string | undefined;
    if (configured && /^wss?:\/\//.test(configured)) return configured;
    const path = configured && configured.startsWith("/") ? configured : "/ws";
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.host}${path}`;
}

export type ConnectionStatus = "connecting" | "open" | "closed";

export function useWebSocket() {
    const [status, setStatus] = useState<ConnectionStatus>("connecting");
    const socketRef = useRef<WebSocket | null>(null);

    const setDrones = useDroneStore((s) => s.setDrones);
    const setRoutes = useRouteStore((s) => s.setRoutes);

    // The whole connection lifecycle lives inside the effect: connect/reconnect
    // state is effect-local, and the only setState calls happen asynchronously
    // from socket events (never synchronously in the effect body).
    useEffect(() => {
        let disposed = false;
        let attempts = 0;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        function connect() {
            const socket = new WebSocket(resolveWsUrl());
            socketRef.current = socket;

            socket.onopen = () => {
                attempts = 0;
                setStatus("open");
            };

            socket.onmessage = (event) => {
                let msg: ServerMessage;
                try {
                    msg = JSON.parse(event.data as string) as ServerMessage;
                } catch {
                    console.warn("[ws] ignoring non-JSON message");
                    return;
                }
                if (msg.type === "drones:update") {
                    setDrones(msg.drones);
                } else if (msg.type === "routes:update") {
                    setRoutes(msg.routes);
                }
            };

            socket.onerror = () => {
                // An error is always followed by a close; let onclose reconnect.
                socket.close();
            };

            socket.onclose = () => {
                socketRef.current = null;
                if (disposed) return;
                setStatus("closed");
                const delay = Math.min(1000 * 2 ** attempts, MAX_BACKOFF_MS);
                attempts += 1;
                reconnectTimer = setTimeout(() => {
                    if (disposed) return;
                    setStatus("connecting");
                    connect();
                }, delay);
            };
        }

        connect();

        return () => {
            disposed = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);

            const socket = socketRef.current;
            if (!socket) return;
            // Detach handlers so this torn-down socket can't drive reconnects.
            socket.onopen = socket.onmessage = socket.onerror = null;
            socket.onclose = null;
            if (socket.readyState === WebSocket.CONNECTING) {
                // Closing mid-handshake logs "closed before established" (common
                // under StrictMode's double-mount); wait until it opens, then close.
                socket.onopen = () => socket.close();
            } else {
                socket.close();
            }
        };
    }, [setDrones, setRoutes]);

    const send = useCallback((message: ClientMessage) => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        } else {
            console.warn("[ws] cannot send — socket not open");
        }
    }, []);

    return { status, send };
}
