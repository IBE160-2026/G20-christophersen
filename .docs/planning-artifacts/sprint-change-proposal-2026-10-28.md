---
title: 'Correct Course: Salgsoppgave som hovedinngang til PAA'
date: '2026-10-28'
workflow: 'bmad-correct-course'
mode: 'batch'
status: 'technical-gates-approved-offline'
decision_owner: 'Mads'
scope: 'major-planning-change'
baseline_commit: 'b259207'
---

# Sprint Change Proposal — Property Acquisition Agent

**Vedtak 2026-10-28:** Mads har godkjent hele forslaget, D1–D3 og alle 15 AC.
Offline implementering er autorisert; selektivt kombinert grunnlag skal bevare
fysiske sider, og manglende rapport skal ikke stoppe tilgjengelig økonomi.
[Arbeidsplan og gjennomføring](../implementation-artifacts/spec-salgsoppgave-offline-build.md).
Avventende portstatus nedenfor er bevart som beslutningshistorikk.
Ingen ny live- eller kostnadsautorisasjon følger av vedtaket.

**Salgsoppgave er den vedtatte produktretningen.** Mads bestilte denne
endringen 2026-10-28: én opplasting skal gi mest mulig kontrollerbart
investeringsgrunnlag. FINN bevares som fremtidig alternativ, med utvikling og
live-aktivering utsatt. Dette forslaget bevarer beslutningen og spesifiserer
den tekniske avgrensningen som må avklares før implementering.

**Stoppunkt:** D1–D3 nedenfor gjelder reelle endringer i PDF-støtte,
lesbarhetskontrakt og AI-arkitektur. Ingen produktkode endres før svaret.
Gjennomført her: kartlegging, oppdatert spec/AC, 13 syntetiske dokumenter og
lokal karakterisering. Test-/reviewresultat føres i
[verifikasjonen](../implementation-artifacts/salgsoppgave-correct-course-2026-10-28/verifikasjon.md).
Åpent arbeid spores bare i [sentral oversikt](../implementation-artifacts/deferred-work.md), PAA-SO1.

## 1. Endring og kildegrunnlag

Tidligere UJ-1 begynner med manuell P/L/D/J/Ymin og én separat tekstbasert
tilstandsrapport på høyst 30 sider. FINN-1/2 er senere levert offline bak
tilgangsgate. Den nye hovedreisen begynner med salgsoppgaven og automatisk
utfylling. Dette er et strategisk produktvalg, ikke en feil i levert FINN-kode.

Bestillingen finnes i aktiv
[promptlogg](../process/prompts/session-01a18445-b28a-71e2-af47-e969cbb8c90f.jsonl).
Arbeidsform er batch fordi Mads allerede har gitt retning, avgrensning,
arbeidsrekkefølge og stoppvilkår; ingen ny samtale om allerede avklarte valg.

