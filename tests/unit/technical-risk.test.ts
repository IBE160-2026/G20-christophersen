import { describe, expect, it } from 'vitest'
import { codeFirstBasis } from '../helpers/code-first.ts'
import { analyzeTechnicalRisks, extractExplicitTechnicalFindings } from '../../src/backend/import/technical-risk.ts'
import { createLocalPlan } from '../../src/backend/import/local-plan.ts'
import { createCodeFirstImport } from '../../src/backend/import/semantic-adapter.ts'
import { RiskAnalysisSchema } from '../../src/contracts/property-risk.ts'

describe('local technical risk evidence', () => {
  it.each(['prospectus', 'report'] as const)('retains explicit TG2/TG3, original text and physical pages for %s', async role => {
    const basis = codeFirstBasis([
      'Salgsoppgave. Trykt side 90.\n',
      'TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Bad øst\nTilstandsgrad: TG2\nVurdering av avvik:\n• Fugene har sprekker.\nKonsekvens/tiltak\nKontroller fugene.\n',
      'Tak — TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUtbedre taket.\nTILSTANDSRAPPORT - SLUTT\n',
    ])
    basis.role = role
    const plan = createLocalPlan(basis), risk = analyzeTechnicalRisks(basis), outcome = await createCodeFirstImport(basis)
    expect(plan.findings.map(item => [item.component, item.grade, item.source.pdfPage])).toEqual([['Bad øst', 'TG2', 2], ['Tak', 'TG3', 3]])
    expect(risk.findings.map(item => [item.title, item.grade, item.status])).toEqual([['Bad øst', 'TG2', 'documented'], ['Tak', 'TG3', 'documented']])
    for (const finding of risk.findings) for (const source of finding.sources) {
      expect(source.documentHash).toBe(basis.hash)
      expect(source.documentName).toBe(basis.name)
      expect(basis.pages[source.pdfPage - 1]!.text.slice(source.start, source.end)).toBe(source.quote)
    }
    // Reading two explicit findings never declares the rest of the prose complete.
    expect(risk.coverage).toBe('partial')
    expect(outcome.coverage.technical.status).toBe('incomplete')
    expect(outcome.manifest!.residual.length).toBeGreaterThan(0)
    expect(RiskAnalysisSchema.safeParse(risk).success).toBe(true)
  })

  it('does not infer graphic grades from a legend or mix a summary with the original deviation', () => {
    const basis = codeFirstBasis([
      'Tilstandsrapport\nTG2: Vesentlige avvik\nTG3: Store eller alvorlige avvik\nOppsummering av avvik\nYttervegger > Kledning\n',
      'Tilstandsrapport\nKledning\nBeskrivelse\nVurdering av avvik:\n• Det er påvist spredte råteskader i kledningen.\nKonsekvens/tiltak\nRåteskadet kledning bør skiftes ut.\n',
    ])
    const risk = analyzeTechnicalRisks(basis)
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    expect(risk.findings).toHaveLength(1)
    expect(risk.findings[0]).toMatchObject({ status: 'documented', grade: null, component: 'Kledning' })
    expect(risk.findings[0]!.sources.every(source => source.pdfPage === 2)).toBe(true)
    expect(risk.findings[0]!.sources.map(source => source.quote)).toContain('Kledning')
    expect(risk.findings[0]!.description).toContain('råteskader')
    expect(risk.findings[0]!.description).not.toContain('bør skiftes')
    expect(createLocalPlan(basis).manifest.candidates.every(item => item.disposition === 'unresolved')).toBe(true)
  })

  it('separates explicit unexamined construction from possible and documented problems', () => {
    const basis = codeFirstBasis([
      'Taket er en lukket konstruksjon uten mulighet for inspeksjon.\nHulltaking er ikke foretatt på bad.\n',
      'Vurdering av avvik:\n• Det kan være fukt i konstruksjonen.\nKonsekvens/tiltak\nUndersøk nærmere.\n',
      'Vurdering av avvik:\n• Håndløper mangler.\nKonsekvens/tiltak\nMonter håndløper.\n',
    ])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings.map(item => item.status)).toEqual(['not-investigated', 'not-investigated', 'possible', 'documented'])
    expect(risk.findings.every(item => item.grade === null)).toBe(true)
  })

  it('keeps unknown/incomplete pages, raster and attachments visibly unexamined', () => {
    const basis = codeFirstBasis(['Vurdering av avvik:\n• Lekkasje.\n', 'TG3\nSkade.\n', 'Et bilde med tekstlag.\n'])
    basis.pages[0]!.status = 'incomplete'
    basis.pages[1]!.status = 'unknown'
    basis.pages[2]!.rasterUnprocessed = true
    basis.attachments = [{ id: 'vedlegg', name: 'rapport.pdf', isPdf: true }]
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.examinedPages).toEqual([1, 2, 3])
    expect(risk.unreadPages).toEqual([1, 2, 3])
    expect(risk.findings).toHaveLength(1)
    expect(risk.findings[0]).toMatchObject({ status: 'possible', grade: null, sourceQuality: 'partial-text', sources: [{ pdfPage: 1 }] })
    expect(risk.coverage).toBe('partial')
    expect(risk.limitations.join(' ')).toContain('Vedlegg er ikke undersøkt')
    for (const page of basis.pages) page.status = 'unreadable'
    expect(analyzeTechnicalRisks(basis).coverage).toBe('unavailable')
  })

  it.each(['unknown', 'incomplete'] as const)('retains %s text only as uncertain original-check candidates, never TG findings', async status => {
    const basis = codeFirstBasis(['Bygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUndersøk taket.\nHulltaking er ikke foretatt på bad.\n'])
    basis.pages[0]!.status = status
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(2)
    expect(risk.findings.every(finding => finding.status === 'possible' && finding.grade === null && finding.sourceQuality === 'partial-text')).toBe(true)
    expect(risk.findings.every(finding => finding.description.startsWith('Ufullstendig og ukontrollert tekstuttrekk:'))).toBe(true)
    expect(risk.unreadPages).toEqual([1])
    expect(risk.examinedPages).toEqual([1])
    for (const finding of risk.findings) for (const source of finding.sources) expect(basis.pages[0]!.text.slice(source.start, source.end)).toBe(source.quote)
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toEqual([])
    expect(outcome.coverage.technical.status).not.toBe('complete')
  })

  it('retains distinct same-description rooms and preserves the original manifest', () => {
    const entry = (room: string) => `Bygningsdel: ${room}\nTilstandsgrad: TG2\nVurdering av avvik:\n• Fuger er sprukket.\nKonsekvens/tiltak\nKontroller fuger.\n`
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\n' + entry('Bad øst') + entry('Bad vest') + 'TILSTANDSRAPPORT - SLUTT\n'])
    const plan = createLocalPlan(basis), risk = analyzeTechnicalRisks(basis)
    expect(plan.findings).toHaveLength(2)
    expect(new Set(risk.findings.map(item => item.id)).size).toBe(2)
    expect(plan.manifest.blocks.map(item => basis.pages[0]!.text.slice(item.start, item.end)).join('')).toBe(basis.pages[0]!.text)
    expect(plan.manifest.candidates.every(item => item.disposition === 'finding')).toBe(true)
  })

  it('does not present a multiline grade association or long text as fully processed', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nBygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist skade.\n• Flere forhold må undersøkes.\n' + 'Lang beskrivelse uten sikker avslutning.\n'.repeat(100) + 'TILSTANDSRAPPORT - SLUTT\n'])
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings[0]!.grade).toBeNull()
    expect(risk.findings[0]!.sources[0]!.quote.length).toBeLessThanOrEqual(2000)
    expect(risk.limitations.join(' ')).toContain('for lange')
    expect(createLocalPlan(basis).manifest.candidates[0]!.disposition).toBe('unresolved')
  })

  it('keeps existing explicit finding identity and ignores a negative deviation statement', () => {
    const basis = codeFirstBasis(['TILSTANDSRAPPORT - START\nAdresse: Testveien 8\nTilstandsgrad: TG3\nBygningsdel: tak\nLekkasje i tak.\nTILSTANDSRAPPORT - SLUTT\n'])
    const plan = createLocalPlan(basis)
    expect(plan.findings).toHaveLength(1)
    expect(plan.findings[0]!.findingId).toMatch(/^local-(?!technical)/)
    expect(analyzeTechnicalRisks(basis).findings[0]).toMatchObject({ title: 'tak', grade: 'TG3', status: 'documented' })
    expect(analyzeTechnicalRisks(codeFirstBasis(['Vurdering av avvik:\nDet er ikke påvist avvik.\n'])).findings).toEqual([])
  })
  it.each(['Det er ikke påvist lekkasje.', 'Det er ikke registrert skader.'])('filtrerer benektet konkret avvik og gjeninnfører det aldri som TG: %s', text => {
    const basis = codeFirstBasis([`Bygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n${text}\n`])
    expect(analyzeTechnicalRisks(basis).findings).toEqual([])
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
    expect(createLocalPlan(basis).manifest.candidates[0]?.disposition).toBe('unresolved')
  })
  it.each(['Badet er ikke undersøkt.', 'Hulltaking er ikke foretatt på bad.'])('viser manglende undersøkelse én gang og uten dokumentert problem: %s', text => {
    const risks = analyzeTechnicalRisks(codeFirstBasis([`Vurdering av avvik:\n${text}\n`]))
    expect(risks.findings).toHaveLength(1)
    expect(risks.findings[0]).toMatchObject({ status: 'not-investigated', grade: null })
  })
  it.each(['Det er ikke registrert avvik, men det kan være fukt i veggen.', 'Det kan ikke utelukkes fukt i konstruksjonen.'])('beholder mulighet som mulighet: %s', text => {
    expect(analyzeTechnicalRisks(codeFirstBasis([`Vurdering av avvik:\n${text}\n`])).findings[0]).toMatchObject({ status: 'possible', grade: null })
  })
  it('regner ikke en bevist blank side som ulest', () => {
    expect(analyzeTechnicalRisks(codeFirstBasis([''])).unreadPages).toEqual([])
  })
  it('navngir den konkrete ikke undersøkte installasjonen med bevart usikker kildekvalitet', () => {
    const text = 'Innebygget varmtvannstank på kjøkken, ikke tilgjengelig for kontroll.'
    const basis = codeFirstBasis([text]); basis.pages[0]!.status = 'unknown'
    const finding = analyzeTechnicalRisks(basis).findings[0]!
    expect(finding).toMatchObject({ title: 'Innebygget varmtvannstank på kjøkken, ikke tilgjengelig for kontroll', status: 'possible', grade: null, sourceQuality: 'partial-text' })
    expect(finding.sources[0]!.quote).toBe(text)
    expect(finding.description).toContain('Ufullstendig og ukontrollert tekstuttrekk')
  })

  it('knytter manglende undersøkelse til eksplisitt bygningsdel uten å påstå skade eller grad', () => {
    const finding = analyzeTechnicalRisks(codeFirstBasis(['Bad\nVurdering av avvik:\nHulltaking er ikke foretatt.\nKonsekvens/tiltak\nUndersøk nærmere.'])).findings[0]!
    expect(finding).toMatchObject({ title: 'Bad: ikke undersøkt', component: 'Bad', status: 'not-investigated', grade: null })
    expect(finding.sources.map(source => source.quote)).toContain('Bad')
  })
  it('viser ikke generelle TGIU-definisjoner eller en fragmentert standardtekst som eiendomsfunn', () => {
    const basis = codeFirstBasis(['TGIU er ikke undersøkt av takstmann. Beskrivelsen av\nFlater eller bygningsdeler som er skjult, tildekket, innbygget, møblert, låst,\nsnødekket eller på annen måte utilgjengelige, blir ikke undersøkt.'])
    expect(analyzeTechnicalRisks(basis).findings).toEqual([])
    expect(analyzeTechnicalRisks(codeFirstBasis(['Taket er snødekket og er ikke undersøkt.'])).findings).toHaveLength(1)
  })

  it.each(['TG2 Bad øst', 'TG 3 Tak'])('kobler et eksplisitt gradsymbol foran komponenten uten å arve en forklaringsgrad: %s', heading => {
    const basis = codeFirstBasis([`${heading}\nVurdering av avvik:\n• Det er påvist lekkasje.\nKonsekvens/tiltak\nUtbedre lekkasjen.\nTilstandsrapport\n`])
    const finding = extractExplicitTechnicalFindings(basis)[0]!
    expect(finding).toMatchObject({ grade: heading.includes('2') ? 'TG2' : 'TG3', component: heading.includes('Bad') ? 'Bad øst' : 'Tak', description: '• Det er påvist lekkasje.' })
    expect(analyzeTechnicalRisks(basis).findings[0]).toMatchObject({ grade: finding.grade, component: finding.component })
    expect(extractExplicitTechnicalFindings(codeFirstBasis(['TG2 Vesentlige avvik\nVurdering av avvik:\nDette er en generell forklaring.\nKonsekvens/tiltak\nKontroller.']))).toEqual([])
  })

  it('bevarer rapportens foreslåtte vedlikeholdstiltak som eget kildebelagt utdrag', () => {
    const basis = codeFirstBasis(['Bygningsdel: Tak\nTilstandsgrad: TG3\nVurdering av avvik:\n• Beslaget er skadet.\nKonsekvens/tiltak:\nSkift skadet beslag. Innhent tilbud fra blikkenslager.\nVinduer\nVinduer er nye.'])
    const finding = analyzeTechnicalRisks(basis).findings[0]!
    expect(finding.action).toBe('Rapportens foreslåtte tiltak (utdrag): Skift skadet beslag. Innhent tilbud fra blikkenslager.')
    expect(finding.description).toBe('• Beslaget er skadet.')
    expect(finding.sources.at(-1)!.quote).toContain('Konsekvens/tiltak:\nSkift skadet beslag.')
    expect(finding.sources.at(-1)!.quote).not.toContain('Vinduer')
    for (const item of finding.sources) expect(basis.pages[0]!.text.slice(item.start, item.end)).toBe(item.quote)
  })

  it('tar ikke med et uavgrenset tiltak fra sidekanten eller ukontrollert tekst', () => {
    const text = 'Bad\nVurdering av avvik:\n• Sluket er skadet.\nKonsekvens/tiltak\nKontroller membranen.'
    const basis = codeFirstBasis([text])
    expect(analyzeTechnicalRisks(basis).findings[0]!.action).not.toContain('Rapportens foreslåtte tiltak')
    basis.pages[0]!.status = 'unknown'
    expect(analyzeTechnicalRisks(basis).findings[0]!.action).toContain('Kontroller original')
  })

  it('knytter linjebrutt manglende kontroll til komponent og nærmeste rom uten å hevde skade', async () => {
    const basis = codeFirstBasis(['ETASJE > BAD\nVanntett sjikt, membran og sluk\nMembran og øvrige tettesjikt er skjult bak flislagte overflater og er\nderfor ikke mulig å kontrollere visuelt i sin helhet.\nBeskrivelse\nVarmesentral\nFelles varmesentral ligger utenfor leiligheten og er ikke nærmere\nkontrollert.\n'])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(2)
    expect(risk.findings[0]).toMatchObject({ component: 'ETASJE > BAD · Vanntett sjikt, membran og sluk', status: 'not-investigated', grade: null })
    expect(risk.findings[0]!.description).toContain('Membran og øvrige tettesjikt')
    expect(risk.findings[1]!.description).toContain('Felles varmesentral ligger utenfor leiligheten')
    expect(risk.findings[1]!.component).toBe('Varmesentral')
    expect(risk.findings[1]!.title).not.toContain('BAD')
    expect(risk.findings.every(item => item.grade === null)).toBe(true)
    for (const finding of risk.findings) for (const item of finding.sources) expect(basis.pages[0]!.text.slice(item.start, item.end)).toBe(item.quote)
    basis.pages[0]!.status = 'unknown'
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.propertyRisk!.technical.findings.every(item => item.status === 'possible' && item.sourceQuality === 'partial-text' && item.grade === null)).toBe(true)
  })

  it.each(['Beskrivelse', 'TEKNISKE INSTALLASJONER', 'Membran\nMembranen er kontrollert.'])('arver ikke rom gjennom en mellomliggende blokk: %s', separator => {
    const basis = codeFirstBasis([`ETASJE > BAD\n${separator}\nVarmesentral\nFelles varmesentral ligger utenfor leiligheten og er ikke nærmere kontrollert.`])
    expect(analyzeTechnicalRisks(basis).findings[0]!.component).toBe('Varmesentral')
  })

  it('bevarer rom umiddelbart etter komponenten med egne ordrette kildebelegg', () => {
    const basis = codeFirstBasis(['Overflater gulv\nLOFT > BAD - 4M2\nVurdering av avvik:\nDet er påvist skader i gulvet.\nKonsekvens/tiltak:\nKontroller gulvet.'])
    const finding = analyzeTechnicalRisks(basis).findings[0]!
    expect(finding.component).toBe('LOFT > BAD - 4M2 · Overflater gulv')
    expect(finding.sources.map(item => item.quote)).toEqual(expect.arrayContaining(['Overflater gulv', 'LOFT > BAD - 4M2']))
    for (const item of finding.sources) expect(basis.pages[0]!.text.slice(item.start, item.end)).toBe(item.quote)
  })

  it('velger ikke ett av motstridende rom på hver side av samme komponent', () => {
    const basis = codeFirstBasis(['LOFT > BAD\nOverflater gulv\nKJELLER > BAD\nVurdering av avvik:\nDet er påvist skader i gulvet.\nKonsekvens/tiltak:\nKontroller gulvet.'])
    expect(analyzeTechnicalRisks(basis).findings[0]!.component).toBe('Overflater gulv')
  })

  it('bevarer hele radonomtalen med nyanser og avklaringsbehov fremfor å hevde høy målt radon', async () => {
    const text = 'Radon\nOmrådet har meget høy radonaktsomhet.\nDet er ikke fremlagt dokumentasjon på utførte radonmålinger i\nleiligheten.\nLeiligheten ligger høyt, og risikoen vurderes som vesentlig lavere enn for boliger på grunn.\nBeskrivelse\nInnvendige dører\nDørene er malte.'
    const basis = codeFirstBasis([text]), finding = analyzeTechnicalRisks(basis).findings[0]!
    expect(finding).toMatchObject({ title: 'Radon: målinger er ikke dokumentert', component: 'Radon', grade: null, status: 'not-investigated' })
    expect(finding.description).toContain('vesentlig lavere')
    expect(finding.description).not.toContain('Dørene')
    expect(finding.consequence).toContain('ikke et måleresultat')
    expect(finding.sources[0]!.quote).toBe(text.slice(finding.sources[0]!.start, finding.sources[0]!.end))
    basis.pages[0]!.status = 'unknown'
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.propertyRisk!.technical.findings[0]).toMatchObject({ grade: null, status: 'possible', sourceQuality: 'partial-text' })
    expect(outcome.coverage.technical.status).toBe('incomplete')
  })

  it.each([
    'Radon\nDet er fremlagt dokumentasjon på utførte radonmålinger i leiligheten.\nBeskrivelse',
    'Lukkede konstruksjoner, skjulte tekniske installasjoner, tildekkede overflater og utilgjengelige områder er ikke kontrollert utover det som fremgår av rapporten.',
    'Det er ikke undersøkt hvilke finansieringsvilkår kjøper kan oppnå.',
  ])('lager ikke et teknisk kontrollfunn fra dokumentert måling eller generell tekst: %s', text => {
    expect(analyzeTechnicalRisks(codeFirstBasis([text])).findings).toEqual([])
  })
})

