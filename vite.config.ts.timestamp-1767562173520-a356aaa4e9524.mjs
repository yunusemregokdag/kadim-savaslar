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
      },
      // Remove console.log and debugger in production
      drop: mode === "production" ? ["console", "debugger"] : []
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dW51c1xcXFxPbmVEcml2ZVxcXFxNYXNhXHUwMEZDc3RcdTAwRkNcXFxcS2FkaW0gc2F2YVx1MDE1RmxhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXVudXNcXFxcT25lRHJpdmVcXFxcTWFzYVx1MDBGQ3N0XHUwMEZDXFxcXEthZGltIHNhdmFcdTAxNUZsYXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l1bnVzL09uZURyaXZlL01hc2ElQzMlQkNzdCVDMyVCQy9LYWRpbSUyMHNhdmElQzUlOUZsYXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnL3NvY2tldC5pbyc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAncHJvY2Vzcy5lbnYuQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSksXHJcbiAgICAgICdwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSlcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLicpLFxyXG4gICAgICAgIC8vIEZpeCBUaHJlZS5qcyBpbXBvcnRzIGZvciBtb2JpbGVcclxuICAgICAgICAndGhyZWUnOiAndGhyZWUnLFxyXG4gICAgICB9LFxyXG4gICAgICBkZWR1cGU6IFsndGhyZWUnLCAncmVhY3QnLCAncmVhY3QtZG9tJywgJ0ByZWFjdC10aHJlZS9maWJlcicsICdAcmVhY3QtdGhyZWUvZHJlaSddXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFsndGhyZWUnLCAnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJywgJ0ByZWFjdC10aHJlZS9wb3N0cHJvY2Vzc2luZycsICdpdHMtZmluZSddLFxyXG4gICAgICBleGNsdWRlOiBbJ0B0eXBlcy90aHJlZSddLFxyXG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICAgIC8vIEZpeCBmb3IgbW9iaWxlIFdlYlZpZXdcclxuICAgICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICAgIHN1cHBvcnRlZDoge1xyXG4gICAgICAgICAgJ3RvcC1sZXZlbC1hd2FpdCc6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICAvLyBPcHRpbWl6ZSBmb3IgbW9iaWxlXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICd0aHJlZS12ZW5kb3InOiBbJ3RocmVlJ10sXHJcbiAgICAgICAgICAgICdyZWFjdC10aHJlZSc6IFsnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJ10sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICAvLyBFbnN1cmUgcHJvcGVyIEVTIG1vZHVsZSBoYW5kbGluZ1xyXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICBzdXBwb3J0ZWQ6IHtcclxuICAgICAgICAndG9wLWxldmVsLWF3YWl0JzogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICAvLyBSZW1vdmUgY29uc29sZS5sb2cgYW5kIGRlYnVnZ2VyIGluIHByb2R1Y3Rpb25cclxuICAgICAgZHJvcDogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10gOiBbXVxyXG4gICAgfVxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRWLE9BQU8sVUFBVTtBQUM3VyxTQUFTLGNBQWMsZUFBZTtBQUN0QyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFIeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxLQUFLLEVBQUU7QUFDakMsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBLGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxVQUNSLElBQUk7QUFBQSxVQUNKLGNBQWM7QUFBQSxRQUNoQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztBQUFBLElBQ2hDLFFBQVE7QUFBQSxNQUNOLHVCQUF1QixLQUFLLFVBQVUsSUFBSSxjQUFjO0FBQUEsTUFDeEQsOEJBQThCLEtBQUssVUFBVSxJQUFJLGNBQWM7QUFBQSxJQUNqRTtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsR0FBRztBQUFBO0FBQUEsUUFFaEMsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLFNBQVMsYUFBYSxzQkFBc0IsbUJBQW1CO0FBQUEsSUFDbkY7QUFBQSxJQUNBLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxTQUFTLHNCQUFzQixxQkFBcUIsK0JBQStCLFVBQVU7QUFBQSxNQUN2RyxTQUFTLENBQUMsY0FBYztBQUFBLE1BQ3hCLGdCQUFnQjtBQUFBO0FBQUEsUUFFZCxRQUFRO0FBQUEsUUFDUixXQUFXO0FBQUEsVUFDVCxtQkFBbUI7QUFBQSxRQUNyQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUE7QUFBQSxNQUVSLHVCQUF1QjtBQUFBLE1BQ3ZCLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxVQUNOLGNBQWM7QUFBQSxZQUNaLGdCQUFnQixDQUFDLE9BQU87QUFBQSxZQUN4QixlQUFlLENBQUMsc0JBQXNCLG1CQUFtQjtBQUFBLFVBQzNEO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUE7QUFBQSxNQUVQLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxRQUNULG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUE7QUFBQSxNQUVBLE1BQU0sU0FBUyxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLElBQzNEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
