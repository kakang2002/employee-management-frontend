import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './', // Use relative paths for GitHub Pages compatibility
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

