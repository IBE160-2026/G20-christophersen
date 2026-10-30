---
name: Property Acquisition Agent
description: To alternative premiumuttrykk for samme investeringsverktøy.
status: approved-concept-a
revision: 3
updated: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
paired_with: EXPERIENCE.md
implementation_authorized: true
sources:
  - designforslag.md
  - .memlog.md
  - ../ux-IBE160-2026-10-13/DESIGN.md
colors:
  a-paper: '#F7F8F5'
  a-white: '#FFFFFF'
  a-ink: '#243B35'
  a-muted: '#65746C'
  a-line: '#D7DFD8'
  a-accent: '#22665F'
  a-soft: '#EAF0EB'
  a-warning: '#7B5318'
  a-danger: '#903E43'
  b-page: '#101819'
  b-surface: '#172123'
  b-ink: '#EEF3F0'
  b-muted: '#A3B5B5'
  b-line: '#304042'
  b-accent: '#BCE7C6'
  b-warning: '#EDCC91'
  b-danger: '#F2A5A0'
typography:
  a-title:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: 'clamp(44px, 4.4vw, 70px)'
    fontWeight: '400'
    lineHeight: '1.04'
    letterSpacing: -2.5px
  a-metric:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: 'clamp(42px, 5vw, 73px)'
    fontWeight: '400'
    lineHeight: '1.2'
  b-title:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 'clamp(28px, 3.3vw, 48px)'
    fontWeight: '450'
    lineHeight: '1.1'
    letterSpacing: -0.045em
  b-metric:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 'clamp(30px, 3.6vw, 54px)'
    fontWeight: '350'
    lineHeight: '1.25'
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    fontSize: 15px
    lineHeight: '1.5'
  data:
    fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace'
    fontSize: 12px
rounded:
  sm: 3px
  dialog: 6px
spacing:
  control-height: 44px
  a-gutter: 64px
  b-gutter: 40px
  mobile-gutter: 20px
components:
  a-hero:
    background: '{colors.a-paper}'
    title: '{typography.a-title.fontSize}'
  b-workspace:
    background: '{colors.b-page}'
    metric: '{typography.b-metric.fontSize}'
  a-chart:
    line: '{colors.a-accent}'
    area: '{colors.a-soft}'
  b-chart:
    line: '{colors.b-accent}'
    background: '{colors.b-page}'
---

> **Vedtak 2026-10-30:** Mads har valgt og godkjent konsept A som endelig designretning og autorisert implementering i eksisterende PAA. Konsept B bevares som alternativhistorikk. Senere omtale av «venter på valg» beskriver forslaget før dette vedtaket. Se [implementeringsspesifikasjonen](../../../implementation-artifacts/spec-konsept-a-produkt.md).


# Visuelle alternativer — revisjon 3

[Konsept A](mockups/konsept-a.html), [konsept B](mockups/konsept-b.html)
og [sammenligning](mockups/designforslag.html). Ingen retning er valgt.
Dette dokumentet og [EXPERIENCE.md](EXPERIENCE.md) beskriver tilsiktede
utkast ved avvik; de erstatter ikke tidligere godkjente produktkontrakter.
[Revisjon 2](.working/revisjon-2/DESIGN.md) er bevart uendret som historikk.

## Brand & Style

A er en lys, eksklusiv eiendomsopplevelse. Foto og redaksjonell adresse gir
objektet identitet. Store serif-tall, luft og tynne linjer gir avkastningen
plass uten et administrativt kortsystem.

B er en avansert investeringsarbeidsflate. Dyp grafitt, stor lett talltypografi,
lys mint og en sentral graf samler eiendommen og finansieringsvalgene. Smal
navigasjon og presise datarader gir tetthet uten å gjøre dokumentkontroll
til hovedoppgaven. Dette er et annet sideoppsett, ikke A i mørk modus.

## Colors

