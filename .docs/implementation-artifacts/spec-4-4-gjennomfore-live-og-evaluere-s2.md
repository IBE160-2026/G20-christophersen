---
title: 'Story 4.4 — Ekte live-uttrekk og S2'
type: 'chore'
created: '2026-10-23'
status: 'done'
route: 'dispatch'
baseline_commit: 'd378399f8637b8b1feb7418646d745aee245c4ca'
review_loop_iteration: 1
context:
  - '{project-root}/.docs/planning-artifacts/r1-live-ki-semester-v1.md'
  - '{project-root}/.docs/implementation-artifacts/epic-4-context.md'
  - '{project-root}/.docs/implementation-artifacts/story-4-4-checkpoint.md'
---

<frozen-after-approval reason="Brukerens uttrykkelige gjenopptaksbestilling og eksisterende AC autoriserer gjennomføringen">

## Intent

Gjennomfør eksisterende Story 4.4 AC1–AC6 i epics.md: ekte produksjonsadapter på F1–F4 og vurder originaluttrekk mot uendret dokumentfasit. F1/F2/F4 skal gjennom bygget hovedflyt med reell kildekontroll og riktig kodebestemt resultat. F3 kjøres ved adaptergrensen med L fortsatt null. Bevar originale leverandør-/adapterutfall før brukerretting.

## Boundaries & Constraints

**Always:** Brukerens manuelle kontroll 2026-10-23: prosjektforbruk USD 0, hard spend limit USD 2, prepaid USD 5. USD 2 beholdes som strengere operativ grense innen R1 USD 20. Minimalkallet er allerede fullført: preflight-result.json har HTTP 200, 5000 RPM/1000000 TPM, 9 input/5 output, USD 0.000068. Det må IKKE gjentas. Bare én betalt forespørsel av gangen, også på tvers av prosesser. Før hvert nytt kall dokumenteres hash, versjoner, pris, kostnad hittil og full konservativ reservasjon; stopp ved risiko eller ukjent belastning. Reservasjon USD 1.48 per fixture bygger på 100000 input og 128000 output inkl. reasoning; bekreft at serialisert liten request er godt innen inputreservasjonen uten å påstå eksakt lokal tokentelling. Avstem faktisk usage etter hvert kall før neste. Ved feil/timeout uten usage beholdes full reservasjon som ukjent og STOPP. Modell gpt-6.1-sol/low/default, ett forsøk, 120 s frist, strict schema, prompt/schema 1/1 og kontrakt 2/1 bevares. Standardpris kontrolleres mot OpenAI Docs: input USD 2/M, cached USD 0.10/M, cache-write USD 2.50/M og output USD 10/M; langkontekstpriser ved >272000 input. Registrer cachefelter og service tier. Kilde-/sidekontroll gjelder fysisk PDF-side; F4 TG3 er side 4, trykt 2.

**Never:** Ingen 4.5/S5-måling, automatisk retry, ny modell, endret fasit, prompt/schema/outputtak eller låste krav. Ingen secrets i logger, browsermiljø, byggeutdata, Git eller frontend. Ingen push eller commit fra implementeringsagent; root committer etter kontroll. Ingen betalt API i vanlig testsuite. Usporede JSONL-økter beholdes urørt. Ikke kall kontrolladapter/demodata live-bevis.

## I/O & Edge-Case Matrix

| Scenario | Input | Forventet | Feilhåndtering |
|---|---|---|---|
| AC1/2 | F1–F4, låst fasit, hash og versjoner | Ett originalt live-uttrekk per case, usage, headere og terminalutfall | Stopp ved billing/rate limit/budsjettrisiko; ingen retry |
| AC3/4 | Originale funn og forhåndsfasit | TG2 minst 90 %, alle TG3 på riktig side, ingen oppdiktede | Registrer oversette/feil side/usikkerhet; ingen etterretting teller |
| AC5 | Feil eller manglende bevis | Ærlig avvik og versjoner | Ikke erklær fullt verifisert |
| AC6 | F1/F2/F4 hovedflyt og F3 adapter | Gå videre/Forkast/Innhent mer informasjon; F3 L=null | Ingen S5-påstand eller omgåelse av tallkrav |

