import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { AnalysisHttpResponseSchema } from '../../src/contracts/analysis-http.ts'

for (const mode of [undefined, 'live', 'unknown'] as const) {
  it(`4.3: actual server entry with ANALYSIS_MODE=${mode ?? '(unset)'}`, async () => {
    const probe = createServer(); probe.listen(0, '127.0.0.1'); await once(probe, 'listening')
    const port = (probe.address() as { port: number }).port
    await new Promise<void>(resolve => probe.close(() => resolve()))
    const address = `http://127.0.0.1:${port}`
    // Intentionally no API key or inherited mode; every request stays local.
    const child = spawn(process.execPath, ['src/backend/server.ts', '--dev'], {
      env: { PATH: process.env.PATH, PAA_PORT: String(port), ...(mode === undefined ? {} : { ANALYSIS_MODE: mode }) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const closed = once(child, 'close')
    let output = ''
    let ready!: () => void
    const started = new Promise<void>(resolve => { ready = resolve })
    child.stdout.on('data', chunk => { output += chunk; if (output.includes(address)) ready() })
    child.stderr.resume()
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      if (mode === 'unknown') {
        const [code] = await closed
        expect(code).toBe(1)
        expect(output).not.toContain(address)
        return
      }
      await Promise.race([started, closed.then(() => { throw new Error('Server stopped before startup') }),
        new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Startup deadline')), 10_000) })])
      clearTimeout(timer)
      const metadata = await fetch(address + '/api/analysis-config')
      expect(await metadata.json()).toEqual({ mode: mode ?? 'demo' })
      const bytes = await readFile(new URL('../fixtures/property-cases/F1-tilstandsrapport.pdf', import.meta.url))
      const body = new FormData()
      body.append('file', new Blob([bytes]), 'F1-tilstandsrapport.pdf')
      const response = await fetch(address + '/api/analysis', { method: 'POST', body,
        headers: { 'X-Session-Id': 'entry', 'X-Request-Id': 'entry', 'X-Analysis-Generation': '1' } })
      const result = AnalysisHttpResponseSchema.parse(await response.json())
      expect(result).toMatchObject({ kind: 'analysis', outcome: { mode: mode ?? 'demo', status: mode === 'live' ? 'failed' : 'completed' } })
      if (mode === 'live') expect(result).toMatchObject({ outcome: { error: { code: 'adapter-failure', reason: expect.stringContaining('OPENAI_API_KEY') } } })
    } finally {
      clearTimeout(timer)
      const kill = setTimeout(() => child.kill('SIGKILL'), 2000)
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
      await closed
      clearTimeout(kill)
    }
  }, 20_000)
}
