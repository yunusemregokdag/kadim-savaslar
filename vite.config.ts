import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        },
        '/socket.io': {
          target: 'http://localhost:3001',
          ws: true,
          changeOrigin: true
        }
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Fix Three.js imports for mobile
        'three': 'three',
      },
      dedupe: ['three', 'react', 'react-dom', '@react-three/fiber', '@react-three/drei']
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing', 'its-fine'],
      exclude: ['@types/three'],
      esbuildOptions: {
        // Fix for mobile WebView
        target: 'es2020',
        supported: {
          'top-level-await': true
        }
      }
    },
    build: {
      target: 'es2020',
      // Optimize for mobile
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            'three-vendor': ['three'],
            'react-three': ['@react-three/fiber', '@react-three/drei'],
          }
        }
      }
    },
    esbuild: {
      // Ensure proper ES module handling
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  };
});
