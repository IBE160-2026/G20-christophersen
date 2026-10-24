// Observation at the production SDK fetch boundary. Never clicks or controls the UI.
import { join } from 'node:path'
import { createOwnedLock, requireLockOwner, usageCost } from '../story-4-4/run-safety.mjs'
import { attemptId, hash, read, write, validateApproval } from './manual.mjs'

export function createObservedFetch(directory, forward = globalThis.fetch) {
  let attempted = false
  return async (input, init) => {
    const plan = read(join(directory, 'plan.json'))
    const approval = validateApproval(plan, read(join(directory, 'armed.json')))
    if (approval.armed !== true || attempted) throw new Error('Transport not armed or already attempted')
    // Only this provider endpoint, method and exact request may leave the machine.
    if (String(input) !== 'https://api.openai.com/v1/responses' || init?.method !== 'POST' || typeof init.body !== 'string') throw new Error('Unexpected transport')
    const request = JSON.parse(init.body)
    const normalized = structuredClone(request)
    const document = JSON.parse(normalized.input[0].content[0].text)
    if (document.documentName !== plan.documentName || document.reportHash !== plan.reportHash || typeof document.requestId !== 'string') throw new Error('Not prepared F1')
    document.requestId = attemptId
    normalized.input[0].content[0].text = JSON.stringify(document)
    if (hash(JSON.stringify(normalized)) !== plan.requestSha256) throw new Error('Request changed beyond requestId')
    attempted = true
    // Durable singleton shared with historical paid runner. Never released automatically.
    const owner = createOwnedLock(plan.globalLock, 'F1')
    requireLockOwner(plan.globalLock, owner)
    write(directory, 'dispatch.json', { at: new Date().toISOString(), owner, requestSha256: hash(init.body),
      normalizedRequestSha256: plan.requestSha256, reservationUsd: approval.reservationUsd,
      costBeforeUsd: approval.costBeforeUsd, unknownCost: true })
    write(directory, 'request.json', request)
    try {
      const response = await forward(input, init)
      // No request/response headers, credentials or cookies are persisted.
      write(directory, 'http.json', { at: new Date().toISOString(), status: response.status })
      const body = await response.text()
      const provider = JSON.parse(body)
      // Failed API responses can quote key fragments: never persist their body.
      const key = process.env.OPENAI_API_KEY
      const safeBody = response.ok && provider.status === 'completed' && (!key || !body.includes(key))
      write(directory, 'provider-body.json', safeBody ? provider : { omitted: true, reason: 'Non-completed or unsafe provider body', status: response.status })
      let costUsd
      try {
        if (!safeBody || !response.ok || provider.status !== 'completed' || provider.model !== plan.model || provider.service_tier !== 'default') throw new Error('Unresolved response')
        costUsd = usageCost(provider.usage)
      } catch { /* Retain unknown cost and lock for explicit reconciliation. */ }
      write(directory, 'usage.json', { at: new Date().toISOString(), usage: safeBody ? provider.usage ?? null : null,
        unknownCost: costUsd === undefined, costUsd: costUsd ?? null,
        cumulativeProjectUsd: costUsd === undefined ? null : approval.costBeforeUsd + costUsd,
        reservationRetainedUsd: approval.reservationUsd, lockRetained: true })
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
    } catch {
      write(directory, 'transport-failure.json', { at: new Date().toISOString(), unknownCost: true,
        reservationRetainedUsd: approval.reservationUsd, lockRetained: true })
      throw new Error('Observed request did not complete; reconcile before any further paid attempt')
    }
  }
}

const directory = new URL(import.meta.url).searchParams.get('directory')
export const fetch = directory ? createObservedFetch(directory) : async () => { throw new Error('Evidence directory required') }
