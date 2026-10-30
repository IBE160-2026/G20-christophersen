---
name: Property Acquisition Agent
description: Forslag til lys, samlet eiendomsarbeidsflate med salgsoppgaven som hovedinngang.
status: proposal-awaiting-approval
updated: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
paired_with: EXPERIENCE.md
implementation_authorized: false
sources:
  - designforslag.md
  - .memlog.md
  - ../ux-IBE160-2026-10-13/DESIGN.md
  - ../../sprint-change-proposal-2026-10-28.md
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
typography:
  title:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  section:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.35'
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  meta:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  metric:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
rounded:
  sm: 6px
  md: 8px
  lg: 10px
spacing:
  unit: 8px
  '1': 8px
  '2': 16px
  '3': 24px
  '4': 32px
  '5': 48px
  page-gutter: 32px
  mobile-gutter: 16px
  section-gap: 32px
  related-gap: 8px
  control-height: 44px
  focus-width: 2px
  focus-offset: 3px
components:
  upload:
    background: '{colors.surface-main}'
    border: '{colors.border-control}'
    radius: '{rounded.lg}'
  action-primary:
    background: '{colors.accent-primary}'
    foreground: '{colors.on-accent}'
    height: '{spacing.control-height}'
    radius: '{rounded.sm}'
  input:
    background: '{colors.surface-main}'
    foreground: '{colors.text-primary}'
    border: '{colors.border-control}'
    height: '{spacing.control-height}'
    radius: '{rounded.sm}'
  navigation:
    foreground: '{colors.text-secondary}'
    selection: '{colors.accent-primary}'
  metric:
    foreground: '{colors.ink-structure}'
    value: '{typography.metric.fontSize}'
    label: '{colors.text-secondary}'
  source-panel:
    background: '{colors.surface-main}'
    pdf-background: '{colors.surface-subtle}'
    divider: '{colors.border-decorative}'
  status:
    radius: '{rounded.sm}'
    label: '{typography.label.fontSize}'
  historical:
    background: '{colors.surface-subtle}'
    foreground: '{colors.text-secondary}'
---

# Property Acquisition Agent — visuelt forslag

Utkast før Mads' godkjenning. [Samlet forslag](designforslag.md) og
[EXPERIENCE.md](EXPERIENCE.md) er de to dokumentenes beslutningsgrunnlag.
[Tre statiske skjermskisser](mockups/designforslag.html) viser start, oversikt
og rapport/kilde. Ved avvik beskriver disse to dokumentene det tilsiktede
forslaget; tidligere godkjente kontrakter erstattes først ved uttrykkelig vedtak.

## Brand & Style

Et rolig, profesjonelt arbeidsverktøy for førstevurdering av ett utleieobjekt.
Viderefør godkjent lys grafitt/petrol med større typografi og færre bokser.
Dokumenter, økonomi og konkrete mangler er hovedinnhold. Visuell enkelhet skal
gjøre nødvendig kontroll lettere å utføre og forstå.

## Colors

Alle hexverdiene videreføres fra forrige DESIGN. `{colors.surface-page}` er
bakgrunnen, `{colors.surface-main}` arbeidsflaten og `{colors.surface-subtle}`
rolig gruppering eller PDF-bakgrunn. `{colors.ink-structure}` brukes til titler
og nøkkeltall; primær- og sekundærtekst følger sine navngitte tokens.
`{colors.accent-primary}` markerer handlinger og valgt seksjon.

Statusfamiliene success/warning/danger brukes sammen med synlig tekst.
Mangler får warning; alvorlige forhold og økonomiske regelbrudd får danger.
En grønn kontrollmarkering gjelder bare det konkrete kontrollerte grunnlaget.
Inngangsflate, kildeidentitet eller tom funnliste får ingen generell
«analysen er trygg»-farge. Kontrast må kontrolleres på den senere implementasjonen.

## Typography

Systemfont gir lokal rendering uten eksterne fonter. Brødtekst er
`{typography.body.fontSize}`, sidetittel `{typography.title.fontSize}` og tall
`{typography.metric.fontSize}`. Seksjonsoverskrifter bruker section; etiketter
og metadata er minst 14 px i dette forslaget. Tall får tabellariske siffer;
beløpskolonner høyrejusteres, med enhet og år synlig. Lange mangeltekster
ombrytes i stedet for å kuttes. Størrelsene er nye forslag, ikke tidligere vedtak.

