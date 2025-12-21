// vite.config.ts
import path from "path";
import { defineConfig, loadEnv } from "file:///C:/Users/yunus/OneDrive/Masa%C3%BCst%C3%BC/Kadim%20sava%C5%9Flar/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/yunus/OneDrive/Masa%C3%BCst%C3%BC/Kadim%20sava%C5%9Flar/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/yunus/OneDrive/Masa%C3%BCst%C3%BC/Kadim%20sava%C5%9Flar/node_modules/@tailwindcss/vite/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\yunus\\OneDrive\\Masa\xFCst\xFC\\Kadim sava\u015Flar";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3e3,
      host: "0.0.0.0"
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, ".")
      },
      dedupe: ["three"]
    },
    optimizeDeps: {
      include: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dW51c1xcXFxPbmVEcml2ZVxcXFxNYXNhXHUwMEZDc3RcdTAwRkNcXFxcS2FkaW0gc2F2YVx1MDE1RmxhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXVudXNcXFxcT25lRHJpdmVcXFxcTWFzYVx1MDBGQ3N0XHUwMEZDXFxcXEthZGltIHNhdmFcdTAxNUZsYXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l1bnVzL09uZURyaXZlL01hc2ElQzMlQkNzdCVDMyVCQy9LYWRpbSUyMHNhdmElQzUlOUZsYXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAncHJvY2Vzcy5lbnYuQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSksXG4gICAgICAncHJvY2Vzcy5lbnYuR0VNSU5JX0FQSV9LRVknOiBKU09OLnN0cmluZ2lmeShlbnYuR0VNSU5JX0FQSV9LRVkpXG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuJyksXG4gICAgICB9LFxuICAgICAgZGVkdXBlOiBbJ3RocmVlJ11cbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWyd0aHJlZScsICdAcmVhY3QtdGhyZWUvZmliZXInLCAnQHJlYWN0LXRocmVlL2RyZWknLCAnQHJlYWN0LXRocmVlL3Bvc3Rwcm9jZXNzaW5nJ11cbiAgICB9XG4gIH07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFYsT0FBTyxVQUFVO0FBQzdXLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssRUFBRTtBQUNqQyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsSUFDUjtBQUFBLElBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxJQUNoQyxRQUFRO0FBQUEsTUFDTix1QkFBdUIsS0FBSyxVQUFVLElBQUksY0FBYztBQUFBLE1BQ3hELDhCQUE4QixLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsSUFDakU7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLEdBQUc7QUFBQSxNQUNsQztBQUFBLE1BQ0EsUUFBUSxDQUFDLE9BQU87QUFBQSxJQUNsQjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFNBQVMsc0JBQXNCLHFCQUFxQiw2QkFBNkI7QUFBQSxJQUM3RjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
