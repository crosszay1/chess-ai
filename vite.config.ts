import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/chess", 
  plugins: [react()],
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
    open: true,
  },
});
