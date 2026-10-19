import Big from 'big.js'
import { FinancialFieldSchema } from '../contracts/financial-input.ts'
import { FinancialBasisSchema } from '../contracts/financial-basis.ts'
import type { FinancialBasis, FinancialBasisValidation, CostBreakdown } from '../contracts/financial-basis.ts'
import type { FinancialField } from '../contracts/financial-input.ts'
import type { FinancialIssue } from '../contracts/financial-validation.ts'
import { financialPeriodContext, parseFinancialDecimal, validateFinancialInput } from './validation.ts'

const Decimal = Big()
Decimal.strict = true

/** Én ren vurdering av numerikk, opphav og kjent kostnadsinnhold. Ingen screening. */
export function validateFinancialBasis(input: FinancialBasis): FinancialBasisValidation {
  const registeredBasis = FinancialBasisSchema.parse(input)
  const result: FinancialBasisValidation = {
    ...validateFinancialInput(registeredBasis.values),
    registeredBasis,
    costBreakdown: { items: [], D: null, J: null, annualD: null, annualJ: null },
  }
  const addIssue = (
    field: FinancialField, target: FinancialIssue['target'], code: FinancialIssue['code'],
    message: string, action: string,
  ) => result.fields[field].issues.push({ field, target, code, message, action, relatedFields: [] })

  for (const field of FinancialFieldSchema.options) {
    const source = registeredBasis.sources[field]
    if (source.kind === '' || source.description.trim() === '') {
      addIssue(field, 'source', 'missing-source', `${field}: Kilde eller egen forutsetning mangler.`,
        `Oppgi opphav og beskrivelse for ${field}.`)
    }
    if (source.conflict !== null) {
      addIssue(field, 'source', 'source-conflict', `${field}: Uløst kildekonflikt.`,
        `Kontroller begge kildeverdiene for ${field}, rett gjeldende verdi/opphav og fjern motstriden først når den er avklart.`)
    }
  }
  const rent = registeredBasis.sources.L
  if (rent.rentNature === '') {
    addIssue('L', 'source', 'missing-rent-nature', 'L: Forventet eller faktisk oppgitt leie er ikke angitt.',
      'Oppgi om L er forventet leie eller faktisk leie med kilde.')
  } else if (rent.rentNature === 'actual' && (rent.kind !== 'source' || rent.description.trim() === '')) {
    addIssue('L', 'source', 'unsupported-actual-rent', 'L: Faktisk leie mangler oppgitt kildegrunnlag.',
      'Oppgi kilden til faktisk leie, eller merk leien som forventet.')
  }

  const items = registeredBasis.costItems
  const cost: CostBreakdown = result.costBreakdown
  const costProblem = (code: FinancialIssue['code'], message: string, action: string) => {
    for (const field of ['D', 'J'] as const) addIssue(field, 'cost', code, message, action)
  }
  const itemName = (index: number) => `Kostnadspost ${index + 1}${items[index]!.label.trim() ? ` (${items[index]!.label.trim()})` : ''}`
  for (const [index, item] of items.entries()) {
    const amount = parseFinancialDecimal(item.rawAmount)
    const debt = parseFinancialDecimal(item.rawDebt)
    const valid = item.label.trim() !== '' && amount !== null && debt !== null
      && new Decimal(amount).gte('0') && new Decimal(debt).gte('0') && new Decimal(debt).lte(amount)
    cost.items.push({
      ...item, amount, D: valid ? new Decimal(amount!).minus(debt!).toFixed() : null,
      J: valid ? debt : null, status: valid ? item.includedIn === null ? 'counted' : 'included' : 'invalid',
    })
    if (!valid) costProblem('invalid-cost', `${itemName(index)}: Navn, beløp eller rentedel/avdrag er ugyldig eller mangler.`,
      'Oppgi navn og ikke-negative beløp; renter/avdrag må være oppgitt (også 0) og kan ikke overstige samlet beløp.')
  }
  const byId = new Map(cost.items.map((item) => [item.id, item]))
  const idCounts = new Map<string, number>()
  for (const item of cost.items) idCounts.set(item.id, (idCounts.get(item.id) ?? 0) + 1)
  // Bare eksplisitt oppgitte direkte barn summeres. Ingen likhet/full detaljering kreves.
  const uncoveredParents = new Set<string>()
  for (const parent of cost.items) {
    if (parent.D === null || parent.J === null) continue
    let drift = new Decimal('0')
    let debt = new Decimal('0')
    for (const child of cost.items) {
      if (child.includedIn !== parent.id || child.D === null || child.J === null) continue
      drift = drift.plus(child.D)
      debt = debt.plus(child.J)
    }
    if (drift.gt(parent.D) || debt.gt(parent.J)) uncoveredParents.add(parent.id)
  }
  // Avgjør alle kjeder før status endres, slik at radrekkefølgen ikke velger utfallet.
  const validInclusions = cost.items.map((item) => {
    const visited = new Set([item.id])
    let child = item
    let parentId = item.includedIn
    let valid = idCounts.get(item.id) === 1 && !uncoveredParents.has(item.id)
    while (parentId !== null && valid) {
      const parent = byId.get(parentId)
      if (!parent || visited.has(parentId) || parent.status === 'invalid'
        || idCounts.get(parentId) !== 1 || uncoveredParents.has(parentId)) { valid = false; break }
      visited.add(parentId)
      if (child.D !== null && child.J !== null && parent.D !== null && parent.J !== null
        && (new Decimal(child.D).gt(parent.D) || new Decimal(child.J).gt(parent.J))) valid = false
      child = parent
      parentId = parent.includedIn
    }
    return valid
  })
  for (const [index, item] of cost.items.entries()) {
    if (!validInclusions[index]) {
      item.status = 'invalid'
      costProblem('invalid-cost-inclusion', `${itemName(index)}: Inkluderingen kan ikke kontrolleres.`,
        'Velg en eksisterende post som dekker beløpet og rentedelen, uten sirkulær eller tvetydig inkludering.')
    }
  }
  if (cost.items.length > 0) {
    let drift = new Decimal('0')
    let debt = new Decimal('0')
    for (const item of cost.items) {
      if (item.status !== 'counted') continue
      drift = drift.plus(item.D!)
      debt = debt.plus(item.J!)
    }
    const complete = cost.items.every((item) => item.status !== 'invalid')
    if (complete) {
      cost.D = drift.toFixed()
      cost.J = debt.toFixed()
    }
    const context = financialPeriodContext(registeredBasis.values.D)
    if (context.year !== null && context.factor !== null) {
      const annualD = drift.times(context.factor).toFixed()
      const annualJ = debt.times(context.factor).toFixed()
      if (complete) { cost.annualD = annualD; cost.annualJ = annualJ }
      for (const field of ['D', 'J'] as const) {
        const total = result.fields[field].normalization
        const annual = field === 'D' ? annualD : annualJ
        if (total !== null && total.year === context.year && new Decimal(annual).gt(total.annualValue)) {
          addIssue(field, 'cost', 'cost-exceeds-total', `${field}: Oppgitt kostnadsinnhold overstiger den registrerte totalen.`,
            `Kontroller oppdelingen og registrert ${field}; inkluderte poster skal ikke legges til på nytt, og renter/avdrag hører bare til J.`)
        }
      }
    }
  }
  result.issues = []
  for (const field of FinancialFieldSchema.options) {
    const value = result.fields[field]
    value.status = value.issues.length === 0 ? 'sufficient' : 'insufficient'
    result.issues.push(...value.issues)
  }
  return result
}
