import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { AdapterOutcomeSchema, ReportHashSchema } from '../../contracts/document-analysis.ts'
import { AnalysisAdapterError } from './adapter.ts'
import type { AnalysisAdapter } from './adapter.ts'

// Konvolutten eier bare lagringsbinding. AdapterOutcomeSchema eier uttrekket.
const StoredDemoSchema = z.strictObject({
  reportHash: ReportHashSchema,
  contractVersion: z.string(),
  extractionVersion: z.string(),
  outcome: z.unknown(),
})

/** Lokal loader mottar hash, aldri opplastet navn/sti eller forespørselskontekst. */
export type DemoLoader = (reportHash: string) => Promise<string | null>

const readStoredDemo: DemoLoader = async reportHash => {
  const hash = ReportHashSchema.parse(reportHash)
  try {
    return await readFile(new URL(`./data/${hash}.json`, import.meta.url), 'utf8')
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

/** Lokal standard uten miljø, nøkkel, nettverk, modellklient eller live-fallback. */
export function createDemoAdapter(load: DemoLoader = readStoredDemo): AnalysisAdapter {
  return {
    mode: 'demo',
    async analyze(document) {
      let serialized: string | null
      try { serialized = await load(document.reportHash) } catch {
        throw new AnalysisAdapterError('adapter-failure', 'Det lagrede demo-uttrekket kunne ikke leses lokalt.')
      }
      if (serialized === null) {
        throw new AnalysisAdapterError('adapter-failure', 'Det finnes ikke et lagret demo-uttrekk for denne rapporthashen.')
      }
      let value: unknown
      try { value = JSON.parse(serialized) } catch {
        throw new AnalysisAdapterError('invalid-response', 'Det lagrede demo-uttrekket har ugyldig JSON-format.')
      }
      const stored = StoredDemoSchema.safeParse(value)
      if (!stored.success) {
        throw new AnalysisAdapterError('invalid-response', 'Det lagrede demo-uttrekket har ugyldig lagringsstruktur.')
      }
      if (stored.data.reportHash !== document.reportHash) {
        throw new AnalysisAdapterError('metadata-mismatch', 'Det lagrede demo-uttrekket tilhører en annen rapporthash.')
      }
      const outcome = stored.data.outcome
      if (stored.data.contractVersion !== document.contractVersion
        || stored.data.extractionVersion !== document.extractionVersion
        || (typeof outcome === 'object' && outcome !== null
          && (('contractVersion' in outcome && outcome.contractVersion !== document.contractVersion)
            || ('extractionVersion' in outcome && outcome.extractionVersion !== document.extractionVersion)))) {
        throw new AnalysisAdapterError('incompatible-version', 'Det lagrede demo-uttrekket har en uforenlig kontrakt- eller uttrekksversjon.')
      }
      const parsed = AdapterOutcomeSchema.safeParse(outcome)
      if (!parsed.success) {
        throw new AnalysisAdapterError('invalid-response', 'Det lagrede demo-uttrekket er ikke et gyldig terminalt adapterutfall.')
      }
      return parsed.data
    },
  }
}
