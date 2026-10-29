import { describe, expect, it } from 'vitest'
import express from 'express'
import { createServer, request as httpRequest } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { createImportRouter } from '../../src/backend/http/import-route.ts'
import { createAnalysisRouter } from '../../src/backend/http/analysis-route.ts'
import { createProcessingLock } from '../../src/backend/http/processing-lock.ts'
import { runImport } from '../../src/backend/http/run-import.ts'
import type { ImportPipelineOptions } from '../../src/backend/http/run-import.ts'
import { ImportHttpResponseSchema } from '../../src/contracts/document-import.ts'
async function server(options:ImportPipelineOptions={}){
  const app=express(),lock=createProcessingLock(),imports=createImportRouter({...options,lock}),legacy=createAnalysisRouter({lock})
  app.use('/api',imports);app.use('/api',legacy)
  const http=createServer(app);http.listen(0,'127.0.0.1');await once(http,'listening')
  const address=http.address();if(!address||typeof address==='string')throw new Error('listener')
  return {url:`http://127.0.0.1:${address.port}`,async close(){const closed=new Promise<void>(resolve=>http.close(()=>resolve()));http.closeAllConnections();await Promise.all([imports.stop(),legacy.stop()]);await closed}}
}
let requestCounter=0
async function upload(url:string,name='mixed-12.pdf',role='prospectus',headers:Record<string,string>={}){
  const bytes=await readFile(new URL(`../fixtures/sales-prospectus/${name}`,import.meta.url)),body=new FormData()
  body.append('file',new Blob([bytes]),name)
  const response=await fetch(`${url}/api/document-import`,{method:'POST',body,headers:{'X-Session-Id':'import-http','X-Request-Id':`request-${++requestCounter}`,'X-Analysis-Generation':String(requestCounter),'X-Document-Role':role,...headers}})
  return {response,body:ImportHttpResponseSchema.parse(await response.json())}
}
it('SO-AC1/5/14: faktisk HTTP/barn gir kildebundet økonomi før finansinput, uten nøkkel og med stengt live',async()=>{
  const events:string[]=[],app=await server({onLifecycle:kind=>events.push(kind)})
  try{
    const {response,body}=await upload(app.url)
    expect(response.status).toBe(200);expect(body.kind).toBe('document-import')
    if(body.kind!=='document-import')throw new Error('import')
    expect(body.outcome.economy.fields[0]?.amount).toBe('3000000')
    expect(body.outcome.technical.findings.find(f=>f.grade==='TG3')?.source.pdfPage).toBe(10)
    expect(events).toEqual(['started','adapter-permitted','closed'])
    expect((await upload(app.url)).body).toEqual({kind:'rejected',code:'duplicate-analysis'})
    expect((await upload(app.url,'mixed-12.pdf','prospectus',{'X-Import-Mode':'live'})).body).toEqual({kind:'rejected',code:'live-disabled'})
    const config=await fetch(`${app.url}/api/document-import-config`);expect(await config.json()).toMatchObject({liveEnabled:false,mode:'demo',maxPages:200})
  }finally{await app.close()}
})
it.each([31,200,201])('SO-AC2: separat rapport %i går via ny profil og egen fysisk original',async count=>{
  const app=await server()
  try{const {body}=await upload(app.url,`text-${count}.pdf`,'report',{'X-Parent-Hash':'a'.repeat(64)})
    if(count===201)expect(body).toEqual({kind:'rejected',code:'page-limit'})
    else{expect(body.kind).toBe('document-import');if(body.kind==='document-import'){expect(body.outcome.pageCount).toBe(count);expect(body.outcome.role).toBe('report');expect(body.outcome.documents[0]?.parentHash).toBe('a'.repeat(64))}}
  }finally{await app.close()}
},15000)
it('SO-AC2: inclusive 50 MiB og samlet rapportbudsjett/bytte uten AI over grensen',async()=>{
  const events:string[]=[],app=await server({onLifecycle:kind=>events.push(kind)})
  try{
    const bytes=await readFile(new URL('../fixtures/sales-prospectus/separate-report-4.pdf',import.meta.url))
    const allowance=50*1024*1024-bytes.length
    const valid=await upload(app.url,'separate-report-4.pdf','report',{'X-Retained-Bytes':String(allowance),'X-Parent-Hash':'a'.repeat(64)})
    expect(valid.body.kind).toBe('document-import')
    const before=events.length
    expect((await upload(app.url,'separate-report-4.pdf','report',{'X-Retained-Bytes':String(allowance+1),'X-Parent-Hash':'a'.repeat(64)})).body).toEqual({kind:'rejected',code:'payload-too-large'})
    expect(events).toHaveLength(before)
    // Node's response listener observes early 413 while the oversized producer is still writing.
    const result=await new Promise<{status:number;body:unknown}>((resolve,reject)=>{
      const request=httpRequest(`${app.url}/api/document-import`,{method:'POST',headers:{'Content-Type':'multipart/form-data; boundary=large','X-Session-Id':'large','X-Request-Id':'large','X-Analysis-Generation':'0','X-Document-Role':'prospectus'}},response=>{
        const chunks:Buffer[]=[];response.on('data',chunk=>chunks.push(chunk));response.once('end',()=>resolve({status:response.statusCode!,body:JSON.parse(Buffer.concat(chunks).toString())}))
      })
      request.on('error',reject)
      request.write('--large\r\nContent-Disposition: form-data; name="file"; filename="large.pdf"\r\n\r\n')
      request.write(Buffer.alloc(50*1024*1024+1));request.end('\r\n--large--\r\n')
    })
    expect(result.status).toBe(413);expect(events).toHaveLength(before)
  }finally{await app.close()}
},15000)
it('SO-AC13: global prosesslås deles med legacy og beholdes til child-close ved abort',async()=>{
  let pid:number|undefined,closed=false,started!:()=>void
  const start=new Promise<void>(resolve=>{started=resolve})
  const app=await server({childModule:new URL('../helpers/import-hang-child.ts',import.meta.url),onLifecycle:(kind,id)=>{if(kind==='started'){pid=id;started()}if(kind==='closed')closed=true}})
  try{
    const bytes=await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf',import.meta.url)),body=new FormData();body.append('file',new Blob([bytes]),'mixed-12.pdf')
    const abort=new AbortController()
    const active=fetch(`${app.url}/api/document-import`,{method:'POST',body,signal:abort.signal,headers:{'X-Session-Id':'active','X-Request-Id':'active','X-Analysis-Generation':'0','X-Document-Role':'prospectus'}}).catch(()=>null)
    await start
    expect((await upload(app.url,'text-30.pdf','prospectus',{'X-Session-Id':'different'})).body).toEqual({kind:'rejected',code:'analysis-active'})
    const legacy=await fetch(`${app.url}/api/analysis`,{method:'POST',body,headers:{'X-Session-Id':'legacy','X-Request-Id':'legacy','X-Analysis-Generation':'0'}})
    expect(await legacy.json()).toEqual({kind:'rejected',code:'analysis-active'})
    abort.abort();await active
    for(let i=0;i<100&&!closed;i++)await new Promise(resolve=>setTimeout(resolve,10))
    expect(closed).toBe(true);expect(()=>process.kill(pid!,0)).toThrow()
  }finally{await app.close()}
})
it('SO-AC13: uploadstopp avslutter faktisk mottak før lås frigis',async()=>{
  const app=await server({deadlineMs:100})
  try{
    const request=httpRequest(`${app.url}/api/document-import`,{method:'POST',headers:{'content-type':'multipart/form-data; boundary=hang','X-Session-Id':'upload','X-Request-Id':'upload','X-Analysis-Generation':'0','X-Document-Role':'prospectus'}})
    request.on('error',()=>undefined);request.write('--hang\r\nContent-Disposition: form-data; name="file"; filename="x.pdf"\r\n\r\n%PDF-')
    await Promise.race([once(request,'close'),new Promise((_,reject)=>setTimeout(()=>reject(new Error('upload-hang')),2000))])
    expect(request.destroyed).toBe(true)
  }finally{await app.close()}
})
describe('SO-AC13: foreldrefrist, RSS og terminalcleanup',()=>{
  it.each(['import-hang-child.ts','import-late-child.ts'])('%s termineres uten retry/sen suksess og markør bevares etter tillatelse',async name=>{
    const bytes=await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf',import.meta.url)),events:string[]=[],markers=new Set<string>()
    const input={bytes,documentName:'mixed-12.pdf',requestId:'deadline',sessionId:'deadline',role:'prospectus' as const,parentHash:null,attachmentId:null}
    let pid:number|undefined
    await expect(runImport(input,new AbortController().signal,markers,{deadlineMs:300,childModule:new URL(`../helpers/${name}`,import.meta.url),onLifecycle:(kind,id)=>{events.push(kind);pid=id}})).rejects.toMatchObject({code:'processing-timeout'})
    expect(events.at(-1)).toBe('closed');expect(()=>process.kill(pid!,0)).toThrow();expect(input.bytes).toHaveLength(0)
    expect(markers.size).toBe(name==='import-late-child.ts'?1:0)
  })
  it('RSS-stopp måles fra forelderen, også ved blokkert child-eventloop',async()=>{
    const bytes=await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf',import.meta.url)),events:string[]=[]
    await expect(runImport({bytes,documentName:'synthetic.pdf',requestId:'memory',sessionId:'memory',role:'prospectus',parentHash:null,attachmentId:null},new AbortController().signal,new Set(),{deadlineMs:5000,rssLimitBytes:1,childModule:new URL('../helpers/import-hang-child.ts',import.meta.url),onLifecycle:kind=>events.push(kind)})).rejects.toMatchObject({code:'memory-limit'})
    expect(events.at(-1)).toBe('closed')
  })
})
it('ukjent originalhash får generell lokal plan med stengt semantisk port',async()=>{
  const app=await server()
  try{
    const bytes=await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf',import.meta.url)),body=new FormData();body.append('file',new Blob([bytes,Buffer.from('\n%unknown fixture')]),'synthetic-other.pdf')
    const response=await fetch(`${app.url}/api/document-import`,{method:'POST',body,headers:{'X-Session-Id':'other','X-Request-Id':'other','X-Analysis-Generation':'0','X-Document-Role':'prospectus'}})
    const parsed=ImportHttpResponseSchema.parse(await response.json())
    expect(parsed.kind).toBe('document-import')
    if(parsed.kind!=='document-import')throw new Error('generic import')
    expect(parsed.outcome.model).toBe('gpt-6.1-sol');expect(parsed.outcome.manifest?.blocks.length).toBeGreaterThan(0)
    expect(parsed.outcome.cost?.status).toBe('blocked');expect(parsed.outcome.coverage.technical.status).not.toBe('complete')
    expect(parsed.outcome.economy.fields.find(field=>field.id==='price')?.amount).toBe('3000000')
    expect(createHash('sha256').update(bytes).digest('hex')).toHaveLength(64)
  }finally{await app.close()}
})

