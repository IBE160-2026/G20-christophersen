---
name: Property Acquisition Agent
description: Visuell identitet for den låste desktop-webflyten i v1.
status: final
updated: 2026-10-14
paired_with: EXPERIENCE.md
sources:
  - ../../prds/prd-IBE160-2026-10-10/prd.md
  - ../../prds/prd-IBE160-2026-10-10/addendum.md
  - ../../prds/prd-IBE160-2026-10-10/sluttkontroll.md
  - ../../briefs/brief-IBE160-2026-09-15/brief.md
  - ../../briefs/brief-IBE160-2026-09-15/addendum.md
  - ../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md
  - ../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md
  - ../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf
colors:
  surface-page: '#F1F5F4'
  surface-main: '#FFFFFF'
  surface-subtle: '#EBF1EF'
  ink-structure: '#253436'
  text-primary: '#243537'
  text-secondary: '#526865'
  accent-primary: '#22665F'
  on-accent: '#FFFFFF'
  focus-ring: '#22665F'
  border-control: '#738781'
  border-decorative: '#D5E0DC'
  status-success: '#2D6144'
  status-success-surface: '#EDF5EE'
  status-warning: '#7B5318'
  status-warning-surface: '#FBF3E2'
  status-danger: '#903E43'
  status-danger-surface: '#F7ECED'
# Typeroller konkretisert av fasilitator; se beslutningsloggen A1–A5.
typography:
  title:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  section:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  meta:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  metric:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
# Geometrisk skala konkretisert av fasilitator; smal visning følger valgt PDF-panel.
rounded:
  sm: 3px
  md: 4px
  lg: 6px
  xl: 8px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '7': 48px
  page-gutter: 32px
  section-gap: 24px
  related-gap: 8px
  control-height: 36px
  focus-width: 2px
  focus-offset: 3px
components:
  app-header:
    background: '{colors.surface-main}'
    foreground: '{colors.ink-structure}'
    metadata: '{colors.text-secondary}'
  stepper:
    background: '{colors.surface-main}'
    active: '{colors.accent-primary}'
    foreground: '{colors.text-primary}'
    status: '{typography.meta.fontSize}'
  action-primary:
    background: '{colors.accent-primary}'
    foreground: '{colors.on-accent}'
    radius: '{rounded.md}'
    minHeight: '{spacing.control-height}'
  action-secondary:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
    radius: '{rounded.md}'
  value-field:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
    label: '{typography.label.fontSize}'
  period-control:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
  source-note:
    foreground: '{colors.text-secondary}'
    size: '{typography.meta.fontSize}'
  cost-breakdown:
    foreground: '{colors.text-primary}'
    divider: '{colors.border-decorative}'
  financial-confirmation:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-primary}'
    gap: '{spacing.3}'
  report-input:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
  analysis-status:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-primary}'
  finding-list:
    background: '{colors.surface-main}'
    selection: '{colors.accent-primary}'
    divider: '{colors.border-decorative}'
  finding-detail:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    title: '{typography.section.fontSize}'
  finding-actions:
    gap: '{spacing.related-gap}'
    foreground: '{colors.text-primary}'
  finding-edit:
    background: '{colors.surface-main}'
    border: '{colors.border-control}'
    foreground: '{colors.text-primary}'
  origin-detail:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-primary}'
    metadata: '{colors.text-secondary}'
  pdf-viewer:
    background: '{colors.surface-subtle}'
    page: '{colors.surface-main}'
    control: '{colors.text-primary}'
  tg3-resolution:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
  list-confirmation:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    separator: '{colors.border-decorative}'
  recommendation:
    foreground: '{colors.ink-structure}'
    title: '{typography.title.fontSize}'
    reason: '{typography.body.fontSize}'
  metric-grid:
    foreground: '{colors.ink-structure}'
    value: '{typography.metric.fontSize}'
    label: '{colors.text-secondary}'
  basis-detail:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    divider: '{colors.border-decorative}'
  detail-disclosure:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
    label: '{typography.label.fontSize}'
  issue-message:
    background: '{colors.status-warning-surface}'
    foreground: '{colors.status-warning}'
    error: '{colors.status-danger}'
  status-label:
    foreground: '{colors.text-secondary}'
    radius: '{rounded.sm}'
    size: '{typography.meta.fontSize}'
  stale-result:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-secondary}'
    border: '{colors.border-control}'
