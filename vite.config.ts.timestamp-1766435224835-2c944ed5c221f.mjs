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
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false
        },
        "/socket.io": {
          target: "http://localhost:3001",
          ws: true,
          changeOrigin: true
        }
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "."),
        // Fix Three.js imports for mobile
        "three": "three"
      },
      dedupe: ["three", "react", "react-dom", "@react-three/fiber", "@react-three/drei"]
    },
    optimizeDeps: {
      include: ["three", "@react-three/fiber", "@react-three/drei", "@react-three/postprocessing", "its-fine"],
      exclude: ["@types/three"],
      esbuildOptions: {
        // Fix for mobile WebView
        target: "es2020",
        supported: {
          "top-level-await": true
        }
      }
    },
    build: {
      target: "es2020",
      // Optimize for mobile
      chunkSizeWarningLimit: 2e3,
      rollupOptions: {
        output: {
          manualChunks: {
            "three-vendor": ["three"],
            "react-three": ["@react-three/fiber", "@react-three/drei"]
          }
        }
      }
    },
    esbuild: {
      // Ensure proper ES module handling
      target: "es2020",
      supported: {
        "top-level-await": true
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dW51c1xcXFxPbmVEcml2ZVxcXFxNYXNhXHUwMEZDc3RcdTAwRkNcXFxcS2FkaW0gc2F2YVx1MDE1RmxhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXVudXNcXFxcT25lRHJpdmVcXFxcTWFzYVx1MDBGQ3N0XHUwMEZDXFxcXEthZGltIHNhdmFcdTAxNUZsYXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l1bnVzL09uZURyaXZlL01hc2ElQzMlQkNzdCVDMyVCQy9LYWRpbSUyMHNhdmElQzUlOUZsYXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcbiAgcmV0dXJuIHtcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgICcvc29ja2V0LmlvJzoge1xuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXG4gICAgICAgICAgd3M6IHRydWUsXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdwcm9jZXNzLmVudi5BUElfS0VZJzogSlNPTi5zdHJpbmdpZnkoZW52LkdFTUlOSV9BUElfS0VZKSxcbiAgICAgICdwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSlcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4nKSxcbiAgICAgICAgLy8gRml4IFRocmVlLmpzIGltcG9ydHMgZm9yIG1vYmlsZVxuICAgICAgICAndGhyZWUnOiAndGhyZWUnLFxuICAgICAgfSxcbiAgICAgIGRlZHVwZTogWyd0aHJlZScsICdyZWFjdCcsICdyZWFjdC1kb20nLCAnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJ11cbiAgICB9LFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgaW5jbHVkZTogWyd0aHJlZScsICdAcmVhY3QtdGhyZWUvZmliZXInLCAnQHJlYWN0LXRocmVlL2RyZWknLCAnQHJlYWN0LXRocmVlL3Bvc3Rwcm9jZXNzaW5nJywgJ2l0cy1maW5lJ10sXG4gICAgICBleGNsdWRlOiBbJ0B0eXBlcy90aHJlZSddLFxuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcbiAgICAgICAgLy8gRml4IGZvciBtb2JpbGUgV2ViVmlld1xuICAgICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgICBzdXBwb3J0ZWQ6IHtcbiAgICAgICAgICAndG9wLWxldmVsLWF3YWl0JzogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcbiAgICAgIC8vIE9wdGltaXplIGZvciBtb2JpbGVcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAndGhyZWUtdmVuZG9yJzogWyd0aHJlZSddLFxuICAgICAgICAgICAgJ3JlYWN0LXRocmVlJzogWydAcmVhY3QtdGhyZWUvZmliZXInLCAnQHJlYWN0LXRocmVlL2RyZWknXSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGVzYnVpbGQ6IHtcbiAgICAgIC8vIEVuc3VyZSBwcm9wZXIgRVMgbW9kdWxlIGhhbmRsaW5nXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgICAgc3VwcG9ydGVkOiB7XG4gICAgICAgICd0b3AtbGV2ZWwtYXdhaXQnOiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRWLE9BQU8sVUFBVTtBQUM3VyxTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFIeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxLQUFLLEVBQUU7QUFDakMsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLElBQUk7QUFBQSxVQUNKLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLElBQ2hDLFFBQVE7QUFBQSxNQUNOLHVCQUF1QixLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsTUFDeEQsOEJBQThCLEtBQUssVUFBVSxJQUFJLGNBQWM7QUFBQSxJQUNqRTtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUFBO0FBQUEsUUFFaEMsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLFNBQVMsYUFBYSxzQkFBc0IsbUJBQW1CO0FBQUEsSUFDbkY7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxTQUFTLHNCQUFzQixxQkFBcUIsK0JBQStCLFVBQVU7QUFBQSxNQUN2RyxTQUFTLENBQUMsY0FBYztBQUFBLE1BQ3hCLGdCQUFnQjtBQUFBO0FBQUEsUUFFZCxRQUFRO0FBQUEsUUFDUixXQUFXO0FBQUEsVUFDVCxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUE7QUFBQSxNQUVSLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQSxZQUNaLGdCQUFnQixDQUFDLE9BQU87QUFBQSxZQUN4QixlQUFlLENBQUMsc0JBQXNCLG1CQUFtQjtBQUFBLFVBQzNEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUE7QUFBQSxNQUVQLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxRQUNULG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
