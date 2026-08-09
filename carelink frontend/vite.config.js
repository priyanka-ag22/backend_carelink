import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Pin HMR websocket to a specific port to avoid Windows firewall/antivirus
    // blocking the auto-selected port (was :3080) which caused "server connection lost"
    // and triggered blank white-screen reloads.
    hmr: {
      port: 3001,
    },
    // Proxy /api calls to the Spring Boot backend to avoid CORS issues in dev
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