describe('eksplisitte avviksfortsettelser mellom fysiske sider', () => {
  const first = 'Bygningsdel: Tak øst\nTilstandsgrad: TG3\nVurdering av avvik:\n• Det er påvist lekkasje i\nFortsetter på neste side\n'
  const next = 'Bygningsdel: Tak øst (forts.)\nVurdering av avvik (forts.):\ntekkingen.\n• Beslaget er skadet.\nKonsekvens/tiltak\nUtbedre taket.\n'
  it('samler hele avviket én gang med ordrette kilder fra begge sider', async () => {
    const basis = codeFirstBasis([first, next])
    const [finding] = extractExplicitTechnicalFindings(basis)
    expect(finding).toMatchObject({ component: 'Tak øst', grade: 'TG3', description: '• Det er påvist lekkasje i\ntekkingen.\n• Beslaget er skadet.' })
    expect(finding!.sources.map(item => item.pdfPage)).toEqual([1, 2])
    const risk = analyzeTechnicalRisks(basis)
    expect(risk.findings).toHaveLength(1)
    expect(risk.findings[0]).toMatchObject({ component: 'Tak øst', grade: 'TG3', description: finding!.description })
    expect(new Set(risk.findings[0]!.sources.map(item => item.pdfPage))).toEqual(new Set([1, 2]))
    for (const item of risk.findings[0]!.sources) expect(basis.pages[item.pdfPage - 1]!.text.slice(item.start, item.end)).toBe(item.quote)
    expect(risk.coverage).toBe('partial')
    const outcome = await createCodeFirstImport(basis)
    expect(outcome.technical.findings).toHaveLength(1)
    expect(outcome.coverage.technical.status).not.toBe('complete')
  })
  it('teller ikke en gjentatt vanlig avviksetikett som et nytt funn', () => {
    const basis = codeFirstBasis([first, next.replace('avvik (forts.):', 'avvik:')])
    expect(analyzeTechnicalRisks(basis).findings).toHaveLength(1)
  })
  it.each([
    next.replace('Tak øst', 'Tak vest'),
    next.replace(' (forts.)', ''),
    next.replace('Konsekvens/tiltak', 'Vinduer'),
    next.replace('Konsekvens/tiltak\nUtbedre taket.\n', ''),
  ])('avviser ulik komponent, manglende anker eller usikker slutt', text => {
    expect(extractExplicitTechnicalFindings(codeFirstBasis([first, text]))).toEqual([])
  })
  it.each(['unknown', 'incomplete', 'unreadable'] as const)('kobler ikke gjennom %s neste side', status => {
    const basis = codeFirstBasis([first, next])
    basis.pages[1]!.status = status
    expect(extractExplicitTechnicalFindings(basis)).toEqual([])
  })
  it('krever eksplisitt utgående anker og sammenhengende fysiske sider', () => {
    expect(extractExplicitTechnicalFindings(codeFirstBasis([first.replace('Fortsetter på neste side\n', ''), next]))).toEqual([])
    expect(extractExplicitTechnicalFindings(codeFirstBasis([first, '', next]))).toEqual([])
  })
  it('arver ikke grad gjennom raster eller en ny komponent før sidekanten', () => {
    const raster = codeFirstBasis([first, next]); raster.pages[1]!.rasterUnprocessed = true
    expect(extractExplicitTechnicalFindings(raster)).toEqual([])
    expect(extractExplicitTechnicalFindings(codeFirstBasis([first.replace('Fortsetter', 'Vinduer\nFortsetter'), next]))).toEqual([])
  })
})
