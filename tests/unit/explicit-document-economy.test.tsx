import { expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { importEconomyDraft } from '../../src/domain/document-import.ts'
import { economySuggestions } from '../../src/domain/source-economy.ts'
import { createInitialSession, sessionReducer } from '../../src/frontend/state/session.ts'
import { selectScenarioBasis } from '../../src/frontend/state/scenario.ts'
import { calculateFinancialScenario } from '../../src/domain/financial-scenario.ts'
import { selectResult } from '../../src/frontend/state/result.ts'
import { DocumentEconomy } from '../../src/frontend/investment/DocumentEconomy.tsx'
const debt = 'Ingen lån registrert for sameiet.\nSeksjonen har ingen gjeld per. 26.10.2026'
const costs = 'Felleskostnader\nKr 3 660,- pr. mnd.\nInkluderer: Felleskostnader: 2 704,-\nInternett: 159,-\nA-konto fyring: 797,-\nFelleskostnadene inkluderer kommunale avgifter, drift og\nvedlikehold, felles bygningsforsikring, strøm til\nfellesarealer, forretningsfører- og styrehonorar.'
const texts = ['Prisantydning: 8 600 000 kr', costs, debt]
it('knytter dokumentert datert null og eksakt kostnadssammensetning til originale UTF16-spenn', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(texts))
  const suggested = economySuggestions(importEconomyDraft(outcome), { requireReview: false })
  expect(suggested).toMatchObject({ P: '8600000', preliminaryOperatingSubtotal: '43920', preliminaryCostYear: null, D: null })
  const fields = outcome.economy.fields
  expect(fields.filter(field => field.includedIn === 'commonCosts').map(field => field.amount)).toEqual(['2704', '159', '797'])
  for (const field of fields) for (const source of field.sources) expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(markup).toContain('Gjeldsopplysning: Seksjonen har ingen gjeld per. 26.10.2026')
  expect(markup).toContain('Inngår i felleskostnadene')
  expect(markup).toContain('Separate beløp er ukjente')
})
it.each([
  'Ingen lån registrert for sameiet.', 'Seksjonen har ingen gjeld per. 26.10.2026',
  debt.replace('26.10.2026', '31.02.2026'), debt + '\nFellesgjeld: 100 kr',
  debt + '\nSeksjonen har gjeld på kr 100.', debt + '\nFellesgjeld er ukjent', debt + '\nSameiet har lån på 100 000 kroner.',
  debt + '\nSameiet har lån på kr 100 000.', debt.replace('26.10.2026', '26.10.20260'),
  debt.replace('per. ', 'per. ' + ' '.repeat(2100)),
])('avviser ufullstendig, ugyldig eller motstridende nullgjeld: %s', text => {
  const plan = createLocalPlan(codeFirstBasis(['Prisantydning: 8 600 000 kr', text]))
  expect(economySuggestions({ original: { fields: plan.fields.map(field => ({ ...field, source: field.sources[0] ?? null })) }, corrections: {}, completeOperatingCosts: false }, { requireReview: false }).P).toBeNull()
})
it.each([costs.replace('797,-', '798,-'), costs + '\nFelleskostnadene inkluderer ikke kommunale avgifter.', costs.replace('pr. mnd.', 'pr. år'), costs + '\nRentedel er uavklart'])('sperrer uavklart eller motstridende delsum', async text => {
  const outcome = await createCodeFirstImport(codeFirstBasis([texts[0]!, text, debt]))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryOperatingSubtotal).toBeNull()
})
it('foreløpig netto holder full D, kontantstrøm og screening sperret og viker for manuell drift', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(texts))
  let session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', outcome, selected: { hash: outcome.reportHash, bytes: new Uint8Array(), file: new File([], outcome.documentName) } }
  // Independent annual rent input. Automatic SSB priority is covered by rent-scenario tests.
  for (const action of [
    { type: 'register-value', field: 'L', rawValue: '226800' }, { type: 'register-period', field: 'L', period: 'year' },
    { type: 'register-year', field: 'L', year: '2025' }, { type: 'register-source', field: 'L', source: { kind: 'assumption', description: 'SSB 2025 reference', conflict: null } },
    { type: 'register-rent-nature', rentNature: 'expected' },
  ] as const) session = sessionReducer(session, action)
  const basis = selectScenarioBasis(session)
  expect(basis).toMatchObject({ P: '8600000', D: null, preliminaryOperatingSubtotal: '43920', preliminaryCostYear: null })
  const scenario = calculateFinancialScenario(basis, { equity: '', annualInterest: '', months: '' })
  expect(scenario).toMatchObject({ preliminaryNoi: '182880', netYield: null, noi: null, cashFlow: null })
  expect(Number(scenario.preliminaryNetYield)).toBeCloseTo(2.1265116279)
  expect(Number(scenario.grossYield)).toBeCloseTo(2.6372093023)
  expect(basis.issues.join(' ')).toContain('Kostnadsår: ukjent')
  expect(selectResult(session).status).toBe('not-calculated')
  for (const rawValue of ['ugyldig', '']) {
    session = sessionReducer(session, { type: 'register-value', field: 'D', rawValue })
    expect(selectScenarioBasis(session).preliminaryOperatingSubtotal).toBeNull()
  }
})
it('bevarer historisk økonomigrammatikk for integritetspinnet replay', () => {
  expect(createLocalPlan(codeFirstBasis(texts), { legacyEconomy: true }).fields.find(field => field.id === 'sharedDebt')?.amount).toBeNull()
})

