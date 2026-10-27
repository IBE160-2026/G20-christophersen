// Production fetch observation only: no adapter, replay, UI confirmation or timing.
import { join } from 'node:path'
import { hash, read, write } from './manual.mjs'
import { caseId, attemptId, validateBenchmarkApproval } from './benchmark.mjs'
import { createOwnedLock, requireLockOwner, usageCost } from '../story-4-4/run-safety.mjs'

export function createObservedFetch(directory, forward = globalThis.fetch) {
  let attempted = false
  return async (input, init) => {
    const prepared = read(join(directory, 'plan.json'))
    const { plan, approval } = validateBenchmarkApproval(prepared.projectRoot, directory)
    if (attempted || String(input) !== 'https://api.openai.com/v1/responses' || init?.method !== 'POST' || typeof init.body !== 'string') throw new Error('Unplanned benchmark transport')
    const request = JSON.parse(init.body)
    const normalized = structuredClone(request)
    const basis = JSON.parse(normalized.input[0].content[0].text)
    if (basis.reportHash !== plan.reportHash || basis.documentName !== plan.documentName || typeof basis.requestId !== 'string') throw new Error('Wrong benchmark report')
    basis.requestId = attemptId
    normalized.input[0].content[0].text = JSON.stringify(basis)
    if (hash(JSON.stringify(normalized)) !== plan.requestSha256) throw new Error('Changed benchmark request')
    attempted = true
    const owner = createOwnedLock(plan.globalLock, caseId)
    requireLockOwner(plan.globalLock, owner)
    write(directory, 'dispatch.json', { at: new Date().toISOString(), owner, requestSha256: hash(init.body),
      normalizedRequestSha256: plan.requestSha256, reservationUsd: approval.reservationUsd, costBeforeUsd: approval.costBeforeUsd, unknownCost: true })
    write(directory, 'request.json', request)
    try {
      const response = await forward(input, init)
      write(directory, 'http.json', { at: new Date().toISOString(), status: response.status })
      const body = await response.text()
      let provider
      try { provider = JSON.parse(body) } catch { /* Unsafe/failed bodies are never persisted. */ }
      const key = process.env.OPENAI_API_KEY
      const safe = response.ok && provider?.status === 'completed' && (!key || !body.includes(key))
      write(directory, 'provider-body.json', safe ? provider : { omitted: true, reason: 'Non-completed or unsafe provider body', status: response.status })
      let costUsd
      try {
        if (!safe || provider.model !== plan.model || provider.service_tier !== 'default') throw new Error('Unresolved provider usage')
        costUsd = usageCost(provider.usage)
      } catch { /* Unknown charge retains lock and full reservation. */ }
      write(directory, 'usage.json', { at: new Date().toISOString(), usage: safe ? provider.usage ?? null : null,
        costUsd: costUsd ?? null, unknownCost: costUsd === undefined, reservationRetainedUsd: plan.reservationUsd, lockRetained: true })
      if (costUsd !== undefined) {
        requireLockOwner(plan.globalLock, owner)
        // Persist before returning to SDK/pipeline/UI. Never attest human completion.
        write(directory, 'receipt.json', { at: new Date().toISOString(), usage: provider.usage, costUsd,
          cumulativeProjectUsd: plan.costBeforeUsd + costUsd, unknownCost: false, costOnly: true,
          s5Measured: false, humanControlStatus: 'not-recorded', attempts: 1, retries: 0, owner })
      }
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
    } catch {
      write(directory, 'transport-failure.json', { at: new Date().toISOString(), unknownCost: true,
        reservationRetainedUsd: plan.reservationUsd, lockRetained: true })
      throw new Error('Observed benchmark transport failed; no automatic retry')
    }
  }
}

const directory = new URL(import.meta.url).searchParams.get('directory')
export const fetch = directory ? createObservedFetch(directory) : async () => { throw new Error('Evidence directory required') }
