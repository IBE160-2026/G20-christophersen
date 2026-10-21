import { z } from 'zod'
import { FindingCorrectionSchema } from './finding-control.ts'

/** Separat brukerregistrering. Snapshot binder teksten til rapportforholdet, aldri bare ID. */
export const Tg3ResolutionSchema = z.strictObject({
  status: z.string(),
  reason: z.string(),
  basis: z.string(),
  binding: FindingCorrectionSchema,
})
export const Tg3FindingSchema = z.strictObject({
  findingId: z.string().min(1),
  current: FindingCorrectionSchema,
  resolution: Tg3ResolutionSchema.nullable(),
})
export type Tg3Resolution = z.infer<typeof Tg3ResolutionSchema>
export type Tg3Finding = z.infer<typeof Tg3FindingSchema>
export type Tg3Field = 'status' | 'reason' | 'basis'