</frozen-after-approval>

## Code Map

- `src/backend/analysis/{backend-config,live-request,live-adapter}.ts`: produksjons-SDK, settings, schema/prompt, 128000 outputtak. Gjenbruk uendret.
- `src/backend/http/{analysis-route,pipeline-child,run-pipeline}.ts`: ekte router/dokumentarbeid/adapter; eksisterende betrodd `transportModule` kan observere ekte fetch. Ingen kontrollretur. Fang request/body/headere med allowlist og skriv bevis før cleanup. Aldri headers med Authorization.
- `tests/e2e/screening-result.spec.ts`: gjenbruk felt-/kontrollhandlinger og forventede økonomiske resultater; erstatt fixtureadapter med ekte produksjonsadapter. F1/F2/F4 skjermkontrolleres og original PDF ses før bekreftelser. Visuell inspeksjon av lagrede screenshots følger hos root.
- `src/backend/documents/{validate-pdf,extract-pdf}.ts`, `analysis/analyze-document.ts`: F3 ekte PDF.js og produksjonsadapter uten falsk finansstart.
- `tests/fixtures/property-cases/{expected.json,sha256.json,README.md}`: uendret fasit og fiktive PDF-er. Bevar hash av fasit før og etter.
- `.docs/implementation-artifacts/story-4-4/`: preflight og plan finnes allerede; legg til forsøksplan, originale svar, adapterutfall, kontrollbevis og regnskap.

## Tasks & Acceptance

- [x] `.docs/implementation-artifacts/story-4-4/`: plan, rapport-/fasithash, versjoner og reservasjoner før sekvensielle F1–F4; capture av alle originale terminalutfall, tokens, faktisk kostnad og headere.
- [x] Fullstendige reelle hovedflytbevis F1/F2/F4 samt F3 ved adaptergrensen uten å endre L. **Lukket 2026-10-27: nye separate originale F1/F2-sluttforsøk; historisk F1 replay/ufullstendighet og F2-feil bevares urørt.** Ingen nye produktfunksjoner. Kjøringer må ikke kunne startes av npm test; dokumenter eksplisitt engangskommando.
- [x] `.docs/implementation-artifacts/story-4-4-verifikasjon.md`: vurder hvert originalfunn semantisk mot fasit og PDF, TG2/TG3-tellere, feil/oversette og S2. Forklar automatiserte UI-handlinger kontra menneskelig/agentkildekontroll, ingen S5.
- [x] `.docs/process/arbeidsokter/2026-10-23-story-4-4-live.md`: bestilling, valg, kommandoer, alle forsøk og resultat.
- [x] Kontroller RT-16–RT-18-evalueringsmetode (9/10 TG2 +2/2 TG3 består; manglende TG3, feil side under terskel, oppdiktet eller 8/10 består ikke). Ingen testenhet som later som betalt modellkvalitet.
- [x] Relevante eksisterende tester, typecheck/lint/build; root tar uavhengig evaluering/review og lokal commit. Status til in-review/review bare etter fullført bevis.

**Acceptance Criteria:** Given eksisterende AC1–AC6, when originale live-bevis evalueres, then alle forsøk/kostnader og hvert TG3 etterprøves og S2 rapporteres ærlig uten brukerretting eller fasitendring.

## Implementation Notes

Ingen intentgap; betalte kall er uttrykkelig autorisert med USD 2 tak. Brukeren har allerede bestilt gjennomføring fra eksisterende checkpoint/AC; ingen ny godkjenningsrunde. Avgrenset footprint til evalueringshjelpere/bevis, ingen produktendring forventet. Node 24.21.0: /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin. Playwright-cache: /private/tmp/ibe160-story-3-5-browsers. Trygg terminalutføring uten rå feilutskrift eller trace som kan inneholde secrets. Preflight-plan/result er rootens første betalte forsøk, som skal inngå i regnskapet.

## Verification

Kjør eksisterende unit/integrasjon og meningsfulle evalueringsprøver uten nøkkel/nett; kjør typecheck, lint og build. Root utfører uavhengig S2-kildekontroll og endelig regresjon. Dokumenter kommandoer og faktiske resultater. Ta screenshots og gjennomgå original rapporttekst før bekreftelse; ingen tidspåstand.

