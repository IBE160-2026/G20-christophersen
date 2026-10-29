import { afterEach, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import oracle from '../fixtures/sales-prospectus/code-first-live-oracle.json' with { type: 'json' }
import frozenPages from '../fixtures/sales-prospectus/code-first-live-pages.json' with { type: 'json' }
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { compareWithOracle } from '../../src/backend/import/oracle-comparison.ts'
import { prepareLiveTest } from '../../src/backend/import/prepare-live-test.ts'
import { AnalysisBudgetStore } from '../../src/backend/import/analysis-budget-store.ts'
import { sdkStub } from '../helpers/code-first.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import type { DocumentImport } from '../../src/contracts/document-import.ts'

const directories:string[]=[]
afterEach(async()=>{await Promise.all(directories.splice(0).map(path=>rm(path,{recursive:true,force:true})))})
async function controlledOriginal() {
  const bytes=await readFile(new URL('../fixtures/sales-prospectus/code-first-live-original.pdf',import.meta.url))
  expect(createHash('sha256').update(bytes).digest('hex')).toBe(oracle.original.sha256)
  const format=await validatePdf(bytes,oracle.original.file,{maxPages:200})
  if(format.status!=='format-validated')throw new Error('fixture-format')
  const extracted=await extractImport(format)
  expect(extracted.pages).toEqual(frozenPages.pages)
  const deps=sdkStub({mutate:output=>{
    const source=output.economy[0]!.sources
    return {...output,economy:[...output.economy,{fieldId:'sharedDebtPayment',amount:'1000',period:'month',year:null,includedIn:'commonCosts',debtPart:'1000',nature:'fact',sources:source}]}
  }})
  return createCodeFirstImport({hash:format.reportHash,name:format.documentName,role:'prospectus',requestId:'uncorrected-controlled-trial',parentHash:null,attachmentId:null,pages:extracted.pages,attachments:extracted.attachments},deps)
}
it('offline preparation reproduces exact SDK packet with zero external calls and actual blockers',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'prepare-live-'));directories.push(directory)
  const result=await prepareLiveTest({outputDirectory:directory,budgetDirectory:join(directory,'missing-history')})
  expect(result.ready).toBe(false)
  expect(result.blockers).toEqual(['local-tokenizer-unavailable','budget-history-unavailable'])
  expect(result.externalCalls).toBe(0)
  const packet=JSON.parse(await readFile(result.packet,'utf8'))
  expect(packet.reservationsCreated).toBe(0);expect(packet.budget.history).toBeNull()
  expect(packet.original).toEqual(oracle.original);expect(packet.oracle).toEqual(oracle)
  expect(JSON.parse(packet.wire.body)).toEqual(packet.request)
  expect(createHash('sha256').update(await readFile(join(directory,'request.json'))).digest('hex')).toBe(packet.wire.bodySha256)
  expect(packet.request.model).toBe('gpt-6.1-sol');expect(packet.request.max_output_tokens).toBe(8000)
  expect(packet.request.reasoning).toEqual({effort:'low'});expect(packet.request.service_tier).toBe('default')
  expect(packet.tokenizer.inputTokens).toBeNull();expect(packet.productionBenchmark).toBe(false)
})
it('known durable empty history removes only that blocker; preparation reads no API key and uses no global fetch',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'prepare-no-network-'));directories.push(directory)
  const budgets=join(directory,'budgets');AnalysisBudgetStore.initialize(budgets,oracle.original.sha256)
  const environment=process.env,fetch=globalThis.fetch
  let keyReads=0,externalFetches=0
  process.env=new Proxy(environment,{get(target,key){if(key==='OPENAI_API_KEY'){keyReads++;throw new Error('key-read-forbidden')}return Reflect.get(target,key)}})
  globalThis.fetch=async()=>{externalFetches++;throw new Error('network-forbidden')}
  try{
    const result=await prepareLiveTest({outputDirectory:directory,budgetDirectory:budgets})
    expect(result.blockers).toEqual(['local-tokenizer-unavailable']);expect(result.ready).toBe(false)
    expect(keyReads).toBe(0);expect(externalFetches).toBe(0)
    const store=AnalysisBudgetStore.open(budgets,oracle.original.sha256)
    try{expect(store.snapshot()).toEqual([]);expect(store.remaining()).toBe('0.20000000')}finally{store.close()}
  }finally{process.env=environment;globalThis.fetch=fetch}
})
it('schema/source validated untouched controlled output matches independent conditions, relations and physical sources',async()=>{
  const result=await controlledOriginal()
  expect(DocumentImportSchema.safeParse(result).success).toBe(true)
  expect(compareWithOracle(result,oracle)).toEqual({accepted:true,deviations:[]})
  // IDs and order may change without changing the observed source-backed conditions.
  const renamed=structuredClone(result),ids=new Map(renamed.technical.findings.map((finding,index)=>[finding.findingId,'arbitrary-'+index]))
  for(const finding of renamed.technical.findings){finding.findingId=ids.get(finding.findingId)!;finding.conditionId='condition-'+finding.findingId;finding.original={...finding.original,findingId:finding.findingId}}
  for(const candidate of renamed.manifest!.candidates)if(candidate.findingId)candidate.findingId=ids.get(candidate.findingId)!
  renamed.technical.findings.reverse()
  expect(compareWithOracle(renamed,oracle).accepted).toBe(true)
  renamed.economy.fields.find(field=>field.id==='sharedDebtPayment')!.year='2026'
  expect(compareWithOracle(renamed,oracle).accepted).toBe(true)
  for(const finding of renamed.technical.findings){finding.description=finding.description.replace(/[.!?]+$/,'')+'.';finding.original={...finding.original,description:finding.description}}
  expect(DocumentImportSchema.safeParse(renamed).success).toBe(true)
  expect(compareWithOracle(renamed,oracle).accepted).toBe(true)
  const paraphrase=structuredClone(renamed),east=paraphrase.technical.findings.find(finding=>finding.component==='bad øst')!
  east.description='Badet har omfattende skader.';east.original={...east.original,description:east.description}
  expect(DocumentImportSchema.safeParse(paraphrase).success).toBe(true)
  expect(compareWithOracle(paraphrase,oracle).deviations.map(item=>item.code)).toEqual(['missing-finding','extra-finding'])
})
it('ownership and debt-part relation require their independently frozen exact source coverage',async()=>{
  const original=await controlledOriginal()
  const ownership=structuredClone(original)
  ownership.economy.ownershipSources=[ownership.economy.fields.find(field=>field.id==='price')!.sources[0]!]
  expect(DocumentImportSchema.safeParse(ownership).success).toBe(true)
  expect(compareWithOracle(ownership,oracle).deviations).toEqual([{code:'economy-ownership-source',subject:'ownership'}])
  const relation=structuredClone(original),field=relation.economy.fields.find(field=>field.id==='commonCosts')!
  const quote=oracle.economy.fields.find(field=>field.id==='commonCosts')!.source.quote,start=relation.pages[0]!.text.indexOf(quote)
  field.sources=[{...field.sources[0]!,pdfPage:1,start,end:start+quote.length,quote}]
  expect(DocumentImportSchema.safeParse(relation).success).toBe(true)
  expect(compareWithOracle(relation,oracle).deviations).toEqual([{code:'economy-relation-source',subject:'commonCosts'}])
})
it('uncertain usage, technical limitations and incomplete analysis each independently fail comparison',async()=>{
  const original=await controlledOriginal()
  const uncertain=structuredClone(original);uncertain.cost!.status='uncertain';uncertain.cost!.actualUsd=null
  expect(DocumentImportSchema.safeParse(uncertain).success).toBe(true)
  expect(compareWithOracle(uncertain,oracle).deviations).toEqual([{code:'incomplete-cost',subject:'cost'}])
  for(const mutation of [{actualUsd:null},{reason:'unknown-usage'}]){
    const mislabeled=structuredClone(original);Object.assign(mislabeled.cost!,mutation)
    expect(DocumentImportSchema.safeParse(mislabeled).success).toBe(true)
    expect(compareWithOracle(mislabeled,oracle).deviations).toEqual([{code:'incomplete-cost',subject:'cost'}])
  }
  const limited=structuredClone(original);limited.technical.limitations=['Diagrammet krever kontroll.']
  expect(DocumentImportSchema.safeParse(limited).success).toBe(true)
  expect(compareWithOracle(limited,oracle).deviations).toEqual([{code:'technical-limitations',subject:'technical'}])
  const incomplete=structuredClone(original);incomplete.technical.status='blocked';incomplete.coverage.technical.status='incomplete'
  expect(DocumentImportSchema.safeParse(incomplete).success).toBe(true)
  expect(compareWithOracle(incomplete,oracle).deviations).toEqual([{code:'incomplete-analysis',subject:'technical'}])
})
it('oracle rejects omitted/extra/wrong grades and source-backed but wrong semantic findings',async()=>{
  const original=await controlledOriginal()
  const missing=structuredClone(original)
  missing.technical.findings=missing.technical.findings.filter(finding=>finding.component!=='tak')
  // Keep the mutation schema-valid to exercise the independent oracle rather than only parser rejection.
  for(const candidate of missing.manifest!.candidates)if(candidate.grade==='TG3'){candidate.disposition='unresolved';candidate.findingId=null}
  missing.technical.status='blocked';missing.coverage.technical.status='incomplete'
  expect(DocumentImportSchema.safeParse(missing).success).toBe(true)
  expect(compareWithOracle(missing,oracle).deviations.some(item=>item.code==='missing-finding')).toBe(true)
  const extra=structuredClone(original),finding=structuredClone(extra.technical.findings[0]!)
  finding.findingId='extra';finding.conditionId='extra';finding.original={...finding.original,findingId:'extra'};extra.technical.findings.push(finding)
  expect(DocumentImportSchema.safeParse(extra).success).toBe(true)
  expect(compareWithOracle(extra,oracle).deviations.some(item=>item.code==='extra-finding')).toBe(true)
  const grade=structuredClone(original),roof=grade.technical.findings.find(finding=>finding.component==='tak')!
  roof.grade='TG2';roof.original={...roof.original,grade:'TG2'}
  for(const candidate of grade.manifest!.candidates)if(candidate.findingId===roof.findingId){candidate.disposition='unresolved';candidate.findingId=null}
  grade.technical.status='blocked';grade.coverage.technical.status='incomplete'
  expect(DocumentImportSchema.safeParse(grade).success).toBe(true)
  expect(compareWithOracle(grade,oracle).deviations.some(item=>item.code==='wrong-grade')).toBe(true)
  const source=structuredClone(original),east=source.technical.findings.find(finding=>finding.component==='bad øst')!
  east.sources=east.sources.filter(source=>source.pdfPage!==4)
  expect(DocumentImportSchema.safeParse(source).success).toBe(true)
  expect(compareWithOracle(source,oracle).deviations.some(item=>item.code==='wrong-finding-source')).toBe(true)
})
it('oracle rejects wrong original, malformed source, economic values, periods, years, inclusion, debt-part and invented zero',async()=>{
  const original=await controlledOriginal()
  const wrongOriginal=JSON.parse(JSON.stringify(original).replaceAll('SALGSOPPGAVE','SALGSOXPGAVE')) as DocumentImport
  expect(DocumentImportSchema.safeParse(wrongOriginal).success).toBe(true)
  expect(compareWithOracle(wrongOriginal,oracle).deviations.some(item=>item.code==='wrong-original')).toBe(true)
  const invalidSource=structuredClone(original);invalidSource.technical.findings[0]!.sources[0]!.start++
  expect(compareWithOracle(invalidSource,oracle).deviations[0]!.code).toBe('invalid-schema-or-source')
  for(const [key,value]of [['amount','5001'],['period','year'],['year','2025'],['includedIn','sharedDebtPayment'],['debtPart','0']] as const){
    const result=structuredClone(original),field=result.economy.fields.find(field=>field.id==='commonCosts')!
    Object.assign(field,{[key]:value})
    expect(DocumentImportSchema.safeParse(result).success).toBe(true)
    expect(compareWithOracle(result,oracle).deviations.some(item=>item.code==='economy-value-or-relation')).toBe(true)
  }
  const invented:DocumentImport=structuredClone(original),missing=invented.economy.fields.find(field=>field.id==='municipalFees')!
  Object.assign(missing,{amount:'0',status:'available',nature:'fact',sources:invented.economy.fields.find(field=>field.id==='commonCosts')!.sources})
  expect(DocumentImportSchema.safeParse(invented).success).toBe(true)
  expect(compareWithOracle(invented,oracle).deviations.some(item=>item.code==='unknown-economy-field')).toBe(true)
})