---

# Property Acquisition Agent — Design

> **Produktretning 2026-10-28:** Salgsoppgave blir hovedinngangen til PAA;
> FINN beholdes som fremtidig alternativ uten videre utvikling/live-aktivering nå.
> Se [Correct Course, endringsforslag og implementeringsspec](../../sprint-change-proposal-2026-10-28.md).
> Retningen er besluttet; PDF-/OCR-/AI-valgene D1–D3 avventer avklaring før
> produktimplementering. Teksten nedenfor bevarer tidligere versjonsgrunnlag;
> finans-/screeningregler og historiske S5/S6-bevis endres ikke.

## Brand & Style

Et rolig, institusjonelt arbeidsverktøy for førstevurdering av eiendom. Presisjon, kontroll og lesbarhet bærer uttrykket: lys flate, grafitt som struktur, luft mellom informasjonsgrupper og kompakte data der det hjelper arbeidet. KI presenteres som én delprosess. Resultat skal oppleves som et kort investeringsnotat med anbefaling først, uten å overta brukerens investeringsbeslutning.

Spesifikasjonen er destillert fra [.memlog.md](.memlog.md) og [brukeravklaringer](.working/brukeravklaringer.md). Produktkrav arves fra `sources`; opplevelsen spesifiseres i [EXPERIENCE.md](EXPERIENCE.md). Ved konflikt med skisser og prøver gjelder DESIGN.md og EXPERIENCE.md.

Mads har valgt fargealternativ 2, lokale feil/mangler og behovsåpnet detaljsporbarhet, samt PDF-panel ved behov 14. oktober 2026. Beslutningsloggen skiller brukerens valg fra fasilitatorens konkretisering av typografi, geometri, fokus, valideringstidspunkt og tallformat.

## Colors

Valgt **Grafitt og petrol**: [fargeprøve, alternativ 2](.working/color-themes-1.html) viser aksent, anbefaling, proveniens og historisk tilstand. [Valgt palett](.working/valgt-palett.json) bevarer de eksakte hexene; andre alternativer er utforskning, ikke godkjente varianter. Frontmatter bruker flate kebab-case-navn, med `success_bg` fra prøven oversatt til `status-success-surface` og tilsvarende for varsel/feil.

| Roller | Bruk |
|---|---|
| `{colors.surface-page}`, `{colors.surface-main}`, `{colors.surface-subtle}` | Lett bakgrunn, hvit arbeidsflate og sekundære grupper. Historisk resultat bruker den sekundære flaten; lesbar tekst dempes gjennom hierarki, ikke gjennom samlet lav opasitet. |
| `{colors.ink-structure}`, `{colors.text-primary}`, `{colors.text-secondary}` | Overskrifter og tall, løpende innhold, deretter metadata/kilder. Sekundærtekst er fortsatt lesbar informasjon. |
| `{colors.accent-primary}`, `{colors.on-accent}`, `{colors.focus-ring}` | Diskret petrol for primærhandling, gjeldende trinn, valgt funn og synlig fokus. Aksent betyr interaksjon/orientering, ikke investeringskvalitet. |
| `{colors.border-control}`, `{colors.border-decorative}` | Første rolle gjør felt og meningsbærende kontrollgrenser synlige. Andre rolle brukes bare til dekorative skiller. |
| `{colors.status-success}`, `{colors.status-success-surface}` | «Gå videre» og faktisk positiv status, alltid med tekst. Ingen kjøpe- eller godkjenningspåstand. |
| `{colors.status-warning}`, `{colors.status-warning-surface}` | «Innhent mer informasjon», mangel, usikkerhet og Uavklart når relevant. |
| `{colors.status-danger}`, `{colors.status-danger-surface}` | «Forkast», dokument-/analyse-/feltfeil og alvorlig rapportgrad, med konkret etikett. TG-grad og screeningutfall er ulike opplysninger. |

Kontrast konkretiserer PRD NFR-2 med et praktisk designmål: informasjonstekst minst **4,5:1**, nødvendig kontrollgrense og fokus minst **3:1**. Ingen WCAG-sertifisering eller nytt kurskrav påstås. [Kontrastgrunnlag](.working/tilgjengelighetsgrunnlag.md) forklarer anvendelsen; [faktiske kontrastpar](.working/fargekontraster-1.json) dokumenterer prøven.

