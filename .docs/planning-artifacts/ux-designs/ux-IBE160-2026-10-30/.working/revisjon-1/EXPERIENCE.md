---
name: Property Acquisition Agent
description: Forslag til opplasting først og åpen kontroll av ett eiendomsgrunnlag.
status: proposal-awaiting-approval
updated: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
paired_with: DESIGN.md
implementation_authorized: false
sources:
  - designforslag.md
  - .memlog.md
  - ../ux-IBE160-2026-10-13/EXPERIENCE.md
  - ../../sprint-change-proposal-2026-10-28.md
  - ../../prds/prd-IBE160-2026-10-10/prd.md
---

# Property Acquisition Agent — atferdsforslag

## Foundation

Responsiv lokal webapp, desktop som hovedformfaktor, ett objekt i en
midlertidig økt. React og eksisterende CSS-/komponentgrunnlag videreføres;
intet nytt UI-bibliotek eller agentrammeverk velges. [DESIGN.md](DESIGN.md)
eier visuelt uttrykk og tokens. [Samlet forslag](designforslag.md) forklarer
kildegrunnlag og endringer fra checkpoint `06d8962`.

Dette er et utkast før godkjenning. [Statiske skjermskisser](mockups/designforslag.html)
viser start, oversikt og rapport/kilde. Dokumentene angir det tilsiktede
forslaget ved skisseavvik; tidligere godkjente kontrakter erstattes først ved
vedtak. Navigasjon, samordnet bekreftelse og vurdering i oversikten krever
senere implementering og sporbar avstemming med PRD/arkitektur.

## Information Architecture

| Flate | Inngang | Oppgave |
| --- | --- | --- |
| Start | Åpning av app | Last opp salgsoppgave; synlig FINN URL-felt med eksisterende sperre; manuell/demo-inngang. |
| Oversikt | Lokal import eller seksjonsvalg | Vis tilgjengelig økonomi, kontrollstatus, alle avgjørende mangler og gjeldende kodevurdering når den finnes. |
| Økonomi | Åpent seksjonsvalg / mangel | Kontroller pris/kjøp, leie, drift og finansiering uten å skrive dokumentverdier på nytt. |
| Rapport | Åpent seksjonsvalg / mangel | Kontroller tilhørighet, rapportområde, uttrekk, full liste og separat alvorlig TG3. |
| Kilder og mangler | Åpent seksjonsvalg / kilde | Dokumenter, sidestatus, konflikter, dokumenterte begrensninger og handling til rett kontekst. |
| Kildepanel | Tall, funn eller oversikt | Se originalutdrag og korrekt PDF-side med nabosider, og gå tilbake til valgt post. |

Økonomi, rapport og kilder kan åpnes i valgfri rekkefølge etter opplasting.
Manglende økonomi sperrer ikke lesing av rapporten. Tilgang er ikke bekreftelse.
Det samme kildepanelmønsteret brukes overalt; panel er ingen ny fasetrinn.

## Voice and Tone

Bruk vanlige norske økonomiord. Symbolene P/L/D/J/Ymin, revisjoner og
prioritetsnummer kan finnes i beregningsdetaljer. Mikrocopy skal si hva
opplysningen betyr, hva som mangler og hva brukeren kan gjøre.

| Situasjon | Tekst |
| --- | --- |
| Før opplasting | «Vi henter ut tilgjengelige opplysninger om økonomi og tilstand. Du kontrollerer grunnlaget før vurderingen blir gjeldende.» |
| Kandidater | «Opplysninger hentet ut — kildekontroll gjenstår». |
| Ubekreftet grunnlag | «Kontroll gjenstår»; ingen fjerde anbefalingskategori. |
| Finansiering | «Finansieringsforslag — ikke bekreftet». |
| Manglende leie | «Kan ikke beregnes — leieinntekt mangler». |
| Uavklart identitet | «Eiendom uten bekreftet identitet». |
| TG3 | «Avklart for førstevurdering — brukeroppgitt grunnlag»; aldri teknisk godkjenning. |
| Endret grunnlag | «Vurderingen må oppdateres». Tidligere resultat heter «Forrige vurdering — historisk». |
| Midlertidig økt | «Arbeidet beholdes bare mens siden er åpen». |

