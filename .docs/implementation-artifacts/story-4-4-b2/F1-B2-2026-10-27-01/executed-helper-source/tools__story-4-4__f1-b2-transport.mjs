// One original provider request; observation never replaces the response.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { requireLockOwner, usageCost } from './run-safety.mjs'
const sha = value => createHash('sha256').update(value).digest('hex')
const read = path => JSON.parse(readFileSync(path, 'utf8'))
const write = (dir, file, value) => writeFileSync(join(dir, file), JSON.stringify(value, null, 2)+'\n', { flag:'wx', mode:0o600 })
export function createObservedFetch(directory, forward = globalThis.fetch) {
  let attempted = false
  return async (input, init) => {
    const plan = read(join(directory,'plan.json'))
    const started = read(join(directory,'started.json'))
    requireLockOwner(plan.globalLock, started.owner)
    if (attempted || String(input)!=='https://api.openai.com/v1/responses' || init?.method!=='POST' || typeof init.body!=='string') throw new Error('Unplanned dispatch')
    const normalized = JSON.parse(init.body)
    const basis = JSON.parse(normalized.input[0].content[0].text)
    if (basis.reportHash!==plan.reportHash || basis.documentName!=='F1-tilstandsrapport.pdf') throw new Error('Wrong report')
    basis.requestId=plan.attemptId
    normalized.input[0].content[0].text=JSON.stringify(basis)
    if (sha(JSON.stringify(normalized))!==plan.requestSha256) throw new Error('Changed request')
    attempted=true
    write(directory,'dispatch.json',{at:new Date().toISOString(),owner:started.owner,requestSha256:sha(init.body),normalizedRequestSha256:plan.requestSha256})
    write(directory,'request.json',JSON.parse(init.body))
    try {
      const response=await forward(input,init)
      const headers=Object.fromEntries([...response.headers].filter(([name])=>name.startsWith('x-ratelimit-') || ['x-request-id','content-type','openai-processing-ms','openai-version'].includes(name)))
      write(directory,'http.json',{at:new Date().toISOString(),status:response.status,headers})
      const body=await response.text()
      let provider
      try { provider=JSON.parse(body) } catch { /* No raw failed body is persisted. */ }
      const key=process.env.OPENAI_API_KEY
      const safe=response.ok && provider?.status==='completed' && (!key || !body.includes(key))
      write(directory,'provider.json',safe?provider:{omitted:true,reason:'Non-completed or unsafe provider body'})
      let costUsd
      try {
        if (!safe || provider.model!==plan.model || provider.service_tier!=='default') throw new Error('Unresolved provider')
        costUsd=usageCost(provider.usage)
      } catch { /* Unknown usage preserves full reservation and lock. */ }
      write(directory,'usage.json',{usage:safe?provider.usage??null:null,costUsd:costUsd??null,unknownCost:costUsd===undefined,reservationUsd:plan.reservationUsd})
      return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers})
    } catch {
      write(directory,'transport-failure.json',{unknownCost:true,reservationRetainedUsd:plan.reservationUsd})
      throw new Error('Observed provider transport failed; no retry')
    }
  }
}
const directory=new URL(import.meta.url).searchParams.get('directory')
export const fetch=directory?createObservedFetch(directory):async()=>{throw new Error('Evidence directory required')}
