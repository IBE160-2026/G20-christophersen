---
name: Property Acquisition Agent
description: Investeringsverktøy med eiendommen, økonomien og finansscenarioet i sentrum.
status: proposal-awaiting-approval
revision: 2
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
    fontSize: 36px
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
  property-hero:
    background: '{colors.surface-main}'
    title: '{typography.title.fontSize}'
    radius: '{rounded.lg}'
  scenario:
    background: '{colors.surface-main}'
    border: '{colors.border-control}'
    status: '{colors.status-warning}'
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

# Property Acquisition Agent — visuelt forslag, revisjon 2

Utkast før Mads' godkjenning. [Samlet forslag](designforslag.md),
[beslutningslogg](.memlog.md) og [EXPERIENCE.md](EXPERIENCE.md) beskriver retningen.
[Interaktiv offline-skisse](mockups/designforslag.html) viser ett fiktivt
investeringsverktøy med Start, Investering, Eiendom og risiko og Dokumentasjon.
Revisjon 1 er bevart under [.working/revisjon-1](.working/revisjon-1).
Dokumentene beskriver tilsiktet forslag ved skisseavvik; tidligere godkjente
kontrakter erstattes først ved uttrykkelig vedtak. Ingen produktkode er implementert.

## Brand & Style

Et moderne, minimalistisk investeringsverktøy for førstevurdering av ett
utleieobjekt. Eiendommen, avkastningen, kontantstrømmen og finansieringsvalgene
har størst visuell vekt. Konkrete risikoer og usikkerhet er synlige ved vurderingen;
TG-detaljer, PDF og kontrolladministrasjon ligger i tilgjengelig fordypning.
Lys grafitt/petrol videreføres med luft og presise tall, uten tradingpreg.

## Colors

Alle 17 eksisterende hexverdier beholdes uendret. `{colors.surface-page}` er
bakgrunnen, `{colors.surface-main}` arbeidsflaten og `{colors.surface-subtle}`
rolig gruppering eller PDF-bakgrunn. `{colors.ink-structure}` brukes til adresse
og nøkkeltall; tekst bruker primær- og sekundærtokens. `{colors.accent-primary}`
markerer handling og valgt seksjon.

Warning viser mangler eller ubekreftet scenario; danger viser alvorlige forhold
og økonomiske brudd. Farge ledsages alltid av tekst. Ingen grønn totalstatus fra
et godt økonomitall, et bilde eller en teknisk gyldig kilde. Kontrast må kontrolleres
på senere implementasjon; paletten er ingen sertifisering.

## Typography

Systemfont, `{typography.body.fontSize}` brødtekst, `{typography.title.fontSize}`
adresse/sidetittel og `{typography.metric.fontSize}` på tre primære nøkkeltall.
Etiketter og metadata er minst 14 px. Tall har tabellariske siffer og tydelig
enhet/år. Stor kontantstrøm kan brytes i beløp og enhetslinje. NOI er støtteinfo
under «Driftsresultat før finansiering». Lange årsaker ombrytes.

## Layout & Spacing

Omtrent 1200 px innhold ved 1440 px skjermbredde. 8 px grunnrytme;
`{spacing.page-gutter}` på desktop, `{spacing.mobile-gutter}` smalt og
`{spacing.section-gap}` mellom hovedseksjoner. Relatert innhold bruker
`{spacing.related-gap}`.

Eiendomstoppen er rundt 190–220 px høy: bilde omtrent 260 × 170 px til venstre,
adresse, pris og nøkkelinfo til høyre. Under står bruttoyield, nettoyield og
kontantstrøm samlet i omtrent to tredeler av bredden; vurdering i den siste
tredelen. Neste rad har interaktiv finansiering og et enkelt risiko-/mangelsammendrag.
Unngå en fullbredde kontrollbanner foran investeringsinformasjonen.

Første desktopskjerm bør vise eiendommen, de tre nøkkeltallene, vurderingen og
starten på finansieringen. Pris, kontantbehov og lån har hver sin etikett.
Under omtrent 1200 CSS px brukes færre kolonner; små flater får én kolonne.
Rapport og original kan vises side om side når lesbart; ellers eget kildepanel.
Ingen horisontal sidescroll for skjema/tekst. PDF har egen avgrenset leseflate.

