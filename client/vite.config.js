import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    open: true, // Automatically open the app in the browser
    historyApiFallback: true, // Redirect 404s to index.html
  },
});
