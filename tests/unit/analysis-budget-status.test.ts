import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { AnalysisBudgetStore } from '../../src/backend/import/analysis-budget-store.ts'

const hash = 'a'.repeat(64), digest = 'b'.repeat(64)
const stem = createHash('sha256').update(hash).digest('hex')

it('lesestatus oppretter ingen filer og endrer aldri eksisterende reservasjon', () => {
  const directory = mkdtempSync(join(tmpdir(), 'paa-status-'))
  try {
    expect(AnalysisBudgetStore.inspect(join(directory, 'missing'), hash)).toEqual({ kind: 'missing', entries: [] })
    expect(readdirSync(directory)).toEqual([])
    AnalysisBudgetStore.initialize(directory, hash)
    const store = AnalysisBudgetStore.open(directory, hash)
    store.reserve(hash, digest, '0.15')
    expect(AnalysisBudgetStore.inspect(directory, hash)).toEqual({ kind: 'unavailable', entries: [] })
    store.settle(digest, null); store.close()
    const before = readFileSync(join(directory, stem + '.json'), 'utf8')
    expect(AnalysisBudgetStore.inspect(directory, hash)).toMatchObject({ kind: 'available', entries: [{ state: 'uncertain', reservedUsd: '0.15', actualUsd: null }] })
    expect(readFileSync(join(directory, stem + '.json'), 'utf8')).toBe(before)
    expect(readdirSync(directory)).toEqual([stem + '.json'])
  } finally { rmSync(directory, { recursive: true }) }
})

it('lesestatus sperrer ved ødelagt, for stor, lenket eller ventende historikk', () => {
  const directory = mkdtempSync(join(tmpdir(), 'paa-status-'))
  const history = join(directory, stem + '.json')
  try {
    for (const content of ['{', 'x'.repeat(65537), JSON.stringify({ version: 1, analysisId: 'c'.repeat(64), entries: [] })]) {
      writeFileSync(history, content)
      expect(AnalysisBudgetStore.inspect(directory, hash)).toEqual({ kind: 'unavailable', entries: [] })
    }
    rmSync(history)
    symlinkSync('missing-target', history)
    expect(AnalysisBudgetStore.inspect(directory, hash)).toEqual({ kind: 'unavailable', entries: [] })
    rmSync(history)
    mkdirSync(join(directory, stem + '.lock'))
    expect(AnalysisBudgetStore.inspect(directory, hash)).toEqual({ kind: 'unavailable', entries: [] })
    rmSync(join(directory, stem + '.lock'), { recursive: true })
    writeFileSync(join(directory, stem + '.pending'), '')
    expect(AnalysisBudgetStore.inspect(directory, hash)).toEqual({ kind: 'unavailable', entries: [] })
  } finally { rmSync(directory, { recursive: true }) }
})

it('lesestatus avviser FIFO uten å blokkere prosessen', () => {
  const directory = mkdtempSync(join(tmpdir(), 'paa-status-fifo-'))
  try {
    const fifo = spawnSync('mkfifo', [join(directory, stem + '.json')], { encoding: 'utf8', timeout: 3000 })
    expect(fifo.status).toBe(0)
    const moduleUrl = new URL('../../src/backend/import/analysis-budget-store.ts', import.meta.url).href
    const child = spawnSync(process.execPath, ['--input-type=module', '-e',
      `import { AnalysisBudgetStore } from ${JSON.stringify(moduleUrl)}; const result = AnalysisBudgetStore.inspect(${JSON.stringify(directory)}, ${JSON.stringify(hash)}); if (result.kind !== 'unavailable') process.exit(1);`],
    { encoding: 'utf8', timeout: 3000 })
    expect(child.error).toBeUndefined()
    expect(child.status).toBe(0)
  } finally { rmSync(directory, { recursive: true }) }
})
