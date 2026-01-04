import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    include: ["react/jsx-runtime", "react/jsx-dev-runtime"],
  },

  server: {
    port: 3001,

    // إذا تحتاج COOP للـ popup
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },

    // Proxy /api -> backend على 3000
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