Implementering gjennomført med originale live-bevis. Uavhengig evaluering bekrefter S2, men AC6 er delvis: F1/F2 gir ekstra ufullstendighetsårsaker fra generelle limitations, og F1s sluttkontroll er kun replaybevist. Story klargjøres til review med dette åpne avviket, ikke done. Ingen nye betalte forsøk planlegges. Root kjører full regresjon og review.


## Review Triage Log

Tre uavhengige reviewlag er kjørt mot `/private/tmp/story44-live-review.diff`.
Verifikasjonslaget fant ingen verifikasjonsgap. Blindlaget leverte ti funn,
kanttilfellelaget fire. Hvert funn er vurdert separat før gruppering.

| ID | Dom/rute | Selvstendig bevis og håndtering |
|---|---|---|
| B1 | medium / defer | Preeksisterende finding-control gjør alle limitations til incomplete-report. Reelt F1/F2-avvik bekreftet i originaler og screenshots; registrert i deferred-work med krav om offline-regresjon ved senere produktretting. AC6 forblir åpen. |
| B2 | medium / dokumentpatch | F1-receipt sier uiControlCompleted=false, og bare replay har fullstendig sluttbevis. Rapporten beholder dette som åpen akseptanse; historisk bevis kan ikke rekonstrueres ved ny påstand. Eventuelt senere eksplisitt budsjettavklart forsøk må få ny identitet, ikke overskrive F1. Ingen ny betalt kjøring utføres her. |
| B3 | high / patch | replay-control F3 hoppet over nøkkel/lås og gikk inn i ekte F3-adaptergren. Kombinasjonen avvises før backend; offline-prøve krever null dispatch/fetch. |
| B4 | high / patch | reconcile fjernet delt lås uten eierkontroll. Ny eier-/forsøksbinding kreves før fjerning; samtidige feil kan ellers slippe gjennom. Offline-prøver dekker feil eier. |
| B5 | medium / patch | listen-promise hadde ingen error-lytter; EPERM gikk utenom catch. Promise avvises ved serverfeil, med bevart feilbevis/cleanup. |
| B6 | high / patch | S2-hjelper telte bare innsendte vurderinger; utelatt TG3-rad ga 0=0. Separat forhåndsfasit og eksakt ID/graddekning kreves; negative prøver for utelatte/ekstra/feil grader. Faktisk uavhengig S2-vurdering hadde alle fem fasitfunn og påvirkes ikke. |
| B7 | low / patch | Ubrukt corrections-objekt testet ikke en reell rettingsgrense. Fjernes; dokumentasjon begrenses til originalvurdering uten rettingsargument og inputimmutabilitet. |
| B8 | high / patch | Sann usage-test kunne godta NaN/negative kostnader og frigjøre lås. Tokens og kostnader valideres før kvittering/regnskap/frigivelse; ugyldig historisk kvittering avvises. Faktiske fem svar har gyldige heltall og avstemte summer. |
| B9 | medium / dokumentpatch | Produktcommit og request/prompt/schema er dokumentert, men tidligere hjelperversjoner er ikke hashet før forsøk. Ny hash ved senere prepare og sluttmanifest gjør framtidig kjøring sporbar; historisk mangel oppgis uttrykkelig og ingen plan originalendres. |
| B10 | medium / patch | s2-assessment/rapport hadde foreldet pending-tekst, og oppgavestatus kunne tolkes som full AC6. Referanse til ferdig uavhengig rapport og tydelig skille mellom gjennomført evaluering og åpen akseptanse rettes. |
| E1 | high / patch, samme rot som B3 | F3 replay kunne gå til produksjonsfetch uten lås, verifisert i action/id-gren. Samme avvisning og null-kall-prøve som B3. |
| E2 | high / patch, samme rot som B6 | Manglende forventet TG3-rad forsvant fra denominator; separat full fasit og dekning som B6. |
| E3 | medium / patch, samme rot som B5 | Asynkron serverfeil gikk utenom catch. Samme listen-avvisning/feilbevis som B5. |
| E4 | medium / avvist som spec-only retting | Den avkryssede hovedflytoppgaven var misvisende, verifisert mot F1 receipt. Workflow avviser funn hvis eneste retting er spec; root har uansett synkronisert faktisk oppgavestatus ved egen akseptansekontroll. Åpen AC6 er bevart og ikke erstattet av replay. |

