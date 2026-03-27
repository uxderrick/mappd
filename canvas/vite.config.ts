import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    proxy: {
      '/flow-graph.json': 'http://localhost:3569',
      '/screenshots.json': 'http://localhost:3569',
      '/screenshots': 'http://localhost:3569',
      '/mappd-config.json': 'http://localhost:3569',
      '/mappd-inject.js': 'http://localhost:3569',
      '/proxy': 'http://localhost:3569',
      '/ws': {
        target: 'ws://localhost:3569',
        ws: true,
      },
    },
  },
  build: { outDir: 'dist' },
})
