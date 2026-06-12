# DroneWatch

A web-based **Command & Control (C2)** interface for monitoring a fleet of drones in real time. Define patrol routes, watch drones move live over a WebSocket feed, and switch the underlying map engine at runtime.

🔗 **Live demo:** https://drone-watch-two.vercel.app

> ℹ️ The backend runs on a free Render instance that sleeps after ~15 min idle. The first load after a pause takes ~30–50s to cold-start (you'll see a "Connecting…" banner); the client reconnects automatically once it's awake.

<!-- Add screenshots / a short Loom clip here:
![DroneWatch dashboard](docs/screenshot.png)
-->

---

## Headline: the map engine is swappable at runtime

The defining architectural constraint: **two map rendering engines — Leaflet and Mapbox — are both implemented and interchangeable from the settings panel, with zero loss of state.**

This works because **all drone state lives outside the map components.** Positions, routes, and selection live in a Zustand store; `LeafletMap` and `MapboxMap` consume *identical props* and own no business logic. The store is the brain; the maps are just eyes.

```
            ┌──────────────────────────┐
WebSocket → │  Zustand stores (truth)  │ ← REST snapshot
            │  drones · routes · UI    │
            └────────────┬─────────────┘
                         │  identical props
              ┌──────────┴──────────┐
         <LeafletMap/>   ⇄   <MapboxMap/>      ← swap at runtime
              └─────────────────────┘
```

Three rules make this hold:

1. **Engine-agnostic state.** Both engines receive the same props from a single switcher (`Map/index.tsx`). Add a prop to one, add it to the other — prop parity is the contract.
2. **One coordinate format.** State always stores `{ lat, lng }`. Conversion to engine-specific order (Mapbox wants `[lng, lat]`) happens *only* at the rendering boundary, in `mapUtils`.
3. **The backend is the only mover.** The frontend never computes movement — it renders what the WebSocket sends. The simulator (server-side) interpolates each drone along its route every 500ms.

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite, TypeScript |
| Map engines | `react-leaflet` (Leaflet) · `react-map-gl` (Mapbox GL JS) |
| State | Zustand |
| Realtime | native browser `WebSocket` ↔ `ws` (Node) |
| Backend | Node.js, Express (REST) + `ws` (WebSocket), run via `tsx` |
| Styling | Tailwind CSS v4 (dark, military theme) |

---

## Repository layout

```
drone-watch/
├── shared/types.ts      # data contracts — single source of truth for both ends
├── render.yaml          # Render Blueprint (backend deploy)
├── backend/
│   └── src/
│       ├── server.ts      # Express + HTTP bootstrap, simulator loop
│       ├── wsServer.ts    # WebSocket hub, mission:* handlers
│       ├── simulator.ts   # movement engine (interpolation + bearing)
│       ├── state.ts       # in-memory drones + routes
│       ├── seed.ts        # 5 demo drones, 3 routes near Dnipro, UA
│       └── routes/        # REST: /api/drones, /api/routes
└── frontend/
    └── src/
        ├── store/         # droneStore, routeStore, settingsStore, ui/metrics
        ├── hooks/         # useWebSocket, useTelemetry
        └── components/
            ├── Map/        # index (switcher), LeafletMap, MapboxMap, mapUtils
            ├── Sidebar/    # DroneList, DroneCard, TelemetryPanel, Compass
            ├── Topbar/     # StatusPills
            ├── Bottombar/  # StatusBar
            ├── Mission/    # MissionModal
            └── Settings/   # SettingsPanel (engine switch)
```

## Data contracts

Both ends import shapes from [`shared/types.ts`](shared/types.ts) — `Drone`, `Route`, the
WebSocket messages, and the REST responses. Treat that file as the API contract.

```
GET  /api/drones   → { drones: Drone[] }    # initial snapshot
GET  /api/routes   → { routes: Route[] }
POST /api/routes   → body: Route → Route

WS  server → client:  drones:update (every 500ms) · routes:update (on change)
WS  client → server:  mission:create · mission:start · mission:stop
```

---

## Running locally

**Prerequisites:** Node.js ≥ 20.

**1. Backend** (port 8080):

```bash
cd backend
npm install
npm run dev          # tsx watch — REST + WebSocket + simulator
```

**2. Frontend** (port 5173):

```bash
cd frontend
npm install
cp .env.example .env   # then paste your Mapbox token into VITE_MAPBOX_TOKEN
npm run dev
```

Open http://localhost:5173. The Leaflet engine works without a token; Mapbox needs
`VITE_MAPBOX_TOKEN` (free at [account.mapbox.com](https://account.mapbox.com)). Locally
`VITE_WS_URL`/`VITE_API_URL` stay as same-origin paths (`/ws`, `/api`) — Vite proxies
them to the backend, so the browser only talks to the Vite origin.

---

## Deployment

- **Frontend → Vercel.** Root Directory `frontend`, framework Vite, build `npm run build`, output `dist`. Keep "Include files outside the Root Directory" enabled (the build's `tsc -b` needs `shared/types.ts`). Set the three `VITE_*` env vars to the production backend (absolute `wss://` / `https://` URLs).
- **Backend → Render** (free tier) via the `render.yaml` Blueprint. No build step: it runs TypeScript directly with `tsx`. Render injects `PORT`; the WebSocket and REST share the one port. Health check: `/api/health`.

Production uses secure `wss://` end to end.

---

## Design principles (why it's built this way)

- **Prop parity is the contract between engines** — the switcher is the single place props are passed.
- **Never store coordinates in engine-specific order** — canonical `{lat,lng}` everywhere.
- **The store is the brain; maps are eyes** — no movement math or mission logic inside map components. This is what makes the two engines swappable.
- **Backend is authoritative** for all positions — the frontend renders, it does not simulate.
- **Trails/history are bounded** derived UI state, capped to avoid unbounded memory growth over a long session.
