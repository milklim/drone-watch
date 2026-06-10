import { useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket.ts";
import { useDroneStore } from "./store/droneStore.ts";
import type { ConnectionStatus } from "./hooks/useWebSocket.ts";

const STATUS_COLOR: Record<ConnectionStatus, string> = {
    open: "text-active",
    connecting: "text-idle",
    closed: "text-danger",
};

/**
 * Phase 2 debug shell: verifies the live data pipeline (WebSocket → store → UI)
 * with a plain drone list. Replaced by the real map shell in Phase 3.
 */
function App() {
    const { status } = useWebSocket();
    const drones = useDroneStore((s) => s.drones);
    const selectedDroneId = useDroneStore((s) => s.selectedDroneId);
    const selectDrone = useDroneStore((s) => s.selectDrone);

    useEffect(() => {
        console.log("[debug] selectedDroneId =", selectedDroneId);
    }, [selectedDroneId]);

    return (
        <div className="h-full overflow-auto bg-bg p-6 text-text">
            <header className="mb-4 flex items-baseline justify-between border-b border-border-base pb-3">
                <h1 className="text-lg font-semibold tracking-[0.18em] text-white">
                    DRONEWATCH
                </h1>
                <span className="text-dim">
                    ws:{" "}
                    <span className={STATUS_COLOR[status]}>{status}</span> ·{" "}
                    {drones.length} drones
                </span>
            </header>

            <ul className="space-y-1">
                {drones.map((d) => {
                    const selected = d.id === selectedDroneId;
                    return (
                        <li key={d.id}>
                            <button
                                type="button"
                                onClick={() => selectDrone(d.id)}
                                className={`flex w-full items-center gap-3 rounded border px-3 py-2 text-left transition-colors ${
                                    selected
                                        ? "border-accent bg-accent-dim text-white"
                                        : "border-border-base bg-surface hover:border-border-hi"
                                }`}
                            >
                                <span className="w-16 text-accent">{d.id}</span>
                                <span className="w-24 font-semibold">
                                    {d.callsign}
                                </span>
                                <span className="w-16 text-dim">{d.status}</span>
                                <span className="text-dim">
                                    {d.position.lat.toFixed(5)},{" "}
                                    {d.position.lng.toFixed(5)}
                                </span>
                            </button>
                        </li>
                    );
                })}
                {drones.length === 0 && (
                    <li className="text-dim">Waiting for drone feed…</li>
                )}
            </ul>
        </div>
    );
}

export default App;