it('SO-AC13: mottatt svar over 8 MiB stoppes før validering og ingen sen suksess',async()=>{
  const bytes=await readFile(new URL('../fixtures/sales-prospectus/mixed-12.pdf',import.meta.url)),events:string[]=[]
  await expect(runImport({bytes,documentName:'synthetic.pdf',requestId:'response',sessionId:'response',role:'prospectus',parentHash:null,attachmentId:null},new AbortController().signal,new Set(),{childModule:new URL('../helpers/import-response-limit-child.ts',import.meta.url),onLifecycle:kind=>events.push(kind)})).rejects.toMatchObject({code:'response-limit'})
  expect(events).toEqual(['started','adapter-permitted','closed'])
})
it.each([['per-page',[128*1024+1]],['aggregate',Array(9).fill(120*1024)]] as const)('review: faktisk PDF-worker/HTTP stopper %s-tekstgrensen før adapter og frigir låsen',async(_name,lengths)=>{
  const {syntheticTextPdf}=await import('../helpers/synthetic-text-pdf.ts')
  const events:{kind:string;pid?:number}[]=[],app=await server({onLifecycle:(kind,pid)=>events.push({kind,pid})})
  try{
    const body=new FormData();body.append('file',new Blob([syntheticTextPdf([...lengths])]),'synthetic-budget.pdf')
    const response=await fetch(`${app.url}/api/document-import`,{method:'POST',body,headers:{'X-Session-Id':'text-budget','X-Request-Id':'text-budget','X-Analysis-Generation':'0','X-Document-Role':'prospectus'}})
    expect(await response.json()).toEqual({kind:'rejected',code:'text-limit'})
    expect(events.map(event=>event.kind)).toEqual(['started','closed'])
    expect(()=>process.kill(events[0]!.pid!,0)).toThrow()
    const recovered=await upload(app.url,'mixed-12.pdf','prospectus',{'X-Session-Id':'text-budget'})
    expect(recovered.body.kind).toBe('document-import')
    expect(events.map(event=>event.kind)).toEqual(['started','closed','started','adapter-permitted','closed'])
  }finally{await app.close()}
},15000)
