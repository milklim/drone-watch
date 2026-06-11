import { useEffect } from "react";
import { MapView } from "./components/Map/index.tsx";
import { SettingsPanel } from "./components/Settings/SettingsPanel.tsx";
import { useWebSocket } from "./hooks/useWebSocket.ts";
import { useDroneStore } from "./store/droneStore.ts";
import { useRouteStore } from "./store/routeStore.ts";
import type { ConnectionStatus } from "./hooks/useWebSocket.ts";
import type { RoutesResponse } from "../../shared/types.ts";

const STATUS_COLOR: Record<ConnectionStatus, string> = {
    open: "text-active",
    connecting: "text-idle",
    closed: "text-danger",
};

function App() {
    const { status } = useWebSocket();
    const droneCount = useDroneStore((s) => s.drones.length);
    const setRoutes = useRouteStore((s) => s.setRoutes);

    // Routes don't change on their own, so a one-time REST snapshot is enough;
    // the live feed only carries drones.
    useEffect(() => {
        const api =
            (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";
        const controller = new AbortController();
        fetch(`${api}/routes`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data: RoutesResponse) => setRoutes(data.routes))
            .catch((err: unknown) => {
                if (!controller.signal.aborted) {
                    console.error("[api] failed to load routes", err);
                }
            });
        return () => controller.abort();
    }, [setRoutes]);

    return (
        <div className="relative h-full bg-bg text-text">
            <MapView />
            <div className="absolute left-3 top-3 z-1100">
                <SettingsPanel />
            </div>
            <div className="absolute right-3 top-3 z-1100 rounded border border-border-base bg-surface/90 px-3 py-1.5 text-dim">
                ws: <span className={STATUS_COLOR[status]}>{status}</span> ·{" "}
                {droneCount} drones
            </div>
        </div>
    );
}

export default App;
