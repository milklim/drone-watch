/**
 * DroneWatch — top command bar.
 *
 * Assembles the brand mark, live fleet pills, the WebSocket indicator, and the
 * new-mission action into the C2 header strip.
 */

import type { ConnectionStatus } from "../../hooks/useWebSocket.ts";
import { DroneIcon } from "../icons/DroneIcon.tsx";
import { StatusPills } from "./StatusPills.tsx";

const WS_LABEL: Record<ConnectionStatus, string> = {
    open: "WS LIVE",
    connecting: "WS CONNECTING",
    closed: "WS DOWN",
};

const WS_COLOR: Record<ConnectionStatus, string> = {
    open: "text-active",
    connecting: "text-idle",
    closed: "text-danger",
};

const WS_DOT: Record<ConnectionStatus, string> = {
    open: "bg-active animate-pulse",
    connecting: "bg-idle animate-pulse",
    closed: "bg-danger",
};

export function Topbar({
    status,
    onNewMission,
}: {
    status: ConnectionStatus;
    onNewMission: () => void;
}) {
    return (
        <header className="z-10 flex h-(--spacing-topbar) shrink-0 items-center overflow-hidden border-b border-border-base bg-surface px-3 md:px-4">
            <div className="flex shrink-0 select-none items-center gap-2.5 border-r border-border-base pr-5 text-[13px] font-bold tracking-[0.18em] text-white">
                <DroneIcon />
                <span className="hidden lg:inline">DRONEWATCH</span>
            </div>

            <StatusPills />

            <div
                data-testid="ws-status"
                className={`hidden items-center gap-2 border-r border-border-base px-4.5 text-[10px] font-medium tracking-widest lg:flex ${WS_COLOR[status]}`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${WS_DOT[status]}`}
                />
                {WS_LABEL[status]}
            </div>

            <button
                type="button"
                onClick={onNewMission}
                className="ml-auto shrink-0 whitespace-nowrap h-7.5 rounded-[3px] bg-accent px-3 text-[11px] font-bold tracking-[0.12em] text-white transition-colors hover:bg-[#2563eb] active:scale-[0.97] md:px-4 md:text-[10px]"
            >
                +<span className="hidden md:inline"> NEW MISSION</span>
            </button>
        </header>
    );
}
