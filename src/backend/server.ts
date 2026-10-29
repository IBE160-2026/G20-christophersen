import express, { type ErrorRequestHandler } from 'express'
import { createListingBackend } from './listing/backend.ts'
import { createListingRouter } from './http/listing-route.ts'
import { createImportRouter } from './http/import-route.ts'
import { createProcessingLock } from './http/processing-lock.ts'
import { createAnalysisRouter } from './http/analysis-route.ts'
import { access, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'

const host = '127.0.0.1'
const port = 3000
const address = `http://${host}:${port}`
const development = process.argv.includes('--dev')
const root = new URL('../../', import.meta.url)
const dist = fileURLToPath(new URL('dist/', root))

async function start() {
  if (!development) {
    try {
      await access(new URL('dist/index.html', root))
    } catch {
      console.error('Bygget app mangler. Kjør npm run build før npm run demo.')
      process.exitCode = 1
      return
    }
  }

  const app = express()
  const server = createServer(app)
  app.disable('x-powered-by')
  app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    next()
  })

  const mode = process.env.ANALYSIS_MODE ?? 'demo'
  if (mode !== 'demo' && mode !== 'live') throw new Error('Ugyldig lokal analysemodus')
  const lock = createProcessingLock()
  const analysis = createAnalysisRouter({ mode, lock })
  const documentImport = createImportRouter({ lock })
  app.use('/api', documentImport)
  app.use('/api', analysis)
  app.use('/api', createListingRouter(createListingBackend()))

  // Andre API-er er ikke tilgjengelige i semester-v1.
  app.use('/api', (_request, response) => {
    response.status(404).type('text').send('API-ruten er ikke tilgjengelig.')
  })

  const vite = development
    ? await (await import('vite')).createServer({
        configFile: fileURLToPath(new URL('vite.config.ts', root)),
        appType: 'custom',
        server: { middlewareMode: true, ws: { server } },
      })
    : undefined

  if (vite) {
    app.get('/', async (_request, response, next) => {
      try {
        const template = await readFile(new URL('index.html', root), 'utf8')
        response.type('html').send(await vite.transformIndexHtml('/', template))
      } catch {
        next(new Error('Arbeidsflaten kunne ikke lastes.'))
      }
    })
    app.use(vite.middlewares)
  } else {
    // Bare byggeutdata, aldri reporoten eller private originaler.
    app.use(express.static(dist, { dotfiles: 'deny', redirect: false, fallthrough: false }))
  }

  app.use((_request, response) => {
    response.status(404).type('text').send('Fant ikke ressursen.')
  })

  const safeError: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    if (response.headersSent) {
      response.destroy()
      return
    }
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? error.status : undefined
    const code = status === 400 || status === 412 || status === 416
      ? status : status === 403 || status === 404 ? 404 : 500
    response.status(code).type('text').send(code === 500
      ? 'Arbeidsflaten kunne ikke lastes. Last siden på nytt.'
      : code === 412 || code === 416 ? 'Ressursen kan ikke leveres med de angitte forespørselsvilkårene.'
      : 'Fant ikke ressursen.')
  }
  app.use(safeError)

  async function stop() {
    const closed = new Promise<void>(resolve => server.close(() => resolve()))
    server.closeAllConnections()
    await Promise.all([analysis.stop(), documentImport.stop()])
    await vite?.close()
    await closed
    process.exit(0)
  }
  process.once('SIGINT', () => { void stop() })
  process.once('SIGTERM', () => { void stop() })

  server.once('error', async (error) => {
    const code = 'code' in error ? error.code : undefined
    const reason = code === 'EADDRINUSE'
      ? `Port ${port} er opptatt. Stopp den andre serveren og prøv igjen.`
      : code === 'EPERM' || code === 'EACCES'
        ? 'Miljøet tillater ikke lokal server på denne adressen.'
        : 'Kontroller installasjonen og prøv igjen.'
    console.error(`Appen kunne ikke starte på ${address}. ${reason}`)
    await vite?.close()
    process.exitCode = 1
  })
  server.listen(port, host, () => {
    console.log(`Property Acquisition Agent · ${development ? 'Utvikling' : mode === 'live' ? 'Live analyse' : 'Demo'} · ${address}`)
  })
}

start().catch(() => {
  console.error('Appen kunne ikke starte. Kontroller installasjonen og prøv igjen.')
  process.exitCode = 1
})
