import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // Subdomínio (cursos.novaedubncc.com.br): assets devem ser absolutos.
  // Com base './', ao acessar /login os assets viram /login/assets/... e dão 404.
  base: '/',
  root: path.resolve(__dirname),
  server: {
    host: 'localhost',
    port: 3002,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
