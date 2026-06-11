/**
 * DroneWatch — settings panel.
 *
 * Drives presentation-only preferences in `settingsStore`: the active map
 * engine and the Mapbox follow-camera toggle. Switching the engine here swaps
 * Leaflet ↔ Mapbox with no loss of drone/route state — that state lives in the
 * stores, not the map components.
 */

import { useSettingsStore } from "../../store/settingsStore.ts";

export function SettingsPanel() {
    const mapEngine = useSettingsStore((s) => s.mapEngine);
    const setMapEngine = useSettingsStore((s) => s.setMapEngine);
    const followSelected = useSettingsStore((s) => s.followSelected);
    const setFollowSelected = useSettingsStore((s) => s.setFollowSelected);

    return (
        <div className="flex flex-col gap-2 rounded border border-border-base bg-surface/90 px-3 py-2.5 backdrop-blur">
            <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-dim">
                    Map engine
                </span>
                <select
                    value={mapEngine}
                    onChange={(e) =>
                        setMapEngine(e.target.value as typeof mapEngine)
                    }
                    className="rounded border border-border-base bg-surface-2 px-2 py-1 text-text outline-none focus:border-accent"
                >
                    <option value="leaflet">Leaflet (OpenStreetMap)</option>
                    <option value="mapbox">Mapbox (3D + dark)</option>
                </select>
            </label>

            <label
                className={`flex items-center gap-2 ${
                    mapEngine === "mapbox" ? "text-text" : "text-muted"
                }`}
            >
                <input
                    type="checkbox"
                    checked={followSelected}
                    disabled={mapEngine !== "mapbox"}
                    onChange={(e) => setFollowSelected(e.target.checked)}
                    className="accent-accent"
                />
                <span>Follow selected drone</span>
            </label>
        </div>
    );
}