## Elevation & Depth

Tonal forskjell og `{colors.border-decorative}` skiller seksjoner; felt bruker
`{colors.border-control}`. Ingen dekorativ glød, gradient eller tunge skygger.
Kildepanelet har tydelig overskrift og avgrensning. Eiendomsillustrasjonen gir
visuell identitet uten å konkurrere med tallene.

## Shapes

Kontroller bruker `{rounded.sm}`, små grupper `{rounded.md}` og bilde/hovedflater
`{rounded.lg}`. Bruk rader og skillelinjer inne i seksjoner. Ingen ny boks rundt
hver kilde eller metadataopplysning.

## Components

| Komponent | Visuelt forslag |
| --- | --- |
| Eiendomstopp | Lokal illustrasjon merket fiktiv, adresse, pris og nøkkelinfo. Ukjent byggeår vises som ukjent. Manglende virkelig bilde får nøytral plassholder. |
| Seksjonsnavigasjon | Start, Investering, Eiendom og risiko, Dokumentasjon. Valgt seksjon har tekstmarkering og petrolstrek. |
| Primære nøkkeltall | Bruttoyield, nettoyield og kontantstrøm før skatt, 36 px. Samlet synlig etikett «Interaktivt scenario – ikke bekreftet» når scenariotall vises. |
| Investeringsvurdering | Stor eksisterende anbefaling, kort begrunnelse, alle avgjørende forhold og neste handling. Kompakt gul flate for informasjonsbehov, uten å skyve økonomien ned. |
| Finansscenario | Presise felt/slidere for egenkapital, rente og nedbetaling. Beregnet lån og betaling tett ved kontrollene; nullstillingshandling synlig. |
| Risikooversikt | Konkrete tekniske, økonomiske og dokumentrelaterte forhold med tekststatus og videre lenke. Ingen ny samlet risikoscore eller AI-prosent. |
| Opphavsmarkører | Fra dokumentet, Egen forutsetning og Ukjent; eget Dokumentets estimat når aktuelt. Kontrollstatus er separat i fordypning. |
| Økonomifordypning | Leie/drift, pris/kjøp, forutsetninger og NOI som lesbare rader med kildehandlinger. |
| Opplasting og FINN | Fremtredende PDF-inngang på Start; synlig URL-felt med sann sperrestatus. Eksempelknapp er tydelig prototypenavigasjon. |
| Rapport og kontroll | Alle TG-funn, enkeltkontroll, separat TG3-avklaring og listebekreftelse beholdes i fordypning. Kritiske mangler oppsummeres på Investering. |
| Kildedialog | Dokument, fysisk side, utdrag og originalkontekst. Tekniske ID-er i detaljer; tydelig lukk/retur. |
| Historisk resultat | `{components.historical.background}` og tekstlig «Forrige vurdering — historisk». |

Alle kontroller har minst `{spacing.control-height}` høyde. Fokus bruker
`{colors.focus-ring}`, `{spacing.focus-width}` bredde og `{spacing.focus-offset}`
avstand. Faktisk bilde, areal, type og rom trenger senere kontrakt-/parserarbeid;
prototypens fiktive topp demonstrerer ønsket uttrykk, ikke eksisterende importstøtte.

## Do's and Don'ts

- La eiendom, økonomi og finansieringsvalg lede oppmerksomheten.
- Behold kritiske mangler synlige i oversikten; gi full TG-/kildefordypning.
- Skill scenario, dokumentopplysninger, egne forutsetninger og kontrollstatus.
- Vis enhet, år, ukjent verdi og konflikt; legg SDK-/hashdetaljer i fordypning.
- Unngå risikoscore, AI-magi, kjøpsknapp og oppdiktet fremdrift.
- Presenter aldri fiktiv illustrasjon som foto av en virkelig eiendom.
- Skissen har lokal interaksjon og syntetiske tall, ingen filbehandling, API eller produktanalyse.
