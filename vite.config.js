import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.js", import.meta.url)),
      name: "Navigator",
      formats: ["es"],
      // fileName: "navigator",
    },
    rollupOptions: {
      external: ["vue", "maplibre-gl"],
      output: {
        globals: {
          vue: "Vue",
          "maplibre-gl": "maplibregl",
        },
      },
    },
  },

  server: {
    open: "/dev.html",
  },
});
