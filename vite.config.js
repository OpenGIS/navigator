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
      fileName: "navigator",
    },
    rollupOptions: {
      external: ["vue", "@ogis/waymark-js"],
      output: {
        globals: {
          vue: "Vue",
          "@ogis/waymark-js": "WaymarkJS",
        },
      },
    },
  },

  server: {
    open: "/dev.html",
  },
});