Lest grunnlag: [PRD](prds/prd-IBE160-2026-10-10/prd.md) og addendum,
[epics/stories](epics.md), [arkitektur](architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[DESIGN](ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og
[EXPERIENCE](ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md),
[samlet SPEC](../specs/spec-IBE160/SPEC.md) og grensekontrakter,
R1/R2/R3, faktisk sprintstatus, FINN-spec/bevis og deferred-work.
Faglærerens [tilbakemelding](briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
og [sensorveiledning](../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
er brukt for realistisk avgrensning, plan–kode-spor, finans i vanlig kode,
uavhengig fasit, lokal demo og personvern. De krever ikke at salgsoppgaver,
200 sider eller OCR støttes; dette er produkt-/teknologivalg i denne endringen.

### Konkret kode- og prøvebevis

| Observasjon | Bevis / konsekvens |
| --- | --- |
| Sidegrensen er kontrakt, ikke bare UI | `validate-pdf.ts` avviser >30; `DocumentBasisSchema` og fullført analyse har `.max(30)` i `src/contracts/document-analysis.ts`. Ny støtte trenger versjonert migrasjon. |
| PDF-parseren kan fysisk lese lengre dokumenter | Rå worker bevarte alle fysiske sider i 50/100/150/200/201-siders syntetiske filer. Eksisterende validering og schema avviste alle >30 som forventet. Dette er undersøkelse, ikke endret appstøtte. |
| Lesbarhetsregel passer dårlig på salgsoppgaver med foto | `mixed-12.pdf`: tekstløs bildeside 3 gir `unreadable-text`; skannet TG3 på side 10 gir samme feil. Begge beholder fysiske posisjoner. |
| PDF-vedlegg er en annen original | Seks-sidersfil med fire-siders rapportvedlegg gir ingen TG-tekst i hovedfilen og ingen nåværende dokumentfeil. PDF.js finner vedlegget separat. Tom hovedfilliste kan ikke bevise at rapporten er analysert. |
| Nåværende økonomimapping er delvis FINN-spesifikk | `ListingField` har URL-kilder og `validateListingImport` krever FINN-identitet. Semantikk kan gjenbrukes; PDF må ha egen kildevariant. |
| Eksisterende TG-forespørsel kan ikke hente økonomi | `createLiveRequest` bruker bare findings/limitations og forbyr endring av finansinput. Ny versjonert uttrekkskontrakt/prompt er nødvendig. |
| Ressursvern finnes, men er ikke komplett minne-/tokenbudsjett | `receive-pdf.ts`: 50 MiB/1 MiB; `run-pipeline.ts`: isolert barn, 60 s lokal/120 s live; én aktiv økt og duplikatmarkør. `live-adapter.ts` akkumulerer svar uten bytegrense; `max_output_tokens` er 128 000. Det er ingen RSS- eller inputtokengrense her. |

[Første prøve](../implementation-artifacts/salgsoppgave-correct-course-2026-10-28/pdf-probe-before-review.json)
for text-100 tok 526 ms og text-200 702 ms, med høyeste prosess-RSS
henholdsvis 270 000 og 297 184 KiB i hver sin ferske prosess. Tiden inkluderer
formatsteg, rå ekstraksjon og vedleggsinspeksjon etter modulimport; RSS er
hele prøveprosessen inklusive workers. Originalfilene er bare ca. 90/182 KiB.
Dette er **ikke** et stressbevis for 50 MiB, OCR, live-latens eller største
ressursbehov. Se [alle rå observasjoner](../implementation-artifacts/salgsoppgave-correct-course-2026-10-28/pdf-probe.json).

## 2. Konsekvenser og gjenbruk

| Område | Gjenbruk | Nødvendig endring |
| --- | --- | --- |
| Økonomi | `domain/listing.ts`, `financial-basis.ts`, `validation.ts`; faste pris/kostnadsfelt, konflikter og inkludering | Skill kildeuavhengige feltregler fra FINN-URL; nytt PDF-opphav med utdrag/fysisk side; bevar eierform og faktisk/estimert opphav. |
| Finansiering | `domain/financing.ts`, slider/tallfelt, rente og måneder | Bruk dokumentgrunnlag til kontantbehov; la brukeren justere. Ukjent gjeldsbetaling gir ingen komplett J. Ingen endring av formler. |
| PDF | `backend/documents/*`, hash, isolert ekstraksjon, fem sidestatuser og cleanup | Egen importprofil, eksplisitte rapportområder/dekning, begrenset tekst/ressurser og vedleggsoppdagelse. |
| TG | Eksisterende kandidater, kildevalidering, korrigering/avvisning, listebekreftelse og TG3-avklaring | Behold utdrag/flere belegg; skille sammendrag fra rapport og samme forhold fra like beskrivelser. Ikke en ny TG-motor. |
| Økt/UI | `session.ts`, `result.ts`, originalvisning og finansbekreftelse | Dokument først, automatisk ubekreftet utfylling, kun nødvendige mangler. Rapportbytte og salgsoppgavebytte får ulike virkninger. |
| Finans/screening | `finance.ts`, `thresholds.ts`, `screening.ts` og finans-/screeningkontrakter | Ingen endring av låste regler. Ny dokumentdekning må gi eksisterende utilstrekkelig-grunnlag-semantikk. |
| Demo | Hash-/versjonsbundet adapter og lokale ressurser | Nye syntetiske dokument/svar-par; behold F1–F4 og ingen live-fallback. |
| FINN | All eksisterende importkode, tester og bevis | Ingen videre utvikling/live-aktivering nå. Feltregler kan trekkes ut under regresjon uten å endre FINN-atferd. |

Epic 1s registrering blir kontroll av forhåndsutfylte data med nødvendig
manuell supplering. Epic 2s dokumentinngang og identitet utvides, mens
kontroll/TG3 består. Epic 3s finans- og screeningregler består; snapshot må
binde både salgsoppgave og eventuell separat rapport. Epic 4s opprinnelige
live-evaluering gjelder gammel rapportprofil, ikke den nye prompten. Epic 5
trenger senere oppdatert README/demo og eget leveringsgrunnlag for utvidelsen.

Faktisk sprintstatus er viktigere enn gamle planformuleringer om «ikke
startet»: Epic 1–3 og 4.1–4.4 er done, 4.5 har S5-W1/formell in-progress,
5.4 er backlog, 5.5 er delvis leveringsforberedelse. Ingen historisk story
rulles tilbake, gjenåpnes eller markeres ferdig av denne endringen.
S5-W1, opprinnelige S5-/S6-bevis og frosset S6-kandidat beholdes uendret.

## 3. Anbefalt vei og beslutninger

**Direkte utvidelse i et nytt Epic 6, med avgrenset første støtteprofil.**
Produktretningen er en vesentlig omplanlegging (PM/arkitekt), men
implementeringen kan gjenbruke eksisterende modulgrenser. Ingen rollback av
FINN eller ny analyse-/finansmotor er begrunnet.

| Alternativ | Vurdering |
| --- | --- |
| Direkte justering med ny dokumentimport og små stories | Anbefalt. Middels/høy innsats og middels/høy risiko ved kilde/fullstendighet. Fem foreslåtte stories; grovt 5–10 effektive utviklingsdager med usikkerhet, ikke et leveringsløfte. |
| Tilbakerulling av FINN | Ikke anbefalt. Fjerner gjenbruk og levert funksjon uten å løse PDF-/OCR-problemet. |
| Full salgsoppgave+OCR+automatisk alle vedlegg nå | Ikke anbefalt i første leveranse. Høy innsats/risiko, nye avhengigheter og nye kostnads-/personvernvalg. |
| Beholde 30 sider og manuelt dele filene | Teknisk enklere, men løser i liten grad ønsket hovedreise og skaper side-/proveniensrisiko. |

Rekkefølgen flytter FINN-aktivering bak salgsoppgaven. Ny UI/live-kvalitet og
ny leveringskontroll må komme etter implementeringen; tidligere målinger
kan ikke brukes som bevis på redusert manuelt arbeid eller treffsikkerhet.
Detaljert visuell UX-redesign forblir separat.

### D1 — Lange PDF-er og ressursprofil — avventer Mads

Anbefaling: ny importgrense **200 sider**, behold **50 MiB**, **60 s lokal /
120 s live**, og suppler med tekst-, respons-, token- og minnevern etter
[specen](../implementation-artifacts/spec-salgsoppgave-input.md).
Den gamle 30-sidersruten beholdes kompatibel. Sidegrensen er en øvre grense,
ikke garanti: en tett/komplisert 100-siders PDF kan avvises av andre grenser.
Ingen stille avkorting, automatisk oppdeling eller lengre frist ved timeout.

### D2 — OCR og dokumentdekning — avventer Mads

Anbefaling: **ingen OCR/vision i første leveranse**. Økonomi fra lesbare sider
kan vises som deluttrekk. Tekstløse sider forblir ulest, også om de visuelt
kan være foto. De kalles aldri blanke eller ferdig analyserte.

Rapportområde må være identifisert og kontrollert. Uleselig/usikker side
inne i dette området sperrer fullført teknisk grunnlag; be om tekstbasert
separat rapport. Utenforliggende bildesider kan holdes utenfor TG-omfanget
med synlig begrensning etter kontroll av rapportområdet; en automatisk
antakelse om at alle slike sider er foto godtas ikke. Ukjent rapportgrense,
manglende sider eller uavklart TG utenfor området krever avklaring. Det er
en eksplisitt endring fra R2s dokumentomfattende avvisning.

Konsekvens: fulle skanninger støttes ikke ennå, og brukerens kontroll av et
uklart rapportområde kan være nødvendig. Dette er den viktigste
brukeropplevelsesbegrensningen ved å utsette OCR.

### D3 — AI-kall og vedlegg — avventer Mads

Anbefaling: **ett kombinert strukturert uttrekk per ny fil**, basert på samme
PDF.js-tekstgrunnlag; økonomi og TG har separate validerte delutfall.
Eksisterende TG-regler og finansmotor gjenbrukes. Integrerte rapportsider
analyseres i hovedfilen med uendrede fysiske posisjoner.

**Faktiske innebygde PDF-vedlegg oppdages, men pakkes ikke automatisk ut i
første leveranse.** Brukeren bes laste rapporten opp separat; ny fil får egen
hash og sine egne sider. Dette er en bevisst begrensning i målet om én
opplasting. PDF.js tilbyr vedleggsinnhold, men en ferdig buffer gir ikke i
seg selv bounded-read-vern mot store dekomprimerte vedlegg. Automatisk
utpakking/OCR/chunking krever nytt valg hvis det skal tas inn nå.

Alternativet er to spesialiserte AI-kall med økonomisider/rapportdel hver
for seg. Det gjenbruker mer av eksisterende prompt uendret, men gir flere
kall og nye delings-/fullstendighetsrisikoer. Ett kombinert kall med egen
envelope anbefales for å unngå at samme rapport leses to ganger. Rapport
som lastes opp separat analyseres én gang uten ny salgsoppgaveanalyse.

Live for ny import er deaktivert som standard. Mads har uttrykkelig
forbudt nye betalte kall uten ny autorisasjon; eldre FINN-/R1-budsjetter er
ikke gjenbrukbar tillatelse. Beslutning om D1–D3 autoriserer bare senere
offline implementering/test, ikke betalt kjøring.

### Eksternt teknologigrunnlag, lest 2026-10-28

- PDF.js anbefaler å rendre synlige sider for å begrense canvasminne;
  originalvisningen bør videreføre dette. Se [offisiell FAQ](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#i-want-to-render-all-100-pages-in-a-document-at-a-high-resolution-is-it-a-good-idea).
- Vedleggsmetadata/-innhold og cleanup finnes i [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/api.js.html).
  Lokal `pdfjs-dist` 6.4.299 har tilsvarende typer. En API-mulighet er ingen
  garanti for sikker, begrenset vedleggsutpakking eller OCR.
- Direkte PDF-input hos OpenAI inkluderer tekst og sidebilder og kan øke
  tokenbruken; APIets filgrense på 50 MB er atskilt fra vår 50 MiB-grense.
  Derfor anbefales fortsatt lokalt tekstuttrekk i første leveranse.
  [File inputs](https://developers.openai.com/api/docs/guides/file-inputs).
- [Modellsiden for gpt-6.1-sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
  oppgir 1 050 000 konteksttokens, 128 000 maks output og Standard-priser
  USD 2/10 per million input/output. Over 272 000 input gjelder oppgitte
  langkonteksttillegg. Det er leverandørgrenser, ikke vår støtteprofil eller
  dokumentasjon på kontotilgang/TPM.
- Med foreslått 100 000 input / 16 000 output er en illustrativ øvre
  tokenpris USD **0,36** = 100 000 × 2/1 000 000 + 16 000 × 10/1 000 000,
  uten rabatt, verktøy, regionalt tillegg eller andre priser. Det er **ingen
  godkjent kostnadsramme**. 128 000 output alene kan koste USD 1,28 ved
  samme sats, så gammel outputgrense bør ikke arves ukritisk.
- Eksakt inputtelling kan utføres via [OpenAI token counting](https://developers.openai.com/api/docs/guides/token-counting),
  men det er et API-kall og utføres ikke nå. Senere live må verifisere
  modelltilpasset lokal teller og faktisk pris/kapasitet; bytes/sider er
  ikke eksakte tokens. Ingen pris eller tokenkvote er verifisert på kontoen.

## 4. Konkrete før → etter-endringer

| Artefakt / avsnitt | Før | Etter / begrunnelse |
| --- | --- | --- |
| Brief, «Med i v1»; PRD, «Låst v1-scope» | Manuell registrering og én separat tilstandsrapport; salgsoppgave utenfor | Vedtatt retning: salgsoppgave først, automatisk ubekreftet økonomigrunnlag og integrert/separat rapport. Teknisk profil under D1–D3. Øvrige non-goals og finansregler består. |
| PRD UJ-1, FR-1/4 | Registrer og bekreft fem verdier før rapportanalyse | Import før tallbekreftelse; vis felt automatisk, spør om nødvendige mangler og juster finansiering. Ingen import er bekreftelse. Teknisk uttrekk kan forberedes uten finansinput. |
| PRD FR-6/7/9 | Én tekst-PDF ≤30, ett rent TG-kall, dokumentfeil ved uleselig side | Foreslått egen salgsoppgaveprofil, økonomi-/TG-delutfall og kontrollert rapportområde. Ulest rapport gir fortsatt utilstrekkelig teknisk grunnlag. Ingen TG-funn fra rent sammendrag som erstatning for manglende rapport. |
| PRD FR-2/8/18 | Finansopphav og funnets rapport/PDF-side | Bevar også originalt økonomiutdrag, eierform, perioder og flere kildebelegg; fysisk side per originalfil; bevar import og retting separat. |
| PRD FR-5/12–17 | Låste TG3-, finans-, terskel- og screeningregler | Uendret. Dekningsmangel inngår som utilstrekkelig rapportgrunnlag, aldri som ny finansiell regel. |
| Epics 1–5 / story 1.3/1.7, 2.1–2.7, 3.5/3.8/3.9, 4.2–4.4, 5.1–5.5 | Godkjente historiske stories med implementeringsbevis | Ingen endring av gamle AC eller done-status. Nye behov får 6.1–6.5 og SO-AC1–15; historisk FR-/AD-spor beholdes. |
| AD-3/4/6 og R2 | Samlet ≤30-grunnlag, ett TG-schema, ulest side blokkerer hele dokumentet | Foreslått versjonert importenvelope, hele originalens sidestatus og eksplisitt deldekning/rapportområde. Del felles valideringskode; bevar gammel protokoll. |
| AD-5/9 og R3 | 50 MiB, 60/120 s, in-memory og én aktiv økt | Bevar dette; suppler ny import med tekst-/token-/respons-/RSS-vern og aktiv prosessgrense. Ingen database, kø eller diskpersistens. |
| AD-1/2/7/8/10 | Rene moduler, frontendøkt, deterministisk finans, én screening, ærlige bevis | Videreføres. Økten utvides med dokumentroller/kildebelegg, ikke en konkurrerende regelmotor. |
| EXPERIENCE IA, report-input, value-field, analysis-status; DESIGN stepper | Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat | Foreslått minimal rekkefølge: Salgsoppgave → Kontroller tall → Kontroller rapport → Resultat. Samme tokens, originalvisning, fokus og kontroll; detaljredesign senere. |
| SPEC «Prioritert tillegg» og non-goals | FINN som prioritert videreutvikling, salgsoppgave utenfor | Ny datert retning prioriterer salgsoppgave; FINN utsettes. Historisk non-goal leses med dette eksplisitte unntaket. |
| Sprintregister/README | Gjeldende tidligere leveranse og bevis | Nå bare datert produktstatus/planpekere; ingen nye done-markeringer. Etter D1–D3: legg Epic 6 og 6.1–6.5 i backlog; etter implementering oppdater faktisk kjøreoppskrift og nytt testbevis. |

Detaljerte kontrakter, feil-/grensematrise og alle SO-AC er i
[implementeringsspecen](../implementation-artifacts/spec-salgsoppgave-input.md).
Datert henvisning er lagt i primærartefaktene; gammel tekst/akseptanse er
bevart. Dette gir én aktiv endringsbeskrivelse uten å omskrive historisk bevis.

## 5. Implementeringsoverlevering

**Mads/produkteier:** avgjør D1–D3. Produktretningen trenger ingen ny
godkjenning. Dersom OCR eller automatisk vedleggsutpakking ønskes nå, må
spec/ressursmodell konkretiseres på nytt før kode.

**PM/arkitektansvar:** innarbeid godkjent teknisk profil i operative
kontrakter og Epic 6, med eksisterende finans-/screeningregler låst.
**Utvikler via bmad-build:** 6.1–6.5 i specens rekkefølge med syntetiske
originaler/fasit og deaktivert ny live-gate. **Uavhengig reviewer:** vurder
kontraktmigrasjon, kildebelegg, dekning, duplikater, kostnadsvern og
regresjon; triager alle funn før ferdigpåstand. Ingen ekstern melding sendt.

Suksess: automatisk synlige kontrollerbare felt med minst mulig nødvendig
supplering; korrekt fysisk originalside; ingen doble beløp/funn eller
oppdiktede TG2/TG3; mangelfull rapport kan ikke gi komplett screening;
finansregler, FINN og offline demo består. Ny full brukerflyt, feil-/store
PDF-prøver og meningsfulle regresjoner skal dokumenteres på faktisk kode.

## 6. Correct Course-sjekkliste og arbeidsstatus

| Punkt | Status | Resultat |
| --- | --- | --- |
| 1.1 | [x] | Trigger er ny produktbestilling, med FINN-1/2 som nærmeste leverte arbeid; ingen gammel story feiler av denne grunn. |
| 1.2–1.3 | [x] | Strategisk endring og konkrete kode-/fixturebevis dokumentert. |
| 2.1–2.5 | [x] | Alle fem epics vurdert; ny Epic 6 foreslått, FINN utsatt, gammel status/bevis bevart. |
| 3.1–3.4 | [x] | PRD/arkitektur/UX/SPEC, tester, README og leveringsbevis vurdert. Ingen ny CI-/driftsplattform nødvendig. |
| 4.1 | [x] | Direkte utvidelse vurdert som gjennomførbar etter portavklaring; innsats/risiko angitt. |
| 4.2 | [N/A] | Rollback vurdert og forkastet; intet levert arbeid må fjernes. |
| 4.3–4.4 | [x] | Første støtteprofil avgrenser OCR/vedlegg; anbefalt direkte justering med nytt scope-tillegg. |
| 5.1–5.5 | [x] | Problem, påvirkning, før/etter, spec/AC og ansvarlig overlevering levert. |
| 6.1–6.2 | [x] | Sjekkliste og kildeavstemming dokumentert; uavhengig review/resultat lenkes i verifikasjonen. |
| 6.3 | [!] | Retning er eksplisitt vedtatt, men tekniske D1–D3 er ennå ikke godkjent. Stopp før produktimplementering. |
| 6.4 | [!] | Ikke legg ubesluttede stories i aktiv sprint nå. Foreslått Epic 6 + 6.1–6.5 får backlog etter vedtak; gammel sprintfil beholdes. |
| 6.5 | [x] | Roller, rekkefølge, suksess og neste beslutning er konkrete; ingen annen person eller agent er tildelt implementering uten avklaring. |

BMAD-analysen og forslaget er levert. Workflowens implementeringsgodkjenning
og gjennomføring er fortsatt åpne; ingen fullført produktleveranse påstås.