## Component Patterns

| Komponent | Atferd |
| --- | --- |
| Opplasting | Filvalg starter eksisterende lokale lesing uten finansinput. Vis faktisk opphav og støtteprofil; ingen ny betalt analyse. |
| FINN-felt | Innliming starter ingen henting. Behold URL-validering, objektbytteregler, servergate, autorisasjonsreferanser og duplikatvern. Vis konsekvens ved feltet. |
| Seksjonsnavigasjon | Åpner Oversikt, Økonomi, Rapport eller Kilder og mangler uten ny analyse eller endret kontrollstatus. Etikett, valgt tilstand og tastaturfokus er tydelige. |
| Økonomirad | Vis verdi, original periode/år, opphav og kontrollstatus. «Se kilde», «Stemmer med originalen» og «Korriger» gir nødvendig kontroll uten duplisert registrering. |
| Finansiering | Eksakte tallfelt for egenkapital, rente og nedbetaling. År/måneder konverteres entydig til hele måneder. Ingen skjulte standardverdier. Vis bare eksisterende financingSuggestion for lån, månedsbetaling og årlig betaling straks. |
| Bekreft økonomi | Én synlig sluttkontroll etter nødvendig kilde-, konflikt-, null-, kostnadsinnholds- og fullstendighetskontroll. Bevar manuelle rettinger og proveniens. Ingen bekreft-alt-snarvei eller automatisk bekreftelse. |
| Nøkkeltall | Fire eksisterende beregninger bruker kun relevante gyldige bekreftede input. Gyldige delberegninger kan vises før rapportkontroll. Ingen ubekreftet yield/kontantstrøm eller midlertidig confirmed:true. |
| Rapportfunn | Valg viser korrekt originalside. Bekreft uttrekk, korriger eller avvis med originalen bevart. Ubrukt utkast påvirker ikke grunnlaget. Kontrollhandlinger følger eksisterende krav til tilstrekkelig dokument-/analysegrunnlag. |
| TG3-avklaring | Separat Uavklart/Avklart, begrunnelse og konkret eksternt grunnlag. Avklart betyr ikke utbedret; Uavklart kan beholdes. |
| Listebekreftelse | Gjelder hele gjeldende listen etter enkeltkontroller og nødvendige begrensningskontroller. Vellykket tomliste krever fortsatt eksplisitt kontroll. |
| Vurdering | Reevaluer eksisterende koderegler fra gjeldende kontrollert grunnlag i oversikten; ingen separat Beregn-resultat-side. Bevar revisjonsbundet snapshot og historikkmarkering. |
| Kildepanel | Behold fysisk side, dokument/hash, ordrett utdrag, trykt side når kjent og nabo-sider. Opphav er atskilt fra menneskelig kontroll. Tekniske bindinger blir tilgjengelige i detaljer. |
| Historisk resultat | Åpnes som Forrige vurdering. Beholder opprinnelig grunnlag og kan ikke fremstilles som gjeldende for endrede verdier. |

Finansiering grupperes visuelt med `{spacing.related-gap}` og felt med
`{spacing.control-height}`. Mangler bruker `{colors.status-warning}` med
tekst; alvorlige forhold `{colors.status-danger}` med tekst. Farger endrer
ikke domene-/screeningregler.

## State Patterns

