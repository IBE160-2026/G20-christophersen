---
title: 'PAA-SO1: godkjent offline implementering'
type: 'feature'
created: '2026-10-28'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '9f49aa083b3fdd65cf0765119c33b6aa34a115bc'
implementation_commit: 'c516b8682ae0bac9d38a10a064dcedc9984e5167'
context:
  - '{project-root}/.docs/implementation-artifacts/spec-salgsoppgave-input.md'
  - '{project-root}/.docs/planning-artifacts/sprint-change-proposal-2026-10-28.md'
---

<frozen-after-approval reason="Mads godkjente hele forslaget, specen og alle 15 AC 2026-10-28">

## Intent

Implementer hele den godkjente offline salgsoppgaveflyten og SO-AC1–15 i
[kravspecen](spec-salgsoppgave-input.md). Denne arbeidsplanen konkretiserer
filene uten å erstatte eller redusere de godkjente kravene.

## Boundaries & Constraints

Mads har godkjent D1–D3: 200 sider, fortsatt 50 MiB, forsvarlige ressursgrenser,
ingen OCR/vision, kombinert økonomi-/TG-uttrekk, integrert rapport og manuell
opplasting av faktiske PDF-vedlegg. Manglende rapport blokkerer ikke økonomi.
Bevar kildebelegg og fysiske sider; ingen gjetting eller skjult usikkerhet.

Bevar alle sidestatuser lokalt, men velg relevante økonomisider og hele
rapportområdet til kombinert uttrekksgrunnlag. Ikke send unødvendig hele
200-sidersfiler. Vis utelatte/uleste sider. Uavklart område kan ikke fullføres.
Ny live-grense er stengt; manglende pålitelig modelltilpasset lokal tokenteller
skal blokkere live. Ingen betalte kall, nettbasert token-count, push,
kundedokumenter eller endring av finans-/screeningregler og historisk S5/S6.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Dokumentgrenser | 30/31/50/100/150/200/201 sider, 50 MiB/+1 | Ny profil godtar innen grense; legacy fortsatt 30; samlet beholdt filbudsjett | Trygg avvisning, cleanup, ingen adapter |
| Dekning | Integrert/manglende/vedlagt/flere rapporter, raster/bunntekst | Økonomi uavhengig; eksplisitt teknisk dekning og kontroll av identitet/område | Ulest rapport kan ikke bekreftes eller skjules med tom funnliste |
| Kilde/funn | Fysisk10/trykt6, separat3/trykt1, duplikat/tolikebad | Eksakt hash/side/utdrag; ett forhold/flere belegg; ulike forhold består | Feil kilde/uklar identitet gir usikkerhet/sperre |
| Økonomi | Pris/gjeld/total, inkludert avgift, måneds-/årsposter, ukjent/konflikt/estimat | Fasiten i SO-AC7–10; automatisk ubekreftet utfylling; ingen dobbeltelling | Ukjent forblir ukjent, ingen avgifts-/driftsestimat |
| Økt | Rettelser, nyhash, sammehash, senretur, separat rapport | Manuelt eierskap, nullstilling ved nytt objekt, kontekstbundet gjenbruk | Gamle svar avvises; separat rapport bevarer økonomi |
| Ressurser | Timeout/abort/minne/tekst/token/svargrense | Reell stans og cleanup før lås frigis; ingen retry | Synlig kontrollert feil, ingen sensitive logger |
| Full flyt | Nøkkel/nett fjernet, tre syntetiske utfall | Opplasting → tall/finansiering → eksisterende TG-kontroll → eksisterende screening | Ny live kan ikke åpnes via gammel modus |

</frozen-after-approval>

## Code Map

