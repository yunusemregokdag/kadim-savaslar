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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5dW51c1xcXFxPbmVEcml2ZVxcXFxNYXNhXHUwMEZDc3RcdTAwRkNcXFxcS2FkaW0gc2F2YVx1MDE1RmxhclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxceXVudXNcXFxcT25lRHJpdmVcXFxcTWFzYVx1MDBGQ3N0XHUwMEZDXFxcXEthZGltIHNhdmFcdTAxNUZsYXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3l1bnVzL09uZURyaXZlL01hc2ElQzMlQkNzdCVDMyVCQy9LYWRpbSUyMHNhdmElQzUlOUZsYXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAnLicsICcnKTtcclxuICByZXR1cm4ge1xyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDMwMDAsXHJcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnL3NvY2tldC5pbyc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMScsXHJcbiAgICAgICAgICB3czogdHJ1ZSxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCB0YWlsd2luZGNzcygpXSxcclxuICAgIGRlZmluZToge1xyXG4gICAgICAncHJvY2Vzcy5lbnYuQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSksXHJcbiAgICAgICdwcm9jZXNzLmVudi5HRU1JTklfQVBJX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5HRU1JTklfQVBJX0tFWSlcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLicpLFxyXG4gICAgICAgIC8vIEZpeCBUaHJlZS5qcyBpbXBvcnRzIGZvciBtb2JpbGVcclxuICAgICAgICAndGhyZWUnOiAndGhyZWUnLFxyXG4gICAgICB9LFxyXG4gICAgICBkZWR1cGU6IFsndGhyZWUnLCAncmVhY3QnLCAncmVhY3QtZG9tJywgJ0ByZWFjdC10aHJlZS9maWJlcicsICdAcmVhY3QtdGhyZWUvZHJlaSddXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFsndGhyZWUnLCAnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJywgJ0ByZWFjdC10aHJlZS9wb3N0cHJvY2Vzc2luZycsICdpdHMtZmluZSddLFxyXG4gICAgICBleGNsdWRlOiBbJ0B0eXBlcy90aHJlZSddLFxyXG4gICAgICBlc2J1aWxkT3B0aW9uczoge1xyXG4gICAgICAgIC8vIEZpeCBmb3IgbW9iaWxlIFdlYlZpZXdcclxuICAgICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICAgIHN1cHBvcnRlZDoge1xyXG4gICAgICAgICAgJ3RvcC1sZXZlbC1hd2FpdCc6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICAvLyBPcHRpbWl6ZSBmb3IgbW9iaWxlXHJcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAgICd0aHJlZS12ZW5kb3InOiBbJ3RocmVlJ10sXHJcbiAgICAgICAgICAgICdyZWFjdC10aHJlZSc6IFsnQHJlYWN0LXRocmVlL2ZpYmVyJywgJ0ByZWFjdC10aHJlZS9kcmVpJ10sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICAvLyBFbnN1cmUgcHJvcGVyIEVTIG1vZHVsZSBoYW5kbGluZ1xyXG4gICAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgICBzdXBwb3J0ZWQ6IHtcclxuICAgICAgICAndG9wLWxldmVsLWF3YWl0JzogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFYsT0FBTyxVQUFVO0FBQzdXLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUh4QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLEtBQUssRUFBRTtBQUNqQyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0EsY0FBYztBQUFBLFVBQ1osUUFBUTtBQUFBLFVBQ1IsSUFBSTtBQUFBLFVBQ0osY0FBYztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDO0FBQUEsSUFDaEMsUUFBUTtBQUFBLE1BQ04sdUJBQXVCLEtBQUssVUFBVSxJQUFJLGNBQWM7QUFBQSxNQUN4RCw4QkFBOEIsS0FBSyxVQUFVLElBQUksY0FBYztBQUFBLElBQ2pFO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxHQUFHO0FBQUE7QUFBQSxRQUVoQyxTQUFTO0FBQUEsTUFDWDtBQUFBLE1BQ0EsUUFBUSxDQUFDLFNBQVMsU0FBUyxhQUFhLHNCQUFzQixtQkFBbUI7QUFBQSxJQUNuRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLFNBQVMsc0JBQXNCLHFCQUFxQiwrQkFBK0IsVUFBVTtBQUFBLE1BQ3ZHLFNBQVMsQ0FBQyxjQUFjO0FBQUEsTUFDeEIsZ0JBQWdCO0FBQUE7QUFBQSxRQUVkLFFBQVE7QUFBQSxRQUNSLFdBQVc7QUFBQSxVQUNULG1CQUFtQjtBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQTtBQUFBLE1BRVIsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osZ0JBQWdCLENBQUMsT0FBTztBQUFBLFlBQ3hCLGVBQWUsQ0FBQyxzQkFBc0IsbUJBQW1CO0FBQUEsVUFDM0Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQTtBQUFBLE1BRVAsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLFFBQ1QsbUJBQW1CO0FBQUEsTUFDckI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
