import oracle from '../fixtures/sales-prospectus/code-first-oracle.json' with { type: 'json' }
import { createHash } from 'node:crypto'
import type { ImportBasis } from '../../src/backend/import/local-plan.ts'
import type { SemanticRequest } from '../../src/backend/import/semantic-request.ts'
import { createOfflineSdkTransport } from '../../src/backend/import/offline-sdk-transport.ts'
import { REFERENCE_PRICE, AnalysisBudget } from '../../src/backend/import/budget.ts'

export function codeFirstBasis(texts: string[] = oracle.pages): ImportBasis {
  return { hash: createHash('sha256').update(JSON.stringify(texts)).digest('hex'), name: 'independent-code-first.pdf', role: 'prospectus', requestId: 'code-first', parentHash: null, attachmentId: null,
    pages: texts.map((text, index) => ({ pdfPage: index + 1, text, status: text.trim() ? 'readable' : 'blank', reason: null, rasterUnprocessed: false })), attachments: [] }
}
type Block = { id: string; pdfPage: number; start: number; end: number; text: string }
export function semanticStubOutput(request: SemanticRequest) {
  const input = JSON.parse(request.input[0].content[0].text) as { blocks: Block[]; contextBlocks: Block[]; candidates: { id: string; pdfPage: number; start: number; end: number; grade: string }[]; localFindings: { findingId: string; component: string }[] }
  const all = [...input.blocks, ...input.contextBlocks]
  const refs = (page: number) => all.filter(block => block.pdfPage === page).map(block => ({ blockId: block.id, start: block.start, end: block.end }))
  const bathroom = { findingId: 'bath-east', conditionId: 'bath-east', component: 'bad øst', description: oracle.findings[0]!.description, grade: 'TG2', sources: [...refs(2), ...refs(4)] }
  const roof = { findingId: 'roof', conditionId: 'roof', component: 'tak', description: oracle.findings[2]!.description, grade: 'TG3', sources: [...refs(4), ...refs(5)] }
  return { processedBlockIds: input.blocks.map(block => block.id), findings: [bathroom, roof],
    candidates: input.candidates.map(candidate => ({ candidateId: candidate.id, disposition: 'finding', findingId: candidate.grade === 'TG3' ? 'roof' : 'bath-east', sources: all.filter(block => block.pdfPage === candidate.pdfPage && block.start <= candidate.start && block.end >= candidate.end).map(block => ({ blockId: block.id, start: block.start, end: block.end })), reason: null })),
    economy: [{ fieldId: 'commonCosts', amount: '5000', period: 'month', year: '2026', includedIn: null as string | null, debtPart: '1000', nature: 'fact', sources: refs(1) }], uncertainties: [] as string[], limitations: [] as string[] }
}
export function sdkStub(options: { mutate?: (value: ReturnType<typeof semanticStubOutput>) => unknown; status?: string; usage?: unknown; texts?: string[] } = {}) {
  const calls: SemanticRequest[] = []
  const transport = createOfflineSdkTransport(async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as SemanticRequest; calls.push(request)
    const output = semanticStubOutput(request)
    return new Response(JSON.stringify({ id: 'resp_offline_stub', object: 'response', status: options.status ?? 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(options.mutate ? options.mutate(output) : output), annotations: [] }] }], usage: options.usage === undefined ? { input_tokens: 2000, output_tokens: 1000 } : options.usage }), { headers: { 'content-type': 'application/json' } })
  })
  return { calls, transport, tokenizer: { model: 'gpt-6.1-sol' as const, verification: 'test-only' as const, countRequest: (_request: SemanticRequest) => 3000 }, price: REFERENCE_PRICE, ledger: new AnalysisBudget('independent-analysis') }
}
