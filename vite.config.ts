import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Keep the existing portfolio at / while the new application lives at /app/.
  root: '.',
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: { input: 'app/index.html' },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
