---
title: 'Avgrenset ekte økonomiprøve med trygg PDF- og kostnadsport'
type: 'bugfix'
created: '2026-10-30'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '58f11cfd9e3d25481ed3a385464e31aec4b1df1c'
context: []
---

<frozen-after-approval reason="Brukerens eksplisitte implementeringsbestilling 2026-10-30 autoriserer økonomiprøven; ingen ny designrunde">

## Intent

Klargjør første ekte prøve av økonomiske opplysninger og dokumenterte begrensninger
fra eksplisitt valgte fysiske sider. Teknisk/TG-dekning forblir uavklart og kan
aldri bekreftes av denne prøven. Rett de påviste PDF-statusfeilene uten å skjule
raster, grenseoverskridelser eller ukjente strukturer. Stopp for brukerens
fasitgodkjenning og senere særskilt betalt testgodkjenning.

## Boundaries & Constraints

Behold Sol/low/global Standard, USD 0,20 samlet med separat rapport, ingen
finans-/screeningendring. Ingen ekte nettverks-/count-/genereringskall, nøkkellesing,
push eller private dokumenter i Git. Ikke fabriker uavhengig fasit/attestasjon.
Gjenbruk PDF.js, opprinnelig tekst og fysiske sider, kilde-/økonomiskjema,
SDK-wire/count og varig AnalysisBudgetStore. Alle sider skal beholdes lokalt;
kun eksplisitt valgt lesbart tekstgrunnlag sendes i foreslått request. Perfekt OCR
eller grønn teknisk dekning utenfor prøveutvalget kreves ikke for økonomiprøven.

Ukjent count-pris må fortsatt stoppe **før** nettverk. Offisiell dokumentasjon
etablerer ikke gratis count; implementering kan ferdigstille sikre avhengigheter,
men må rapportere denne eksterne prisporten ærlig. Ikke finn på pris, dollar-cap,
modelltokenizer, tellerframing eller kontogrenser. Maks output inkluderer reasoning.
Ingen verktøy, filer, bilder, historikk, automatisk retry eller separat rapportkall.

## I/O & Edge-Case Matrix

| Scenario | Forventning |
| --- | --- |
| Gyldig PieceInfo/Group med vanlig tekst | Lesbar tekst; kjent metadata skjuler ikke innhold |
| Feil metadata/ukjent nøkkel/AP/XFA/referanse | Fortsatt usikker/sperret; raster beholdes |
| Inflate over 1 MiB | Egen grenseårsak, bevart tekst/side, ikke damaged/blank/readable |
| Virkelig korrupt strøm | Fortsatt skadet/uleselig/ufullstendig |
| Lesbare valgte økonomisider, usikre kart/rastersider ellers | Avgrenset request tillatt klargjort, alle utelatte sider regnskapsført, TG uavklart |
| Ulest valgt side/endrede bytes/kildeoffset | Stopp før request/generering |
| Manglende fasitgodkjenning eller livegodkjenning | Klargjort pakke, null nettverk |
| Ukjent pris/telling/historikk eller USD 0,20 overskrides | Null generering, ingen stille avkorting/ny kvote |

</frozen-after-approval>

## Code Map

- `src/backend/documents/pdf-extraction-worker.ts`: PieceInfo/Group skal valideres
  eksplisitt, ikke bare legges blindt til generell allowlist. Metadata malformet,
  ekstra ukjente felter og uavklarte refs skal forbli unknown. Group krever kjent
  Transparency-struktur; faktisk ICCBased fargerom krever gyldig ICC stream/N.
- `pdf-extraction-core.ts`: kun ERR_BUFFER_TOO_LARGE blir limit, andre feil damaged.
  Intern limit-status kan bli offentlig unknown med konkret årsak; ikke øk grensen.
- `src/backend/import/semantic-request.ts`, `budget.ts`, `token-count.ts`,
  `live-preflight.ts`, `analysis-budget-store.ts`: eksisterende hele request-
  digest, strict schema, datert maksimumspris, varig felles kvote og stengte porter.
