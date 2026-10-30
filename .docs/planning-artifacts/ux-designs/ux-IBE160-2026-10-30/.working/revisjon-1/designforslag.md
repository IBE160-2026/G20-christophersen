---
title: UX-redesign av Property Acquisition Agent
status: proposal-awaiting-approval
date: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
decision_owner: Mads
implementation_authorized: false
---

# Forslag: fra salgsoppgave til en oversiktlig eiendomsvurdering

**Anbefaling:** Én tydelig opplasting, deretter én samlet eiendomsarbeidsflate.
Dokumentet fyller grunnlaget; brukeren kontrollerer kildene, supplerer det som
mangler og justerer finansieringen. Vurderingen er synlig sammen med økonomi,
rapportstatus og konkrete mangler. Fire låste veivisertrinn erstattes av
åpne seksjoner for det samme objektet.

Dette er et designforslag til godkjenning, ikke en implementert eller godkjent
designkontrakt. Produktkode, eksisterende porter og tidligere UX-dokumenter er
uendret. Ingen betalte API-kall, nye agentmoduler eller push inngår.

[Statiske skjermskisser](mockups/designforslag.html) viser start, oversikt og
rapportkontroll. [DESIGN.md](DESIGN.md) beskriver uttrykket og
[EXPERIENCE.md](EXPERIENCE.md) beskriver atferden. Alle er utkast.
Skissene viser ulike illustrative tilstander: oversikten har ufullstendig
rapport, mens rapportkontrollen viser et alternativt, fullført demouttrekk.

## 1. Hva de tre parallelle gjennomgangene fant

Agent 1 undersøkte dagens UI og arbeidsflyt. Agent 2 utformet en ny retning.
Agent 3 kontrollerte gjennomførbarhet og bevaring av domene-/sikkerhetsregler.
Gjennomgangene var dokument- og kodebaserte; dagens app er ikke brukertestet
eller visuelt evaluert i en ny nettleserøkt. Funnene er designgrunnlag, ikke
en ny sentral feilliste. Utsatt arbeid spores fortsatt bare i
[deferred-work.md](../../../implementation-artifacts/deferred-work.md).

| Observasjon i dagens løsning | Belegg ved checkpoint | Samlet designvalg |
| --- | --- | --- |
| Opplasting ligger over den gamle manuelle registreringen på «Tallgrunnlag». | `src/frontend/App.tsx:89–94` | Egen startflate med salgsoppgaven som hovedhandling. |
| Manglende økonomi sperrer rapport og funn selv etter dokumentimport. | `src/frontend/App.tsx:59–64`, `src/frontend/state/session.ts:223` | Åpne økonomi, rapport og kilder uavhengig. Kontrollporter gjelder bruk av grunnlaget. |
| Importkontroll, overføring og tallbekreftelse oppleves som flere økonomiske systemer. | `ProspectusImport.tsx:73–96`, `FinancialInput.tsx:154` under `src/frontend/screens/` | Én økonomiflate; ingen synlig overføring mellom to skjemaer. Domenekontrollene beholdes. |
| Fullt skjema for verdi, periode, år, kilde og konflikt vises også når importen kjenner feltet. | `FinancialInput.tsx:64–130`, `src/frontend/screens/FinancialBasisInput.tsx:29–54` | Lesbare dokumentrader; redigering bare ved behov. |
| Finansiering ligger langt nede; nedbetaling vises bare i måneder. | `ProspectusImport.tsx:89–90`, `src/frontend/components/FinancingControls.tsx:7–13` | Finansiering ved økonomitallene; eksakte tallfelt og forståelig nedbetalingstid. |
| Nøkkeltall er knyttet til et resultat sent i reisen. | `src/frontend/components/FinancialMetrics.tsx:98` | Vis beregnbare, bekreftede økonomiske delresultater uten å vente på rapportkontroll. |
| Token-, SDK- og budsjettinformasjon kommer før økonomien. | `ProspectusImport.tsx:47` | Praktisk status først; tekniske bevis i detaljer. |
| Rapportadministrasjon gjentas i funnkontrollen. | `ReportAnalysis.tsx:50–73` under `src/frontend/screens/` | Én dokumentstatus, med rapportbytte og identitetskontroll på riktig sted. |
| Funnkontroll, listebekreftelse og TG3-avklaring er nødvendige, men vanskelige å skille. | `ReportAnalysis.tsx:104–114`, `src/frontend/screens/FindingListControl.tsx:8–15` | Kort fremdrift og tydelig navngitte, separate kontrollhandlinger. |
| Kildeåpning og retur varierer mellom økonomi, rapport og resultat. | `ProspectusImport.tsx:100`, `ScreeningResult.tsx:57` under `src/frontend/screens/` | Samme kildepanel fra alle flater; behold valgt post og fokus ved retur. |
| Symboler, prioritet, ID-er og revisjonsbegreper vises som hovedspråk. | `ScreeningResult.tsx:70–119` | Vanlige økonomibegreper; tekniske identifikatorer i detaljer. |
| FINN-kodeendring kan bytte objekt allerede ved URL-endring. | `src/frontend/state/session.ts:136–142` | Synlig konsekvens ved feltet. Ingen endring i FINN-logikk inngår i dette forslaget. |

