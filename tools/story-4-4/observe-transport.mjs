// Observer only: forwards the unchanged request once to the real provider.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const evidence = new URL(import.meta.url).searchParams.get('evidence')
if (!evidence) throw new Error('Evidence path required')
export async function fetch(input, init) {
  const plan = JSON.parse(readFileSync(`${evidence}-plan.json`, 'utf8'))
  const request = JSON.parse(init.body)
  const serialized = JSON.stringify(request)
  const normalized = structuredClone(request)
  const basis = JSON.parse(normalized.input[0].content[0].text)
  basis.requestId = `story44-${plan.id}`
  normalized.input[0].content[0].text = JSON.stringify(basis)
  if (createHash('sha256').update(JSON.stringify(normalized)).digest('hex') !== plan.requestSha256) throw new Error('Request changed')
  writeFileSync(`${evidence}-dispatch.json`, JSON.stringify({ at: new Date().toISOString(), actualRequestSha256: createHash('sha256').update(serialized).digest('hex'), serializedBytes: Buffer.byteLength(serialized), reservationUsd: plan.reservationUsd, costBeforeUsd: plan.costBeforeUsd, identityNormalization: 'Only code-generated requestId differs from prepared basis; all other request bytes validated' }, null, 2) + '\n', { flag: 'wx' })
  writeFileSync(`${evidence}-request.json`, serialized + '\n', { flag: 'wx' })
  let response
  try {
    response = await globalThis.fetch(input, init)
    const headers = Object.fromEntries([...response.headers].filter(([name]) => name.startsWith('x-ratelimit-') || ['x-request-id', 'content-type', 'openai-processing-ms', 'openai-version'].includes(name)))
    writeFileSync(`${evidence}-http.json`, JSON.stringify({ receivedAt: new Date().toISOString(), status: response.status, headers }, null, 2) + '\n', { flag: 'wx' })
    // Consume provider body before returning it, so evidence survives pipeline cleanup.
    const body = await response.text()
    writeFileSync(`${evidence}-provider.json`, body + '\n', { flag: 'wx' })
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
  } catch {
    writeFileSync(`${evidence}-transport-failure.json`, JSON.stringify({ at: new Date().toISOString(), usage: null, reservationRetainedUsd: 1.48 }) + '\n', { flag: 'wx' })
    throw new Error('Observed transport failed; reservation retained')
  }
}
