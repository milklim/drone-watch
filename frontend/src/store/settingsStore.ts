/**
 * DroneWatch — settings store.
 *
 * UI preferences that drive presentation only: which map engine renders.
 */

import { create } from "zustand";

export type MapEngine = "leaflet" | "mapbox";

interface SettingsState {
    mapEngine: MapEngine;
    followSelected: boolean; // Mapbox-only: ease camera to track selection
    setMapEngine: (engine: MapEngine) => void;
    setFollowSelected: (follow: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
    mapEngine: "leaflet",
    followSelected: false,
    setMapEngine: (mapEngine) => set({ mapEngine }),
    setFollowSelected: (followSelected) => set({ followSelected }),
}));