| Lastbærende kombinasjon, valgt alternativ 2 | Målt forhold |
|---|---:|
| Primærtekst / hvitt | 12,8094:1 |
| Sekundærtekst / sekundærflate, svakeste normale tekstpar | 5,2061:1 |
| Hvit tekst / petrol primærhandling | 6,7011:1 |
| Grønn / positiv flate | 6,5050:1 |
| Varseltekst / varselflate | 6,1501:1 |
| Feiltekst / feilflate | 6,1489:1 |
| Petrol fokus / sekundærflate, svakeste fokuspar | 5,8590:1 |
| Kontrollkant / sekundærflate, svakeste kontrollpar | 3,3314:1 |

Fokus på fylt primærhandling må skilles fra knappens egen aksent gjennom lys avstand til ringen. Dekorative skiller brukes ikke alene til felt, utvalg eller status. Nye fargekombinasjoner må kontrolleres ved senere konkretisering.

## Typography

Et nøkternt sans-serif uttrykk med tydelig hierarki og tall som kan skannes. Frontmatter bruker lokal systemfont og seks roller ut fra den valgte prøven og den ønskede presise, kompakte desktop-flaten. `title` brukes på resultatets anbefaling, `section` på grupper, `body` på begrunnelser, `label` på felt/handlinger, `meta` på kilder/status og `metric` på beregningsverdier. Kilde og usikkerhet må ikke gjøres uleselig for å få plass.

Tall beholder enheter og årsperiode. Normalvisning bruker norske skilletegn, beløp i hele NOK og yield med tre desimaler som i fargeprøven; nødvendig detaljpresisjon utvides ved terskelbrudd eller fasitkontroll. Visningsformatet endrer ingen beregning: uavrundede regler gjelder, og en avrundet visning som skjuler brudd får en konkret forklaring. Tabellariske siffer kan brukes innen systemfonten uten å gi tradingpreg.

## Layout & Spacing

Horisontal firetrinns-stepper øverst på alle flater: **Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat**. Stepperen beholdes synlig når arbeidsinnholdet rulles, uten å dekke fokusert innhold. Funnkontrollen viser funn/funndetaljer og innebygd original-PDF side om side. Resultat organiseres som anbefaling og kort begrunnelse, deretter nøkkeltall, rapportgrunnlag, mangler/usikkerhet og sporbarhet. Informasjon grupperes med typografi, avstand og skiller; bokser skal ha en funksjon.

[Firetrinns-wireframe](wireframes/flow-firetrinn-2026-10-13.excalidraw) og [SVG-oversikt](wireframes/flow-firetrinn-2026-10-13.svg) illustrerer valgte flater, samtidig PDF-kontroll og tilbakehandlinger. Gråtoner, panelgeometri og standard detaljåpning i skissen er illustrative.

Alle fire IA-flater har [visuelle nøkkelreferanser](mockups/key-oversikt.html): [Tallgrunnlag](mockups/key-tallgrunnlag.html), [Tilstandsrapport](mockups/key-tilstandsrapport.html), [Kontroller funn](mockups/key-kontroller-funn.html) og [Resultat](mockups/key-resultat.html). Tallgrunnlag samler definisjon, registrert verdi, periode, anvendt årsgrunnlag og kilde i lesbare rader på bred desktop. Tilstandsrapport samler valgt dokument og eksplisitt analysehandling med tallbekreftelsen som kontekst. Resultat viser de fire nøkkeltallene samlet i én rad når plassen tillater det, før tekniske funn og mangler. Smalere flater ombryter grupper uten innholdstap. Mocks viser konstruerte PRD-eksempler og utvalgte tilstander; de utfører ingen produktfunksjon.

Skalaen er 4/8/12/16/24/32/48 px, med 32 px ytre luft, 24 px mellom hovedgrupper og 36 px kontrollhøyde. Fasilitatorens operasjonalisering: fra 1200 CSS px brukes delt kontrollflate med om lag 44/56 funn/PDF. Under grensen beholder funnkontrollen hovedrollen; PDF åpnes som et panel med valgt funn kort oppsummert, korrekt side og tydelig tilbakehandling. Ingen stablet funn/PDF som standard fallback. Ved sterk zoom ombrytes stepperen med alle navn/nummer/status bevart. Representative nøkkelmocks er 1440×900, 1280×800 og smalere panelvisning; dette er desktop-/zoomtilpasning.

