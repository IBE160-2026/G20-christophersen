import { expect, it } from 'vitest'
import { createEconomyMoneyCatalogue, createEconomyQualifierCatalogue, parseNorwegianMoney } from '../../src/backend/import/economy-money.ts'
import type { ImportBasis } from '../../src/backend/import/local-plan.ts'

function basis(text: string): ImportBasis {
  return { hash: 'a'.repeat(64), name: 'synthetic.pdf', role: 'prospectus', requestId: 'money', parentHash: null, attachmentId: null, attachments: [], pages: [{ pdfPage: 1, status: 'readable', text, reason: null, rasterUnprocessed: false }] }
}
it('transkriberer norske grupper og øre eksakt uten flyttall eller avrunding', () => {
  for (const [raw, amount, minorUnits] of [
    ['0', '0', '0'], ['12345', '12345', '1234500'], ['12.345,-', '12345', '1234500'], ['12.345,‑', '12345', '1234500'],
    ['12.345,67', '12345.67', '1234567'], ['12 345,06', '12345.06', '1234506'], ['12\u00a0345,6', '12345.6', '1234560'], ['12\u202f345,60', '12345.6', '1234560'],
    ['1.234.567', '1234567', '123456700'], ['000,01', '0.01', '1'], ['9007199254740993,99', '9007199254740993.99', '900719925474099399'],
  ]) expect(parseNorwegianMoney(raw!)).toEqual({ amount, minorUnits, ambiguity: null })
})
it('stopper tvetydige grupper, fortegn, ugyldige brøker og ikke-pengebeløp', () => {
  for (const raw of ['3.000', '1.50', '1,234', '12.34,56', '12.345,', '-12.345,-', '−12 345', '+123', '12.345,-5', '12.345,‑.50', '1e6', '25%', '01.07.2026', '2026-07-01', '01.07–01.10.2026', '1/2', ' 123']) {
    expect(parseNorwegianMoney(raw).amount, raw).toBeNull()
    expect(parseNorwegianMoney(raw).minorUnits, raw).toBeNull()
    expect(parseNorwegianMoney(raw).ambiguity, raw).not.toBeNull()
  }
})
it('bevarer råtekst og eksakte UTF16-spenn og lar ikke ugyldige tokens bli gyldige fragmenter', () => {
  const input = basis('😀 Vann 12.345,67 kr\nAvgift 1.234,- eks.mva.\nÅr 2026; 25 %; 01.07–01.10.2026\nMinus − 1.234,00 og 1e6\nUkjent 3.000')
  const catalogue = createEconomyMoneyCatalogue(input, [1, 1])
  expect(catalogue.map(item => item.raw)).toEqual(['12.345,67', '1.234,-', '2026', '25 %', '01.07–01.10.2026', '− 1.234,00', '1e6', '3.000'])
  expect(catalogue.map(item => item.id)).toEqual(catalogue.map((_, index) => `v${index.toString(36)}`))
  expect(catalogue.every(item => input.pages[0]!.text.slice(item.source.start, item.source.end) === item.raw && item.source.quote === item.raw)).toBe(true)
  expect(catalogue.slice(2).every(item => item.amount === null)).toBe(true)
  expect(catalogue[0]!.minorUnits).toBe('1234567')
})
it('bevarer eksplisitt mva og betalingsperioder uten å beregne, annualisere eller binde ved antakelse', () => {
  const input = basis('12.345,67 eks.mva per kvartal\n1.234,00 inkl. mva pr. måned\nTermin 3/2026 01.07–01.10.2026\n25 % merverdiavgift og 100 kr per år')
  const qualifiers = createEconomyQualifierCatalogue(input, [1])
  expect(qualifiers.map(item => item.kind)).toEqual(expect.arrayContaining(['vat-excluded', 'vat-included', 'vat', 'quarter', 'month', 'term', 'date-range', 'year']))
  expect(qualifiers.every(item => item.raw === input.pages[0]!.text.slice(item.source.start, item.source.end))).toBe(true)
  expect(qualifiers.find(item => item.kind === 'quarter')!.raw).toBe('kvartal')
  expect(qualifiers.find(item => item.kind === 'date-range')!.raw).toBe('01.07–01.10.2026')
})

it('konsumerer ugyldige suffikser, prosenter og promille uten gyldige prefikser', () => {
  const tokens = ['12.345,-5', '12.345,‑5', '12.345,‑.50', '12.345,‑,50', '123,', '25.0 %', '2,5 ‰', '2026-07-01', '1e+6', '‑123,00', '– 123,00', '—123,00']
  const input = basis(tokens.join('\n'))
  const catalogue = createEconomyMoneyCatalogue(input, [1])
  expect(catalogue.map(item => item.raw)).toEqual(tokens)
  expect(catalogue.every(item => item.amount === null && item.minorUnits === null && item.ambiguity !== null)).toBe(true)
})

it('markerer feilgrupperte kr-beløp uavklart uten å slå sammen fakturakolonner', () => {
  for (const text of ['kr 12 34,50', '12 34,50 kr']) {
    const catalogue = createEconomyMoneyCatalogue(basis(text), [1])
    expect(catalogue.every(item => item.amount === null && item.ambiguity === 'malformed-currency-group')).toBe(true)
  }
  const columns = createEconomyMoneyCatalogue(basis('kr 12 345,00 2 345,00 14 690,00'), [1])
  expect(columns.map(item => item.amount)).toEqual(['12345', '2345', '14690'])
})
it('skiller setningspunktum og valuta foran årslignende beløp fra ugyldige fortsettelser', () => {
  const valid = createEconomyMoneyCatalogue(basis('Beløpet er kr 1500. Neste sum er kr 2026.'), [1])
  expect(valid.map(item => [item.raw, item.amount])).toEqual([['1500', '1500'], ['2026', '2026']])
  for (const token of ['1500,', '1500..', '1500.,', '1500,-5', '1500,–5']) {
    expect(createEconomyMoneyCatalogue(basis('kr ' + token), [1]).every(item => item.amount === null), token).toBe(true)
  }
})
it('bevarer bøyninger av kvartal og merverdiavgift samt entydig komma-en-dash', () => {
  const qualifiers = createEconomyQualifierCatalogue(basis('kvartalsvise beløp med merverdiavgiften'), [1])
  expect(qualifiers.map(item => item.raw)).toEqual(['kvartalsvise', 'merverdiavgiften'])
  expect(parseNorwegianMoney('12.345,–')).toEqual({ amount: '12345', minorUnits: '1234500', ambiguity: null })
  expect(createEconomyMoneyCatalogue(basis('kr 12.345,–'), [1])[0]!.amount).toBe('12345')
  for (const token of ['–12.345,–', '12.345–14.567', '12.345,–5']) expect(parseNorwegianMoney(token).amount).toBeNull()
})

it('lar faktisk LF og CRLF avslutte setning før neste tall uten å godta fortsettelser på samme linje', () => {
  for (const newline of ['\n', '\r\n']) {
    const catalogue = createEconomyMoneyCatalogue(basis('kr 12 345.' + newline + '100 kr'), [1])
    expect(catalogue.map(item => [item.raw, item.amount])).toEqual([['12 345', '12345'], ['100', '100']])
  }
  const sameLine = createEconomyMoneyCatalogue(basis('kr 12 345. 100 kr'), [1])
  expect(sameLine[0]!.amount).toBeNull()
})