Filnavn uten full sti i tabellen er presisert i beleggkolonnen. Visuelle
problemer er utledet fra komponentstruktur og `src/frontend/styles.css:452–458`;
ingen målbar tidsbesparelse eller validert brukervennlighet hevdes.

Språket endres konsekvent: «Tallgrunnlag» blir «Økonomi og forutsetninger»,
«nettoyield» blir «Netto leieavkastning», «NOI» blir «Driftsresultat før
finansiering» og «gjeldsbetjening» blir «Renter og avdrag». «Løpetid
(måneder)» blir «Nedbetalingstid». P/L/D/J/Ymin beholdes i formeldetaljer;
«semantisk rest», SDK-stub, tokenizer, prioritet og listerevisjon flyttes til
tekniske detaljer. Kontrolltekst skal fortsatt angi hva brukeren bekrefter.

## 2. Ny hovedreise

1. **Last opp salgsoppgaven.** Filvalg starter eksisterende lokale lesing
   automatisk. Ingen krav om pris, leie, egenkapital eller rentefelt først.
2. **Få oversikt med en gang.** Tilgjengelige opplysninger, kilder,
   dokumentstatus og mangler vises i samme arbeidsflate. Ukjent identitet
   heter «Eiendom uten bekreftet identitet», ikke en gjettet adresse.
3. **Kontroller og suppler der det trengs.** Dokumentverdier skrives ikke inn
   på nytt. Brukeren kontrollerer dem mot originalen, håndterer konflikter og
   oppgir egen leieforutsetning eller andre manglende felt med begrunnelse.
4. **Juster finansieringen.** Egenkapital, rente og nedbetalingstid gir lokal
   forhåndsvisning av beregnet lån og betaling. Økonomien bekreftes samlet
   etter nødvendig kilde-/innholdskontroll.
5. **Kontroller rapporten.** Funn og original vises sammen. Uttrekkskontroll,
   listebekreftelse og avklaring av alvorlig TG3 er fortsatt ulike handlinger.
6. **Se vurderingen i oversikten.** Kode bestemmer Gå videre, Forkast eller
   Innhent mer informasjon fra det gjeldende grunnlaget. En separat
   «Beregn resultat»-side/handling trengs ikke når kontrollene er registrert.

Økonomi og rapport kan behandles i valgfri rekkefølge etter opplasting.
Manglende rapport skal ikke skjule tilgjengelig økonomi.

## 3. Skjermene

### A. Start: «Analyser en eiendom»

Rolig side med produktnavn, kort forklaring og stor opplastingssone:

> **Last opp salgsoppgave**<br>
> Vi henter ut tilgjengelige opplysninger om økonomi og tilstand.
> Du kontrollerer grunnlaget før vurderingen blir gjeldende.<br>
> **Velg PDF**

Vis støtte for inntil 200 fysiske sider, 50 MiB per fil og samlet beholdt
salgsoppgave/separat rapport. Skannede rapportsider kan kreve en annen PDF;
ingen automatisk OCR eller vedleggsutpakking foreslås.

