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
    followSelected: boolean; // Mapbox-only: ease camera to track selection
    setMapEngine: (engine: MapEngine) => void;
    setActiveLayer: (layer: ActiveLayer) => void;
    setFollowSelected: (follow: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
    mapEngine: "leaflet",
    activeLayer: "map",
    followSelected: false,
    setMapEngine: (mapEngine) => set({ mapEngine }),
    setActiveLayer: (activeLayer) => set({ activeLayer }),
    setFollowSelected: (followSelected) => set({ followSelected }),
}));
