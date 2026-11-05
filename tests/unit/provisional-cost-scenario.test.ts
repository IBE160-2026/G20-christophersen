import { expect, it } from 'vitest'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { importEconomyDraft } from '../../src/domain/document-import.ts'
import { economySuggestions } from '../../src/domain/source-economy.ts'
import { selectScenarioBasis } from '../../src/frontend/state/scenario.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'

const pages = [
  'Prisantydning: 4 050 000 kr\nkr 0,- (Andel av fellesgjeld)\nSameiet har ikke lån.',
  'Kommunale avgifter utgjør kr. 12 957,- pr. år.\nEiendomsskatten er beregnet til kr. 3.942,- og er inkludert i de kommunale avgiftene.\nFellesutgiftene utgjør kr. 1 020,- pr. mnd. og inkluderer:\nFelles byggforsikring, drift og vedlikehold, bank, strøm i\nfellesareal, brann- og sprinklerkontroll.',
]
it('viser bare en merket kostnadsforutsetning når kommunal inkludering er ukjent, og leverer aldri full D', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(pages))
  const municipal = outcome.economy.fields.find(field => field.id === 'municipalFees')!
  expect(municipal.includedIn).toBeNull()
  for (const completeOperatingCosts of [false, true]) {
    const suggested = economySuggestions(importEconomyDraft(outcome, {}, completeOperatingCosts), { requireReview: false })
    expect(suggested).toMatchObject({ P: '4050000', D: null, preliminaryOperatingSubtotal: null,
      preliminaryCostScenario: { annualCosts: '25197' }, sharedAnnualPayment: '0' })
    expect(suggested.preliminaryCostScenario!.assumption).toContain('eventuell overlapping er ikke avklart')
  }
  let session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', outcome,
    selected: { hash: outcome.reportHash, bytes: new Uint8Array(), file: new File([], outcome.documentName) } }
  session.financial.L = { rawValue: '144000', period: 'year', year: '2025', confirmed: false }
  session.sources.L = { kind: 'assumption', description: 'Uavhengig regnefasit', conflict: null, rentNature: 'expected' }
  const basis = selectScenarioBasis(session)
  expect(basis.preliminaryCostAssumption).toContain('Forutsetning')
  expect(calculateFinancialScenario(basis, { equity: '', annualInterest: '', months: '' })).toMatchObject({
    preliminaryNoi: '118803', netYield: null, noi: null, cashFlow: null,
  })
  // Brukerens arbeid har forrang, også når den nye verdien ikke er gyldig.
  session = sessionReducer(session, { type: 'register-value', field: 'D', rawValue: 'ugyldig' })
  expect(selectScenarioBasis(session).preliminaryOperatingSubtotal).toBeNull()
  expect(municipal.includedIn).toBeNull()
})
it('dokumentert null gjeld holdes uavhengig av drift, men konkrete motbevis sperrer gjeldsbetaling', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(pages))
  const originalDraft = importEconomyDraft(outcome)
  const suggested = () => economySuggestions(originalDraft, { requireReview: false })
  expect(suggested()).toMatchObject({ sharedAnnualPayment: '0', D: null })
  const common = originalDraft.original.fields.find(field => field.id === 'commonCosts')!
  common.debtPart = '100'
  expect(suggested().sharedAnnualPayment).toBeNull()
  common.debtPart = '0'
  const payment = originalDraft.original.fields.find(field => field.id === 'sharedDebtPayment')!
  payment.amount = '100'
  expect(suggested().sharedAnnualPayment).toBeNull()
  payment.amount = null
  payment.status = 'conflict'
  expect(suggested().sharedAnnualPayment).toBeNull()
  payment.status = 'missing'
  expect(suggested().sharedAnnualPayment).toBe('0')
  originalDraft.original.fields.find(field => field.id === 'sharedDebt')!.status = 'missing'
  expect(suggested().sharedAnnualPayment).toBeNull()
})
it('gir ingen kostnadsforutsetning ved beløps-/gjeldskonflikt eller ukjent periode', async () => {
  for (const extra of ['Felleskostnader: 2 000 kr per måned', 'Fellesgjeld er ukjent']) {
    const outcome = await createCodeFirstImport(codeFirstBasis([...pages, extra]))
    expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryCostScenario).toBeNull()
  }
  const outcome = await createCodeFirstImport(codeFirstBasis(pages))
  outcome.economy.fields.find(field => field.id === 'municipalFees')!.period = 'unknown'
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryCostScenario).toBeNull()
})