- `representative-intake.ts`/`prepare-live-test.ts`: behold den eksisterende komplette
  kvalitetsprøven uendret. Ny liten eksplisitt økonomiprøve er et separat scope,
  ikke en omgåelse som kan få komplett TG-status.
- Ny `economy-trial.ts` (eventuelt liten requestmodul): privat klargjøring av
  valgte sider med kildeankere og maskinelt foreslått fasit uten attestasjon.
  Gjenbruk kilde-/økonomikontrakter; rå kvartal/mva/avvik må bevares, ingen regning.
- Root lager faktisk privat fasitoversikt og prosessbevis. Implementeringsagent
  endrer ikke `private/`, prosesslogg, sentral deferred eller eksisterende fasit.

## Tasks & Acceptance

- [x] Worker/core og syntetiske tester: eksplisitt sikre metadata og dekodingslimit.
- [x] Økonomiprøve-modul og offline-tester: valgt tekst, komplett fysisk ledger,
  separat teknisk usikkerhet, request/schema/digest/kildevalidering og godkjenningsport.
- [x] Gjenbruk/utvid kostnadsvakter for økonomirequesten med konservativ reserve;
  bevar ukjent count-prisstopp. Hvis dokumentert countpris senere oppgis, må gebyr
  reserveres varig under samme kvote før count; ingen rabatt eller gratisantakelse.
- [x] Root: privat enkel fasit for brukerens angitte sider, kildesjekk, nødvendig
  full test/build/lint, uavhengig BMAD-review og lokal commit med aktiv promptlogg.

AC1: Gitt gyldig metadata, når PDF leses, da er tekststatus korrekt og skadelig/
ukjent sideinnhold fortsatt sperret, også på blank-/rastersider.
AC2: Gitt avgrenset økonomiprøve, når pakken bygges, da beholdes hele sideregnskapet
og eksakte originale kilder, og ingen usendt side/TG-dekning erklæres ferdig.
AC3: Gitt endret request, manglende godkjenning, uviss pris/telling/historikk eller
for stort samlet maksimum, når kjøring vurderes, da kan ingen generering utføres.
AC4: Gitt fasitoversikt, når bruker får den, da er tall/avvik/perioder/mva og
manglende opplysninger tydelige, uten automatisk menneskelig godkjenning.

## Implementation Notes

Ett brukerrettet mål, ingen irreversible handlinger i denne økten. Brukeren har
allerede valgt avgrenset scope og bedt om ingen ny omfattende planrunde; denne
korte interne specen dokumenterer bestillingen uten ny designgodkjenningsport.
Implementering sekvensielt hos én agent; root klargjør kun privat kontrollgrunnlag
og gjennomfører integrasjon/review. Ny live-transport behøver ikke åpnes nå;
ferdig offline preflight skal være konkret og ærlig sperret frem til godkjenning.

## Spec Change Log

## Review Triage Log

Individuell triage av B1–B8, E1–E3 og V1 er dokumentert i
[samlet reviewbevis](salgsoppgave-economy-trial-2026-10-30/review.md). Alle er
verifisert medium og rettet som direkte implementerings-/testpatcher; ingen
ny produktbeslutning eller endring av frosset intent kreves.

## Verification

Pinned Node24.21.0/npm11.19.0. Syntetiske metadata/limit-/scope-/godkjennings-/
budsjettester; full npm test, build/typecheck og lint. Frossen finans/historikk og
original/private fasitattester bevares. Ingen appdata fra ekte dokument i testrepo.

## Sluttstatus

Offline klargjøring er ferdig: 1506/1506 tester, bygg/typecheck og lint består.
Alle tre uavhengige review-nykontroller er uten restfunn etter 14 rettede funn.
Menneskelig fasitgodkjenning og faktisk kostnads-/live-port er fortsatt åpne;
status done gjelder klargjøring, ikke betalt AI-test eller komplett TG-analyse.
[Endelig verifikasjon](salgsoppgave-economy-trial-2026-10-30/verifikasjon.md).
