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
    const summaries = [...markup.matchAll(/<summary>(.*?)<\/summary>/gu)].map(match => match[1]).filter(summary => summary!.includes('<strong>'))
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
  expect((markup.match(/class="risk-item risk-item--documented"/g) ?? []).length).toBe(2) // Ett forhold og én bakgrunnsrad.
  expect((markup.match(/class="risk-item risk-item--not-investigated"/g) ?? []).length).toBe(0)
  expect(markup).toContain('Generelle bestemmelser og bakgrunn (1)')
  expect(markup).toContain('Generell lovforklaring')
  expect(markup).not.toContain(background.consequence)
})

it('viser grad, sammendragsforbehold og fysisk rapportområde uten å hevde komplette detaljer', () => {
  const source = { documentHash: 'a', documentName: 'teknisk.pdf', pdfPage: 4, start: 0, end: 20, quote: 'Bad øst: Avvik funnet.' }
  const item: PropertyRiskItem = { id: 'summary', domain: 'technical', category: 'technical', title: 'Bad øst', description: 'Bad øst: Avvik funnet.', grade: 'TG3', evidenceKind: 'summary', status: 'documented',
    consequence: 'Detaljene må undersøkes.', action: 'Se originalen.', sources: [source] }
  const risks: PropertyRiskOverview = { documented: [item], possible: [], unexamined: [], background: [], gaps: [], limitations: [], technicalCoverage: 'Rapportdekningen er ufullstendig.',
    reportEvidence: { documentName: 'teknisk.pdf', ranges: [{ startPage: 8, endPage: 12, certainty: 'ambiguous', source: { ...source, pdfPage: 8 } }], unreadPages: [9, 11] } }
  for (const Component of [RiskOverview, RiskDetails]) {
    const markup = renderToStaticMarkup(createElement(Component, { risks, onSource: () => {}, onDetails: () => {} }))
    if (Component === RiskDetails) expect(markup).toContain('sammendragsopplysninger vises i tillegg og inngår ikke i antallet over')
    expect(markup).toContain('sammendrags- og detaljtall skal ikke legges sammen')
    expect(markup).toContain(Component === RiskOverview ? 'id="technical-risk"' : 'Dokumenterte problemer (0)')
    expect(markup).toContain('technical-grade--tg3')
    expect(markup).toContain('Oppgitt i sammendrag')
    expect(markup).toContain('fysisk PDF-side 8–12')
    expect(markup).toContain('usikker avgrensning')
    expect(markup).toContain('fysisk PDF-side 9, 11')
    expect(markup).toContain('Uleste eller ufullstendige sider i dokumentet')
    expect(markup).toContain('ikke teknisk kontrollgrunnlag')
    expect(markup).toContain('Åpne rapportstart')
    expect(markup).toContain('Se originalkilde')
    expect(markup).not.toContain('Lokal analyse har delvis dekning')
    const detailMarkup = renderToStaticMarkup(createElement(Component, { risks: { ...risks, documented: [{ ...item, evidenceKind: 'detail' }] }, onSource: () => {}, onDetails: () => {} }))
    expect(detailMarkup).toContain('Detaljtekst')
    expect(detailMarkup).not.toContain('Rapportdetalj')
  }
})

it('viser avledet OCR, usikre sider og delvis kobling uten å kalle sidene ferdig kontrollert', () => {
  const source = { method: 'local-vision' as const, documentHash: 'a', documentName: 'grafisk.pdf', pdfPage: 9, quote: 'Taktekking: Det er påvist lekkasje.', region: { x: .1, y: .1, width: .6, height: .3 }, rasterDigest: 'b'.repeat(64), extractorVersion: 'local-visual-1' }
  const item: PropertyRiskItem = { id: 'visual', domain: 'technical', category: 'technical', title: 'TG3 · Taktekking', description: source.quote, grade: 'TG3', evidenceKind: 'detail', sourceQuality: 'local-visual', status: 'documented', consequence: 'Avklar tiltak.', action: 'Kontroller originalen.', sources: [source] }
  const risks: PropertyRiskOverview = { documented: [item], possible: [], unexamined: [], background: [], gaps: [], limitations: [], technicalCoverage: 'Rapportdekningen er ufullstendig.', reportEvidence: { documentHash: 'a', documentName: source.documentName, ranges: [{ startPage: 8, endPage: 11, certainty: 'ambiguous', source: { documentHash: 'a', documentName: source.documentName, pdfPage: 8 } }], unreadPages: [9, 10], visualPages: [{ pdfPage: 9, rendered: true, status: 'uncertain', reason: 'Ett symbol kunne ikke knyttes til en komponent.', findings: 1 }, { pdfPage: 10, rendered: false, status: 'unavailable', reason: 'Lokal bildeanalyse utilgjengelig.', findings: 0 }] } }
  for (const Component of [RiskOverview, RiskDetails]) {
    const markup = renderToStaticMarkup(createElement(Component, { risks, onSource: () => {}, onDetails: () => {} }))
    expect(markup).toContain('2 fysiske sider i analyseutvalget; 1 side rendret og lokalt lest')
    expect(markup).toContain('Automatisk kobling med kildebelegg')
    expect(markup).not.toContain('Sikker automatisk kobling')
    expect(markup).toContain('Lokal bildeanalyse / OCR')
    expect(markup).toContain('OCR-lesning fra sidebildet')
    expect(markup).toContain('avledet tekst, ikke ordrett PDF-tekstlag')
    expect(markup).toContain('ikke fullstendig sidekontroll eller brukergodkjenning')
    expect(markup).toContain('Fortsatt usikker bildeanalyse: fysisk PDF-side 9, 10')
    expect(markup).toContain('Ikke bildebehandlet i identifisert rapportområde: fysisk PDF-side 8, 11')
    expect(markup).toContain('Ett symbol kunne ikke knyttes')
    expect(markup).toContain('Åpne originalside 9')
    expect(markup).toContain('technical-grade--tg3')
    expect(markup).not.toContain('grad ukjent')
  }
})
