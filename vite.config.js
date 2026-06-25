import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/mahjong/ on GitHub Pages,
  // so assets must be referenced under the /mahjong/ subpath.
  base: '/mahjong/',
  plugins: [react()],
})
