import { fork } from 'node:child_process'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { DocumentImportSchema, IMPORT_VERSION, IMPORT_EXTRACTION_VERSION, IMPORT_PROMPT_VERSION, IMPORT_MODEL, IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
import type { DocumentImport, ImportRole } from '../../contracts/document-import.ts'
import { LOCAL_PROCESSING_DEADLINE_MS } from './run-pipeline.ts'

export class ImportRejection extends Error {
  readonly code: string; readonly status: number
  constructor(code: string, status = 400) { super(code); this.code = code; this.status = status }
}
export type ImportPipelineInput = { bytes: Buffer; documentName: string; requestId: string; sessionId: string; role: ImportRole; parentHash: string | null; attachmentId: string | null }
export type ImportPipelineOptions = { onLifecycle?: (kind: 'started' | 'closed' | 'adapter-permitted', pid?: number) => void; deadlineMs?: number; rssLimitBytes?: number; childModule?: URL }
export async function runImport(input: ImportPipelineInput, signal: AbortSignal, markers: Set<string>, options: ImportPipelineOptions = {}): Promise<DocumentImport> {
  if (signal.aborted) { input.bytes = Buffer.alloc(0); throw new ImportRejection('processing-failure', 499) }
  const hash = createHash('sha256').update(input.bytes).digest('hex')
  const key = JSON.stringify([input.sessionId, hash, input.role, 'demo', IMPORT_MODEL, IMPORT_VERSION, IMPORT_PROMPT_VERSION, IMPORT_EXTRACTION_VERSION])
  if (markers.has(key)) { input.bytes = Buffer.alloc(0); throw new ImportRejection('duplicate-analysis', 409) }
  const child = fork(fileURLToPath(options.childModule ?? new URL('./import-child.ts', import.meta.url)), [], { execArgv: ['--max-old-space-size=256'], env: {}, serialization: 'advanced', stdio: ['ignore', 'ignore', 'ignore', 'ipc'] })
  const notify = (kind: 'started' | 'closed' | 'adapter-permitted') => { try { options.onLifecycle?.(kind, child.pid) } catch { /* Bare måledata. */ } }
  notify('started')
  const closed = new Promise<void>(resolve => child.once('close', () => { notify('closed'); resolve() }))
  const deadline = performance.now() + (options.deadlineMs ?? LOCAL_PROCESSING_DEADLINE_MS)
  let timer: ReturnType<typeof setTimeout> | undefined, monitor: ReturnType<typeof setInterval> | undefined
  let abort: () => void = () => undefined
  let sampling = false
  let ps: ReturnType<typeof execFile> | undefined
  try {
    return await new Promise<DocumentImport>((resolve, reject) => {
      let settled = false, permitted = false
      const fail = (code: string, status = 500) => { if (!settled) { settled = true; reject(new ImportRejection(code, status)) } }
      abort = () => fail('processing-failure', 499)
      signal.addEventListener('abort', abort, { once: true })
      child.once('error', () => fail('processing-failure'))
      child.once('exit', () => fail('processing-failure'))
      timer = setTimeout(() => fail('processing-timeout', 504), Math.max(0, deadline - performance.now()))
      monitor = setInterval(() => {
        if (sampling || !child.pid || settled) return
        sampling = true
        // Parent sampling remains effective if the parser blocks its own event loop. RSS is best effort.
        ps = execFile('/bin/ps', ['-o', 'rss=', '-p', String(child.pid)], { timeout: 1000, maxBuffer: 1024, env: {} }, (error, stdout) => {
          sampling = false
          if (!error && /^\s*\d+\s*$/.test(stdout) && Number(stdout.trim()) * 1024 > (options.rssLimitBytes ?? 512 * 1024 * 1024)) fail('memory-limit')
        })
      }, 100)
      child.on('message', (value: unknown) => {
        if (settled) return
        if (signal.aborted) { abort(); return }
        if (performance.now() >= deadline) { fail('processing-timeout', 504); return }
        if (typeof value !== 'object' || value === null || !('kind' in value)) { fail('processing-failure'); return }
        if (value.kind === 'adapter-ready' && 'hash' in value && value.hash === hash && !permitted) {
          if (markers.has(key)) { fail('duplicate-analysis', 409); return }
          markers.add(key); permitted = true; notify('adapter-permitted')
          child.send({ kind: 'permit-adapter' }, error => { if (error) fail('processing-failure') })
        } else if (value.kind === 'outcome' && 'outcome' in value && permitted) {
          if (Buffer.byteLength(JSON.stringify(value.outcome)) > IMPORT_MAX_RESPONSE_BYTES) { fail('response-limit'); return }
          const parsed = DocumentImportSchema.safeParse(value.outcome)
          if (!parsed.success || parsed.data.reportHash !== hash || parsed.data.requestId !== input.requestId || parsed.data.documentName !== input.documentName || parsed.data.role !== input.role
            || parsed.data.documents[0]?.parentHash !== input.parentHash || parsed.data.documents[0]?.attachmentId !== input.attachmentId) { fail('processing-failure'); return }
          settled = true; resolve(parsed.data)
        } else if (value.kind === 'rejected' && 'code' in value && typeof value.code === 'string') fail(value.code, 422)
        else fail('processing-failure')
      })
      child.send(input, error => { input.bytes = Buffer.alloc(0); if (error) fail('processing-failure') })
      if (signal.aborted) abort()
    })
  } finally {
    if (timer) clearTimeout(timer)
    if (monitor) clearInterval(monitor)
    ps?.kill()
    signal.removeEventListener('abort', abort)
    child.removeAllListeners('message'); child.removeAllListeners('error'); child.on('error', () => undefined)
    try { if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL') }
    finally { input.bytes = Buffer.alloc(0); await closed; child.removeAllListeners() }
  }
}
