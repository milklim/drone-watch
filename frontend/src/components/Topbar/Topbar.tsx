/**
 * DroneWatch — top command bar.
 *
 * Assembles the brand mark, live fleet pills, analytics tabs, the WebSocket
 * indicator, and the new-mission action into the C2 header strip.
 */

import type { ConnectionStatus } from "../../hooks/useWebSocket.ts";
import { StatusPills } from "./StatusPills.tsx";
import { LayerTabs } from "./LayerTabs.tsx";

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
        <header className="z-10 flex h-(--spacing-topbar) shrink-0 items-center border-b border-border-base bg-surface px-4">
            <div className="flex select-none items-center gap-2.5 border-r border-border-base pr-5 text-[13px] font-bold tracking-[0.18em] text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <polygon
                        points="12,2 4,9 7,9 7,15 9,15 9,11 15,11 15,15 17,15 17,9 20,9"
                        fill="#3b82f6"
                        opacity="0.9"
                    />
                    <rect
                        x="10"
                        y="15"
                        width="4"
                        height="6"
                        fill="#3b82f6"
                        opacity="0.7"
                    />
                    <line
                        x1="7"
                        y1="18"
                        x2="17"
                        y2="18"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        opacity="0.5"
                    />
                    <circle cx="12" cy="6" r="1.5" fill="#93c5fd" />
                </svg>
                DRONEWATCH
            </div>

            <StatusPills />
            <LayerTabs />

            <div
                className={`flex items-center gap-2 border-r border-border-base px-4.5 text-[10px] font-medium tracking-widest ${WS_COLOR[status]}`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${WS_DOT[status]}`}
                />
                {WS_LABEL[status]}
            </div>

            <button
                type="button"
                onClick={onNewMission}
                className="ml-auto h-7.5 rounded-[3px] bg-accent px-4 text-[10px] font-bold tracking-[0.12em] text-white transition-colors hover:bg-[#2563eb] active:scale-[0.97]"
            >
                + NEW MISSION
            </button>
        </header>
    );
}
