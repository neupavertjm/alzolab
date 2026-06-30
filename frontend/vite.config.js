import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, el frontend (5173) habla con la API (8000) a través de este
// proxy: el cliente usa rutas relativas (`/api/...`), iguales que en producción,
// donde FastAPI sirve el SPA y la API desde el mismo origen.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
