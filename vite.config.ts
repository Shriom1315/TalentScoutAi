import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { createLiveScraperMiddleware } from './src/server/scraperMiddleware.ts'

function liveScraperPlugin(): Plugin {
  return {
    name: 'talentscout-live-scraper',
    configureServer(server) {
      server.middlewares.use(createLiveScraperMiddleware())
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), liveScraperPlugin()],
})