## Layout & Spacing

8 px grunnrytme, `{spacing.page-gutter}` på desktop og
`{spacing.mobile-gutter}` på smal flate. Relatert innhold får
`{spacing.related-gap}`; hovedseksjoner `{spacing.section-gap}`. Starten har
én fremtredende opplastingssone, fulgt av synlig FINN-felt og sekundære valg.

Arbeidsflaten har objektoverskrift, åpen seksjonsnavigasjon og innhold.
Økonomi og finansiering kan stå ved siden av hverandre når de er lesbare.
Rapport/kilde vises todelt fra omtrent 1200 CSS px; under dette brukes ett
innholdsløp med eget kildepanel. Ingen horisontal side-scroll for skjema og
tekst. Original-PDF kan kreve todimensjonal lesing i sin avgrensede visning.

## Elevation & Depth

Tonal forskjell og `{colors.border-decorative}` skiller seksjoner.
Kontrollfelt bruker den tydeligere `{colors.border-control}`. Ingen
dekorative skygger, glød eller gradienter. Kildepanelets avgrensning og
overskrift viser at det er en egen arbeidskontekst.

## Shapes

Kontroller bruker `{rounded.sm}`, små grupper `{rounded.md}` og
opplastingssone `{rounded.lg}`. Bruk rette innholdsrader og skillelinjer
inne i seksjonene. Unngå et nytt kort rundt hver verdi eller kilde.

## Components

| Komponent | Visuelt forslag |
| --- | --- |
| Opplasting | Hvit hovedflate, tydelig tittel og én petrolfarget «Velg PDF». Støttegrenser i lesbar metadata. |
| FINN-felt | Full etikett og synlig sperretekst, samme inputstandard som resten. Sekundær henteknapp; ingen aktivt utseende som motsier faktisk gate. |
| Seksjonsnavigasjon | Oversikt, Økonomi, Rapport, Kilder og mangler. Valg har tekstmarkering og petrolstrek; ingen låsede fire veivisertrinn. |
| Vurdering | Stor tekst, kort begrunnelse, alle avgjørende forhold og neste handling. Kontrollstatus og historisk resultat har egne tydelige etiketter. |
| Nøkkeltall | Fire lesbare tallområder med enhet, år og kildelenke. Manglende tall erstattes av konkret årsak, aldri null. |
| Økonomirad | Navn, verdi/periode, opphav, kontrollstatus og synlig kildelenke. Fullt retteskjema åpnes ved behov. |
| Finansiering | Tallfelt for egenkapital, rente og nedbetaling; eksisterende slider som supplement. Lån og betaling merkes «Finansieringsforslag — ikke bekreftet». |
| Bekreft økonomi | Én primærknapp ved samlet økonomikontroll; felt-/innholdsfeil vises lokalt med tydelig tekst. |
| Rapportfunn | Grad, kort beskrivelse, side, opphav og kontrollstatus. Alvorlig/usikkert fremheves uten å skjule andre funn. |
| TG3-avklaring | Egen navngitt del av funnet, atskilt med skillelinje; tekstlig Uavklart/Avklart og synlige felt for begrunnelse/grunnlag. |
| Listebekreftelse | Avsluttende handling under listen, med kontrollfremdrift og synlig årsak når bekreftelse er sperret. |
| Kildepanel | Dokument, fysisk side, utdrag, PDF og kontrollhandlinger samlet. Tekniske ID-er ligger i detaljer. |
| Historisk resultat | `{components.historical.background}` og tekstlig «Forrige vurdering — historisk». Tall skal fortsatt være lesbare. |

Alle felt og knapper har minst `{spacing.control-height}` høyde.
Fokus bruker `{colors.focus-ring}`, `{spacing.focus-width}` bredde og
`{spacing.focus-offset}` avstand. Opphav og kontrollstatus vises hver for seg.

## Do's and Don'ts

- Prioriter økonomi, mangler, kilder og neste kontrollhandling.
- Behold synlige enheter, perioder, ukjente verdier og konflikter.
- Legg token-/SDK-/hashdetaljer i tilgjengelige detaljer; behold sperreårsaken synlig.
- Bruk tekst sammen med farge og aldri AI-score, magi, neon eller kjøpsknapp.
- Vis ingen ubekreftet yield-/kontantstrømsforhåndsvisning eller falsk fullføringsprosent.
- Skissene er syntetiske visuelle referanser, uten funksjonell app eller testbevis.
