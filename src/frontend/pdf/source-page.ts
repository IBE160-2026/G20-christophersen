/** Originalkilden velges bare ved samsvar med den aktive rapporten.
 * En kjent heltallsside beholdes, også utenfor dokumentet, for ærlig feilvisning.
 */
export function sourceTarget(source: unknown, report: { hash: string; documentName: string }) {
  if (typeof source !== 'object' || source === null) return { page: null, issue: 'Kildens PDF-side er ikke kjent. Ingen side er valgt.' }
  const raw = source as Record<string, unknown>
  if ((raw.reportHash != null && raw.reportHash !== report.hash) || raw.documentName !== report.documentName) return { page: null,
    issue: `Kildereferansen samsvarer ikke med valgt originalrapport. Oppgitt dokument: ${typeof raw.documentName === 'string' ? raw.documentName : 'ikke kjent'}. Ingen side er valgt.` }
  if (typeof raw.pdfPage !== 'number' || !Number.isInteger(raw.pdfPage)) return { page: null,
    issue: `Oppgitt PDF-side er ugyldig eller ukjent (${String(raw.pdfPage ?? 'ikke oppgitt')}). Ingen side er valgt.` }
  return { page: raw.pdfPage, issue: null }
}
