import { useEffect } from "react";
import { MapView } from "./components/Map/index.tsx";
import { SettingsPanel } from "./components/Settings/SettingsPanel.tsx";
import { Topbar } from "./components/Topbar/Topbar.tsx";
import { Sidebar } from "./components/Sidebar/Sidebar.tsx";
import { StatusBar } from "./components/Bottombar/StatusBar.tsx";
import { useWebSocket } from "./hooks/useWebSocket.ts";
import { useMetricsTracker } from "./hooks/useMetricsTracker.ts";
import { useRouteStore } from "./store/routeStore.ts";
import type { RoutesResponse } from "../../shared/types.ts";

function App() {
    const { status } = useWebSocket();
    useMetricsTracker();
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
        <div className="flex h-full flex-col bg-bg text-text">
            <Topbar status={status} />
            <div className="flex min-h-0 flex-1">
                <Sidebar />
                <main className="relative min-w-0 flex-1">
                    <MapView />
                    <div className="absolute right-3 top-3 z-1100">
                        <SettingsPanel />
                    </div>
                </main>
            </div>
            <StatusBar status={status} />
        </div>
    );
}

export default App;