it('bevarer motstridende sameiegjeld og nullutsagn som fysisk kildebevis', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis([debt, 'Sameiet har lån på 100 000 kroner.']))
  const field = outcome.economy.fields.find(field => field.id === 'sharedDebt')!
  expect(field.status).toBe('conflict')
  expect(field.sources.map(source => source.quote)).toEqual(expect.arrayContaining(['Seksjonen har ingen gjeld per. 26.10.2026', 'Ingen lån registrert for sameiet.', 'Sameiet har lån på 100 000 kroner']))
})
it.each(['privat strøm', 'kommunale avgifter og bygningsforsikring'])('bevarer vanlige eksklusjoner som tilleggskostnader: %s', async excluded => {
  const costText = excluded === 'privat strøm' ? costs + '\nFelleskostnadene inkluderer ikke privat strøm.' : costs.replace(/Felleskostnadene inkluderer[\s\S]*/, `Felleskostnadene ekskluderer ${excluded}.`)
  const outcome = await createCodeFirstImport(codeFirstBasis([texts[0]!, costText, debt]))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryOperatingSubtotal).toBe('43920')
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(markup).toContain('Ekskluderte kostnader kommer i tillegg')
  if (excluded !== 'privat strøm') {
    expect(markup).not.toContain('kommunale avgifter inngår')
    expect(markup).not.toContain('bygningsforsikring inngår')
  } else expect(markup).toContain('kommunale avgifter inngår og legges ikke til på nytt')
})
it('bevarer varmeavregning inklusive pr. og originalt UTF16-spenn', async () => {
  const heat = 'Det er målere i hver leilighet for varme/varmtvann som\navregnes en gang i året, pr. 31.12.'
  const outcome = await createCodeFirstImport(codeFirstBasis([...texts, 'Annen tekst.\n' + heat]))
  expect(outcome.economy.fields.find(field => field.id === 'commonCosts')!.sources).toEqual(expect.arrayContaining([expect.objectContaining({ pdfPage: 4, start: 13, end: 13 + heat.length, quote: heat })]))
})
it.each(['debt', 'operating'])('sperrer underpost som overskrider rotens %s-andel', async kind => {
  const outcome = await createCodeFirstImport(codeFirstBasis(texts))
  const root = outcome.economy.fields.find(field => field.id === 'commonCosts')!
  Object.assign(root, { amount: '1000', debtPart: kind === 'debt' ? '0' : '900' })
  const child = outcome.economy.fields.find(field => field.id === 'municipalFees')!
  Object.assign(child, { amount: '2000', debtPart: kind === 'debt' ? '100' : '0', period: 'year', includedIn: 'commonCosts', status: 'available', nature: 'fact', sources: root.sources })
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryOperatingSubtotal).toBeNull()
})
it('trekker positiv gjeldsdel fra én gang i delsum, selector og foreløpig NOI', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(texts))
  Object.assign(outcome.economy.fields.find(field => field.id === 'commonCosts')!, { amount: '6000', debtPart: '1000' })
  Object.assign(outcome.economy.fields.find(field => field.id === 'sharedDebt')!, { amount: '100000' })
  const session = createInitialSession()
  session.prospectus.prospectus = { ...session.prospectus.prospectus, status: 'imported', outcome, selected: { hash: outcome.reportHash, bytes: new Uint8Array(), file: new File([], outcome.documentName) } }
  session.financial.L = { rawValue: '226800', period: 'year', year: '2025', confirmed: false }
  session.sources.L = { kind: 'assumption', description: 'Leiescenario', conflict: null, rentNature: 'expected' }
  const basis = selectScenarioBasis(session)
  expect(basis.preliminaryOperatingSubtotal).toBe('60000')
  expect(calculateFinancialScenario(basis, { equity: '', annualInterest: '', months: '' }).preliminaryNoi).toBe('166800')
})

