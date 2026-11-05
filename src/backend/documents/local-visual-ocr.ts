import { emitImportMeasurement, hasImportMeasurementSink } from './import-measurement.ts'
import { execFile, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmod, mkdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { StringDecoder } from 'node:string_decoder'
import { LocalVisualPageSchema, type LocalVisualEvidence, type LocalVisualPage } from '../../contracts/local-visual.ts'
import { resolveLocalGrade } from './local-visual-grade.ts'

const sourcePath = fileURLToPath(new URL('./local-visual-ocr.swift', import.meta.url))
const cachePath = fileURLToPath(new URL('../../../private/.local-visual/', import.meta.url))
const maxOutput = 12 * 1024 * 1024
const maxPages = 40
const unavailable = (pdfPage: number, reason: string): LocalVisualPage => ({ pdfPage, width: 1, height: 1, rasterDigest: null, lines: [], symbols: [], error: reason })
async function executablePath() {
  const source = await readFile(sourcePath)
  const digest = createHash('sha256').update(source).update(`${process.platform}:${process.arch}:visual-1`).digest('hex')
  return join(cachePath, digest, 'ocr')
}

/** Oppsett kjøres utenfor importbarnets ressursbudsjett; aldri ved analyse. */
export async function prepareLocalVisual(): Promise<{ available: boolean; reason: string }> {
  if (process.platform !== 'darwin') return { available: false, reason: 'Lokal Vision krever macOS.' }
  const executable = await executablePath()
  try { if ((await stat(executable)).isFile()) return { available: true, reason: 'Lokal bildeleser er klar.' } } catch { /* Bygg manglende kodeversjon. */ }
  const directory = dirname(executable)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  await chmod(cachePath, 0o700)
  await chmod(directory, 0o700)
  const temporary = join(directory, `ocr-${process.pid}-${Date.now()}`)
  try {
    const success = await new Promise<boolean>(resolve => {
      const child = spawn('/usr/bin/swiftc', ['-O', '-module-cache-path', join(cachePath, 'modules'), sourcePath, '-o', temporary], { stdio: 'ignore', env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? tmpdir() } })
      const timer = setTimeout(() => child.kill('SIGKILL'), 90_000)
      child.once('error', () => { clearTimeout(timer); resolve(false) })
      child.once('exit', code => { clearTimeout(timer); resolve(code === 0) })
    })
    if (!success) return { available: false, reason: 'Lokal bildeleser kunne ikke klargjøres innen ressursgrensen.' }
    await chmod(temporary, 0o700)
    await rename(temporary, executable)
    return { available: true, reason: 'Lokal bildeleser er klar.' }
  } finally { await rm(temporary, { force: true }) }
}

/** NDJSON inneholder hele sider. En avbrutt siste linje godtas aldri. */
export function readLocalVisualPages(output: string, requested: readonly number[]): LocalVisualPage[] {
  const pages = new Map<number, LocalVisualPage>()
  for (const line of output.split('\n').slice(0, -1)) {
    try {
      const parsed = LocalVisualPageSchema.safeParse(JSON.parse(line))
      if (parsed.success && requested.includes(parsed.data.pdfPage) && !pages.has(parsed.data.pdfPage)) {
        parsed.data.symbols = parsed.data.symbols.map(symbol => ({ ...symbol, ...resolveLocalGrade(symbol.readings) }))
        pages.set(parsed.data.pdfPage, parsed.data)
      }
    } catch { /* Feil side beholdes som usikker; aldri reparer eller gjett. */ }
  }
  return [...pages.values()]
}

