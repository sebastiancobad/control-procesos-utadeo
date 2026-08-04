import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => el mismo build sirve en GitHub Pages, en Vercel y abierto desde disco.
// La app usa HashRouter, asi que no requiere reescritura de rutas en el servidor.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', chunkSizeWarningLimit: 900 }
})