Resultat viser fra start anbefaling, kort begrunnelse, utløste regler, alle fire nøkkeltall, alvorlige tekniske funn, mangler/uavklarte forhold og neste handling. Formler, inputkilder/forutsetninger, detaljerte beregningsgrunnlag og opprinnelig KI-/brukerendring åpnes ved behov gjennom tydelig merkede seksjoner. Alle aktive TG2/TG3 er fortsatt tilgjengelige. Feil/mangler og det kodebaserte Innhent mer informasjon-utfallet vises i aktuelt arbeidstrinn når kritisk grunnlag er utilstrekkelig; Resultat samler de faktiske blokkeringene uten full feilmeldingsduplisering.

## Elevation & Depth

Hvite og lett tonede flater, avstand og presise skiller gir hierarki. Ingen KI-glød, dekorative gradienter eller effekter som konkurrerer med dokument og tall. Utgangspunktet har ingen skygge som bærende hierarki; PDF-siden skilles fra omgivelsene med flate/kant. Tilstander må være tydelige uten animasjon.

## Shapes

Små, rolige radier fra frontmatter: `md` på felt og handlinger, `lg` på informasjonsgrupper og `sm` på statusetiketter. `full` er reservert for stepperens nummermarkører. Ingen store dekorative kortflater eller merkevareillustrasjoner er valgt.

## Components

ID-ene er felles med EXPERIENCE.md. Tabellen beskriver utseende; atferd og gyldighet finnes i peer-dokumentet. Størrelser følger frontmatter-tokens. Mads har valgt behovsåpning av detaljer på Resultat; anbefalingen skal forstås uten å åpne dem.

