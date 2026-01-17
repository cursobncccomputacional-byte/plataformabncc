import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usar caminhos relativos para funcionar em subpastas
  base: './',
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: false,
    hmr: {
      port: 3001,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