Bare evalueringsverktøy og dokumentasjon patches. Bevar alle originale live-
request/provider/outcome/receiptfiler og fasit. Ingen produktkode eller nye
betalte forsøk. Brukerens sluttstatus review overstyrer workflowens normale done.

### Sluttkontroll av rettinger

Root har lest de endrede hjelpefilene og etterprøvd alle 13 avgrensede prøver
uten nøkkel og med OS-sperret eksternt nett. Hjelperl lint/syntaks bestod.
Alle faktiske originalbrukstall/hash er avstemt på nytt; total USD 0.016072.
Full produktregresjon før verktøypatch: typecheck/lint/build, 1059 unit/integrasjon,
189 bygget-app, 3 dev og 37 komponenttester bestått, buildgrense 204 filer/0
nøkkellekkasjer. Ingen produktkode/fixtures er endret av patchen.
Se [rootens sluttkontroll](story-4-4-sluttkontroll.md) og
[integritetskontroll](story-4-4/root-integrity-check.json).

B3–B8 og E1–E3 er lukket i verktøyene. B2/B9/B10 er håndtert med korrekt
bevis-/statusavgrensning. B1s eksisterende produktavvik er sporet, og F1s
opprinnelige sluttflyt er fortsatt et bevisforbehold. Full AC6 er ikke krysset
av. Story 4.4 er review etter brukerens bestilling, Story 4.5 backlog.

### Gjenopptatt kontroll 2026-10-24

| ID | Dom/rute | Selvstendig bevis og håndtering |
|---|---|---|
| B1 | medium / defer | carried: Samme ubetingede mapping av limitations i finding-control består. 51 målrettede produktprøver er grønne; separat sekvensiell reviewer bekrefter at kontrakt/state mangler en avklaringshandling for generelle begrensninger. Ingen automatisk tekstklassifisering eller tilsidesettelse er innført. Eksisterende defer-entry beholdes uten duplikat. |
| B2 | medium / dokumentpatch | carried: F1-receipt har fortsatt uiControlCompleted=false; komplett sluttflyt finnes bare som replay. Historisk bevis kan ikke produseres offline. Ny rapport presiserer at eventuelt nytt sporbarhets-/budsjettavklart forsøk først vurderes etter trygg løsning av B1. |

Se [gjenopptatt AC6-review](story-4-4-gjenopptatt-review-2026-10-24.md).
13 S2-/sikkerhetsprøver består på nytt uten nøkkel med OS-nettsperre.
Ingen nye live-kall, kostnad USD 0. S2-originaler og eksisterende positive
resultater beholdes. Produktretting krever eksplisitt valg av hvordan generelle
begrensninger kan avklares uten å skjule reelle mangler. AC6 er fortsatt åpen;
spec/sprint forblir in-review/review, ingen done-påstand.

### Godkjent tilleggsbeslutning 2026-10-24

Brukeren har eksplisitt godkjent en separat vurdering av generell
rapportbegrensning. Denne nyere bestillingen overstyrer tidligere avgrensning
om ingen produktfunksjon for den konkrete B1-rettingen; originalt frozen-innhold
beholdes som historikk. Se [beslutning og implementeringsplan](story-4-4-begrensningsvurdering-2026-10-24.md).

- [x] Kontrakt/domain/state/UI: eksplisitt brukerbekreftet vurdering per generell begrensning, original/årsak/revisjonsbinding og ingen generell blocker-override.
- [x] Målrettede tester: tom/stale begrunnelse/binding, revisjonsendringer, originalbevaring, resultatsnapshot og fortsatt typed/kritisk blokkering.
- [x] Offline replay av originale F1/F2 for riktig kodeutfall uten nye modellkall; F4s TG3 Uavklart består.
- [x] Uavhengig B1-review bestått; B2/AC6 lukket med nye originale F1/F2-live-bevis og ny uavhengig sluttreview 2026-10-27.