| Tilstand | Atferd |
| --- | --- |
| Tom start | Stor opplasting; synlig FINN-felt og sann sperrestatus. |
| Leser lokalt | Vis faktiske delsteg og avbrythandling; ingen oppdiktet prosent. |
| Lokalt uttrekk klart | Alle kandidater er ubekreftede; vis kilder og relevant kontroll. |
| Uløst semantikk / stengt live | Synlig ufullstendig rapportanalyse, berørt omfang og sperreårsak. Ingen automatisk fallback eller betalingsknapp. |
| Rapport mangler / vedlegg ulest | Behold økonomi. Tilby separat tekstbasert rapport og eksplisitt tilhørighetskontroll. |
| Uleselig / uklar rapportgrense | Navngi fysiske sider og mangler. Ingen vellykket tomliste eller bekreftelse som opphever feilen. |
| Ukjent / null | Ukjent er ikke 0. Eksplisitt null beholder nødvendig særkontroll. |
| Konflikt | Vis alle originale alternativer, perioder, mva og kilder; ingen automatisk vinner. |
| Ufullstendig drift / fellesgjeld | Kjente subtotaler er delgrunnlag; beregnbart privat lån gjør ikke samlet gjeldsbetaling komplett. |
| Finans endret | Oppdater ubekreftet finansieringsforslag. Tidligere anbefaling er historisk; behold kun fortsatt gyldige relevante delberegninger. |
| Funn-/TG3-endring | Relevant kontroll og anbefaling må oppdateres; bevar uendret økonomi og uttrekk uten nytt KI-kall. |
| Ny rapport | Behold økonomi, men ny rapport-/listekontroll og TG3-avklaring. |
| Ny salgsoppgave | Følg eksisterende hash/generasjonsregler for objektbytte. Samme dokument gjenbrukes bare innen samme gyldige versjons-/moduskontekst. |
| Demo / feil / avbrudd | Navngi faktisk opphav og ufullstendighet; ingen påstått live-suksess eller automatisk retry. |
| Historisk resultat | Tydelig merket under Forrige vurdering med `{components.historical.background}`. Aldri aktiv anbefaling for nye verdier. |
| Sidelasting / lukking | Økten avsluttes; ingen ny lagringsfunksjon. |

## Interaction Primitives

- Seksjonsvalg endrer visning, ikke bekreftelser eller analyse. Faktisk grunnlagsendring styrer nødvendig ny kontroll.
- Én relevant primærhandling i aktuell kontrollkontekst; kilder og andre nødvendige handlinger er synlige.
- Validering navngir berørt felt og konkret handling, beholder input og fokuserer første feil etter bekreftelsesforsøk.
- Kildeåpning fokuserer paneloverskriften. Esc/lukk returnerer til åpneren med valgt post, side og uferdig utkast bevart.
- Valg av funn skifter PDF-side uten å stjele fokus fra funnet.
- Analyse-/visningsstatus kunngjøres kort ved reelle overganger. Ingen automatisk ny analyse ved retur eller økonomiendring.

## Accessibility Floor

Synlige etiketter, enheter, år, feltfeil og kilder knyttes semantisk til
kontrollene. Tastaturrekkefølge følger leserekkefølgen, og alle handlinger
kan utføres uten hover eller drag. Fokus følger DESIGNs
`{colors.focus-ring}`, `{spacing.focus-width}` og `{spacing.focus-offset}`.
Kontroller er minst `{spacing.control-height}` høye.

Status og valgt seksjon må forstås uten fargesyn. Forstørrelse skal bevare
tekst, kilde og handling. En modal kildevisning holder fokus i panelet og
gir tydelig retur. Redusert bevegelse endrer ikke forståelsen. Kontrast,
tastatur, hjelpemiddelannonsering og smal visning må senere verifiseres;
dette dokumentet er ingen tilgjengelighetssertifisering eller produkttest.

## Responsive & Platform

Desktop fra omtrent 1200 CSS px gir todelt rapport/original; smalere flater
bruker én kolonne og kildepanel med valgt posts kontekst. Navigasjonen
ombrytes i samme rekkefølge. `{spacing.page-gutter}` blir
`{spacing.mobile-gutter}` når plassen er knapp. Tall og kontrollhandlinger
skal aldri avhenge av at PDF og funnliste er synlige samtidig.

