import { useState } from "react";
import { MapView } from "./components/Map/index.tsx";
import { SettingsPanel } from "./components/Settings/SettingsPanel.tsx";
import { Topbar } from "./components/Topbar/Topbar.tsx";
import { Sidebar } from "./components/Sidebar/Sidebar.tsx";
import { StatusBar } from "./components/Bottombar/StatusBar.tsx";
import { MissionModal } from "./components/Mission/MissionModal.tsx";
import { MapOverlays } from "./components/MapOverlays.tsx";
import { useWebSocket } from "./hooks/useWebSocket.ts";
import { useMetricsTracker } from "./hooks/useMetricsTracker.ts";

function App() {
    // Routes arrive over the socket too (snapshot on connect + routes:update
    // on change), so no REST bootstrap is needed.
    const { status, send } = useWebSocket();
    useMetricsTracker();
    const [missionOpen, setMissionOpen] = useState(false);
    // Mobile-only: the roster + telemetry collapse into a bottom drawer. From
    // 768px up the Sidebar is a static rail and this flag is inert.
    const [assetsOpen, setAssetsOpen] = useState(false);

    function openMission() {
        // The mission sheet needs the map clear for waypoint taps, so collapse
        // the drawer (it also hides on mobile while the sheet is up).
        setAssetsOpen(false);
        setMissionOpen(true);
    }

    return (
        <div className="flex h-dvh flex-col bg-bg text-text">
            <Topbar status={status} onNewMission={openMission} />
            <div className="relative flex min-h-0 flex-1">
                <Sidebar
                    open={assetsOpen}
                    onToggle={() => setAssetsOpen((v) => !v)}
                    hiddenOnMobile={missionOpen}
                />
                {/* `isolate` traps Leaflet's high z-index panes/controls
                    (up to ~1000) inside the map so they can't paint over the
                    sidebar drawer or status bar. */}
                <main className="relative isolate min-w-0 flex-1">
                    <MapView />
                    <MapOverlays status={status} />
                    <div className="absolute right-3 top-3 z-1100">
                        <SettingsPanel />
                    </div>
                    <MissionModal
                        open={missionOpen}
                        onClose={() => setMissionOpen(false)}
                        send={send}
                    />
                </main>
            </div>
            <StatusBar status={status} />
        </div>
    );
}

export default App;