Implementeringscheckpoint: build/typecheck/lint bestått, 136/136 målrettede
unitprøver og 6/6 bygget-app-originalreplay-prøver bestått med OS-nettsperre
og uten nøkkel. 77 originale/fasit-/modellkontraktfiler er byteidentiske mot
HEAD. B1-produktrettingen er klar til ny uavhengig review, B2 forblir åpen.
Ingen nye live-kall, ingen done-påstand. Se beslutningsfilens faktiske bevis.

### Sluttrunde 2026-10-27 — ny original F1 og verifisert F2-rest

Fersk Mads-kontoavstemming: USD2-grense, før forsøket USD0.016072 og ingen
andre/uavklarte belastninger. Nytt faktisk F1-B2-2026-10-27-01 har fullført
original live-hovedflyt, kildekontroll og Gå videre med korrekte nøkkeltall;
1 kall/0 retry, USD0.003486, samlet USD0.019558, eksplisitt avstemt/fri lås.
Se [ny sluttkontroll](story-4-4-b2-sluttkontroll-2026-10-27.md). Gamle bevis og
benchmark er urørt. Ingen menneskelig S5 eller benchmarkanalyse er startet.

Uavhengig verifikasjonsreview avdekket at F2-originalens feilutfall fortsatt
hindrer full AC6. Offline-replay kan ikke erstatte korrekt faktisk F2-live-
sluttbevis. Kjør derfor ett separat F2-B2-2026-10-27-01 etter samme trygge
forhåndsplan/ny reservasjon og rootkildecheckpoint; ingen automatisk retry.
Dette er innen eksisterende godkjente F1–F4-scope, ikke endret låst krav.
Før neste kall skal ledger inkludere faktisk avstemt F1-B2-kostnad.

- [x] Nytt originalt komplett F1-live-sluttbevis og faktisk usage-avstemming.
- [x] Rett verifiserte helperfunn om opprydding/receipt, gjentatt run/lås,
  gjenopptakbar avstemming, full ledger og eksakt originalresponsbevaring;
  kjør målrettede offlineprøver og uavhengig rekontroll.
- [x] Nytt originalt korrekt F2-live-sluttbevis, kildekontroll og avstemming.
- [x] Endelig uavhengig samlet AC-review og korrekt done/sprintoppdatering.

### Reviewtriage 2026-10-27

Tre ferske reviewagenter ble kjørt sekvensielt: blind (7 funn), edge (ingen),
verification-gap (ett forhåndsverifisert gap og én AC6-rest). Hvert funn er
vurdert før gruppering; ingen nye betalte kall for å teste verktøyrettingene.

| ID | Dom/rute | Verifisert forhold / avgjørelse |
| --- | --- | --- |
| N1 | medium / patch | Receipt skrives etter cleanup; browser.close-feil kan hoppe over kjent kostnad. Isoler cleanup og skriv receipt uansett. |
| N2 | medium / patch | Ny lås kan opprettes før eksisterende started avviser gjentatt run. Varig startmarkør må sjekkes før lås. |
| N3 | medium / patch | Reconciled wx før release kan blokkere ny avstemming ved avbrudd. Gjør samme eier/receipt-validerte avstemming gjenopptakbar. |
| N4 | high / patch | Historisk ledger utelater ny faktisk F1-B2-kostnad og vil gi feil grunnlag for senere 4.5. Felles validert ledger må telle nye forsøk og stoppe ukjente. |
| N5 | medium / patch | Generisk stadium alene mister hvilken UI-forventning som feilet. Bevar trygg feiltype/konkret renset forventning uten secrets/rå providerbody. |
| N6 | medium / patch | Ingen direkte offline receipt-/cleanup-/reconcile-prøver; legg til relevante negative/gjenopptakbare scenarioer med falske avhengigheter. |
| N7 | low / patch | Temp-rålogger er ikke varige. Bevar relevante hemmelighetsfrie regresjonslogger/oppsummeringer i repo. |
| V1 | medium / patch | Transportprøven kunne miste hele output og fortsatt bestå statusassert. Krev særpreget faktisk output og eksakt returnert/lagret body. |
| V2 | medium / bad_spec | Egenkontrollens AC6-vurdering godtok F2-replay som nok. Riktig faktisk F2-live mangler; planen er korrigert til separat nødvendig forsøk. Bevar alt fungerende produkt, F1-original, opprinnelig S2/fasit, benchmark, full regresjon og eksplisitt kritisk vern. Ingen produktkode re-deriveres. |