## Inspiration & Anti-patterns

Viderefør den tidligere godkjente lyse grafitt/petrol-retningens ro,
struktur og lesbare tetthet. Støy fra importadministrasjon flyttes ut av
hovedoppgaven. Ingen chatbot, glød, tradinguttrykk eller generell AI-score;
ingen kort rundt hver opplysning eller skjuling av mangler i detaljer.

## Key Flows

### 1. Mads førstevurderer et dokumentert objekt

1. Mads velger salgsoppgaven uten å registrere finansverdier først.
2. Arbeidsflaten viser tilgjengelige kandidater, kilder og mangler. Han kan lese rapporten før økonomien er ferdig.
3. Han kontrollerer dokumentverdier, supplerer begrunnet leie og justerer egenkapital, rente og nedbetaling. Låne-/betalingsforslaget er ubekreftet.
4. Han utfører underkontrollene og velger Bekreft økonomi. Bare gyldige bekreftede nøkkeltall vises.
5. Han kontrollerer rapporttilhørighet, område, hvert funn og full liste; TG3 får separat status.
6. **Klimaks:** Oversikten viser én eksisterende kodebestemt anbefaling med alle avgjørende forhold, kilder og neste handling. Mads tar investeringsbeslutningen selv.

Feilforløp: ufullstendig rapport eller manglende leie vises konkret; økonomiske delresultater overstyrer ikke mangelen.

### 2. Mads undersøker en kildekonflikt eller et alvorlig funn

1. Mads åpner en markert konflikt eller TG3 fra oversikten.
2. Kildepanelet viser originalutdrag og korrekt fysisk side; konflikter beholder begge alternativer.
3. Han korrigerer med begrunnelse eller bekrefter et korrekt uttrekk. Dette avklarer ikke TG3; det får egen registrering med konkret grunnlag.
4. **Klimaks:** Han kan skille hva dokumentet sier, egen retting og egen avklaring. Uavklart TG3 blir synlig grunn for Innhent mer informasjon.

Feilforløp: manglende kilde eller tomt nødvendig avklaringsgrunnlag kan ikke bekreftes bort.

### 3. Mads endrer finansiering eller dokument

1. Mads endrer rente i Økonomi; kun eksisterende lån-/betalingsforslag forhåndsvises straks.
2. Tidligere vurdering blir historisk. Han kontrollerer og bekrefter endret økonomi; uendret rapport gjenbrukes.
3. **Klimaks:** Oversikten viser en ny revisjonsbundet kodevurdering med etterprøvbart grunnlag.

Alternativ: separat rapportbytte beholder økonomien og krever ny rapportkontroll; ny salgsoppgave følger eksisterende objektbytteregler. Ingen navigasjon eller endring åpner FINN/live-portene.

## Bevarte faglige og tekniske grenser

FR-13s bekreftede beregningsgrunnlag og FR-16s regelprioritet beholdes:
mangler/uavklart alvorlig TG3 først, deretter økonomiske brudd og ellers
Gå videre. Ingen nye finansformler, fratrekk, lånetyper, score eller agenter.
Pris, kontantbehov og lån er separate størrelser. Ingen antatt null eller
stille årsomregning av kvartal/termin/mva fra den separate økonomiprøven.

Kildebindinger, manuelle rettingers eierskap, gamle svar-/duplikatvern,
ressursgrenser, nøkler kun i backend og eksisterende kostnads-/tilgangsporter
videreføres. Checkpointets 11/11 gjelder avgrenset økonomiprøve og er ikke
full TG-/produksjonsvalidering. Vanlig salgsoppgave-live forblir stengt;
svake modellfortolkninger er ubekreftede og PAA-SO2 er fortsatt åpen.
