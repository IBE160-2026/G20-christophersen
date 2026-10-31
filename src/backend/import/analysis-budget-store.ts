import { createHash } from 'node:crypto'
import { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, renameSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import Big from 'big.js'
import { AnalysisBudget } from './budget.ts'
import type { BudgetEntry } from './budget.ts'

const money = z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/)
const historySchema = z.strictObject({
  version: z.literal(1), analysisId: z.string().regex(/^[a-f0-9]{64}$/),
  entries: z.array(z.strictObject({ documentHash: z.string().regex(/^[a-f0-9]{64}$/), requestDigest: z.string().regex(/^[a-f0-9]{64}$/), reservedUsd: money, actualUsd: money.nullable(), state: z.enum(['reserved', 'completed', 'uncertain']), usageCostBasis: z.enum(['provider-usage-upper-bound', 'provider-usage-exact']).optional() })),
})
const safeDirectory = (directory: string) => { if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) throw new Error('budget-history-unavailable') }
function hasPendingEvidence(path: string) {
  try { lstatSync(path); return true }
  catch (error) { if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return false; throw error }
}
function paths(directory: string, analysisId: string) {
  if (!/^[a-f0-9]{64}$/.test(analysisId)) throw new Error('invalid-analysis-id')
  const stem = resolve(directory, createHash('sha256').update(analysisId).digest('hex'))
  return { history: stem + '.json', lock: stem + '.lock', temporary: stem + '.pending' }
}
function durableWrite(directory: string, destination: string, temporary: string, value: unknown) {
  const fd = openSync(temporary, 'wx', 0o600)
  try { writeFileSync(fd, JSON.stringify(value) + '\n'); fsyncSync(fd) } finally { closeSync(fd) }
  renameSync(temporary, destination)
  const parent = openSync(directory, 'r')
  try { fsyncSync(parent) } finally { closeSync(parent) }
}
function readHistory(path: string, rootDocumentHash: string) {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const stat = fstatSync(fd)
    if (!stat.isFile() || stat.size > 64 * 1024) throw new Error('invalid-history')
    const history = historySchema.parse(JSON.parse(readFileSync(fd, 'utf8')))
    if (history.analysisId !== rootDocumentHash || new Set(history.entries.map(entry => entry.requestDigest)).size !== history.entries.length
      || new Set(history.entries.map(entry => entry.documentHash)).size !== history.entries.length
      || history.entries.some(entry => (entry.state === 'completed') !== (entry.actualUsd !== null)
        || entry.actualUsd !== null && Big(entry.actualUsd).gt(entry.reservedUsd))) throw new Error('invalid-history')
    return history
  } finally { closeSync(fd) }
}

/** One root document hash is the logical analysis ID for prospectus AND attached/separate report.
 * Locks survive a process crash: unknown ownership/history is a stop, never an empty allowance.
 * No automatic initialization, stale-lock removal, quota reset or reservation release exists.
 */
export class AnalysisBudgetStore extends AnalysisBudget {
  private readonly directory: string
  private readonly files: ReturnType<typeof paths>
  private closed = false
  private poisoned = false
  private constructor(directory: string, analysisId: string, entries: z.infer<typeof historySchema>['entries']) {
    super(analysisId, { historyRestored: true, entries }); this.directory = directory; this.files = paths(directory, analysisId)
  }
  /** Read-only status: never creates a directory/lock, changes quota or repairs history. */
  static inspect(directory: string, rootDocumentHash: string): { kind: 'missing' | 'available' | 'unavailable'; entries: BudgetEntry[] } {
    const files = paths(directory, rootDocumentHash)
    try {
      try { safeDirectory(directory) }
      catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return { kind: 'missing', entries: [] }
        throw error
      }
      if (hasPendingEvidence(files.lock) || hasPendingEvidence(files.temporary)) return { kind: 'unavailable', entries: [] }
      if (!hasPendingEvidence(files.history)) return { kind: 'missing', entries: [] }
      const history = readHistory(files.history, rootDocumentHash)
      // Recheck evidence around the read to avoid reporting idle during a writer's reservation.
      if (hasPendingEvidence(files.lock) || hasPendingEvidence(files.temporary)) return { kind: 'unavailable', entries: [] }
      return { kind: 'available', entries: history.entries }
    } catch { return { kind: 'unavailable', entries: [] } }
  }
  /** Explicit one-time operation for a known new analysis; preparation never calls this. */
  static initialize(directory: string, rootDocumentHash: string) {
    mkdirSync(directory, { recursive: true, mode: 0o700 }); safeDirectory(directory)
    const files = paths(directory, rootDocumentHash)
    mkdirSync(files.lock, { mode: 0o700 })
    let startedWriting = false, completed = false
    try {
      if (hasPendingEvidence(files.temporary)) throw new Error('budget-history-unavailable')
      // Exclusive destination prevents an explicit init from overwriting old expenditure.
      const fd = openSync(files.history, 'wx', 0o600)
      startedWriting = true
      try { writeFileSync(fd, JSON.stringify({ version: 1, analysisId: rootDocumentHash, entries: [] }) + '\n'); fsyncSync(fd) } finally { closeSync(fd) }
      const parent = openSync(directory, 'r'); try { fsyncSync(parent) } finally { closeSync(parent) }
      completed = true
    } finally { if (!startedWriting || completed) rmdirSync(files.lock) }
  }
  static open(directory: string, rootDocumentHash: string) {
    const files = paths(directory, rootDocumentHash)
    try { safeDirectory(directory) } catch { throw new Error('budget-history-unavailable') }
    try { mkdirSync(files.lock, { mode: 0o700 }) } catch { throw new Error('budget-history-locked') }
    try {
      if (hasPendingEvidence(files.temporary)) throw new Error('pending-history-write')
      const history = readHistory(files.history, rootDocumentHash)
      return new AnalysisBudgetStore(directory, rootDocumentHash, history.entries)
    } catch {
      rmdirSync(files.lock)
      throw new Error('budget-history-unavailable')
    }
  }
  private assertWritable() { if (this.closed || this.poisoned) throw new Error('budget-history-unavailable') }
  private persist() {
    try { durableWrite(this.directory, this.files.history, this.files.temporary, { version: 1, analysisId: this.analysisId, entries: this.snapshot() }) }
    catch { this.poisoned = true; throw new Error('budget-history-write-failed') }
  }
  override reserve(documentHash: string, requestDigest: string, amount: string) {
    this.assertWritable(); super.reserve(documentHash, requestDigest, amount); this.persist()
  }
  override settle(requestDigest: string, actualUsd: string | null, usageCostBasis?: BudgetEntry['usageCostBasis']) {
    this.assertWritable(); super.settle(requestDigest, actualUsd, usageCostBasis); this.persist()
  }
  close() {
    if (this.closed) return
    this.closed = true
    // A failed write retains both lock and pending evidence for manual reconciliation.
    if (!this.poisoned) { try { unlinkSync(this.files.temporary) } catch { /* normally absent */ } rmdirSync(this.files.lock) }
  }
}
