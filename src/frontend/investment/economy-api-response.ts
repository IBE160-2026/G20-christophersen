// En eldre backend eller en mellomliggende server kan svare med tekst/HTML.
// Vis aldri rå responsinnhold i UI eller forsøk automatisk på nytt.
export async function readEconomyResponse(response: Response): Promise<Record<string, unknown>> {
  if (response.status === 404) throw new Error('economy-route-unavailable')
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new Error('economy-response-not-json')
  }
  let value: unknown
  try { value = await response.json() }
  catch { throw new Error('economy-response-not-json') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid-response')
  return value as Record<string, unknown>
}
