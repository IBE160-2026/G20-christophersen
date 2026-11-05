import { z } from 'zod'

const date = z.iso.date()
const sourceUrl = z.url().max(2048).refine(value => {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
    && ['boligutleie.hybel.no', 'kommunikasjon.ntb.no', 'www.utleiemegleren.no'].includes(url.hostname)
  } catch { return false }
}, 'Referansen krever en offisiell HTTPS-kilde.')

export const RentReferenceSchema = z.strictObject({
  id: z.string().min(1).max(100), publisher: z.enum(['Hybel / Menon Economics', 'Utleiemegleren']),
  sourceTitle: z.string().min(1).max(300), sourceUrl, locator: z.string().min(1).max(200),
  publishedAt: date.nullable(), publicationDateSource: sourceUrl.nullable(), accessedAt: date,
  period: z.string().min(1).max(100), periodEnd: date.nullable(),
  municipality: z.enum(['Bergen', 'Oslo']), geography: z.string().min(1).max(200),
  geographicLevel: z.enum(['city', 'district']), district: z.string().min(1).max(100).nullable(),
  housingType: z.enum(['apartment', 'mixed']), rooms: z.number().int().min(1).max(8).nullable(),
  population: z.enum(['active-contracts', 'new-contracts', 'advertisements-and-portfolio', 'signed-contracts-unspecified']),
  metric: z.enum(['monthly-rent', 'annual-change-percent']), value: z.string().max(80).regex(/^\d+(?:\.\d+)?$/),
  averageAreaM2: z.number().positive().nullable(), sampleSize: z.number().int().positive().nullable(),
  notes: z.string().min(1).max(1000),
}).superRefine((record, context) => {
  const fail = (message: string) => context.addIssue({ code: 'custom', message })
  if ((record.geographicLevel === 'district') !== (record.district !== null)) fail('Bydelsreferanser krever bydel.')
  if (record.housingType === 'mixed' && record.rooms !== null) fail('Blandet boligtype har ikke ett romantall.')
  if (record.metric === 'monthly-rent' && Number(record.value) <= 0) fail('Publisert månedsleie må være positiv.')
  if (record.publishedAt && record.publishedAt > record.accessedAt) fail('Publiseringsdato kan ikke være etter kontrollen.')
})
export type RentReference = z.infer<typeof RentReferenceSchema>

export const PublishedRentAssessmentSchema = z.strictObject({
  datasetVersion: z.literal('rent-references-2026-11-05'), snapshotDate: z.literal('2026-11-05'),
  selectedReferenceId: z.string().min(1).max(100).nullable(),
  references: z.array(z.strictObject({ reference: RentReferenceSchema,
    relevance: z.enum(['room-reference', 'context']), geographyMatch: z.enum(['district', 'city-context']),
  })).max(50),
  limitations: z.array(z.string().min(1).max(2000)).max(30),
}).superRefine((assessment, context) => {
  if (new Set(assessment.references.map(item => item.reference.id)).size !== assessment.references.length) context.addIssue({ code: 'custom', message: 'Referanse-ID må være unik.' })
  if (assessment.references.some(item => item.relevance === 'room-reference' && (item.reference.housingType !== 'apartment' || item.reference.rooms === null || item.reference.metric !== 'monthly-rent'))) context.addIssue({ code: 'custom', message: 'Romreferanse krever leilighet, romantall og månedsleie.' })
  if (assessment.selectedReferenceId !== null && !assessment.references.some(item => item.reference.id === assessment.selectedReferenceId
    && item.relevance === 'room-reference' && item.reference.metric === 'monthly-rent'
    && ['active-contracts', 'new-contracts'].includes(item.reference.population))) context.addIssue({ code: 'custom', message: 'Valgt romreferanse krever en publisert kontraktsleie for samme boligtype.' })
})
export type PublishedRentAssessment = z.infer<typeof PublishedRentAssessmentSchema>