2026-10-27 etter implementering: N1–N6/V1 rettet med nye offlineguards og
26/26 grønne målrettede prøver; N7 med varige rålogger. V2 nå dekket av
faktisk original F2-live til Forkast, uicompletedtrue, kost0.003534 og
samlet0.023092, avstemt eid lås. Ingen ny produktkode. Begge nye originaler,
S2 og benchmark bevares; endelig uavhengig rekontroll gjenstår.

### Sekvensiell sluttreview, runde 2

Blind (8), edge (2) og verifikasjon (ingen gap) er ferdig før triage.
Verifikasjonsagenten bekreftet alle AC1–AC6 med ekte nye F1/F2-bevis; ingen
F2-replay-rest. Gjenværende funn er avgrenset helperrobusthet/dokumentasjon.

| ID | Dom/rute | Selvstendig verifikasjon / avgjørelse |
| --- | --- | --- |
| R2-B1 | medium / patch | Receipt-feil før cleanup-løkken kan hoppe over browser/router/server; cleanup må forsøkes uansett. |
| R2-B2 | medium / patch | Sekvensielt await på hengende browser.close hindrer øvrig cleanup. Start uavhengige cleanupforsøk med avgrenset venting. |
| R2-B3 | high / patch | Ugyldig cumulativeProjectUsd blir NaN i differansen og kan slippe gjennom. Krev validCost før sammenligning. Faktiske receipts er gyldige. |
| R2-B4 | medium / patch | costBeforeUsd mangler eksplisitt finite-guard i eksportert reconcile; NaN kan omgå kontroll. Avvis manglende/ugyldig verdi. |
| R2-B5 | low / dokumentpatch | Lagret provider.json er komplett parset JSON, ikke eksakte wirebytes. Presiser format; ingen rekonstruert historisk råbody eller nytt kall. |
| R2-B6 | low / dokumentpatch | 26-prøvers kjørebevis er ikke lagret ennå og tidligere regresjons-JSON sier 7. Bevar ny målrettet etterpatchlogg og eget datert tillegg med faktisk antall. |
| R2-B7 | false | Samlet final-integrity-2026-10-27.json finnes allerede med begge forsøks-IDer og riktig total0.023092; den gamle rapporten er F1-checkpoint. Ny dokumentlenke gjør forskjellen eksplisitt, originalfilen omskrives ikke. |
| R2-B8 | medium / patch | ExcludeF1 gir kjedebrudd når F2 senere finnes; gjentatt historisk reconcile må validere hele kjeden og hente mål-forsøkets førkost, uten å utelate faktiske belastninger. |
| R2-E1 | medium / patch, samme rot R2-B1 | Egen edge-agent bekrefter kast før cleanup. Samme receipt/uansett-cleanup-retting. |
| R2-E2 | high / patch, samme rot R2-B3 | Egen edge-agent bekrefter manglende kumulativt felt passerer NaN-sammenligningen. Samme validCost-retting. |

## Endelig akseptanse 2026-10-27

**Done.** [Uavhengig sluttreview](story-4-4-b2-uavhengig-sluttreview-2026-10-27.md)
bekrefter samtlige AC1–AC6 og alle siste verktøyrettinger. Begge reviewrunders
verifiserte funn er lukket; ingen nye åpne 4.4-funn. Rootens fulle produkt-
regresjon er grønn og siste avgrensede etterpatchregresjon er 44/44.
F1/F2 viser korrekt faktisk originalt live-sluttutfall (Gå videre/Forkast),
F4/F3 og original S2 er bevart. Ingen replay brukes som erstatningsbevis.
Nye to kall kostet USD0.007020, samlet avstemt USD0.023092; ingen ukjent
belastning eller aktiv paidlock. Samtlige 87 beskyttede filer er uendret.
Epic4 forblir in-progress fordi 4.5 mangler menneskelig S5 og review.
4.5 kan nå klargjøres, men ingen S5-B1-v1-KI eller menneskemåling er startet.
