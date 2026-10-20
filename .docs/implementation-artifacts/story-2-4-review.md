# Story 2.4 — full BMAD code review 2026-10-20

**Resultat: bestått. Story 2.4 er done.** Ingen verifiserte feil, rettinger,
åpne reviewoppgaver eller utsatte funn. Lokal status-/dokumentasjonscommit;
ingen push. Produktkoden i implementeringscommitten er beholdt uendret.

## Mål, grunnlag og metode

Reviewmål: `7b1897402b732e46c21de35bdffcc37dad79d6e9`, mot forelder
`fa91c3fbb027be992194f7deb022de60a50acba6`. Diff: 22 filer, +1206/−7.
Arbeidstreet hadde bare denne reviewbestillingens uregistrerte promptlogg
ved start; den er bevart som prosessbevis.

Autoritativt grunnlag lest/kontrollert:

- [Story 2.4 AC1–AC4 og grensen mot 2.5](../planning-artifacts/epics.md#story-24-hente-lagret-demo-uttrekk-bundet-til-riktig-rapport-og-versjon).
- [Implementeringsspec](spec-2-4-hente-lagret-demo-uttrekk-bundet-til-riktig-rapport-og-versjon.md).
- [Arkitektur, særlig AD-1/AD-3/AD-4/AD-6/AD-10](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md).
- [SPEC](../specs/spec-IBE160/SPEC.md), [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), [R2](../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md), eksisterende schemas og dokumentpipeline.
- [Sprintplan](sprint-plan.md), [sprintstatus](sprint-status.yaml), uavhengig `expected.json`, originale F1–F4-PDF-er og eksisterende verifikasjon.
- Sensorveiledning del 1, alle sju sider, og faglærerens tilbakemelding under planning-artifacts: sporbarhet, meningsfulle tester, kildekontroll og lokal demo uten gruppens nøkkel. Ingen nye krav er utledet.

BMAD-workflow og lokale tilpasninger er lastet. Fire uavhengige reviewlag
ble kjørt: Blind Hunter, Edge Case Hunter, Verification Gap Reviewer og
Acceptance Auditor. Ingen rapporterte substansierte funn; ingen lag feilet.
Blind Hunters funngulv var 10 ut fra 95,094 kB; det ble ikke konstruert funn
for å fylle kvoten. Root kontrollerte selv kode/kallkjede, alle AC og egne
negative prøver. Det finnes derfor ingen funn å triagere eller avvise.

## AC mot faktisk kode

| AC | Faktisk implementasjon og etterprøvd resultat |
|---|---|
| AC1 | `AnalysisAdapter` bruker hele delte `DocumentBasis` og `AdapterOutcome`. `analyzeDocument` sender samtlige sider samlet og bruker eksisterende `bindAnalysisOutcome`. Standardloader velger lokal JSON utelukkende etter SHA-256; konvolutthash og begge versjoner på begge nivåer sjekkes før `AdapterOutcomeSchema`. F1–F4 er kjørt gjennom faktisk `validatePdf` → `extractPdf` → standard demo. Alle funn stemmer med uavhengig fasit og tekst på fysisk side. |
| AC2 | Manglende fil, feil konvolutthash, feil versjon, ugyldig JSON/struktur og loaderfeil gir trygg eksplisitt analysefeil. Egne prøver endret faktisk lagring i isolert kopi, inkludert F4-fil lagt på F1-hashens sti. Ny gyldig PDF-byteendring og ukjent rapport under F1-navn får aldri F1-resultatet. Ingen retry/fallback/nett-/nøkkelkode finnes. |
| AC3 | Standardargumentet er lokal demo; mode bindes fra gjeldende kodekontekst og modesamsvar sjekkes. Fiktivt lagret opphav fremgår av limitations og dokumentasjon. Fire faktiske rapporter virker deterministisk med tomt miljø og OS-blokkert nett; ingen modellklient/SDK opprettes. |
| AC4 | Eksisterende resultatbinding klassifiserer originalfunn/usikkerhet og bevarer limitations. Tester dekker gyldig tomliste, ugyldig/uklar kilde/grad/side, feilhash i originalkilde og failed med/uten delresultat. Funn på blank side avvises. Ingen finansverdi, anbefaling, reparasjonsestimat eller ny grad leveres. |

Rapporthashen beregnes av originalbytes i `validatePdf` og kontrolleres igjen
før ekstraksjon. Adapteren tar betrodd, validert dokumentgrunnlag fra denne
pipelinen; den innfører ingen ny PDF-parser eller alternativ hashautoritet.
Resultatbindingens dokumentkontekst er beskyttet mot adaptermutasjon.

Feil navn er ingen oppslagsnøkkel: F2 under F1-navn finner sitt eget
F2-hashbundne svar, og eksisterende kildevalidering viser navneusikkerheten.
En feilbundet konvolutt feiler; avvik i en originalkildes hash bevares som
usikker kandidat og blir aldri et kontrollerbart funn. Dette følger 2.1s
kontrakt og repareres ikke av demoen.

Unreadable/unknown/incomplete og bare blanke sider stoppes av delt
`getDocumentBasisError` før loaderen kalles. Enhetstester kontrollerer alle
statusene med ellers treffende lagring; integrasjon prøver også ekte
mixed-status-, uncertain-content- og blank-variants-PDF-er.

## Tester kjørt i denne reviewen

Node 24.21.0 / npm 11.19.0 og allerede installerte avhengigheter/browser.

| Kontroll | Resultat |
|---|---|
| `npm test` | 436/436, 11/11 filer, ingen hoppet over |
| `npm run lint` | Bestått uten lintadvarsler |
| `npm run build` inklusive `npm run typecheck` | Bestått |
| `npm run test:e2e` | Build + 41/41 bygget app + 2/2 dev bestått |
| Målrettede unit-/integrasjonstester under `env -i` og OS-nettsperre | 49/49 (35 unit + 14 integrasjon) |
| [Egen lagrings-/byteprobe](story-2-4-review-probe.mjs) under samme sperre | 13/13 scenarier og kontrollprobe bestått |
| PDF-originalkontroll | Pypdf leste alle fysiske F1–F4-sider; F4-side 4 ble rendret med PyMuPDF og visuelt inspisert: TG3 «Alvorlig lekkasje i tak», trykt side 2, fysisk side 4 |
| Diff/grenser | Contracts, dokumentpipeline, server/frontend, fixtures/fasit og autoritative planning-/SPEC-kilder er uendret mot implementeringens forelder |
| `git diff --check` | Bestått |
| BMAD `sprint_plan.py validate --status-file .docs/implementation-artifacts/sprint-status.yaml` | `valid: true`, ingen problemer; eksisterende lokal Python/ruamel-installasjon brukt |

Den egne proben bruker en midlertidig kopi av produktkoden og dens ekte
standard-FS-loader. Repoets lagrede demosvar/PDF-er muteres aldri. De 13
scenariene er fire deterministiske F1–F4-kjøringer og ni negative:
feilbundet faktisk JSON-fil, slettet fil, ugyldig JSON, kontrakt-/
uttrekksversjon i konvolutt og outcome hver for seg, nye endrede PDF-bytes,
og ukjent dokument. Alle ni negative gir validert failed med null delresultat.

Kopierbar lokal reproduksjon (erstatt Node-stien ved behov):

```sh
/usr/bin/env -i PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:/usr/bin:/bin NO_COLOR=1 /usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network*)' /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node node_modules/vitest/vitest.mjs run tests/unit/demo-analysis.test.ts tests/integration/demo-analysis.test.ts

/usr/bin/env -i PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:/usr/bin:/bin /usr/bin/sandbox-exec -p '(version 1)(allow default)(deny network*)' /private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node .docs/implementation-artifacts/story-2-4-review-probe.mjs
```

OS-profilen sperrer også workers og loopback. Den egne proben krever faktisk
`EPERM` ved TCP-forsøk før demosjekkene, og kontrollerer fravær av
KEY/TOKEN/SECRET-miljøvariabler. Tomt miljø etableres før Node/import.
Ordinær verktøysandbox avviste nestet `sandbox-exec`; godkjent eskalering
gjennomførte begge sperrede kjøringer. Ordinær E2E feilet ved blokkert lokal
serveroppstart; godkjent eskalering med loopback ga 41+2 bestått. Dette var
miljøbegrensninger, ingen produktfeil. Ingen automatisk godkjenning ble avvist.

## Sluttstatus og avgrensning

Ingen produktrettinger var nødvendige. Reviewrapport, egen probe, arbeidsøkt,
promptlogg og statusoppdateringer lagres. Storyspec og sprintstatus er done;
sprintplan/epic-kontekst er synkronisert. Epic 2 og SP2 pågår fortsatt.
Story 2.5 og alle senere stories forblir backlog; R3/R1/R4 er åpne og R2
closed. Readiness er fortsatt CONCERNS.

Live-kode er ennå ikke implementert; det som er kontrollert her er den delte
adaptergrensen og kontraktene som senere live skal bruke. Ingen HTTP-rute,
duplikatsperre, UI-integrasjon eller ny beslutning om upload-/HTTP-grenser,
timeouter eller produktets opprydding inngår. Testkopiens sletting gjelder
utelukkende reviewens egne midlertidige testfiler.

Dette er modul-/regresjonsbevis for Story 2.4, ikke S2/live-S5/annen-person-S6
eller fullført rapportreise i UI. Lokal commit kan identifiseres med
`git log -1 --format='%H %s' -- .docs/implementation-artifacts/story-2-4-review.md`.
