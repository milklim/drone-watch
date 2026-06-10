/**
 * DroneWatch — drone store.
 *
 * Holds live drone state fed by the WebSocket and the current selection.
 * Engine-agnostic: maps read from here, they never own drone state.
 */

import { create } from "zustand";
import type { Drone } from "../../../shared/types.ts";

interface DroneState {
    drones: Drone[];
    selectedDroneId: string | null;
    setDrones: (drones: Drone[]) => void;
    selectDrone: (id: string | null) => void;
}

export const useDroneStore = create<DroneState>()((set) => ({
    drones: [],
    selectedDroneId: null,
    setDrones: (drones) => set({ drones }),
    selectDrone: (id) => set({ selectedDroneId: id }),
}));