| Komponent | Visuell kontrakt og tilstander |
|---|---|
| `app-header` | Navn i grafitt, modus/opphav i lesbar sekundærtekst. «Demo · lagret KI-uttrekk» er synlig som metadata; ingen KI-logo eller nøkkelfelt. |
| `stepper` | Nummer, eksakt trinnnavn og tekststatus. Petrol markerer gjeldende trinn; statusene «Fullført», «Gjenstår» og «Endret — må oppdateres» kan også leses uten farge. Fokus synlig på navigerbare trinn; sperret trinn har forklaring. |
| `action-primary` | Petrol fyll, hvit tekst, synlig fokus og lesbar handling. Bare gyldige handlinger får aktiv fremtoning; ingen knapp som tar investeringsbeslutningen. |
| `action-secondary` | Hvit flate, grafitt tekst og kontrollkant. Tilbakehandlinger og funnhandlinger er synlige uten hover; sperre forklares. |
| `value-field` | Synlig etikett, verdi, enhet og tilknyttet kilde/forutsetning. Blank og eksplisitt 0 skilles med innhold/status. Feil bruker konkret tekst og feilkantsignal; fokus bruker petrol. |
| `period-control` | År/måned og anvendt årsgrunnlag nær berørt verdi. Valgt periode er tekstlig synlig. Uavklart periode vises som mangel, uten skjult årsstandard. |
| `source-note` | Nøktern metadataetikett identifiserer rapport, brukerforutsetning, brukerendring eller kode. Dokumentnavn og «PDF-side n» holdes lesbare. |
| `cost-breakdown` | Kostnadsposter og skille mellom D og J leses som strukturert innhold med enheter og skiller; ingen ny kostnadsestimat- eller låneplanflate. |
| `financial-confirmation` | Kontrollgruppe med verdier, enheter, perioder, årsgrunnlag og kilder; ubekreftet/endret status tydelig. Bekreftelseshandling følger action-primary. |
| `report-input` | Gjeldende filnavn og dokumentstatus ved synlig filvalg. Grense «Tekstbasert PDF · maks. 30 sider» tilgjengelig; feil har tekstlig årsak. |
| `analysis-status` | Nøktern statuslinje/gruppe med «Analyserer», fullført eller analysefeil. Delresultat og lagret demo merkes; ingen oppdiktet prosentsats eller skjult feil bak tom liste. |
| `finding-list` | Alle aktive funn med TG og kontrollstatus; valgt funn har petrol utvalgssignal og tekstlig identifikasjon. Usikre/avviste funn forveksles ikke med aktive bekreftede fakta. |
| `finding-detail` | TG, kort KI-beskrivelse, dokument/PDF-side, eventuell usikkerhet, status og handlinger i ett lesbart hierarki. Grad og avklaringsstatus er adskilte etiketter. |
| `finding-actions` | Bekreft/Korriger/Avvis står sammen ved det aktuelle funnet. Ingen avvisningsfarge som antyder teknisk utbedring; fokus og nødvendig sperre vises. |
| `finding-edit` | Redigert utkast i tydelig merket gruppe med Bruk korrigering og Avbryt; originalt KI-funn og gjeldende versjon er tilgjengelige separat. Utkast, brukt korrigering og bekreftelsesstatus skiller seg med tekst. Felt for grad, beskrivelse og PDF-side beholder kildekontekst og feltfeil. |
| `origin-detail` | Tydelige overskrifter «Opprinnelig KI-uttrekk» og «Brukerens korrigering»/«Brukeravvist» med samme lesbarhet. Ingen gjennomstreking som gjør originalen uleselig. På Resultat åpnes detaljene ved behov. |
| `pdf-viewer` | Originalside på hvit flate, dokumentnavn/PDF-side og synlige sidekontroller. PDF ligger ved funnet på bred flate. Smal flate bruker et panel med kort valgt-funn-oppsummering og synlig Tilbake til funnkontroll; samme PDF-side og lesbar kilde beholdes. Lasting/feil berører visningen synlig. |
| `tg3-resolution` | Egen gruppe med Avklart/Uavklart, begrunnelse og konkret avklaringsgrunnlag. Brukeropphav vises. Ugyldig Avklart får konkrete feltfeil; original TG3-grad beholdes. |
| `list-confirmation` | Separat, tekstlig bekreftelsesgruppe for gjeldende liste. Status og handling er skilt fra enkeltfunnets Bekreft og fra TG3-avklaring. |
| `recommendation` | Nøyaktig én gjeldende anbefaling øverst, kort kodebegrunnelse direkte under og anbefalingsbundet neste handling. Dempet semantisk statusfarge med tekst; historisk anbefaling bruker stale-result. |
| `metric-grid` | Fire faste nøkkeltall med navn, verdi og enhet/år. Negative tall beholdes. Ikke beregnbart vises med konkret årsak; «Delgrunnlag» er lesbart når samlet grunnlag mangler. |
| `basis-detail` | Formler/input, aktive funn/kilder, avklaringer og annen sporbarhet i skannbare behovsåpnete grupper. Alvorlige funn, blokkere og utløste regler er synlige fra start, uten å skjule øvrige aktive funn. |
| `detail-disclosure` | Synlig tekstoverskrift, åpen/lukket tilstand og fokus ved behovsåpnete detaljer. Innholdet følger basis-detail/origin-detail; ingen skjult ikon-only-kontroll. |
| `issue-message` | Kort årsak, berørt felt/funn/dokument og nødvendig handling i aktuelt trinn. Tekst formidler feil/tomtilstand/usikkerhet; farge supplerer. Resultat samler faktiske blokkere, ikke hele lokale feilmeldinger. |
| `status-label` | Tekstlige status-/opphavsetiketter i lesbar metadatarolle; grad, kontroll, avklaring og modus navngis hver for seg. Grønt/varsel/rødt bare der innholdet begrunner det. |
| `stale-result` | Tidligere anbefaling og tall etter endret gjeldende økonomi/funnliste/rapport eller TG3-status/begrunnelse/grunnlag på sekundærflate med tydelig «Utdatert / Må bekreftes på nytt», endring og nødvendig ny kontroll. Dempet hierarki, fortsatt lesbar kontrast; ingen aktiv beslutningsklar fremtoning. |

## Do's and Don'ts

| Gjør | Unngå |
|---|---|
| Behold lys, profesjonell arbeidsflate og tydelig informasjonshierarki | Mørkt trading-/krypto-/gaminguttrykk, neon, gradienter, KI-glød og store illustrasjoner |
| Bruk én diskret aksent til handling og orientering | Gjør KI til produktets visuelle hovedperson eller bruk statusfarger dekorativt |
| Vis status, grad, opphav og gyldighet med tekst | Formidle usikkerhet eller anbefaling bare med farge; demp historisk tekst til uleselighet |
| La dokument, tall og begrunnelse bære designet | Overflødige kort, fri dashboard-navigasjon, chatbot eller v2-funksjoner i v1-skisser |
| Bruk valgte tokens og behovsåpning konsekvent | Gjør en uvalgt palett eller historisk skisse til gjeldende design |