/** Lokalt bildebevis holdes separat fra PDF.js. Avbrudd gir eksplisitte usikre sider. */
export async function extractLocalVisualEvidence(bytes: Uint8Array, documentHash: string, documentName: string, requestedPages: number[], options: { deadlineMs?: number; maxOutputBytes?: number } = {}): Promise<LocalVisualEvidence> {
  const requested = [...new Set(requestedPages)].filter(page => Number.isInteger(page) && page >= 1 && page <= 200)
  const base = { version: 'local-visual-1' as const, documentHash, documentName }
  if (!requested.length) return { ...base, pages: [] }
  const fail = (reason: string) => ({ ...base, pages: requested.map(page => unavailable(page, reason)) })
  const deadlineMs = Math.max(0, Math.min(35_000, options.deadlineMs ?? 35_000))
  const outputLimit = Math.max(0, Math.min(maxOutput, options.maxOutputBytes ?? maxOutput))
  if (deadlineMs < 50) return fail('Importens gjenværende tidsbudsjett tillater ikke bildekontroll av siden.')
  if (outputLimit < 1024) return fail('Importens gjenværende svarbudsjett tillater ikke bildekontroll av siden.')
  if (createHash('sha256').update(bytes).digest('hex') !== documentHash) return fail('Bildegrunnlagets hash stemmer ikke med originalen.')
  if (process.platform !== 'darwin') return fail('Lokal Vision krever macOS; sidene er ikke bildekontrollert.')
  const executable = await executablePath()
  try { if (!(await stat(executable)).isFile()) return fail('Lokal bildeleser mangler; kjør npm run prepare:visual.') } catch { return fail('Lokal bildeleser mangler; kjør npm run prepare:visual.') }
  try {
    const output = await new Promise<string>(resolve => {
      const child = spawn(executable, [requested.slice(0, maxPages).join(',')], { stdio: ['pipe', 'pipe', 'ignore'], env: { PATH: '/usr/bin:/bin', HOME: process.env.HOME ?? tmpdir() } })
      // Native Vision/PDFKit owns a separate address space. Its RSS must never
      // be presented as part of the Node-only RSS guard.
      let sampling = false, peakRss = 0, finished = false
      let sample: ReturnType<typeof execFile> | undefined
      const monitor = hasImportMeasurementSink() ? setInterval(() => {
        if (finished || sampling || !child.pid) return
        sampling = true
        sample = execFile('/bin/ps', ['-o', 'rss=', '-p', String(child.pid)], { timeout: 1000, maxBuffer: 1024, env: {} }, (error, stdout) => {
          sampling = false
          if (finished) return
          if (!error && /^\s*\d+\s*$/.test(stdout)) {
            const rss = Number(stdout.trim()) * 1024
            peakRss = Math.max(peakRss, rss)
            emitImportMeasurement({ process: 'local-ocr', phase: 'visual', point: 'sample', rss })
          }
        })
      }, 100) : undefined
      child.stdin.on('error', () => { /* Avbrutt innlesing gir usikre sider. */ })
      child.stdin.end(bytes)
      let text = '', size = 0
      const decoder = new StringDecoder('utf8')
      const timer = setTimeout(() => child.kill('SIGKILL'), deadlineMs)
      const stop = () => { child.kill('SIGKILL') }
      const finish = () => {
        if (finished) return
        finished = true
        clearTimeout(timer); if (monitor) clearInterval(monitor); sample?.kill()
        if (hasImportMeasurementSink()) emitImportMeasurement({ process: 'local-ocr', phase: 'visual', point: 'end', rss: peakRss })
        process.off('exit', stop); resolve(text)
      }
      child.stdout.on('data', (chunk: Buffer) => { size += chunk.length; if (size > outputLimit) child.kill('SIGKILL'); else text += decoder.write(chunk) })
      child.once('error', finish)
      child.once('close', finish)
      // Importbarnet kan avbrytes av hovedprosessens 60-sekundersvakt.
      process.once('exit', stop)
    })
    const pages = new Map(readLocalVisualPages(output, requested).map(page => [page.pdfPage, page]))
    return { ...base, pages: requested.map(page => pages.get(page) ?? unavailable(page, page > 0 && requested.indexOf(page) >= maxPages ? 'Sidegrensen for lokal bildekontroll er nådd.' : 'Lokal bildekontroll ble ikke fullført innen ressursgrensen.')) }
  } catch { return fail('Lokal bildeanalyse kunne ikke kjøres; sidene er ikke bildekontrollert.') }
}
