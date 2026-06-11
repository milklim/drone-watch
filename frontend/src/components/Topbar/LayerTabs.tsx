/**
 * DroneWatch — analytics layer tabs.
 *
 * Bound to `settingsStore.activeLayer`. The deck.gl overlay these drive arrives
 * in Phase 5; the tabs own only the active-layer selection.
 */

import { useSettingsStore } from "../../store/settingsStore.ts";
import type { ActiveLayer } from "../../store/settingsStore.ts";

const TABS: { layer: ActiveLayer; label: string }[] = [
    { layer: "map", label: "MAP" },
    { layer: "heatmap", label: "HEATMAP" },
    { layer: "trajectories", label: "TRAJECTORIES" },
];

export function LayerTabs() {
    const activeLayer = useSettingsStore((s) => s.activeLayer);
    const setActiveLayer = useSettingsStore((s) => s.setActiveLayer);

    return (
        <div className="hidden h-full items-center gap-0.5 border-r border-border-base px-4 md:flex">
            {TABS.map(({ layer, label }) => {
                const active = layer === activeLayer;
                return (
                    <button
                        key={layer}
                        type="button"
                        onClick={() => setActiveLayer(layer)}
                        className={`flex h-7 items-center rounded-[3px] px-3 text-[10px] font-bold tracking-widest transition-colors ${
                            active
                                ? "bg-accent-dim text-accent"
                                : "text-dim hover:bg-surface-2 hover:text-text"
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
