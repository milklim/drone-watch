/**
 * DroneWatch — route store.
 *
 * Holds known routes plus the in-progress draft waypoints used while a user
 * draws a new mission. Coordinates are always canonical `{ lat, lng }`.
 */

import { create } from "zustand";
import type { LatLng, Route } from "../../../shared/types.ts";

interface RouteState {
    routes: Route[];
    draftWaypoints: LatLng[];
    setRoutes: (routes: Route[]) => void;
    addRoute: (route: Route) => void;
    addDraftWaypoint: (latlng: LatLng) => void;
    clearDraft: () => void;
}

export const useRouteStore = create<RouteState>()((set) => ({
    routes: [],
    draftWaypoints: [],
    setRoutes: (routes) => set({ routes }),
    addRoute: (route) =>
        set((state) => ({ routes: [...state.routes, route] })),
    addDraftWaypoint: (latlng) =>
        set((state) => ({ draftWaypoints: [...state.draftWaypoints, latlng] })),
    clearDraft: () => set({ draftWaypoints: [] }),
}));
