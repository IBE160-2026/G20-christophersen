import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'

const projectRoot = normalizePath(fileURLToPath(new URL('.', import.meta.url)))
  .replace(/[*?[\]{}()!+@\\]/g, '\\$&')

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  envPrefix: [],
  server: {
    host: '127.0.0.1',
    fs: {
      deny: [
        '**/.env', '**/.env.*', '**/.git/**', '**/*.{crt,pem}',
        `${projectRoot}.docs/**`, `${projectRoot}private/**`, `${projectRoot}src/backend/**`,
      ],
    },
  },
})
