/**
 * DroneWatch — transient UI store.
 *
 * Presentation-only ephemeral state that doesn't belong to a domain store. The
 * live cursor position is written by whichever map engine is mounted (canonical
 * `{ lat, lng }`) and read by the bottom status bar.
 */

import { create } from "zustand";
import type { LatLng } from "../../../shared/types.ts";

interface UiState {
    cursor: LatLng | null;
    setCursor: (cursor: LatLng | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
    cursor: null,
    setCursor: (cursor) => set({ cursor }),
}));
