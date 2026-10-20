import { cp, mkdir } from 'node:fs/promises'
import express from 'express'
import type { Request, Response } from 'express'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'

const projectRoot = normalizePath(fileURLToPath(new URL('.', import.meta.url)))
  .replace(/[*?[\]{}()!+@\\]/g, '\\$&')

export default defineConfig({
  plugins: [react(), {
    name: 'local-pdf-resources',
    configureServer(server) {
      const resources = express().use(express.static(fileURLToPath(new URL('node_modules/pdfjs-dist/', import.meta.url))))
      server.middlewares.use('/pdfjs', (request, response, next) => resources(request as Request, response as Response, next))
    },
    async closeBundle() {
      const target = new URL('dist/pdfjs/', import.meta.url)
      await mkdir(target, { recursive: true })
      for (const folder of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
        await cp(new URL(`node_modules/pdfjs-dist/${folder}/`, import.meta.url), new URL(`${folder}/`, target), { recursive: true })
      }
    },
  }],
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