Under hovedhandlingen står et **synlig FINN URL-felt**, merket
«FINN-lenke — alternativ inngang» og «FINN-import er sperret i dette
oppsettet» når porten er stengt. Ikke skjul feltet bak avanserte valg.
Behold URL-validering, servergate, autorisasjonsreferanser og duplikatvern.
Innliming skal ikke starte et eksternt kall. Manuell registrering og kjent
offline-demo er diskrete alternativer.

### B. Eiendomsarbeidsflaten

Topp: dokumentert identitet, filnavn, «Lokal dokumentanalyse» / faktisk
analyseopphav, dokumentstatus og handling for dokumentbytte. Deretter fire
seksjoner som faner/anker i samme objekt:

| Seksjon | Innhold |
| --- | --- |
| **Oversikt** | Vurdering eller kontrollstatus, viktigste begrunnelse, alle avgjørende mangler, fire nøkkeltall og neste relevante kontrollhandling. |
| **Økonomi** | Pris og kjøp, leie, drift og finansiering med dokumentverdier, kilder og kildekontroll. |
| **Rapport** | Rapporttilhørighet/dekning, alle TG2/TG3, kontrollstatus, original-PDF og separat TG3-avklaring. |
| **Kilder og mangler** | Dokumenter, sidestatus, konflikter og dokumenterte begrensninger. Hver mangel leder til rett sted. |

Tilgang til en seksjon betyr ikke at grunnlaget er bekreftet.
Kildepanelet åpnes over/ved arbeidsflaten og er ikke et femte trinn.

### C. Oversikt og investeringsvurdering

Øverst vises ett av følgende:

- Før kodevurdering finnes: «Kontroll gjenstår», med konkrete mangler og
  neste handling. Dette er en arbeidsstatus, ingen alternativ anbefaling.
- Når eksisterende screeningregler har evaluert gjeldende grunnlag:
  **Innhent mer informasjon**, **Forkast** eller **Gå videre**, med alle
  avgjørende utløsere og kodebestemt neste handling.
- Etter relevant endring: «Vurderingen må oppdateres». Tidligere resultat
  ligger eventuelt under «Forrige vurdering» som tydelig historisk.

Fire nøkkeltall vises med år, enhet, beregningsgrunnlag og kilde:
**Brutto leieavkastning**, **Driftsresultat før finansiering (NOI)**,
**Netto leieavkastning** og **Kontantstrøm før skatt**. De eksisterende
formlene og tersklene endres ikke. Ikke beregnbare tall viser årsak, for
eksempel «Kan ikke beregnes — leieinntekt mangler».

Ikke bruk en investeringsscore, prosentvis «AI-sikkerhet», kjøpsknapp eller
frie KI-genererte konklusjoner. Investeringsvurderingen er tidlig sortering;
investoren tar beslutningen.

## 4. Økonomi: dokument først, egne valg tydelig

**Pris og kjøp:** Vis prisantydning, eventuell fellesgjeld, totalpris uten
kjøpsomkostninger, oppgitte kjøpsomkostninger og kontantbehov hver for seg.
Kjøpsomkostninger endrer ikke yieldnevneren P. Ukjent omkostning er ikke 0.

**Leie:** Skill dokumentert faktisk leie, dokumentert estimat og egen
forventning. «Ingen aktive leieavtaler» betyr ikke automatisk null leie.
Forventet leie uten kilde er en synlig, begrunnet brukerforutsetning.

**Drift:** Vis kjente poster og kjent subtotal uten å kalle den full drift.
Behold inkludering, år/periode, mva, konfliktalternativer og gjeldsdel.
Renter og avdrag telles i J og ikke samtidig i drift D.

**Finansiering:** Et synlig panel har eksakte tallfelt for egenkapital,
rente og nedbetalingstid. Egenkapitalslider supplerer tallfeltet når
kontantbehovet er kjent. Nedbetalingstid vises som år og måneder, konvertert
entydig til hele måneder for dagens annuitetsberegning. Ingen skjulte
standardverdier eller nye lånetyper. Analyseår og minstekrav til netto
leieavkastning er synlige egne forutsetninger, uten nye standardterskler.

