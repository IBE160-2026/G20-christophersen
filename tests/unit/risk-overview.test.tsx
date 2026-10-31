import { expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { RiskOverview, RiskDetails } from '../../src/frontend/investment/RiskOverview.tsx'
import { groupPropertyRisks } from '../../src/frontend/investment/risk-grouping.ts'
import type { PropertyRiskItem, PropertyRiskOverview } from '../../src/frontend/investment/property-risk.ts'

it('skiller godkjenningsforhold med samme kategoritittel og fysiske side før radene åpnes på begge flater', () => {
  const quote = 'Det mangler både ferdigattest og midlertidig brukstillatelse.'
  const text = ['Kjelleretasje', 'Loftsetasje', 'Takterrasse'].map(subject => `${subject}: Oppholdsareal.\n${quote}\n`).join('')
  const findings: PropertyRiskItem[] = [...text.matchAll(/Det mangler[^.]+\./gu)].map((match, index) => ({
    id: `same-page-${index}`, title: 'Godkjenning eller brukstillatelse må kontrolleres', description: quote, domain: 'legal', category: 'use-approval', status: 'possible', grade: null,
    consequence: 'Bruk må avklares.', action: 'Kontroller originalen.', sources: [{ documentHash: 'a', documentName: 'syntetisk.pdf', pdfPage: 1, start: match.index, end: match.index + quote.length, quote }],
  }))
  const before = structuredClone(findings)
  const risks: PropertyRiskOverview = { documented: [], possible: groupPropertyRisks(findings, [{ reportHash: 'a', documentName: 'syntetisk.pdf', pages: [{ pdfPage: 1, text }] }]), unexamined: [], background: [], gaps: [], limitations: [], technicalCoverage: 'Delvis dekning.' }
  const props = { risks, onSource: () => {}, onDetails: () => {} }
  for (const Component of [RiskOverview, RiskDetails]) {
    const markup = renderToStaticMarkup(createElement(Component, props))
    const summaries = [...markup.matchAll(/<summary>(.*?)<\/summary>/gu)].map(match => match[1])
    expect(summaries).toHaveLength(3)
    expect(summaries[0]).toContain('Kjeller')
    expect(summaries[1]).toContain('Loft')
    expect(summaries[2]).toContain('Takterrasse')
    expect(markup).not.toContain(' open=')
  }
  expect(findings).toEqual(before)
})

it('teller samlet forhold én gang og holder kilder, bakgrunn og dekning utenfor risikotallet', () => {
  const make = (id: string, description: string, page: number): PropertyRiskItem => ({ id, description, title: 'Utleieenhet er ikke godkjent', domain: 'legal', category: 'rental-approval', status: 'documented', grade: null,
    consequence: 'Avklar bruk.', action: 'Kontroller originalen.', sources: [{ documentHash: 'a', documentName: 'syntetisk.pdf', pdfPage: page, start: 0, end: description.length, quote: description }] })
  const findings = groupPropertyRisks([make('one', 'Kjellerens utleieenhet er ikke godkjent.', 1), make('two', 'Utleid leilighet er ikke godkjent som egen bruksenhet.', 2)])
  const background = { ...make('background', 'Generell juridisk forklaring.', 3), consequence: 'Denne risikokonsekvensen skal ikke vises for bakgrunn.' }
  const risks: PropertyRiskOverview = { documented: findings, possible: [], unexamined: [], background: [background], gaps: ['Uavklart rapportdekning.', 'Kommunale dokumenter er ikke kontrollert.'], limitations: [], technicalCoverage: 'Delvis dekning.' }
  const markup = renderToStaticMarkup(createElement(RiskOverview, { risks, onSource: () => {}, onDetails: () => {} }))
  expect(findings[0]?.sources).toHaveLength(2)
  expect(markup).toContain('Dokumenterte problemer <span>1</span>')
  expect(markup).toContain('Opplysninger som ikke er undersøkt <span>0</span>')
  expect(markup).toContain('Generelle bestemmelser og bakgrunn (1)')
  expect(markup).toContain('Generell lovforklaring')
  expect(markup).not.toContain(background.consequence)
})
