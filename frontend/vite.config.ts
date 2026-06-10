import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        // Proxy API + WebSocket to the backend so the browser only ever talks to
        // the Vite origin. Avoids relying on WSL2 forwarding a second port.
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/ws": {
                target: "ws://localhost:8080",
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