**Når brukeren justerer:** Beregnet lån, månedsbetaling og årlig betaling
oppdateres som «Finansieringsforslag — ikke bekreftet». Ukjent betaling på
fellesgjeld gjør samlet renter/avdrag ufullstendig, selv om privat lån er
beregnbart. Dette gjenbruker `financingSuggestion`; det er ikke en ny
utkastmodell for yield eller kontantstrøm.

Fire nøkkeltall bruker bare relevant gyldig bekreftet delgrunnlag. Eksempel:
bekreftet pris/leie/drift kan gi netto leieavkastning mens kontantstrøm
mangler bekreftet gjeldsbetaling. Etter finansendring kan uendrede relevante
delberegninger beholdes; den samlede tidligere anbefalingen er historisk.
Ingen midlertidig `confirmed:true` eller umerket tallforhåndsvisning.

**Én forståelig sluttkontroll:** Dokumentradene viser «Se kilde»,
«Stemmer med originalen» og «Korriger». Deretter én «Bekreft økonomi» som
samler brukerens handling; nødvendige underliggende kontroller og
validering gjennomføres i riktig rekkefølge. Ingen automatisk godkjenning
eller «Bekreft alt»-snarvei for ukontrollerte felt. Konflikter og manglende
fullstendighetskontroll stopper bare den berørte bekreftelsen/beregningen.

## 5. Rapport, mangler og kilder

På desktop: funnliste og korrekt originalside side om side. Alvorlige,
usikre og ukontrollerte forhold fremheves uten å filtrere bort resten.
Vis «X av Y funn kontrollert» fremfor revisjons-ID som hovedtekst.

- «Stemmer med originalen» kontrollerer uttrekket, med korriger/avvis som
  egne valg. Original og endring beholdes.
- «Avklar alvorlig forhold» gjelder reelt TG3 og krever separat status,
  begrunnelse og konkret eksternt grunnlag. Kontroll av funnet avklarer
  ikke det tekniske forholdet. TG3 kan forbli uavklart.
- «Bekreft rapportlisten» gjelder hele gjeldende listen. Tom liste krever
  fortsatt vellykket fullstendig analyse og eksplisitt kontroll.

Samme kildepanel brukes fra tall, funn og oversikt: dokumentnavn, fysisk
PDF-side, eventuelt trykt side, ordrett utdrag og originalside/nabosider.
Opphav («Fra dokumentet», «Dokumentets estimat», «Egen forutsetning»,
«Ubekreftet tolkning») og kontrollstatus er to separate egenskaper.
Hash, offseter og revisjoner forblir tilgjengelige i detaljer.

Mangler står både ved berørt verdi/funn og samlet med lenke til handling.
Manglende tekst, ukjent rapportgrense, ubehandlet vedlegg og ukjent
eiendomstilhørighet kan ikke gjøres komplette ved å bekrefte en funnliste.
Dokumenterte begrensninger vises sammen med kildene. En teknisk gyldig
kildeposisjon gjør ikke en svakt underbygget modellfortolkning til fakta.

## 6. Visuelt uttrykk og responsivitet

Viderefør godkjent lys grafitt/petrol-retning: lys grågrønn bakgrunn,
hvite arbeidsflater, mørk tekst og dempet petrol på primærhandlinger.
Mer luft, større tall og færre innrammede bokser. Tall justeres for
sammenligning; kilder er synlige tekstlenker, ikke bare ikoner.

Bruk systemfont, 16 px brødtekst, omtrent 30 px sidetittel og 30 px
nøkkeltall. Kontrollfelt minst 44 px høye, moderat 6–10 px avrunding,
8 px avstandsrytme. Detaljer kan foldes inn; mangler og sperreårsak kan ikke.
Disse dimensjonene er nye anbefalinger, ikke eksisterende godkjente valg.

