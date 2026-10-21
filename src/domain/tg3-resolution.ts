import type { FindingCorrection } from '../contracts/finding-control.ts'
import type { Tg3Field, Tg3Resolution } from '../contracts/tg3-resolution.ts'

const representation = (text: string) => text.trim().replace(/\s+/g, ' ')

/** Konservativ representasjonslikhet, ingen semantisk klassifisering eller ekstern kontroll.
 * Ulik tekst/side er ukjent tilhørighet; ID er ikke bevis på samme forhold.
 */
export function sameTg3Basis(binding: FindingCorrection, current: FindingCorrection): boolean {
  return binding.grade === current.grade && representation(binding.description) === representation(current.description)
    && binding.source.reportHash === current.source.reportHash && binding.source.documentName === current.source.documentName
    && binding.source.pdfPage === current.source.pdfPage
}

/** Eneste anvendbarhetsautoritet for både lokal UI og senere screening. */
export function validateTg3Resolution(current: FindingCorrection, resolution: Tg3Resolution | null) {
  const errors: Partial<Record<Tg3Field | 'binding', string>> = {}
  if (resolution?.status !== 'resolved') errors.status = 'Velg eksplisitt Avklart med nødvendig grunnlag, eller behold Uavklart.'
  if (!resolution?.reason.trim()) errors.reason = 'Oppgi en kort begrunnelse for at forholdet er tilstrekkelig avklart for førstevurdering.'
  if (!resolution?.basis.trim()) errors.basis = 'Oppgi konkret eksternt avklaringsgrunnlag, for eksempel kontroll fra autorisert elektriker med dato eller referanse.'
  if (resolution && !sameTg3Basis(resolution.binding, current)) errors.binding = 'Registrert avklaring gjelder et annet eller ukjent rapportgrunnlag. Registrer gjeldende status og grunnlag for dette forholdet.'
  return { applicable: current.grade === 'TG3' && Object.keys(errors).length === 0, errors }
}
