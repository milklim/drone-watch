# DroneWatch — frontend

React 19 + Vite + TypeScript client. See the [root README](../README.md) for the
project overview, dual-engine architecture, and run instructions.

```bash
npm install
cp .env.example .env   # paste your Mapbox token into VITE_MAPBOX_TOKEN
npm run dev            # http://localhost:5173 (proxies /api and /ws to :8080)
```

Scripts: `npm run dev` · `npm run build` (`tsc -b && vite build`) · `npm run lint` · `npm run preview`.