Desktop fra omtrent 1200 CSS px har todelt rapport/kildearbeid. Under
den grensen brukes én kolonne og et separat kildepanel med valgt
post/funn som kontekst. Panelet har tastaturkontroll, Esc og fokusretur.
Ingen tap av tall, kilde eller handling ved zoom. Status bruker tekst
og form i tillegg til farge; kontrast og tastaturflyt må verifiseres
på implementasjonen før noen tilgjengelighetspåstand.

## 7. Tilstander som designet må dekke

| Tilstand | Synlig tilbakemelding og handling |
| --- | --- |
| Tom start | Velg salgsoppgave, synlig sperret FINN-felt, manuell/demo-inngang. |
| Lokal lesing | «Leser salgsoppgaven …», faktiske delsteg; ingen oppdiktet prosent eller AI-aktivitet. |
| Kandidater klare | «Opplysninger hentet ut — kildekontroll gjenstår». |
| Uløst semantikk, stengt live-port | «Rapportanalysen er ufullstendig». Vis berørt omfang, sperreårsak og mulig lokal handling. Ingen betalingsknapp eller automatisk fallback. |
| Rapport mangler / vedlegg ikke behandlet | Behold økonomien, tilby separat tekstbasert rapport og identitetskontroll. |
| Uleselig rapport | Navngi fysiske sider; ingen grønn tomliste. |
| Konflikt | Vis begge originale verdier med perioder, kvalifikasjoner og kilder. Ingen automatisk kildevinner. |
| Finansiering endret | Ubekreftet finansieringsforslag; gammel vurdering historisk; bekreft endret økonomi. |
| Ny separat rapport | Behold økonomi; rapport-/listekontroll og TG3-avklaringer må gjøres på nytt. |
| Ny salgsoppgave | Forklar objektbytte; følg eksisterende hash-/generasjonsregler og tøm tidligere objekt der de krever det. |
| Samme dokument | Eksisterende hash-/versjons-/modusbundet gjenbruk; ingen ny analysegenerering bare ved navigasjon. |
| Demo / analysefeil | Navngi faktisk opphav og feil. Ikke framstill lagrede data som ny live-analyse. |
| Sidelasting / lukking | Kort varsel: «Arbeidet beholdes bare mens siden er åpen». Ingen ny lagringsfunksjon. |

## 8. Teknisk gjennomførbarhet og bevaring

| Omfang etter designgodkjenning | Eksisterende grunnlag | Nødvendig senere arbeid |
| --- | --- | --- |
| Opplasting og lokal analyse | `analysis/import-client.ts:17`, `screens/ProspectusImport.tsx:40` under `src/frontend/` | Ny startflate og samlet presentasjon. Ingen ny analysemotor. |
| Åpne seksjoner / økonomi før ferdig rapport | `src/frontend/state/session.ts:223`, `src/domain/finance.ts:16` | Endre navigasjon og presentasjonsmodell; behold domenevalidering og delberegningenes krav. |
| Én økonomiflate | `src/frontend/state/import-session.ts:31–49`, `src/domain/source-economy.ts:75` | Samordne kildekontroll, manuelle rettinger og eksplisitt finansbekreftelse uten tap av proveniens. |
| Finansiering | `src/domain/financing.ts:8` | Ny plassering/år-måned-visning; samme Big.js-beregning og gyldighetsgrenser. |
| Kildepanel / PDF | `src/contracts/document-import.ts:27,102`, eksisterende originalvisning | Felles kontekst/fokus/retur. Uendrede autoritative hash-, side- og tekstbindinger. |
| Vurdering i oversikten | `src/domain/screening.ts:70`, `src/frontend/state/result.ts:8–48` | Reevaluer gjeldende kontrollert grunnlag uten ekstra navigasjonsknapp; bevar snapshot/revisjonsbinding og historisk status. |
| Eksakt økonomiprøve / kvartal / termin / mva | `src/backend/import/economy-money.ts`, `economy-compact.ts` | Ikke automatisk integrert i vanlig opplasting. Eventuell produksjonsmapping trenger egen kontrakt- og kvalitetsavklaring. Ingen stille årsomregning i redesign. |
| FINN | `src/backend/listing/backend.ts:52`, `src/backend/http/listing-route.ts:11` | Behold felt og gate. Ingen live-aktivering eller ny importlogikk. |