A bruker `{colors.a-paper}` med `{colors.a-ink}` og petrol som handling/graf.
B bruker `{colors.b-page}` med `{colors.b-ink}` og mint som økonomisk fokus.
Rav markerer uavklarte forhold; farefarge markerer negativ kontantstrøm eller
alvorlige forhold. Tekst og verdi ledsager farge. Ingen grønn totalgodkjenning.

Brukerens nye bestilling åpner for nye farger og kontraster; revisjon 2 sin
begrensning om 17 uendrede farger gjelder derfor ikke disse alternativene.

## Typography

A bruker `{typography.a-title.fontFamily}` og `{typography.a-metric.fontSize}`
for en tydelig redaksjonell skala. B bruker `{typography.b-title.fontFamily}`,
lett vekt og tabellariske siffer; presise beløp og grafdata bruker
`{typography.data.fontFamily}`. Lokale systemfonter gjør skissene helt offline.

Enheter får mindre størrelse ved hovedtallet, men beholdes lesbare.
Kontantstrøm angir før skatt og periode. Kort metadata brukes fremfor
forklarende avsnitt. Skissenes små metadata og SVG-etiketter må vurderes
på nytt for tilgjengelighet ved senere implementering; ingen full
WCAG-godkjenning påstås.

## Layout & Spacing

A: bred todelt fotohero; tre store tall uten bokser; kompakt risikolinje;
300 px finanskolonne til venstre og bred graf til høyre. Store seksjonspauser.

B: liggende bilde i eiendomstoppen; risikolinje før økonomien; KPI-er over
grafen og ca. 298 px finansiering til høyre. Nederst korte grunnlags-/risikorader.

Mobil bruker én kolonne og beholder bilde, objekt, økonomi, risiko,
finansiering/graf og fordypning i en lesbar rekkefølge. Hovedinnhold skal
ikke kreve horisontal sidescroll. Dialoger holder seg innen skjermen.

## Elevation & Depth

Tonalitet og tynne linjer eier hovedhierarkiet. A har flat papirfølelse;
B har diskret toning i grafarealet. Dialoger har avgrensning og dempet
bakgrunnsslør. Ikke en ny skyggeboks rundt hver opplysning.

## Shapes

Foto og hovedkomposisjon er tilnærmet rektangulære. Små kontrollradier,
rolig knappeform og én tydelig dialogflate. Ingen pillerekke for alle fakta.

## Components

| Del | Felles krav / visuell forskjell |
| --- | --- |
| Foto | Identisk lokalt illustrasjonsbilde; A stor og høy, B bred og grunnere. |
| Hovedtall | Samme bruttoyield/nettoyield/kontantstrøm, uten kort. Serif i A; lett sans i B. |
| Finansiering | Tallfelt og supplerende slider. Til venstre i A, til høyre i B. |
| Graf | Samme datasett/horisont, nullakse og datatabell. Rolig flate i A; lys kontrast mot mørk flate i B. |
| Vurdering | Kort, synlig informasjonsbehov og konkrete årsaker; økonomisk scenario er atskilt. |
| Fordypning | TG, opphav og kilder i dialoger. Ingen hash-/kontrolladministrasjon i heroen. |
| PDF/FINN | Primær PDF-handling. FINN-felt og sperret Hent tilgjengelig fra samme inngang. |

## Do's and Don'ts

- Vis eiendommen, avkastningen og risikoen før kildeadministrasjonen.
- Bruk whitespace, størrelse og justering for hierarki, ikke like bokser.
- La grafen støtte et konkret økonomisk spørsmål, med riktig etikett og enhet.
- Behold fakta, dokumentestimater, egne forutsetninger og ukjente som ulike opphav.
- Ikke kall kumulativ kontantstrøm totalavkastning eller prognose.
- Ikke utled risikoscore, kjøpssignal eller komplett analyse av et pent bilde.

Inspirasjonsvedlegg var ikke tilgjengelige i mottatt melding. Retningene
tolker brukerens konkrete beskrivelse; ingen billedanalyse av vedlegg hevdes.
