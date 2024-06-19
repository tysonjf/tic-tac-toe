import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@sockets": path.resolve(__dirname, "./src/sockets"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  plugins: [react()],
});
