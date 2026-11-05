import { describe, expect, it } from 'vitest'
import { analyzeLegalRisks } from '../../src/backend/import/legal-risk.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'

describe('lokalt juridisk risikosøk', () => {
  it.each([
    'Soverommet i kjeller er ikke godkjent for varig opphold.',
    'Loftstuen er ikke godkjent som soverom.',
    'Boden er ikke godkjent til beboelse.',
  ])('viser eksplisitt manglende godkjenning av rombruk uten å påstå forbud mot all utleie: %s', text => {
    const finding = analyzeLegalRisks(codeFirstBasis([text])).findings[0]!
    expect(finding).toMatchObject({ category: 'use-approval', status: 'documented', grade: null })
    expect(finding.title).toContain('ikke godkjent for')
    expect(finding.sources[0]!.quote).toBe(text)
    expect(finding.consequence).toContain('ikke at hele boligen')
  })
  it('bevarer hypotetisk romgodkjenning som uavklart og filtrerer eksplisitt senere godkjenning', () => {
    const text = 'Dersom loftstuen ikke er godkjent som soverom, må bruken avklares.'
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings[0]).toMatchObject({ category: 'use-approval', status: 'possible', title: 'Loftstuen: godkjenning er uavklart' })
    expect(analyzeLegalRisks(codeFirstBasis(['Loftstuen var ikke godkjent som soverom, men er nå godkjent av kommunen.'])).findings).toEqual([])
    expect(analyzeLegalRisks(codeFirstBasis(['Loftstuen er godkjent som soverom.'])).findings).toEqual([])
  })
  it('bevarer fysisk side og ordrett kilde for utleieenhet uten å utlede utleieforbud', () => {
    const texts = Array.from({ length: 58 }, () => '')
    texts[57] = 'Utleiedelen i underetasjen er ikke\ngodkjent som egen boenhet. Kjøper må undersøke videre bruk.'
    const basis = codeFirstBasis(texts), result = analyzeLegalRisks(basis)
    const finding = result.findings.find(item => item.category === 'rental-approval')!
    expect(finding).toMatchObject({ status: 'documented', grade: null, domain: 'legal' })
    expect(finding.sources[0]).toMatchObject({ documentHash: basis.hash, documentName: basis.name, pdfPage: 58 })
    const source = finding.sources[0]!
    expect(texts[57]!.slice(source.start, source.end)).toBe(source.quote)
    expect(finding.consequence).toContain('ikke et generelt utleieforbud')
    expect(result.coverage).toBe('partial')
  })
  it('skiller manglende godkjenningsdokumentasjon fra eksplisitt lovlighetsavvik', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Det foreligger ikke dokumentasjon på at bruksendringen er godkjent. Avvikene anses som lovlighetsmangler.']))
    expect(result.findings.map(item => item.status)).toEqual(['possible', 'documented'])
    expect(result.findings.every(item => item.category === 'use-approval')).toBe(true)
  })
  it('fanger servitutter og konkrete utleiebegrensninger, uten å kalle bruksrett et dokumentert problem', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Tinglyst adkomstrett gjelder naboens vei. Korttidsutleie er begrenset til 60 døgn per år.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([['easement', 'possible'], ['rental-restriction', 'documented']])
  })
  it.each([
    'Det er ikke kjent at det foreligger regler som er til hinder for at hele eiendommen leies ut.',
    'Dette betyr imidlertid ikke at ulovlig oppførte bygg blir lovlige.',
    'Det utstedes ikke ferdigattest for eldre tiltak.',
    'Det er ingen kjente servitutter på eiendommen.',
    'Utleieenheten er godkjent av kommunen.',
    'Ingen begrensninger i utleie er registrert.',
    'Oppgjørshonorar og utskrift av heftelser/servitutter kr 250 per stk.',
  ])('unngår falskt problem fra generell eller benektende tekst: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings).toHaveLength(0)
  })
  it('beholder betingede opplysninger som mulige problemer', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Dersom utleieenheten ikke er godkjent, må dette avklares.']))
    expect(result.findings[0]?.status).toBe('possible')
  })
  it('fanger konkrete bruksforbud og krav til utleietillatelse', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Det er tinglyst byggeforbud på tomten. Boligen kan ikke leies ut. Fremleie krever styrets godkjenning.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([
      ['easement', 'documented'], ['rental-restriction', 'documented'], ['rental-restriction', 'documented'],
    ])
  })
  it('viser utilgjengelig dekning og hopper over tekst fra uleselig side', () => {
    const basis = codeFirstBasis(['Utleieenheten er ikke godkjent.'])
    basis.pages[0]!.status = 'incomplete'
    expect(analyzeLegalRisks(basis)).toMatchObject({ coverage: 'unavailable', examinedPages: [], unreadPages: [1], findings: [] })
  })
  it('leser tilgjengelig tekst konservativt når raster og vedlegg gjenstår', () => {
    const basis = codeFirstBasis(['Utleieenheten er ikke godkjent.'])
    basis.pages[0]!.rasterUnprocessed = true
    basis.attachments = [{ id: 'avtale', name: 'Avtale.pdf', isPdf: true }]
    const result = analyzeLegalRisks(basis)
    expect(result).toMatchObject({ coverage: 'partial', examinedPages: [1], unreadPages: [1] })
    expect(result.limitations.join(' ')).toContain('Innebygde vedlegg')
  })
  it('rapporterer overskridelse fremfor å kalle en avkortet funnliste komplett', () => {
    const basis = codeFirstBasis([Array.from({ length: 201 }, (_, index) => `Utleieenhet ${index} er ikke godkjent.`).join(' ')])
    const result = analyzeLegalRisks(basis)
    expect(result.findings).toHaveLength(200)
    expect(result.coverage).toBe('partial')
    expect(result.limitations.join(' ')).toContain('funngrensen')
  })
  it.each([
    'Det er ikke påvist ulovlig bruk av boenheten.',
    'Det er ikke slik at utleie er forbudt.',
    'Utleieenheten var ikke godkjent, men er nå godkjent av kommunen.',
  ])('skiller benektede og eksplisitt løste historiske forhold: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings).toEqual([])
  })
  it('binder negasjon og usikkerhet til riktig påstand', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Utleie er mulig, men boenheten er ikke godkjent. Ingen servitutter er registrert, men det er tinglyst veirett til naboen.']))
    expect(result.findings.map(item => [item.category, item.status])).toEqual([['rental-approval', 'documented'], ['easement', 'possible']])
    expect(analyzeLegalRisks(codeFirstBasis(['Dersom samtykke mangler, er utleie forbudt.'])).findings[0]?.status).toBe('possible')
  })
  it.each(['Ferdigattest mangler for bruksendringen.', 'Midlertidig brukstillatelse foreligger ikke.'])('bevarer kontrollbehov med motsatt ordstilling: %s', text => {
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings[0]).toMatchObject({ category: 'use-approval', status: 'possible' })
  })

  it('bruker bare rommet i den dokumenterte påstanden, uten å arve rom fra en annen klausul', () => {
    const result = analyzeLegalRisks(codeFirstBasis(['Utleiedelen i underetasjen er ikke godkjent som egen boenhet. Loftstuen er innredet uten dokumentert godkjenning. Soverommet er godkjent, men ferdigattest mangler.']))
    expect(result.findings.map(item => item.title)).toEqual([
      'Utleiedelen i underetasjen: ikke godkjent', 'Loftstuen: godkjenning er ikke dokumentert', 'Ferdigattest er ikke dokumentert',
    ])
    const ambiguous = analyzeLegalRisks(codeFirstBasis(['Loftstue og soverom er innredet uten dokumentert godkjenning.'])).findings[0]!
    expect(ambiguous.title).toBe('Godkjenning er ikke dokumentert')
  })

  it.each(['Nei, ikke som jeg kjenner til', 'Ja', ''])('gjør ikke et egenerklæringsspørsmål til en dokumentert mangel når svaret er %s', answer => {
    const text = `11.2 Kjenner du til om boligen eller andre bygninger mangler brukstillatelse\neller ferdigattest?\n${answer}`
    expect(analyzeLegalRisks(codeFirstBasis([text])).findings).toEqual([])
  })

  it.each([
    'Korttidsutleie av hele boligseksjonen er tillatt i inntil 60 døgn per\nkalenderår, jf. eierseksjonsloven § 24.',
    'Korttidsutleie er tillatt i opptil 60 døgn i året, jf. eierseksjonsloven § 24.',
  ])('viser uttrykkelig døgnbegrensning uten å utlede et generelt utleieforbud: %s', text => {
    const basis = codeFirstBasis([text]), finding = analyzeLegalRisks(basis).findings[0]!
    expect(finding).toMatchObject({ title: 'Korttidsutleie: inntil 60 døgn', category: 'rental-restriction', status: 'documented' })
    const source = finding.sources[0]!
    expect(text.slice(source.start, source.end)).toBe(source.quote)
    expect(finding.title).not.toContain('forbud')
  })

  it('bevarer lovlig midlertidig bruk og synliggjør bare gjenstående arbeider før ferdigattest', () => {
    const text = 'Det foreligger midlertidig brukstillatelse for eiendommen datert 02.08.2023. Midlertidig brukstillatelse dokumenterer at boligen lovlig kan brukes, men at det gjenstår arbeider før ferdigattest kan utstedes. Dagens rombruk stemmer med det som er godkjent.'
    const findings = analyzeLegalRisks(codeFirstBasis([text])).findings
    expect(findings).toHaveLength(1)
    expect(findings[0]).toMatchObject({ title: 'Ferdigattest: gjenstående arbeider', status: 'documented', category: 'use-approval' })
    expect(findings[0]!.description).toContain('boligen lovlig kan brukes')
    expect(findings[0]!.title).not.toMatch(/ulovlig|soverom|loft/i)
  })

  it('skiller formidlingstjenesteforbud fra forbud mot all utleie', () => {
    const text = 'Det er ikke\ntillatt å leie ut seksjonen via formidlingstjenester som\nVander og lignende (gjelder både kort- og langtidsleie).'
    const finding = analyzeLegalRisks(codeFirstBasis([text])).findings[0]!
    expect(finding).toMatchObject({ title: 'Utleie via formidlingstjenester er ikke tillatt', category: 'rental-restriction', status: 'documented' })
    expect(finding.sources[0]!.quote).toBe(text)
  })

  it.each([
    'Dersom vedtektene gjelder, er utleie ikke tillatt via formidlingstjenester.',
    'Dersom bestemmelsen gjelder, utleie krever styrets samtykke.',
    'Dersom det gjenstår arbeider før ferdigattest, må dette avklares.',
  ])('gir ikke hypotetiske vilkår en kategorisk overskrift: %s', text => {
    const finding = analyzeLegalRisks(codeFirstBasis([text])).findings[0]!
    expect(finding.status).toBe('possible')
    expect(finding.title).toMatch(/uavklart|mulig/iu)
  })

  it('navngir dokumentert adkomstrett og bevarer det uavklarte omfanget', () => {
    const finding = analyzeLegalRisks(codeFirstBasis(['Adkomstrett for drift og vedlikehold av\nanlegg/ledninger/kabler.'])).findings[0]!
    expect(finding).toMatchObject({ title: 'Adkomstrett for drift og vedlikehold av anlegg', status: 'possible', category: 'easement' })
    expect(finding.description).toContain('anlegg/ledninger/kabler')
  })
})
