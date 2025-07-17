import { defineConfig } from "vite";
import inferDosPlugin from "../../src/vite-plugin.js";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [inferDosPlugin(), cloudflare()],
});
