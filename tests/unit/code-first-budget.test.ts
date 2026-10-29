import { describe, expect, it } from 'vitest'
import { AnalysisBudget, preflightSemantic, REFERENCE_PRICE } from '../../src/backend/import/budget.ts'
import type { SemanticTokenizer } from '../../src/backend/import/budget.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createSemanticRequest, semanticDigest } from '../../src/backend/import/semantic-request.ts'
import type { SemanticRequest } from '../../src/backend/import/semantic-request.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis, sdkStub } from '../helpers/code-first.ts'
const request = () => createSemanticRequest(createLocalPlan(codeFirstBasis()))
const tokenizer = (tokens: number): SemanticTokenizer => ({ model: 'gpt-6.1-sol', verification: 'test-only', countRequest: () => tokens })
const hash = 'a'.repeat(64)
describe('analysis-scoped conservative reservation', () => {
  it.each([0, 39999, 40000])('whole final request counted at %s; output includes reasoning; maximum reservation is USD .198', tokens => {
    const ledger = new AnalysisBudget('analysis'), prepared = request(); let seen: SemanticRequest | undefined
    const cost = preflightSemantic(prepared, hash, ledger, { offlineTest: true, price: REFERENCE_PRICE, tokenizer: { ...tokenizer(tokens), countRequest(value) { seen=value; return tokens } } })
    expect(cost.status).toBe('reserved'); expect(seen).toBe(prepared)
    expect(cost.outputTokens).toBe(8000); expect(cost.requestDigest).toBe(semanticDigest(prepared))
    if(tokens===40000)expect(cost.reservedUsd).toBe('0.19800000')
  })
  it.each([40001, NaN, Infinity, -1, 1.5])('unsafe/excessive input count %s never reserves', tokens => {
    const ledger = new AnalysisBudget('analysis'), cost = preflightSemantic(request(), hash, ledger, { offlineTest: true, price: REFERENCE_PRICE, tokenizer: tokenizer(tokens) })
    expect(cost.status).toBe('blocked'); expect(ledger.snapshot()).toEqual([])
  })
  it('missing tokenizer, missing/unknown price, wrong model and unverified framing block transport', async () => {
    for (const overrides of [{ tokenizer: undefined }, { price: undefined }, { price: { ...REFERENCE_PRICE, maximumInputPerMillion: '' } }, { tokenizer: { ...tokenizer(100), model: 'unknown' as 'gpt-6.1-sol' } }]) {
      const dependencies=sdkStub(), outcome=await createCodeFirstImport(codeFirstBasis(),{...dependencies,...overrides})
      expect(outcome.cost!.status).toBe('blocked');expect(dependencies.calls).toHaveLength(0);expect(dependencies.ledger.snapshot()).toEqual([])
    }
  })
  it('production preflight cannot use test counter, unverified tariff or lost restart history', () => {
    const ledger = new AnalysisBudget('analysis'), verifiedCounter = { ...tokenizer(100), verification: 'verified-local-model-and-request-framing' as const }
    expect(preflightSemantic(request(),hash,ledger,{tokenizer:tokenizer(100),price:REFERENCE_PRICE}).reason).toBe('local-tokenizer-unavailable')
    expect(preflightSemantic(request(),hash,ledger,{tokenizer:verifiedCounter,price:REFERENCE_PRICE}).reason).toBe('unknown-price')
    expect(preflightSemantic(request(),hash,ledger,{tokenizer:verifiedCounter,price:{...REFERENCE_PRICE,verified:true}}).reason).toBe('budget-history-unavailable')
    expect(ledger.snapshot()).toEqual([])
  })
  it('USD .20 is inclusive; over-budget, reload, changed digest and separate report cannot reset the allowance', () => {
    const ledger = new AnalysisBudget('analysis'); ledger.reserve(hash,'b'.repeat(64),'0.20')
    expect(ledger.remaining()).toBe('0.00000000')
    expect(()=>ledger.reserve('c'.repeat(64),'d'.repeat(64),'0.00000001')).toThrow('analysis-budget-exceeded')
    expect(()=>ledger.reserve(hash,'e'.repeat(64),'0')).toThrow('document-already-attempted')
    const restored=new AnalysisBudget('analysis',{historyRestored:true,entries:ledger.snapshot()})
    expect(restored.remaining()).toBe('0.00000000')
    expect(preflightSemantic(request(),'f'.repeat(64),restored,{offlineTest:true,tokenizer:tokenizer(100),price:REFERENCE_PRICE}).reason).toBe('analysis-budget-exceeded')
  })
  it('same logical analysis shares reservation between prospectus and separate report', async () => {
    const dependencies=sdkStub();dependencies.tokenizer.countRequest=()=>40000
    const first=await createCodeFirstImport(codeFirstBasis(),dependencies)
    const separate=codeFirstBasis();separate.hash='f'.repeat(64);separate.parentHash=first.reportHash;separate.role='report'
    const second=await createCodeFirstImport(separate,dependencies)
    expect(first.cost!.reservedUsd).toBe('0.19800000');expect(second.cost!.reason).toBe('analysis-budget-exceeded');expect(dependencies.calls).toHaveLength(1)
  })
  it('a changed final request digest fails before transport and does not reserve', async () => {
    const dependencies=sdkStub();dependencies.tokenizer.countRequest=value=>{(value as {instructions:string}).instructions+=' changed';return 100}
    const outcome=await createCodeFirstImport(codeFirstBasis(),dependencies)
    expect(outcome.cost!.reason).toBe('request-digest-changed');expect(dependencies.calls).toHaveLength(0);expect(dependencies.ledger.snapshot()).toEqual([])
  })
})