- `src/backend/documents/validate-pdf.ts`: valgfri sideprofil, standard30 uendret; fysisk telling/hash/cleanup gjenbrukes.
- `pdf-extraction-core.ts`, `pdf-extraction-worker.ts`: opt-in bounded tekst under enqueue, rasterindikasjon og begrenset vedleggsmetadata. Pinned `catalog.attachments` gir metadata uten embedded bytes; ikke hent attachmentContent.
- `src/contracts/document-analysis.ts`, `analysis-validation.ts`: legacy completed/basis er max30. Gjenbruk DocumentPageSchema/getCandidateIssues/TG-klassifisering gjennom felles versjonsuavhengige kontrolltyper; ikke gi 200 sider versjon2/1.
- `src/backend/http/{receive-pdf,run-pipeline,analysis-route}.ts`: gjenbruk mottak, prosessisolasjon, absolute frister, duplikatvern og await-close. Ny importchild/-rute, delt prosesslås, RSS/heap, ingen disk.
- `src/domain/listing.ts`: faktoriser kildeuavhengig felt-/pris-/kostnads-/finansieringslogikk; FINN beholder URL-wrapper og atferd. `domain/financing.ts` har eksisterende formler.
- `src/frontend/{App.tsx,state/session.ts,analysis/report-client.ts}`: ny importstate/-klient før finansbekreftelse, hash/generasjon/abort og manuell beskyttelse. Ny salgsoppgavehash nullstiller hele objektet.
- `src/frontend/screens/{FinancialInput,ListingImport,ReportAnalysis}.tsx`: salgsoppgave først, FINN som bevart alternativ; del finansieringskontroller; kildevisning med eksisterende PdfViewer.
- `src/frontend/state/{report,result}.ts`, `src/contracts/finding-control.ts`, `src/domain/finding-control.ts`: felles kontrollutfall; uoverstyrbar dekning/identitet og resultatbinding; eksisterende funn/TG3/listekontroll.
- `tests/fixtures/sales-prospectus/{expected.json,sha256.json,*.pdf}`: uavhengig fasit og 13 syntetiske originaler. Bevar eksisterende fasit; nye nødvendige fixtures får egen fasit før adapterdata.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/*`, `src/backend/documents/*`, `src/backend/http/*`, `src/backend/server.ts` — ny versjonert import, grenser, kilde-/dekningstyper og lifecycle.
- [x] `src/domain/listing.ts`, nye kildeuavhengige domenehjelpere — økonominormalisering og gjenbruk uten FINN-regresjon.
- [x] `src/backend/analysis/*`, nye importmoduler — hash-/versjonsbundet offline adapter, selektivt kombinert requestgrunnlag, streng kilde-/TG-binding og stengt live.
- [x] `src/frontend/*`, delte kontrollkontrakter — full opplastingsflyt, automatisk utfylling, finansiering, originalkontroll, integrert/separat rapport, revisjonsvern og screening.
- [x] `tests/unit/*`, `tests/integration/*`, `tests/e2e/*`, syntetiske fixtures — dekk alle matriselinjer og SO-AC1–15 med uavhengig fasit, alle tre anbefalinger og legacy-regresjon.
- [x] `README.md`, `.docs/planning-artifacts/epics.md`, `.docs/implementation-artifacts/sprint-status.yaml`, sentral deferred-work og ny prosess-/verifikasjonsmappe — dokumenter faktisk støtte, godkjenning, kravspor og bevis uten å omskrive historikk.

**Acceptance Criteria:** Alle 15 Gitt/Når/Da-kriterier i kravspecen gjelder uavkortet.
Når nye implementeringsvalg ikke har synlig produktvirkning, avgjør og dokumenter dem.
Ved nye vesentlige produktvalg stopp med konkret anbefaling; allerede godkjent scope
eller denne arbeidsplanens lengde er ikke en ny godkjenningsport.

## Implementation Notes

2026-10-28: Før implementering er eneste dirty endring aktiv promptlogg, kontrollert
mot brukerens godkjenning. Én sammenhengende brukerleveranse, ingen migrasjon eller
irreversible eksterne handlinger. Eksisterende godkjent detaljspec beholdes som normativt
vedlegg; ingen ny redundant godkjenning kreves.

## Spec Change Log

## Review Triage Log

| ID | Linse | Vurdering | Funn / bevis | Rute |
| --- | --- | --- | --- | --- |
| B1 | blind-hunter | high | D får finansieringsåret i stedet for dokumentert kostnadsår. Autofill velger p.financing.year for begge felter; reproduksjon fra edge-review bekrefter 2026→2027. | patch |
| B2 | blind-hunter | high | Inline-bilder uten XObject kan unngå rasterflagget. Rasterkontrollen går bare gjennom Resources/XObject; BI-operatør i sidens innholdsstrøm inspiseres ikke. | patch |
| B3 | blind-hunter | high | Intern eiendomsmotstrid i integrert dokument kan bekreftes. Conflict beregnes bare ved separate utfall; comparePropertyIdentity(self,self) må også brukes på kandidater i samme original. | patch |
| B4 | blind-hunter | medium | Vedleggsmetadata kan motsies av tomme dekningslister. Schema kontrollerer lengde ved komplett rapport, men avstemmer ikke faktisk attachment-ID-sett. | patch |
| B5 | blind-hunter | high | Importerte kostnadsrader slettes også etter manuelt eierskap. Filteret fjerner import-prefiks uten å se manualFields, mens D/J-verdiene bevares. | patch |
| B6 | blind-hunter | medium | Urelaterte eksplisitte nullbekreftelser tømmes. autofill setter explicitZeros=[] selv når manuelt felt ikke erstattes. | patch |
| B7 | blind-hunter | medium | Eierform styrer ikke avgiftens relevanskontroll. Draftet mister eierform; dokumentavgiften behandles likt ved ukjent eierform/borettslag. Løs med eksplisitt brukerbegrunnelse, aldri lovtolkning eller ny avgiftsberegning. | patch |
| B8 | blind-hunter | medium | Feil separat rapport kan ikke fjernes til fordel for bevart integrert grunnlag. technicalImport foretrekker report.selected og eksisterende handlinger tømmer den ikke; lokal gjenoppretting kan bruke bevart uttrekk uten nytt kall. | patch |
| B9 | blind-hunter | medium | Belegg for eierform/identitet/område vises ikke ved kontroll. UI viser økonomifeltets kilder, men ikke ownershipSources/propertyIdentity/sections.basis. | patch |
| B10 | blind-hunter | medium | Review-snapshot mangler lenkede verifikasjons-/prosessfiler. Filene ble ferdigstilt etter snapshot, er nå kontrollert på disk og inkluderes i sluttstaging; lenkekontroll er grønn. | patch-resolved |
| E1 | edge-case-hunter | high | D-år samsvarer ikke med kildene. Uavhengig reproduksjon /private/tmp/so1-edge-repro.mjs bekrefter samme rotårsak som B1; beholdes som egen triagerad. | patch |
| E2 | edge-case-hunter | medium | end utenfor sidetekst godtas fordi slice klamper. Kildevalideringen har ingen end<=text.length; reproduksjon viser akseptert ugyldig suffix-range. | patch |
| V1 | verification-gap | medium | Tekstbudsjettets faktiske worker-/HTTP-kobling mangler grenseprøve. Pre-verifisert: helpertestene sender budsjettet selv og oppdager ikke fjernet worker-argument. | patch |
| V2 | verification-gap | medium | Aktiv import testes ikke med gyldig svar bundet til feil dokument/forelder. Pre-verifisert: eksisterende sene svar stoppes før metadata-mismatch-grenen. | patch |
| R1 | root-independent-pdf | medium | Inline-fixturens footerfont har ugyldig referanse; uavhengig pypdf feiler med KeyError('/Subtype'). Ressurser må klones, og readable footer + ulest raster testes separat. | patch |

2026-10-29: Alle registrerte funn er rettet og bekreftet gjennom tre fokuserte
uavhengige rechecks uten restfunn. Nye AC-bevis og full regresjon er lenket i
[leveringsverifikasjonen](salgsoppgave-implementation-2026-10-28/verifikasjon.md).
En UI-unit-test er skilt fra backendens TS-prosjekt med `.test.tsx`;
frontend-testprosjektet har JSX/DOM, mens backendens grenser bevares.

## Verification

Bruk pinned Node24.21.0/npm11.19.0 under `/private/tmp/ibe160-story-1-1-runtime`.
Kjør relevante nye tester først, deretter `npm test`, `npm run build`, `npm run lint`
og nødvendige Playwright-flyter med offline modus og tom OPENAI_API_KEY.
Browsercache: `/private/tmp/ibe160-story-3-5-browsers`. Loopback-tester kan kreve
sandboxeskalering. Oppbevar nye rå bevis i egen salgsoppgave-implementeringsmappe.
Utfør uavhengig BMAD-review, korriger funn, dokumenter AC-bevis og lokal commit med
aktiv promptlogg. Ingen push eller betalte API-kall.

Sluttakseptanse 2026-10-29: 1314 unit/integrasjon, 217 unike E2E-tilfeller
(215 fullrunde + 2 rettede RT-12-reruns), 3 dev, 13 komponent og 5 UI-unit etter
testprosjektflytting. Endelig build/lint består. Alle tre rechecks er uten restfunn.
Full nettleserrunde med to historiske testforventninger er bevart som råbevis,
ikke ommerket til én grønn fullkjøring. Ingen betalt API eller push.