it('tolker eksplisitt men-ikke-klausul uten å påstå at utelatt kategori inngår', async () => {
  const text = costs.replace(/Felleskostnadene inkluderer[\s\S]*/, 'Felleskostnadene inkluderer kommunale avgifter, men ikke bygningsforsikring.')
  const outcome = await createCodeFirstImport(codeFirstBasis([texts[0]!, text, debt]))
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryOperatingSubtotal).toBe('43920')
  expect(markup).toContain('kommunale avgifter inngår og legges ikke til på nytt')
  expect(markup).not.toContain('bygningsforsikring inngår')
  expect(markup).toContain('Ekskluderte kostnader kommer i tillegg')
})

const ledger = 'Prisantydning\n4 050 000 kr\nkr 0,- (Andel av fellesgjeld)\nkr 102 340,- (Omkostninger totalt ved prisantydning)\nkr 4 152 340,- (Totalpris inkl omkostninger)\nFELLESKOSTNAD\nKr. 1 020 pr. mnd.\nKOMMUNALE AVGIFTER\nKr. 12 957 pr. år.'
const separateCosts = 'Eiendomsskatten er beregnet til kr. 3.942,- i følge Testby\nKommune og er inkluddert i de kommunale avgiftene.\nKommunale avgifter utgjør kr. 12 957,- pr. år.\nFellesutgiftene utgjør kr. 1 020,- pr. mnd. og inkluderer:\nFelles byggforsikring, drift og vedlikehold, bank, strøm i\nfellesareal, brann- og sprinklerkontroll.\nI følge styreleder kan der forekomme økning i felleskostnadene\nda det er planer om å skifte fasadepanel og fikse en heis som er\ni ustand. Omfanget av kostnadene er uvisst per dags dato.'
it('avstemmer kildebelagt nullgjeld og skatt innen kommunale avgifter, og beholder ukjente økninger', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis([ledger, separateCosts, 'Sameiet har ikke lån.']))
  const suggestion = economySuggestions(importEconomyDraft(outcome), { requireReview: false })
  expect(suggestion).toMatchObject({ P: '4050000', preliminaryOperatingSubtotal: null, D: null, preliminaryCostYear: null })
  expect(outcome.economy.fields.find(field => field.id === 'propertyTax')).toMatchObject({ amount: '3942', includedIn: 'municipalFees', period: 'year' })
  const markup = renderToStaticMarkup(createElement(DocumentEconomy, { outcome, onSource: () => {} }))
  expect(markup).toContain('bygningsforsikring inngår')
  const common = outcome.economy.fields.find(field => field.id === 'commonCosts')!
  expect(common.sources.some(item => /Omfanget av kostnadene er uvisst/.test(item.quote))).toBe(true)
  for (const field of outcome.economy.fields) for (const source of field.sources) expect(outcome.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
})
it.each([
  [ledger.replace('kr 0,- (Andel av fellesgjeld)', ''), separateCosts, 'Sameiet har ikke lån.'],
  [ledger, separateCosts.replace('inkluddert i de kommunale avgiftene', 'betalt separat'), 'Sameiet har ikke lån.'],
  [ledger, separateCosts, 'Sameiet har lån på kr 100 000.'],
  [ledger, separateCosts.replace('Felles byggforsikring', 'kommunale avgifter, Felles byggforsikring'), 'Sameiet har ikke lån.'],
  [ledger, separateCosts + '\nFelleskostnader: 2 000 kr per måned', 'Sameiet har ikke lån.'],
  [ledger, separateCosts + '\nFelleskostnadene inkluderer kommunale avgifter.', 'Sameiet har ikke lån.'],
  [ledger, separateCosts.replace('Felles byggforsikring, drift og vedlikehold, bank, strøm i\nfellesareal, brann- og sprinklerkontroll.', 'Uavklart innhold.'), 'Sameiet har ikke lån.'],
])('sperrer manglende gjeld, ukjent inkludering, overlapp eller motstrid', async (...pages) => {
  const outcome = await createCodeFirstImport(codeFirstBasis(pages))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).preliminaryOperatingSubtotal).toBeNull()
})

