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

    return (
        <div className="flex h-full flex-col bg-bg text-text">
            <Topbar
                status={status}
                onNewMission={() => setMissionOpen(true)}
            />
            <div className="flex min-h-0 flex-1">
                <Sidebar />
                <main className="relative min-w-0 flex-1">
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
