import { describe, expect, it } from 'vitest'
import oracle from '../fixtures/sales-prospectus/code-first-oracle.json' with { type: 'json' }
import { codeFirstBasis, sdkStub } from '../helpers/code-first.ts'
import { createLocalPlan, normalizeWithOffsets } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { createSemanticRequest } from '../../src/backend/import/semantic-request.ts'
import { DocumentImportSchema } from '../../src/contracts/document-import.ts'
import { importGate } from '../../src/domain/document-import.ts'

describe('code-first independent oracle and semantic adapter', () => {
  it('preserves contiguous original offsets, split markers and locally sourced amounts/findings', () => {
    const basis = codeFirstBasis(), plan = createLocalPlan(basis)
    for (const page of basis.pages) {
      const blocks = plan.manifest.blocks.filter(block => block.pdfPage === page.pdfPage)
      expect(blocks.map(block => page.text.slice(block.start, block.end)).join('')).toBe(page.text)
      expect(blocks[0]!.start).toBe(0); expect(blocks.at(-1)!.end).toBe(page.text.length)
    }
    expect(plan.sections.map(area => [area.startPage, area.endPage, area.certainty])).toEqual([[2, 5, 'certain']])
    expect(plan.manifest.candidates.map(item => item.grade)).toEqual(['TG2', 'TG2', 'TG3'])
    const split = plan.manifest.candidates[0]!
    expect(basis.pages[1]!.text.slice(split.start, split.end)).toBe('T G\n2')
    for (const [id, amount] of Object.entries(oracle.localAmounts)) expect(plan.fields.find(field => field.id === id)?.amount).toBe(amount)
    expect(plan.findings).toHaveLength(1); expect(plan.findings[0]?.component).toBe('bad vest')
    const normalized = normalizeWithOffsets('ß a T G\n3'); expect(normalized.offsets[normalized.text.indexOf('TG3')]).toBe(4)
  })
  it('sends every unresolved report block including no-keyword continuation and final page once, with linked context', () => {
    const plan = createLocalPlan(codeFirstBasis()), request = createSemanticRequest(plan), input = JSON.parse(request.input[0].content[0].text)
    const sent = [...input.blocks, ...input.contextBlocks] as { id: string; pdfPage: number; text: string }[]
    expect(new Set(sent.map(block => block.id)).size).toBe(sent.length)
    for (const page of oracle.reportPages) expect(sent.filter(block => block.pdfPage === page).map(block => block.text).join('')).toContain(page === 5 ? 'Vann kommer inn ved takfoten.' : page === 4 ? 'Dette avsnittet har ingen gradmarkør.' : page === 2 ? 'T G\n2' : 'Slitt gulv i bad.')
    expect(input.blocks.every((block: { previousId: unknown; nextId: unknown }) => 'previousId' in block && 'nextId' in block)).toBe(true)
    expect(request).toMatchObject({ model: 'gpt-6.1-sol', reasoning: { effort: 'low' }, service_tier: 'default', truncation: 'disabled', max_output_tokens: 8000 })
  })
  it('official SDK stub completes source validation; retains distinct bathrooms, table source and last-page continuation', async () => {
    const dependencies = sdkStub(), outcome = await createCodeFirstImport(codeFirstBasis(), dependencies)
    expect(dependencies.calls).toHaveLength(1)
    expect(outcome.coverage.technical.status).toBe('complete')
    expect(outcome.technical.findings.map(({ component, grade, description, sources }) => ({ component, grade, description, pages: [...new Set(sources.map(source => source.pdfPage))] })).sort((a,b) => a.component.localeCompare(b.component))).toEqual([...oracle.findings].sort((a,b) => a.component.localeCompare(b.component)))
    expect(outcome.economy.fields.find(field => field.id === 'commonCosts')).toMatchObject({ amount: '5000', debtPart: '1000', includedIn: null, period: 'month', year: '2026' })
    expect(importGate(outcome, 1, false, false, false)).toMatchObject({ coverageComplete: true, identityChecked: false, areaChecked: false })
    expect(outcome.cost).toMatchObject({ status: 'completed', tokenizer: 'test-only', inputTokens: 3000 })
  })
  it.each(['block', 'candidate', 'offset', 'page', 'block-id', 'invented-money'] as const)('missing/invalid %s never becomes complete or retries', async kind => {
    const dependencies = sdkStub({ mutate(value) {
      if (kind === 'block') value.processedBlockIds.pop()
      if (kind === 'candidate') value.candidates.pop()
      if (kind === 'offset') value.findings[0]!.sources[0]!.end++
      if (kind === 'page') value.findings[0]!.sources[0]!.blockId = value.findings[1]!.sources.at(-1)!.blockId
      if (kind === 'block-id') value.findings[0]!.sources[0]!.blockId = 'unknown'
      if (kind === 'invented-money') value.economy[0]!.debtPart = '123456789'
      return value
    } })
    const outcome = await createCodeFirstImport(codeFirstBasis(), dependencies)
    expect(outcome.coverage.technical.status).not.toBe('complete'); expect(outcome.manifest!.residual.length).toBeGreaterThan(0)
    expect(outcome.cost!.status).toBe('blocked'); expect(dependencies.calls).toHaveLength(1)
  })
  it.each(['candidate', 'block', 'hash', 'offset', 'page'] as const)('contract independently rejects removed/forged %s evidence', async kind => {
    const outcome = await createCodeFirstImport(codeFirstBasis(), sdkStub())
    if (kind === 'candidate') outcome.manifest!.candidates.pop()
    if (kind === 'block') outcome.manifest!.blocks.splice(1, 1)
    if (kind === 'hash') outcome.technical.findings[0]!.sources[0]!.documentHash = 'b'.repeat(64)
    if (kind === 'offset') outcome.manifest!.blocks[0]!.end++
    if (kind === 'page') outcome.manifest!.blocks[0]!.pdfPage = 200
    expect(DocumentImportSchema.safeParse(outcome).success).toBe(false)
  })
  it.each(['unknown-end', 'identity', 'raster', 'outside'] as const)('%s stays visibly blocked despite fully acknowledged model output', async kind => {
    const basis = codeFirstBasis()
    if (kind === 'unknown-end') basis.pages[4]!.text = basis.pages[4]!.text.replace('TILSTANDSRAPPORT - SLUTT', 'Ukjent avslutning')
    if (kind === 'identity') basis.pages[1]!.text = basis.pages[1]!.text.replace('Fasitveien 4', 'Annenveien 9')
    if (kind === 'raster') basis.pages[4]!.rasterUnprocessed = true
    if (kind === 'outside') basis.pages[0]!.text += 'TG3: Et nytt forhold utenfor rapporten.\n'
    const outcome = await createCodeFirstImport(basis, sdkStub())
    expect(outcome.coverage.technical.status).not.toBe('complete')
    expect(importGate(outcome, 99, true, true, false).coverageComplete).toBe(false)
  })
  it.each(['incomplete', 'failed', 'refused'])('provider %s retains reservation and records known usage without retry', async status => {
    const dependencies = sdkStub({ status }), outcome = await createCodeFirstImport(codeFirstBasis(), dependencies)
    expect(outcome.cost!.status).toBe('blocked'); expect(outcome.cost!.actualUsd).not.toBeNull(); expect(dependencies.ledger.snapshot()[0]!.state).toBe('completed'); expect(dependencies.calls).toHaveLength(1)
  })
  it('missing usage and timeout keep the conservative reservation; same document cannot re-enter transport', async () => {
    const dependencies = sdkStub({ usage: null }), outcome = await createCodeFirstImport(codeFirstBasis(), dependencies)
    expect(outcome.cost!.status).toBe('uncertain')
    await createCodeFirstImport(codeFirstBasis(), dependencies); expect(dependencies.calls).toHaveLength(1)
    const timeout = sdkStub(); let calls = 0
    timeout.transport.responses.create = (_request, options) => { calls++; return new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')))) }
    const expired = await createCodeFirstImport(codeFirstBasis(), { ...timeout, deadlineMs: 10 })
    expect(expired.cost!.status).toBe('uncertain'); expect(calls).toBe(1); expect(timeout.ledger.snapshot()[0]!.state).toBe('uncertain')
  })
  it('default transport gate returns local economics and physical residuals without a model call', async () => {
    const outcome = await createCodeFirstImport(codeFirstBasis())
    expect(outcome.economy.fields[0]!.amount).toBe('3000000'); expect(outcome.cost!.status).toBe('blocked')
    expect(outcome.coverage.technical.status).toBe('incomplete'); expect(outcome.technical.findings).toHaveLength(1)
  })
})

it('entirely explicit separate report has no semantic rest and USD zero model use',async()=>{
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4, 0001 Testby\nTilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\nTILSTANDSRAPPORT - SLUTT\n']);basis.role='report'
  const dependencies=sdkStub(),outcome=await createCodeFirstImport(basis,dependencies)
  expect(dependencies.calls).toHaveLength(0);expect(outcome.cost).toMatchObject({estimatedUsd:'0.00000000',reservedUsd:'0.00000000',actualUsd:'0.00000000',status:'completed'})
  expect(outcome.coverage.technical.status).toBe('complete');expect(outcome.technical.findings[0]!.grade).toBe('TG3')
})
it('large/truncated semantic lists cannot silently omit final findings or become a green empty list',async()=>{
  for(const count of [200,201]){
    const dependencies=sdkStub({mutate(value){const base=value.findings[1]!;value.findings=Array.from({length:count},(_,index)=>({...base,findingId:index===0?'roof':`roof-${index}`,conditionId:`roof-condition-${index}`}));return value}})
    const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
    expect(outcome.coverage.technical.status).not.toBe('complete');expect(outcome.cost!.status).toBe('blocked');expect(outcome.technical.findings).toHaveLength(1);expect(dependencies.calls).toHaveLength(1)
  }
})
it('over 8MiB SDK success body is bounded and blocks without retry',async()=>{
  const dependencies=sdkStub({mutate:()=>({padding:'x'.repeat(8*1024*1024)})})
  const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
  expect(outcome.coverage.technical.status).not.toBe('complete');expect(outcome.cost!.status).toBe('uncertain');expect(dependencies.calls).toHaveLength(1)
})

it('retained incomplete text keeps uncertain TG candidates and readable-page local economy without throwing',async()=>{
  const basis=codeFirstBasis();basis.pages[1]!.status='incomplete'
  const outcome=await createCodeFirstImport(basis)
  expect(outcome.manifest!.candidates.filter(candidate=>candidate.pdfPage===2)).toHaveLength(1)
  expect(outcome.manifest!.candidates.find(candidate=>candidate.pdfPage===2)!.disposition).toBe('unresolved')
  expect(outcome.economy.fields.find(field=>field.id==='price')!.amount).toBe('3000000')
  expect(outcome.coverage.technical.status).not.toBe('complete')
})
it('long explicit TG quote stays semantic instead of failing source construction',async()=>{
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\nTilstandsgrad: TG3\nBygningsdel: tak\n'+ 'Lekkasje '.repeat(300)+'\nTILSTANDSRAPPORT - SLUTT\n'])
  const plan=createLocalPlan(basis)
  expect(plan.findings).toHaveLength(0);expect(plan.manifest.candidates).toHaveLength(1)
  expect(plan.selected.length).toBeGreaterThan(1)
  const outcome=await createCodeFirstImport(basis)
  expect(outcome.coverage.technical.status).not.toBe('complete')
})
it('repeated exact identity/economy evidence is deduplicated, while unique overflow remains visible and partial',async()=>{
  const repeated=codeFirstBasis(Array.from({length:30},(_,index)=>`${index===0?'TILSTANDSRAPPORT - START\n':''}Adresse: Fasitveien 4\nPrisantydning: 3 000 000 kr\n${index===29?'TILSTANDSRAPPORT - SLUTT\n':''}`))
  const repeatedOutcome=await createCodeFirstImport(repeated)
  expect(repeatedOutcome.propertyIdentity).toHaveLength(1)
  expect(repeatedOutcome.economy.fields.find(field=>field.id==='price')!.sources).toHaveLength(1)
  const unique=codeFirstBasis(Array.from({length:30},(_,index)=>`${index===0?'TILSTANDSRAPPORT - START\n':''}Adresse: Vei ${index}\nPrisantydning: ${3000000+index} kr\n${index===29?'TILSTANDSRAPPORT - SLUTT\n':''}`))
  const outcome=await createCodeFirstImport(unique),price=outcome.economy.fields.find(field=>field.id==='price')!
  expect(outcome.propertyIdentity).toHaveLength(20);expect(price.sources.length).toBeLessThanOrEqual(12);expect(price.alternatives).toHaveLength(10)
  expect(price.status).toBe('conflict');expect(outcome.manifest!.residual.some(item=>/grensen|grense/i.test(item.reason))).toBe(true)
})
it('a marker at UTF-16 chunk boundary stays whole and can be cited by one original span',()=>{
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\n','x'.repeat(1599)+'TG3: Lekkasje i tak.\nTILSTANDSRAPPORT - SLUTT\n'])
  const plan=createLocalPlan(basis),candidate=plan.manifest.candidates[0]!
  expect(candidate.start).toBe(1599)
  expect(plan.manifest.blocks.some(block=>block.pdfPage===candidate.pdfPage&&block.start<=candidate.start&&block.end>=candidate.end)).toBe(true)
})
it.each(['2','3'])('semantic grade sources use the same Tilstandsgrad: %s grammar as candidate collection',async number=>{
  const basis=codeFirstBasis();basis.pages[1]!.text=basis.pages[1]!.text.replace('T G\n2',`Tilstandsgrad: ${number}`)
  const dependencies=sdkStub({mutate(value){value.findings[0]!.grade=`TG${number}`;value.candidates[0]!.findingId='bath-east';return value}})
  const outcome=await createCodeFirstImport(basis,dependencies)
  expect(outcome.coverage.technical.status).toBe('complete')
})
it.each(['null-amount','unknown-period','contradictory-period'] as const)('%s never erases explicit local economy or creates an invalid conflict',async kind=>{
  const basis=codeFirstBasis()
  if(kind==='contradictory-period')basis.pages[0]!.text+='Felleskostnader anslag: 5 000 kr per år i 2027.\n'
  const dependencies=sdkStub({mutate(value){const field=value.economy[0]!;field.year=kind==='contradictory-period'?'2027':null as unknown as string;field.period=kind==='contradictory-period'?'year':'unknown';if(kind==='null-amount')field.amount=null as unknown as string;return value}})
  const outcome=await createCodeFirstImport(basis,dependencies),field=outcome.economy.fields.find(item=>item.id==='commonCosts')!
  expect(field).toMatchObject({amount:'5000',period:'month',year:'2026',status:'available',alternatives:[]})
  if(kind==='contradictory-period'){expect(outcome.technical.uncertainties.some(item=>item.includes('periode eller år'))).toBe(true);expect(outcome.coverage.technical.status).not.toBe('complete')}
})
it.each(['','price','commonCosts'])('unsupported/cross-category includedIn %s stays unknown and blocks complete coverage',async includedIn=>{
  const dependencies=sdkStub({mutate(value){value.economy[0]!.includedIn=includedIn;return value}})
  const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
  expect(outcome.economy.fields.find(item=>item.id==='commonCosts')!.includedIn).toBeNull()
  expect(outcome.technical.uncertainties.some(item=>item.startsWith('Inkludering'))).toBe(true)
  expect(outcome.coverage.technical.status).not.toBe('complete')
})
it('model limitations preserve physical residuals and block confirmation',async()=>{
  const dependencies=sdkStub({mutate(value){value.limitations=['Tabellkobling kan ikke avklares.'];return value}})
  const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
  expect(outcome.technical.limitations).toContain('Tabellkobling kan ikke avklares.')
  expect(outcome.manifest!.residual.some(item=>item.reason.includes('begrensninger'))).toBe(true)
  expect(outcome.coverage.technical.status).not.toBe('complete')
})
it.each(['component','description'] as const)('correct grade/source cannot support invented finding %s',async field=>{
  const dependencies=sdkStub({mutate(value){value.findings[0]![field]=field==='component'?'garasje':'Fundamentet i garasjen har rast sammen.';return value}})
  const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
  expect(outcome.cost!.reason).toBe('unsupported-finding-claims');expect(outcome.coverage.technical.status).not.toBe('complete')
  expect(outcome.technical.findings.some(finding=>finding.component==='garasje')).toBe(false)
})
it('two independent explicit prices preserve conflicting evidence and block the existing finance price boundary',async()=>{
  const {importEconomyDraft}=await import('../../src/domain/document-import.ts')
  const {economySuggestions}=await import('../../src/domain/source-economy.ts')
  const basis=codeFirstBasis();basis.pages[0]!.text+='Prisantydning: 3 100 000 kr\n'
  const outcome=await createCodeFirstImport(basis),price=outcome.economy.fields.find(field=>field.id==='price')!
  expect(price).toMatchObject({status:'conflict',amount:'3000000'})
  expect(price.alternatives.map(item=>item.amount)).toEqual(['3100000'])
  expect(price.sources.map(source=>source.quote.trim())).toEqual(['Prisantydning: 3 000 000 kr','Prisantydning: 3 100 000 kr'])
  expect(economySuggestions(importEconomyDraft(outcome),{requireReview:false}).P).toBeNull()
})
it('SDK/schema exception text never appears in public cost reason or coverage',async()=>{
  const dependencies=sdkStub();dependencies.transport.responses.create=async()=>{throw new Error('PRIVATE provider echo: address and API key SECRET')}
  const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
  expect(outcome.cost!.reason).toBe('semantic-failure');expect(JSON.stringify(outcome)).not.toContain('SECRET')
  const schema=await createCodeFirstImport(codeFirstBasis(),sdkStub({mutate:()=>({extra:'PRIVATE-SCHEMA-ECHO'})}))
  expect(schema.cost!.reason).toBe('invalid-semantic-schema');expect(JSON.stringify(schema)).not.toContain('PRIVATE-SCHEMA-ECHO')
})

it('semantic continuation updates an existing local finding ID with original and continuation sources',async()=>{
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\nTilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\n','Fortsettelse for tak: Fukt ved takfoten.\nTILSTANDSRAPPORT - SLUTT\n'])
  const plan=createLocalPlan(basis),local=plan.findings[0]!,dependencies=sdkStub()
  dependencies.transport.responses.create=async request=>{
    const input=JSON.parse(request.input[0].content[0].text),blocks=[...input.blocks,...input.contextBlocks] as {id:string;start:number;end:number}[]
    return {status:'completed',usage:{input_tokens:2000,output_tokens:1000},output_text:JSON.stringify({processedBlockIds:input.blocks.map((block:{id:string})=>block.id),findings:[{findingId:local.findingId,conditionId:local.conditionId,component:'tak',grade:'TG3',description:'Lekkasje i tak og fukt ved takfoten.',sources:blocks.map(block=>({blockId:block.id,start:block.start,end:block.end}))}],candidates:[],economy:[],uncertainties:[],limitations:[]})}
  }
  const outcome=await createCodeFirstImport(basis,dependencies)
  expect(outcome.technical.findings).toHaveLength(1);expect(outcome.technical.findings[0]!.findingId).toBe(local.findingId)
  expect(outcome.technical.findings[0]!.description).toBe('Lekkasje i tak og fukt ved takfoten.')
  expect([...new Set(outcome.technical.findings[0]!.sources.map(source=>source.pdfPage))]).toEqual([1,2])
  expect(outcome.coverage.technical.status).toBe('complete')
})
it.each([['tak',false],['tak',true],['Tak',false],['Tak',true]] as const)('identical local repeats require semantic reconciliation (component=%s, supported merge=%s)',async(secondComponent,merge)=>{
  const line='Tilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\n'
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\n'+line,line.replace('Bygningsdel: tak',`Bygningsdel: ${secondComponent}`)+'TILSTANDSRAPPORT - SLUTT\n']),plan=createLocalPlan(basis)
  expect(plan.reconciliationIds.size).toBe(2)
  const offline=await createCodeFirstImport(basis)
  expect(offline.coverage.technical.status).not.toBe('complete');expect(offline.manifest!.candidates.every(candidate=>candidate.disposition==='unresolved')).toBe(true)
  const dependencies=sdkStub()
  dependencies.transport.responses.create=async request=>{
    const input=JSON.parse(request.input[0].content[0].text),blocks=[...input.blocks,...input.contextBlocks] as {id:string;pdfPage:number;start:number;end:number}[]
    return {status:'completed',usage:{input_tokens:2000,output_tokens:1000},output_text:JSON.stringify({processedBlockIds:input.blocks.map((block:{id:string})=>block.id),findings:[],candidates:input.candidates.map((candidate:{id:string;pdfPage:number;start:number;end:number},index:number)=>({candidateId:candidate.id,disposition:merge&&index>0?'duplicate':'finding',findingId:plan.findings[merge?0:index]!.findingId,sources:blocks.filter(block=>block.pdfPage===candidate.pdfPage&&block.start<=candidate.start&&block.end>=candidate.end).map(block=>({blockId:block.id,start:block.start,end:block.end})),reason:merge&&index>0?'Samme takforhold gjentatt med identisk komponent og beskrivelse.':null})),economy:[],uncertainties:[],limitations:[]})}
  }
  const outcome=await createCodeFirstImport(basis,dependencies)
  expect(outcome.technical.findings).toHaveLength(merge?1:2)
  expect(outcome.coverage.technical.status).toBe(merge?'complete':'incomplete')
  if(merge)expect([...new Set(outcome.technical.findings[0]!.sources.map(source=>source.pdfPage))]).toEqual([1,2])
})
it('candidate disposition cannot merge distinct local components',async()=>{
  const east='Tilstandsgrad: TG3\nBygningsdel: bad øst\nFukt i gulv.\n',west=east.replace('bad øst','bad vest')
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\n'+east+west+'Uavklart oppsummering TG3 i bad vest.\nTILSTANDSRAPPORT - SLUTT\n']),plan=createLocalPlan(basis),dependencies=sdkStub()
  dependencies.transport.responses.create=async request=>{
    const input=JSON.parse(request.input[0].content[0].text),blocks=input.blocks as {id:string;pdfPage:number;start:number;end:number}[]
    return {status:'completed',usage:{input_tokens:2000,output_tokens:1000},output_text:JSON.stringify({processedBlockIds:blocks.map(block=>block.id),findings:[{...plan.findings[1],findingId:plan.findings[0]!.findingId,conditionId:plan.findings[0]!.conditionId,sources:blocks.map(block=>({blockId:block.id,start:block.start,end:block.end}))}],candidates:[],economy:[],uncertainties:[],limitations:[]})}
  }
  const outcome=await createCodeFirstImport(basis,dependencies)
  expect(outcome.coverage.technical.status).not.toBe('complete');expect(outcome.technical.findings.map(finding=>finding.component)).toEqual(['bad øst','bad vest'])
})
it.each(['included','separate'] as const)('explicit same-category %s relationship can be retained with source evidence',async kind=>{
  const basis=codeFirstBasis()
  basis.pages[0]!.text+=kind==='included'?'Dokumentavgift: 75 000 kr, inkludert i omkostninger.\n':'Felleskostnader: 5 000 kr per måned i 2026, separat.\n'
  const dependencies=sdkStub({mutate(value){if(kind==='included')Object.assign(value.economy[0]!,{fieldId:'documentTax',amount:'75000',period:'once',year:null,includedIn:'purchaseCosts',debtPart:null});else value.economy[0]!.includedIn='';return value}})
  const outcome=await createCodeFirstImport(basis,dependencies)
  expect(outcome.economy.fields.find(field=>field.id===(kind==='included'?'documentTax':'commonCosts'))!.includedIn).toBe(kind==='included'?'purchaseCosts':'')
  expect(outcome.coverage.technical.status).toBe('complete')
})

it('capitalization normalization preserves distinct actual components',async()=>{
  const line='Tilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\n'
  const basis=codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Fasitveien 4\n'+line+line.replace('Bygningsdel: tak','Bygningsdel: Tak over garasje')+'TILSTANDSRAPPORT - SLUTT\n'])
  const plan=createLocalPlan(basis),outcome=await createCodeFirstImport(basis)
  expect(plan.reconciliationIds.size).toBe(0)
  expect(outcome.technical.findings.map(finding=>finding.component)).toEqual(['tak','Tak over garasje'])
  expect(outcome.coverage.technical.status).toBe('complete')
})
