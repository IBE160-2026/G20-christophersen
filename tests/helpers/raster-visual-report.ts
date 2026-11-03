import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/** Faktisk lokal rasterisering av en fiktiv vektorrapport; aldri håndlaget OCR. */
export function rasterVisualReportPdf(bytes: Buffer, monochrome = false): Promise<Buffer> {
  const script = fileURLToPath(new URL('./raster-visual-report.swift', import.meta.url))
  const cache = fileURLToPath(new URL('../../private/.local-visual/modules', import.meta.url))
  return new Promise((resolve, reject) => {
    const child = execFile('/usr/bin/swift', ['-module-cache-path', cache, script, ...(monochrome ? ['--monochrome'] : [])],
      { encoding: 'buffer', maxBuffer: 8 * 1024 * 1024, timeout: 60_000 }, (error, stdout) => error ? reject(error) : resolve(stdout))
    child.stdin?.end(bytes)
    child.stdin?.on('error', () => { /* Exec-feilen rapporteres gjennom callback. */ })
  })
}