Andre kontroller beholdes: ukjent ≠ null, alle konfliktalternativer,
original/korrigering og manuelt eierskap til P/D/J, fullstendig drift,
én aktiv behandling, hash/generasjon/korrelasjon, avbrudd og ingen automatisk
retry. Fil-/side-/tekst-/svar-/tids-/minnegrenser, isolert backendbehandling,
nøkkelplassering og budsjett-/tilgangsporter endres ikke.

**Viktig grense ved 06d8962:** Den separate økonomiprøven bestod 11/11 som
samlet pipeline, modellen alene 10/11. Kode bevarte leieopplysning og tre
dokumentbegrensninger modellen utelot. Svake generelle modellkilder er
fortsatt ubekreftet tolkning. Dette er ikke full TG-/produksjonsvalidering
eller integrasjon i vanlig UI. `/api/document-import-config` har fortsatt
`liveEnabled:false`; **PAA-SO2 forblir åpen**. Redesign må vise denne
realiteten også i et attraktivt grensesnitt.

## 9. Hva en godkjenning vil beslutte

Godkjenning gjelder denne nye UX-retningen: opplasting først, én åpen
eiendomsarbeidsflate, samlet økonomikontroll, sentral finansiering,
konsekvent kildepanel og vurdering i oversikten. Den omfatter foreslått
visuelt uttrykk og tilstandene ovenfor, uten å åpne eksterne porter.

Etter eventuell godkjenning må eksisterende UX-/krav-/arkitekturspor
avstemmes før implementering. Særlig må den gamle sekvensen i PRD FR-4
(finansbekreftelse før rapportanalyse) erstattes i tråd med godkjent
salgsoppgaveretning og dette forslaget. FR-13s krav til bekreftede
beregningsverdier og FR-16s anbefalingsregler beholdes. En sammenslått
bekreftelseshandling krever fortsatt alle nødvendige kontroller.

Senere verifikasjon bør dekke opplasting uten forhåndsinput, økonomi og
rapport i valgfri rekkefølge, eksakt finansiering inklusive 0 % rente,
ukjent fellesgjeldsbetaling, ukjent/null/konflikt, korrekte originalkilder,
TG3/listekontroll, utdatert resultat, dokumentbytte/gjenbruk, stengt FINN
og live, samt tastatur/zoom/smal skjerm. Dette er en fremtidig kontrollplan,
ikke gjennomførte tester eller løfter om tidsbesparelse.

Ingen nye agentmoduler, OCR, markedsdata, score, nye lånetyper, varig
lagring eller automatiske betalte analyser foreslås. Ingen implementering
starter før Mads har godkjent designforslaget.

## Kildegrunnlag

- [AGENTS.md](../../../../AGENTS.md) og [README](../../../../README.md) ved checkpoint `06d8962`.
- [Sensorveiledning](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), særlig side 2–4: plan–kode-spor, bevis for kvalitet og konkret brukervennlighet/tilgjengelighet. Hele PDF-en er tekstlest lokalt.
- [Faglærertilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md): smal kjerne, finans i kode, sporbare kilder, menneskelig beslutning og egne skisser.
- [PRD](../../prds/prd-IBE160-2026-10-10/prd.md), særlig FR-1–FR-18, NFR-2 og S1–S4.
- [Tidligere DESIGN](../ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](../ux-IBE160-2026-10-13/EXPERIENCE.md): godkjent visuell retning og kontrollmekanismer.
- [Godkjent salgsoppgaveendring](../../sprint-change-proposal-2026-10-28.md) og [code-first-design](../../salgsoppgave-code-first-design-2026-10-29.md).
- [Arkitektur](../../architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): modulgrenser, kontroll og resultatintegritet.
- [Checkpointets økonomiprøve](../../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-4.md) og [sentral oversikt](../../../implementation-artifacts/deferred-work.md).
- [Aktiv brukerbestilling](../../../process/prompts/session-01a18c6d-0a58-7063-ac77-b64541b4ec72.jsonl) og [sesjonsnotat](../../../process/arbeidsokter/2026-10-30-ux-redesign-forslag.md).
