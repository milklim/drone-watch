/**
 * DroneWatch — settings store.
 *
 * UI preferences that drive presentation only: which map engine renders and
 * which analytics layer is active.
 */

import { create } from "zustand";

export type MapEngine = "leaflet" | "mapbox";
export type ActiveLayer = "map" | "heatmap" | "trajectories";

interface SettingsState {
    mapEngine: MapEngine;
    activeLayer: ActiveLayer;
    setMapEngine: (engine: MapEngine) => void;
    setActiveLayer: (layer: ActiveLayer) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
    mapEngine: "leaflet",
    activeLayer: "map",
    setMapEngine: (mapEngine) => set({ mapEngine }),
    setActiveLayer: (activeLayer) => set({ activeLayer }),
}));