it('aksepterer eksplisitt etikett med Kr.-prefiks uten falsk gjeldskonflikt', async () => {
  const outcome = await createCodeFirstImport(codeFirstBasis(['Prisantydning: Kr. 3 000 000', 'Fellesgjeld: Kr. 0']))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).P).toBe('3000000')
})

it.each(['ikke inkludert', 'inkludert per måned', 'inkludert pr. kvartal'])('sperrer negert eller ukjent periode for eiendomsskatt: %s', clause => {
  const plan = createLocalPlan(codeFirstBasis([ledger, separateCosts.replace('inkluddert', clause), 'Sameiet har ikke lån.']))
  const field = plan.fields.find(field => field.id === 'propertyTax')!
  expect(field.status).not.toBe('available')
  expect(field.includedIn).toBeNull()
})
it('skatt får ikke årsperiode uten dokumentert årlig kommunal rot og beholder årskilden', () => {
  const missing = createLocalPlan(codeFirstBasis([separateCosts.replace(/Kommunale avgifter utgjør[^\n]+/, '')]))
  expect(missing.fields.find(field => field.id === 'propertyTax')!.period).toBe('unknown')
  const annual = createLocalPlan(codeFirstBasis([ledger, separateCosts]))
  expect(annual.fields.find(field => field.id === 'propertyTax')!.sources.some(source => source.quote.includes('12 957'))).toBe(true)
})
it('inline ukjent gjeld kan ikke overstyres av null-ledger', () => {
  const plan = createLocalPlan(codeFirstBasis([ledger, 'Sameiet har ikke lån.\nOpplysninger: Fellesgjeld er ukjent']))
  expect(plan.fields.find(field => field.id === 'sharedDebt')!.status).toBe('conflict')
})
it('forklarer valgfri total separat og sperrer uforklart avvikende prosa-total', async () => {
  const qualified = 'kr 4 165 330,- (Totalpris inkl omk og valgfrie omkostninger)'
  const prose = 'Totalpris inkl omkostninger og fellesgjeld kr. 4 165 330'
  const outcome = await createCodeFirstImport(codeFirstBasis([ledger, qualified, prose]))
  expect(economySuggestions(importEconomyDraft(outcome), { requireReview: false }).P).toBe('4050000')
  const optional = outcome.economy.fields.find(field => field.category === 'informational' && field.label.includes('valgfrie'))!
  expect(optional).toMatchObject({ amount: '4165330', status: 'available' })
  expect(optional.sources.map(source => source.quote)).toEqual([qualified, prose])
  const unexplained = await createCodeFirstImport(codeFirstBasis([ledger, prose]))
  expect(unexplained.economy.fields.find(field => field.id === 'totalPrice')!.status).toBe('conflict')
  expect(economySuggestions(importEconomyDraft(unexplained), { requireReview: false }).P).toBeNull()
})
