/**
 * DroneWatch — mission creation flow.
 *
 * Floating panel (not a blocking modal): while open, the map stays clickable
 * so the user can drop waypoints — the overlay container is pointer-events-none
 * and only the panel itself captures input. Opening begins a draft in the route
 * store; map clicks land in `draftWaypoints` and render live via the engines'
 * existing draft layers.
 *
 * Launch: POST /api/routes, then `mission:create` + `mission:start` over the
 * socket. The backend assigns the drone, starts the simulator, and pushes a
 * `routes:update` snapshot — no refetch needed here.
 */

import { useEffect, useMemo, useState } from "react";
import type { ClientMessage, Route } from "../../../../shared/types.ts";
import { useDroneStore } from "../../store/droneStore.ts";
import { useRouteStore } from "../../store/routeStore.ts";
import { formatLatLng } from "../../lib/format.ts";

const API = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
            {children}
        </span>
    );
}

export function MissionModal({
    open,
    onClose,
    send,
}: {
    open: boolean;
    onClose: () => void;
    send: (message: ClientMessage) => void;
}) {
    // Mount the panel fresh on every open: its local state (name suggestion,
    // error, drone choice) initializes in useState rather than being reset by
    // effects.
    return open ? <MissionPanel onClose={onClose} send={send} /> : null;
}

function MissionPanel({
    onClose,
    send,
}: {
    onClose: () => void;
    send: (message: ClientMessage) => void;
}) {
    const drones = useDroneStore((s) => s.drones);
    const routes = useRouteStore((s) => s.routes);
    const draftWaypoints = useRouteStore((s) => s.draftWaypoints);
    const beginDraft = useRouteStore((s) => s.beginDraft);
    const removeDraftWaypoint = useRouteStore((s) => s.removeDraftWaypoint);
    const clearDraft = useRouteStore((s) => s.clearDraft);

    const [name, setName] = useState(() => `Patrol N-${routes.length + 1}`);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Only the user's explicit choice is stored; the effective selection is
    // derived below, so it stays valid as the idle list shifts without a
    // state-syncing effect.
    const [chosenDroneId, setChosenDroneId] = useState<string | null>(null);

    const idleDrones = useMemo(
        () => drones.filter((d) => d.status === "idle"),
        [drones],
    );

    const droneId =
        chosenDroneId && idleDrones.some((d) => d.id === chosenDroneId)
            ? chosenDroneId
            : (idleDrones[0]?.id ?? "");

    // Opening the panel starts a draft in the route store (external system
    // sync — the legitimate job of an effect). Idempotent under StrictMode.
    useEffect(() => {
        beginDraft();
    }, [beginDraft]);

    const canLaunch =
        !busy &&
        name.trim().length > 0 &&
        droneId !== "" &&
        draftWaypoints.length >= 2;

    function cancel() {
        clearDraft();
        onClose();
    }

    async function launch() {
        if (!canLaunch) return;
        setBusy(true);
        setError(null);

        const baseId = slugify(name) || "mission";
        const id = routes.some((r) => r.id === baseId)
            ? `${baseId}-${Date.now().toString(36).slice(-4)}`
            : baseId;
        const route: Route = {
            id,
            name: name.trim(),
            droneId,
            waypoints: draftWaypoints,
        };

        try {
            const res = await fetch(`${API}/routes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(route),
            });
            if (!res.ok) {
                throw new Error(`POST /api/routes failed (${res.status})`);
            }
            send({ type: "mission:create", route });
            send({ type: "mission:start", missionId: route.id });
            clearDraft();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Launch failed");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-1200 flex items-end justify-center md:items-center md:justify-end md:pr-4">
            <div className="pointer-events-auto max-h-[55vh] w-full overflow-y-auto rounded-t-[10px] border border-border-hi bg-surface p-4 shadow-[0_30px_80px_rgba(0,0,0,0.9)] md:max-h-[calc(100vh-6rem)] md:w-100 md:max-w-[85%] md:rounded-[5px] md:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                        New Mission
                    </span>
                    <button
                        type="button"
                        onClick={cancel}
                        className="flex h-6.5 w-6.5 items-center justify-center rounded-[3px] border border-border-base bg-surface-2 text-sm text-dim transition-colors hover:border-border-hi hover:text-text"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <Label>Mission Name</Label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        spellCheck={false}
                        className="h-botbar w-full rounded-[3px] border border-border-hi bg-bg px-3 text-text outline-none transition-colors focus:border-accent"
                    />
                </div>

                <div className="mb-4">
                    <Label>Assign Drone</Label>
                    {idleDrones.length > 0 ? (
                        <select
                            value={droneId}
                            onChange={(e) => setChosenDroneId(e.target.value)}
                            className="h-botbar w-full cursor-pointer rounded-[3px] border border-border-hi bg-bg px-3 text-text outline-none transition-colors focus:border-accent"
                        >
                            {idleDrones.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.id.toUpperCase()} / {d.callsign} — IDLE
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="rounded-[3px] border border-border-base bg-bg px-3 py-2 text-[10px] text-idle">
                            No idle drones — stop a mission to free one up.
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <Label>Waypoints — Click Map to Add</Label>
                    <div className="min-h-20 rounded-[3px] border border-border-base bg-bg p-1.5">
                        {draftWaypoints.map((wp, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 rounded-xs px-1.5 py-1 text-[10px] hover:bg-surface-2"
                            >
                                <span className="w-4.5 shrink-0 text-[9px] text-muted">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="flex-1 font-medium text-text">
                                    {formatLatLng(wp)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeDraftWaypoint(i)}
                                    className="text-[9px] text-danger opacity-60 transition-opacity hover:opacity-100"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <div className="px-1.5 py-1 text-[9px] italic text-muted">
                            {draftWaypoints.length === 0
                                ? "Click on the map to place the first waypoint…"
                                : "Click on the map to add more waypoints…"}
                        </div>
                    </div>
                    <div className="mt-1 text-[9px] tracking-[0.04em] text-muted">
                        {draftWaypoints.length} waypoints · min 2 · drone flies
                        one lap and parks at the start point.
                    </div>
                </div>

                {error && (
                    <div className="mb-3 text-[10px] text-danger">{error}</div>
                )}

                <div className="flex justify-end gap-2.5 border-t border-border-base pt-4">
                    <button
                        type="button"
                        onClick={cancel}
                        className="h-8 rounded-[3px] border border-border-base bg-surface-2 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-dim transition-colors hover:border-border-hi hover:text-text"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={launch}
                        disabled={!canLaunch}
                        className="h-8 rounded-[3px] bg-accent px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {busy ? "Launching…" : "Launch Mission"}
                    </button>
                </div>
            </div>
        </div>
    );
}
