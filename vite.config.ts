import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from 'vite-plugin-environment'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util'
    }
  },
  plugins: [react(), EnvironmentPlugin('all')],
});
