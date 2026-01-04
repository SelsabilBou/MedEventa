import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  optimizeDeps: {
    include: ['react/jsx-runtime', 'react/jsx-dev-runtime']
  },
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
=======
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
>>>>>>> 20af0652a2889cf611cf90939f7100f670ebea10
