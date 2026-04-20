import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo is served at https://chanhwi-keyoh.github.io/Cookit-/
// so the base path needs to match the repo name.
export default defineConfig({
  base: '/Cookit-/',
  plugins: [react()],
})
