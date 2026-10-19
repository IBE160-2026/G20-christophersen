# Story 2.2 — BMAD code review 2026-10-19

**Sluttresultat etter videreføring: bestått; done.** Alle fire AC er kontrollert
på nytt; 317 Vitest, typecheck/build/lint og 41 + 2 E2E består. Count-funnet
og oppfølgingsfunnene er rettet. R2 er open, Story 2.3 er backlog, ingen push.
Se [sluttresultatet nederst](#sluttresultat-etter-videreføring).

## Første reviewomgang — historisk resultat

**Første resultat: ikke godkjent; in-progress.** Commit `ab3690b` er gjennomgått.
Seks rettbare funn er håndtert, tre forslag avvist, og ett høyt prioritert
sidetellingsfunn står åpent. Ingen ny lokal commit eller push er utført.

## Autoritativt grunnlag og metode

Hele [Story 2.2 i epics](../planning-artifacts/epics.md#story-22-validere-pdf-format-sidegrense-og-originalidentitet)
og [implementeringsspecen](spec-2-2-validere-pdf-format-sidegrense-og-originalidentitet.md)
ble kontrollert mot faktisk kode og tester. Relevant grunnlag: final
[PRD](../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md) og addendum
(RT-1/RT-2/RT-5), Brief-addendumets F1–F4,
[DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md) /
[EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md),
[arkitektur AD-1/AD-3/AD-4/AD-9/AD-10](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[SPEC og grensekontrakter](../specs/spec-IBE160/SPEC.md),
[sprintplan](sprint-plan.md), [sprintstatus](sprint-status.yaml) og readiness.
Sensorveiledningens eksisterende tekstuttrekk (alle sju sider), faglærerens
tilbakemelding og gjeldende oppfølging styrte sporbarhet, meningsfulle tester,
fiktive data og bevisgrenser. Ingen nye kurskrav er lagt til.

BMAD code review ble aktivert med prosjektets customization-resolver. Fire
reviewlag ble gjennomført: Blind Hunter, Edge Case Hunter, Verification Gap
og Acceptance Auditor. Tre kontekstfrie reviewere ble startet parallelt;
Acceptance Auditor kjørte deretter i en ledig reviewer. Ingen lag feilet.
Blind Hunters kvantitative funnkrav ble ikke behandlet som bevis; hvert forslag
ble etterprøvd. Alle normaliserte funn, alvorlighetsgrader og avvisninger står
i storyens Review Findings. Hovedagenten var eneste skriver.

## Åpent funn B1 — 30-sidersgrensen kan omgås

`validate-pdf.ts` bruker PDF.js `document.numPages`. Endre bare `/Count 31`
til `/Count 30` i `text-31-pages.pdf`: alle 31 sideobjekter, referanser og
xref-posisjoner beholdes, men modulen returnerer `format-validated` og 30.
Uavhengig pypdf teller fortsatt **31 faktiske sider**. Dette er et reelt
moteksempel til korrekt telling i AC1/AC3 og beholdes som **high**.

Reproduksjonen er lagret som
[bevisst rød probe](story-2-2-review-page-count-probe.mjs). Kjør med Node
24.21.0 fra reporoten:

```sh
node .docs/implementation-artifacts/story-2-2-review-page-count-probe.mjs
```

Forventet nå: exit 1, fordi 31 sider feilaktig formatgodkjennes som 30.
Den ordinære grønne testsuiten **lukker ikke dette funnet**.

Den låste PDF.js 6.4.299-koden er fulgt gjennom `PDFDocument.numPages`,
`Catalog.numPages`, `checkLastPage`, `getPageDict`, transportens `GetPage`
og `ExtractPages`. Åpning sjekker første/siste deklarerte side. Et for lavt,
men ellers brukbart Count utløser ikke full telling; `getPageDict` bruker
også Count ved traversering. Å åpne alle rapporterte sider retter derfor
skadede referanser, men oppdager ikke denne skjulte ekstrasiden.
ExtractPages itererer også numPages. En trygg løsning gjennom det offentlige
API-et er ikke påvist i reviewet.

Storyens låste grenser forbyr ny støtteinnskrenkning/streng PDF-profil og
stiller krav om stopp ved reell blocker eller ny teknisk beslutning. Derfor
er ingen ekstra parser, privat PDF.js-API, parserpatch eller omskriving av
PDF-bytes valgt i stillhet. B1 må løses eller eksplisitt avklares før done;
det er ikke avvist som bare en uvanlig feilfil. Avklaringen gjelder
format/sidetelling innen 2.2, **ikke R2s lesbarhets-/layoutmetode**.

## Rettelser

| Funn | Etterprøvd feil | Endring / bevis |
|---|---|---|
| B2, high | F1 med andre Kids-referanse `5 0 R` erstattet med `0 0 R` ble godkjent, selv om getPage(2) feilet. | Åpner hver rapporterte sidedictionary og rydder siden; ny regresjon avviser filen. Ingen tekst leses. |
| B3/E1, medium | Loadingtask.destroy kan rethrowe transportfeil før intern worker-destruksjon og eksponere rå feil. | Komponenten eier PDFWorker eksplisitt og destruerer den separat i finally. Oppryddingsfeil får fast trygg driftsmelding. E1 er samme rotårsak, begge reviewerbidrag beholdes. |
| B4, medium | Alle unntak ble presentert som feil dokumentformat/container, også worker-oppsettfeil. | Kjente parserfeiltyper blir dokumentfeil; øvrige driftsfeil avviser promise med trygg fast melding. Ingen påstand om kjent dokumentårsak. |
| B6, low | Hashmanifestet ble bare delvis kontrollert. | Test kontrollerer navneinventaret og SHA-256 for alle ti 2.2-filer, også tekstløs og avviste filer. |
| B7, low | Generatorens glob ville adoptere uvedkommende/fremtidige PDF-er i manifestet. | Manifestet bygges nå bare fra generatorens ti navngitte utdata. Ingen PDF-byte eller pin er endret. |
| B9, low | Hash/navn ved avvisning manglet regresjonsasserts. | Identitet kontrolleres også ved 31 sider, ikke-PDF, skadet container og tom input. |

B5 (full runtime-validering av hele oracle), B8 (at regenerering overskriver
hashmanifest) og B10 (generell støtte for alle mulige gradstavemåter) er
avvist med konkrete begrunnelser i storyen. Ingen aktuell oraclefeil,
skjult regenereringspåstand eller oversett funn i de faktiske filene er
påvist. Ingen avvisning gjelder B1.

Edge Case Hunter kontrollerte rettelsene separat og fant ingen nye feil i
patchen; den kjente Count-feilen var uttrykkelig unntatt fra dette utsagnet.

## AC-kontroll mot sluttkoden

| AC | Faktisk kontroll | Resultat |
|---|---|---|
| AC1 | Faktiske 30/31-siders tekstfiler, feilformat, skadet container, tom fil og skadet sidereferanse. | Vanlige tilfeller består; **ikke fullt bestått** på grunn av B1. |
| AC2 | SHA-256 av bytes før await; navnebytte, stilignende navn, endrede bytes, valgt Buffer-slice og samtidig kallermutasjon. Også feilutfallenes identitet. | Bestått. Ingen filnavn brukes som serversti. |
| AC3 | Separat formatdelutfall, originalbytes og parserkopi, tekstløs container, ingen completed/readable/pages/findings. Ekte worker-destroy og kontrollerte feilgrener. | Byte-/utfalls-/oppryddingsdel består; korrekt pageCount er **ikke fullt bestått** på grunn av B1. |
| AC4 | Faktiske F1–F4 mot håndskrevet fasit, separat generator uten oracle-/adapterlesing, pypdf og rendering av alle 16 sider. | Bestått innen Story 2.2. F1–F3 har TG2 på side 2 uten TG3; F4 har også TG3 «Alvorlig lekkasje i tak» på PDF-side 4 / trykt side 2. F3 beholder L=null. |

Alle fire renderte kontaktark ble åpnet og kontrollert i reviewet etter ny
rendering med eksisterende PyMuPDF-miljø. Norske tegn, funntekst, dokumentnavn,
marger og fotnumre er leselige. Pypdf kontrollerte også tekst på alle 61
grensesider og én tekstløs side. Finansdata er separate kontrollerte
forutsetninger og samsvarer med Brief-addendum; PDF-ene er ikke private
originaler eller påståtte modellresultater. Dette gir et uavhengig
fixturegrunnlag, ingen målt live-kvalitet eller generell lesbarhetsgaranti.

## Egne testkjøringer

Runtime: Node **24.21.0**, npm **11.19.0**, PDF.js **6.4.299**. Ingen
package-/lockfile-endring under review; ny ren installasjon er ikke påstått.

| Kontroll | Resultat |
|---|---|
| Opprinnelig full Vitest på ab3690b | 292/292 bestått. |
| PDF-integrasjoner etter retting | 21/21 bestått, inkludert nye feil-/identitets-/manifestkontroller. |
| Full Vitest etter retting | 296/296 bestått i sju filer. |
| Typecheck og build | Bestått via npm run build. |
| Lint | Bestått. |
| Bygget demo / dev Playwright | 41/41 og 2/2 bestått. Rapportmodulen er ikke koblet til UI; appkode og avhengigheter er uendret av rettelsene. |
| Uavhengig fixtureinspeksjon | Bestått med pypdf; ny rendering med PyMuPDF og visuell kontroll. |
| Count-probe | **Feiler som forventet nå**; uavhengig pypdf bekrefter 31 sider. |
| Git whitespace / låste kilder / PDF-bytes | git diff --check bestått; planning-artifacts, specs, reference og PDF-bytes uendret mot ab3690b. |

[Råkontroller](story-2-2-review-kontroller.txt) inneholder de faktiske
sluttresultatene, inklusive den røde proben. Første E2E-forsøk ble blokkert
av sandboxens loopbackregel; godkjent eskalering ble brukt ved ny kjøring.
Første nye cleanup-test brukte en klasse som ikke eksporteres ved runtime;
den er rettet til å bruke prototypen fra en faktisk loadingtask. Typecheck
avdekket deretter en utypet spy-instance; assertionen ble rettet. Lint
avdekket eksplisitt throw i finally; oppryddingen ble skilt ut i en helper.
Grønne sluttresultater gjelder etter disse rettelsene.

## Endelig status og avgrensning

Storyfil og sprintstatus er satt til **in-progress**. Epic 2 forblir
in-progress, Story 2.3 forblir backlog, R2 forblir open med decision_record
null. Ingen tekstuttrekks-/lesbarhetsmetode, OCR, adapter, HTTP-/frontendkobling,
KI-kall eller senere story er implementert. Ingen nye readiness-porter er
opprettet. Ingen commit eller push: brukerens betingelse for done/commit er
ikke oppfylt. Arbeidstreets rettelser og bevis er klare til videre behandling
av det avgrensede B1-funnet.

## Sluttresultat etter videreføring

Brukeren bestilte eksplisitt videre retting av B1, faktisk traversering i
eksisterende PDF-lag, bevaring av tidligere rettinger og ny full review.
Bestått review ga autorisasjon til done/sprintoppdatering og lokal commit,
fortsatt uten push, R2-beslutning eller start av 2.3.

**B1 er lukket.** `count-pdf-pages.ts` / `pdf-page-tree-worker.ts` bruker
allerede eksisterende PDF.js Catalog.getAllPageDicts(false). Den følger
faktiske Kids/xref uten Count. En isolert lokal worker får klonede bytes,
normalisert til offset 0, og får bare bruke den eksakt hashkontrollerte
legacy-bunten. Dens private LocalPdfManager/Page-kobling er beskrevet i
[implementeringsvalget](story-2-2-page-tree-design.md). Installasjon og
originalbytes endres ikke. Ingen annen parser eller støtteprofil er lagt til.

Hver faktisk sidedictionary får samme rotate/userUnit/view-kontroll som
PDF.js GetPage. Det lukker også nytt reviewmoteksempel der Count=1 skjulte
et ødelagt Rotate-oppslag på side 2. Opprydding gjelder både eksisterende
PDF.js-loadingtask/worker og den nye sidetre-workeren, inklusive feil i
oppstart og siste destroy/terminate. Alle tidligere rettinger er beholdt;
de opprinnelige 21 reviewtestene er fortsatt i testfilen.

### Ny full BMAD-review og triage

Ny Blind Hunter, Edge Case Hunter, Verification Gap og Acceptance Auditor
gjennomførte full review av opprinnelig implementering pluss arbeidstreets
rettinger. Fire lag ble startet med det samme modellnivået, uten
skriverettigheter. En separat undersøkelse av parseren fant en fungerende
intern traversering og forklarte en pooled-Buffer-offsetfeil; root skrev
alle endringer. Reviewdiffen var 1 445 linjer / 73 927 bytes før oppfølging.
Hvert konkret funn fikk egen vurdering før gruppering:

| Funn / kilde | Vurdering | Utfall |
|---|---|---|
| E2.1, Edge Case | high: faktisk Count=1 skjulte ødelagt Rotate-referanse og ga formatgodkjenning. | Rettet med metadata-gettere for alle faktiske sider; Count4/Count1-regresjoner består. |
| E2.2, Edge Case claim check | high: samme feil brøt kravet om å bevare tidligere skadet-side-retting. | Samme rotårsak som E2.1; begge bidrag beholdt og lukket sammen. |
| A2.1, Acceptance | high: samme metadatafeil hindret full AC1/AC3. | Samme rotårsak; separat ny AC-audit godkjenner nå alle fire AC. |
| V2.1, Verification Gap | medium: ingen test nådde den nye workerens operative feilgren; endring fra reject til null kunne passere suite. | Faktiske threads startes; error/exit/messageerror/unavailable injiseres, trygg avvisning gjennom validatePdf og threadId=-1 kontrolleres. |
| C1, Blind Hunter | low: README/status beskrev fortsatt Count som uløst. | Status og README er oppdatert etter sluttverifikasjon; historikk beholdt. |
| C2, Blind Hunter | low: testantall var foreldet. | README/backend oppdatert til 42 PDF-integrasjoner / 317 Vitest. |
| C3, Blind Hunter | low: manglet faktisk design-/vedlikeholdsbeskrivelse av privat parserkobling. | Eget implementeringsnotat med kildehash, init/recovery/metadata/opprydding og krav ved senere pinendring. |
| C4, Blind Hunter | low: siste PDFWorker.destroy hadde ingen lokal feilmeldingsoversettelse. | Direkte sikring og feilinjeksjon etter faktisk ressursfrigjøring; trygg melding. |
| C5, Blind Hunter | low: direkte countPdfPages kunne eksponere et avvist terminate-unntak. | Trygg terminate-helper og fault-injeksjon etter faktisk terminering. |
| C6, Blind Hunter | medium: manglet oppstarts-/feiltester for ny worker. | Samme rotårsak som V2.1; error, virkelig tidlig exit, messageerror og unavailable er kontrollert. |
| C7, Blind Hunter | medium: normaliseringsretting trengte deterministisk ikke-null byteOffset-regresjon. | Eksplisitt paddet Buffer-slice, faktisk antall 31 og uendrede inputbytes kontrolleres. Rettelsen ble lagt til før reviewerens forslag kom. |
| C8, Blind Hunter | low: alternativ gyldig struktur manglet ved ny parsergrense. | Nye objekt-/xref-strøm- og lineariserte 30-siders-fixtures består; uavhengig syntaks/side-/pikselkontroll. |
| C9, Blind Hunter | medium: manglet sykliske/gjentatte sidetreetilfeller. | Begge konkrete varianter gir trygg invalid-container; workerens generelle feilopprydding er også testet. |

Ingen nye funn er avvist eller utsatt. Tidligere B5/B8/B10-avvisninger
beholdes med begrunnelse i første omgang og storyen. Ingen beslutningsfunn
gjenstår: videreføringsbestillingen autoriserte B1-løsning i eksisterende
PDF-lag; ingen lesbarhetsbeslutning var nødvendig.

Etter retting leste Edge Case og Verification Gap endringene på nytt og
bekreftet lukking. Blind Hunter fant ingen ytterligere konkrete feil i
kode/design/alternative fixtures. Acceptance Auditor kontrollerte alle
AC på nytt og kjørte selv **42/42 PDF-integrasjoner** på låst Node.

### Ny AC-kontroll

| AC | Sluttbevis | Resultat |
|---|---|---|
| AC1 | 30/31 faktiske sider; Count 30/1/0 i 31-sidersfil, nestede root/gren-underrapporteringer, 30 faktiske sider med Count29/31, skadet/skjult metadata/referanse, syklisk/gjentatt tre, alternativ gyldig struktur. | Bestått; faktisk 31 gir page-limit og pageCount31. |
| AC2 | Alle opprinnelige hash/navn/mutasjons-/Buffer-slice-tester og feilidentiteter består; parseren får egen kopi og workerdata normaliseres. | Bestått; originalbytes/hash bevares, navn åpnes aldri som sti. |
| AC3 | Faktisk antall og originalbytes returneres bare som formatdelutfall. Tekstløs container er ikke readable/completed. Reell PDF.js-worker og Node-thread ryddes; feilbaner etterprøvd. | Bestått; ingen tekstuttrekk eller lesbarhetspåstand. |
| AC4 | Uendret F1–F4/expected.json, ny pypdf-/rendererinspeksjon og alle opprinnelige tester. | Bestått; F3 L=null og F4 TG3 på PDF-side4/trykt side2 bevares. |

### Endelige egne kontroller

Node 24.21.0 / npm 11.19.0 / PDF.js 6.4.299 er uendret. Ingen package- eller
lockfile-endring i reviewrettingene. Ny ren npm-installasjon er derfor ikke
påstått eller gjentatt uten grunn.

| Kontroll | Sluttresultat |
|---|---|
| Hele Vitest-settet | **317/317**, 7 filer, inklusive alle **42 PDF-integrasjoner**. |
| Typecheck/build og lint | Bestått. |
| npm run test:e2e etter siste kodeendring | **41/41 demo + 2/2 dev**, bygget på nytt gjennom README-scriptet. |
| Tidligere rød Count-probe | **Grønn**, failed/page-limit, faktisk pageCount31. |
| F1–F4 og grense-/tekstløs fixture | Ny uavhengig pypdf/PyMuPDF-kontroll bestått; opprinnelige PDF-bytes og kontaktark er uendret. |
| Objekt-/xref-strøm og linearisert fixture | Pypdf teller30, pikepdf syntaks/lineariseringskontroll består, alle30 siders tekst og renderte piksler er identiske med originalen i begge filer. |
| Git whitespace, låste kilder, packagepins og statusdelta | Bestått; bare Story2.2 endrer status fra review til done sammenlignet med ab3690b. |

Råbevis: [sluttkontroller](story-2-2-review-sluttkontroller.txt).
PyMuPDF 1.26.6 kan ikke lenger linearisere; pikepdf 10.17.0 ble installert
kun i eksisterende midlertidig Python-miljø for fixtureforfatting. Første
installasjonsforsøk var nettverkssperret; godkjent eskalering ble brukt.
Ingen av disse verktøyene er nye produktavhengigheter, og npm test bruker
bare de innsjekkede fixturefilene.

**Endelig arbeidsstatus: Story 2.2 done, Epic 2 in-progress, R2 open med
decision_record null, Story 2.3 backlog.** Lokal reviewcommit samler alle
bevarte og nye rettinger, tester og prosessbevis. Ingen push, tekst-/layout-
metode, OCR, adapter, KI-kall, HTTP-/frontendintegrasjon eller senere story.
