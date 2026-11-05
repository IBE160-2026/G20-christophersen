import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { basename, resolve, sep } from 'node:path'
import { runImport } from '../../src/backend/http/run-import.ts'
import type { ImportMeasurement } from '../../src/backend/documents/import-measurement.ts'

// Lokal fullflyt med stengt modelltransport. Resultater med dokumenttekst må
// alltid lagres under ignorert private/, aldri sammen med prosessrapporten.
const args = process.argv.slice(2)
const outputIndex = args.indexOf('--output-dir')
if (outputIndex < 1 || outputIndex !== args.length - 2) throw new Error('Bruk: node tools/pdf-memory/probe.ts <PDF> [PDF ...] --output-dir private/<mappe>')
const directory = resolve(args[outputIndex + 1]!), privateRoot = resolve('private') + sep
if (!directory.startsWith(privateRoot)) throw new Error('Målinger og uttrekk skal lagres under private/.')
await mkdir(directory, { recursive: true, mode: 0o700 })
const actualPrivateRoot = await realpath(resolve('private'))
const actualDirectory = await realpath(directory)
if (!actualDirectory.startsWith(actualPrivateRoot + sep)) throw new Error('Resultatmappe må faktisk ligge under private/, også gjennom symlinker.')
const savePrivate = (path: string, content: string) => writeFile(path, content, { mode: 0o600, flag: 'wx' })
for (const [index, file] of args.slice(0, outputIndex).entries()) {
  const measurements: (ImportMeasurement & { elapsedMs: number })[] = [], lifecycle: unknown[] = []
  const started = performance.now(), id = `pdf-memory-${process.pid}-${index}`
  const prefix = resolve(directory, `case-${index + 1}`)
  try {
    const outcome = await runImport({ bytes: await readFile(file), documentName: basename(file), requestId: id, sessionId: id,
      role: 'prospectus', parentHash: null, attachmentId: null }, new AbortController().signal, new Set(), {
      onMeasurement: measurement => measurements.push({ ...measurement, elapsedMs: Math.round(performance.now() - started) }),
      onLifecycle: (kind, pid) => lifecycle.push({ kind, pid, elapsedMs: Math.round(performance.now() - started) }),
    })
    await savePrivate(prefix + '-outcome.json', JSON.stringify(outcome))
    let lastNodeRss = 0, lastOcrRss = 0, sampledConcurrentPeak = 0
    for (const measurement of measurements) {
      if (measurement.process === 'node') lastNodeRss = measurement.rss
      else lastOcrRss = measurement.point === 'end' ? 0 : measurement.rss
      sampledConcurrentPeak = Math.max(sampledConcurrentPeak, lastNodeRss + lastOcrRss)
    }
    const summary = { case: index + 1, status: 'imported', node: process.version, durationMs: Math.round(performance.now() - started),
      pageCount: outcome.pageCount, textCharacters: outcome.pages.reduce((sum, page) => sum + page.text.length, 0),
      pageStatuses: Object.fromEntries([...new Set(outcome.pages.map(page => page.status))].map(status => [status, outcome.pages.filter(page => page.status === status).length])),
      peakNodeMiB: Math.max(0, ...measurements.filter(m => m.process === 'node').map(m => m.rss)) / 1048576,
      peakOcrMiB: Math.max(0, ...measurements.filter(m => m.process === 'local-ocr').map(m => m.rss)) / 1048576,
      sampledPeakNodeAndOcrMiB: sampledConcurrentPeak / 1048576,
      phases: Object.fromEntries([...new Set(measurements.filter(m => m.process === 'node').map(m => m.phase))].map(phase => [phase,
        Math.max(...measurements.filter(m => m.phase === phase && m.process === 'node').map(m => m.rss)) / 1048576])),
      technical: outcome.technical.status, visualPages: outcome.visualAnalysis?.pages.length ?? 0,
      visualCompleted: outcome.visualAnalysis?.pages.filter(page => page.error === null && page.rasterDigest !== null).length ?? 0,
      resourceLimitedPages: outcome.pages.filter(page => /ressursgrense/.test(page.reason ?? '')).map(page => page.pdfPage) }
    await savePrivate(prefix + '-summary.json', JSON.stringify(summary, null, 2))
    process.stdout.write(JSON.stringify(summary) + '\n')
  } catch (error) {
    process.exitCode = 1
    process.stdout.write(JSON.stringify({ case: index + 1, error: String(error), durationMs: Math.round(performance.now() - started) }) + '\n')
  } finally {
    await savePrivate(prefix + '-measurements.json', JSON.stringify({ lifecycle, measurements }, null, 2))
  }
}
