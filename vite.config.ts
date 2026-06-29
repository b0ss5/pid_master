import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// `base: './'` keeps asset paths relative so the built app works when served
// from a subpath/subdomain (the end goal: a subdomain on the user's site).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Only force-split the libraries that are eagerly loaded on first
        // paint (React + React Flow). Everything else — including the export
        // libs (jspdf/html2canvas/dompurify), which are reached solely through
        // export.ts's dynamic import() — is left to Vite's default splitting so
        // those heavy deps stay in their own lazy-loaded chunks and don't get
        // pulled into the eager initial bundle.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@xyflow') || id.includes('/d3-')) return 'reactflow';
          if (
            id.includes('/react-dom/') ||
            id.includes('/react/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});
