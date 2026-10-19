import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // served from GitHub Pages at /<repo>/ — public assets are referenced via
  // import.meta.env.BASE_URL so they follow this
  base: '/Portfolio/',
})
