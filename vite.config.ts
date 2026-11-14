
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.GITHUB_ACTIONS
  ? "/Prestige-chess-website-main/"
  : "/";

export default defineConfig({
  base,
  plugins: [react()]
});
