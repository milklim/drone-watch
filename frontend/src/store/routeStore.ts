/**
 * DroneWatch — route store.
 *
 * Holds known routes plus the in-progress draft waypoints used while a user
 * draws a new mission. Coordinates are always canonical `{ lat, lng }`.
 *
 * Drafting is gated: map clicks only land while a mission is being drawn
 * (`drafting` is set by the mission modal), so stray clicks outside the flow
 * don't accumulate waypoints.
 */

import { create } from "zustand";
import type { LatLng, Route } from "../../../shared/types.ts";

interface RouteState {
    routes: Route[];
    draftWaypoints: LatLng[];
    drafting: boolean;
    setRoutes: (routes: Route[]) => void;
    addRoute: (route: Route) => void;
    beginDraft: () => void;
    addDraftWaypoint: (latlng: LatLng) => void;
    removeDraftWaypoint: (index: number) => void;
    clearDraft: () => void;
}

export const useRouteStore = create<RouteState>()((set) => ({
    routes: [],
    draftWaypoints: [],
    drafting: false,
    setRoutes: (routes) => set({ routes }),
    addRoute: (route) =>
        set((state) => ({ routes: [...state.routes, route] })),
    beginDraft: () => set({ drafting: true }),
    addDraftWaypoint: (latlng) =>
        set((state) =>
            state.drafting
                ? { draftWaypoints: [...state.draftWaypoints, latlng] }
                : {},
        ),
    removeDraftWaypoint: (index) =>
        set((state) => ({
            draftWaypoints: state.draftWaypoints.filter((_, i) => i !== index),
        })),
    clearDraft: () => set({ draftWaypoints: [], drafting: false }),
}));
