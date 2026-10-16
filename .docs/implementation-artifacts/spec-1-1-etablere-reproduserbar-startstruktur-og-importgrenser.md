---
title: 'Story 1.1 — Etablere reproduserbar startstruktur og importgrenser'
type: 'chore'
created: '2026-10-16'
status: 'done'
route: 'oneshot'
story_key: '1-1-etablere-reproduserbar-startstruktur-og-importgrenser'
---

<frozen-after-approval reason="Godkjent Story 1.1 og eksplisitt implementeringsbestilling 2026-10-16">

## Intent

Implementer bare [Story 1.1, AC1–AC4](../planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser): offisiell Vite react-ts, én package.json/package-lock.json, nødvendige låste startversjoner, TypeScript/Oxlint og struktur med AD-1s importretning. Reell ren npm ci, type/lint og konkret kontroll av import-/Git-grenser skal dokumenteres. Versjonsavvik krever avklaring, ingen dummytester. Bare nødvendige avhengigheter og kode opprettes.

Autoritet er ferdig brief/PRD/UX/arkitektur/SPEC, epics/readiness/sprintplan/-status, samlet i [Epic 1-kontekst](epic-1-context.md). Kravspor: NFR-3/NFR-4, lokal forutsetning for S6, AD-1/AD-9/AD-10 og CAP-8. Ingen appserver, godkjent UX-skall, finans-/PDF-/KI-logikk eller fremtidige kontrakter. Story 1.2 startes ikke. Reelle uklarheter eller nye produkt-/arkitekturvalg legges frem for Mads før løsning velges.

</frozen-after-approval>

## Implementation Notes

- Undersøkelsen fant bare planverk og prosessverktøy, ingen eksisterende appkode. `main` peker på `cfc58a68a73a538064bc6c2045f29b0a51e72458`. Den eneste opprinnelige uversjonerte filen er denne øktens automatiske promptlogg; den bevares som autorisert prosesspor.
- Rutevurdering: liten, reversibel grunnstruktur-/konfigurasjonsendring; ingen uavklart brukerbeslutning og ingen irreversibel handling. Offisiell starter tilpasses ved å flytte React-inngangen til `src/frontend/`, fjerne demonstrasjonsinnhold og beholde bare nødvendig konfigurasjon. Scriptnavn og støttetyper er implementeringsdetaljer innen arkitekturens Deferred.
- Planlagte filer: package.json/låsfil, .nvmrc/.npmrc, TypeScript-/Vite-/Oxlint-konfigurasjon, index.html, minimal React-inngang i src/frontend, ansvarsbeskrivelser for src/contracts/domain/backend, .gitignore, kort README-oppskrift, story-/sprintstatus og faktiske kontroll-/prosessbevis.
- Offisiell Vite-kilde: `df7503cc499e0b49e45701e3be7546918ee9d322`, `packages/create-vite/template-react-ts`. Nødvendige pins og støttetyper bekreftes gjennom faktisk avhengighetsoppløsning.
- Vertsmiljøet har Node 26.8.1. Godkjent Node 24.21.0 er hentet fra nodejs.org og SHA-256-kontrollert isolert under `/tmp/ibe160-story-1-1-runtime/`; systeminstallasjonen endres ikke. npm fra denne distribusjonen er 11.19.0.
- Startgrunnlag og ansvarsfoldere er etablert. Én låsfil v3 har identiske direkte pins/rotmetadata med package.json. README beskriver faktisk installasjon/type/lint og importgrenser; `/private/` er Git-ignorert for lokale originaldokumenter.
- AC1: reell npm ci bestod i repoet og i ny isolert mappe uten node_modules eller miljøfiler. Første nettinstallasjon hadde en forbigående SSL-feil, samme kommando bestod ved gjentakelse uten pin-/TLS-endring. Npm-varsel om valgfri fsevents er dokumentert; ingen installasjonspolicy endret.
- AC2: type/lint og npm ls bestod. Kontrollprober i den isolerte kopien beviste at typefeil og betinget hook faktisk avvises; begge kontroller bestod igjen etter at probene ble slettet.
- AC3/AC4: faktisk importgjennomgang viser bare React/egen App i frontend og Vite/plugin i byggekonfigurasjon. Domain/contracts/backend har ingen kode på forskudd. Sju Git-ignoreringer, versjonerbarhet for nødvendige filer og whitespacekontroll er etterprøvd. Se [verifikasjon](story-1-1-verifikasjon.md) og [råutskrift](story-1-1-kontroller.txt).
- Workflowens eneste konfigurerte review-lag, Blind Hunter, ble kjørt med en uavhengig agent på samme modellnivå. Alle ni funn gjaldt bevis/oppskrift; de er kontrollert og rettet nedenfor. Ingen review-lag ble hoppet over, ingen forhold er utsatt, og ingen nye produkt-/arkitekturbeslutninger ble nødvendige.
- AC1–AC4 er oppfylt. Storyfilen avsluttes som done; sprintnøkkelen flyttes til review i samsvar med bmad-build/oneshot. Epic 1 forblir in-progress og alle andre stories forblir backlog.

## Review Triage Log

| Funn | Vurdering og etterprøvd retting |
|---|---|
| Renmappe-oppsett/PATH manglet i råbeviset | low, rettet. Verifikasjonen viser eksakt Node-PATH og kopierbart mktemp/cp-oppsett med hele filutvalget. Faktisk opprinnelig tempfile/shutil-oppsett er identifisert særskilt. |
| Nettinstallasjonens feil/nytt forsøk var bare oppsummert | low, rettet. Faktiske verktøyutdata fra begge kjøringene er bevart i kontrollutskriften, med identisk kommando, feilkode og exit 1/0. |
| Byteidentitet manglet synlig sammenligning | low, rettet. Kjørt shasum på repoets og den rene kopiens låsfil; begge har SHA-256 `91a3fbe29cc65f2b4b7dbe19f63439c7c3bcfb4f573b2a6639871c1e657749ea`. JSON-kontroll bekrefter alle direkte pins og rotmetadata. |
| Negativ engine-kontroll manglet | low, rettet. Reell npm ci --dry-run med Node 26.8.1 ble avvist med EBADENGINE/exit 1 og forventet Node 24.21.0/npm 11.19.0; ingen låsfilendring. |
| Importtreff manglet i råbeviset | low, rettet. Faktisk treffliste er lagret i kontrollutskriften. |
| Importlisten alene dekker ikke dynamisk import/reeksport/I/O | low, rettet. Alle kildefilene er gjennomgått, og supplerende tekstsøk/filliste er lagret. Bare to React-filer og Vite-konfigurasjon har kode; DOM-tilgang er i frontend og ren kjerne har ingen kode. |
| Ignoreringsprøver sier ikke om faktisk sporet innhold | low, rettet. git ls-files --cached --ignored --exclude-standard ga ingen treff. Faktisk indeks viser bare de 24 avgrensede leveransefilene. |
| git diff --check omfattet ikke nye uversjonerte filer | low, rettet. Alle nye filer ble lagt i indeksen, og git diff --cached --check bestod for hele leveransen. |
| README utelot unntaket for miljøeksempler | low, rettet. README navngir .env.example/.env.*.example uten hemmeligheter, i samsvar med eksisterende .gitignore. |

## Code review — 2026-10-16

Gjennomgått commit: `2a9abfa4b6941797f6cfd2087e42dd28da3e90cd`, sammenlignet
med forelder `cfc58a68a73a538064bc6c2045f29b0a51e72458` (24 filer,
2 030 tillegg, fire slettinger). BMAD `bmad-code-review`, modus `full`, med
storynøkkel `1-1-etablere-reproduserbar-startstruktur-og-importgrenser`.

Autoritet: [Story 1.1, AC1–AC4 og arbeidsgrense](../planning-artifacts/epics.md#story-11-etablere-reproduserbar-startstruktur-og-importgrenser),
[arkitekturens AD-1/AD-9/AD-10 og Stack/Structural Seed](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
[SPEC](../specs/spec-IBE160/SPEC.md) med grensekontrakter, sporbarhet og
verifikasjonskontrakt, [sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml).
Planens opprinnelige backlog-oversikt er et snapshot fra planleggingen;
sprintstatus eier den løpende fremdriften. Kursgrunnlag og faglæreroppfølging
er lest som angitt i [Epic 1-kontekst](epic-1-context.md), uten nye produktkrav.

Fire uavhengige review-lag ble fullført: Blind Hunter (ti kandidater), Edge
Case Hunter (ingen funn), Verification Gap Reviewer (ingen verifikasjonsgap)
og Acceptance Auditor (ingen støttede AC-/arkitekturavvik). Ingen lag feilet.
[Arbeidsøkten](../process/arbeidsokter/2026-10-16-story-1-1-review.md) bevarer
reviewoppsett, råsvar og beslutninger. Dette er en ny gjennomgang; original
rådialog fra implementeringens tidligere Blind Hunter ble ikke bevart og
rekonstrueres ikke fra den eksisterende ni-punktsoppsummeringen ovenfor.

### Review Findings

Alle ti kandidater kom fra `blind-hunter`; numrene følger råsvarets rekkefølge.
Åtte lave dokumentasjons-/bevisfunn ble håndtert, to ble forkastet etter
kontroll mot storyens faktiske arbeidsgrense. Ingen high/medium-funn,
beslutningsbehov, åpne rettinger eller utsatte oppgaver gjenstår.

| ID | Dom / sted i opprinnelig commit | Bekreftet forhold og håndtering |
|---|---|---|
| 1 | low — story-1-1-kontroller.txt:177 | Uquotert `|` blir en shellpipeline ved kopiering. Rettet quoting, merket endringen i historisk utskrift og kjørt samme søk på nytt med faktisk kommandoutskrift. |
| 2 | low — README.md:57 | `.env*` lovet mer ignorering enn `.env`/`.env.*` i Git-konfigurasjonen. README bruker nå de eksakte mønstrene og beholder de navngitte eksempelunntakene. |
| 3 | low — story-1-1-verifikasjon.md:68 | Oppskriften kunne avslutte med vellykket `npm ls` etter en tidligere feil. Lagt i subshell med `set -eu`; hele den rettede kodeblokken er kjørt på nytt og bestod. |
| 4 | low — story-1-1-kontroller.txt:49 | Historisk bevis viste probeinnhold, men ikke oppretting/sletting. Nye faktiske kjøringer bevarer disse kommandoene, forventet TS2322/hookfeil og vellykket kontroll etter sletting. |
| 7 | low — denne storyfilens opprinnelige reviewnotat | Rådialog fra tidligere underagentreview mangler; triageoppsummering og brukerbestilling finnes. Begrensningen er gjort eksplisitt, og en ny full review er gjennomført med fire uavhengige lag og råsvar bevart i arbeidsøkten. Tidligere dialog er ikke oppdiktet. |
| 8 | low — story-1-1-verifikasjon.md:14 | Den tidligere registrerte Node-arkivhashen har ingen bevart sjekksumutskrift. Dokumentasjonen skiller nå historisk registrering fra denne reviewens faktisk prøvde Node/npm/installasjon. Ingen ny arkivverifikasjon påstås; AC1 krever den reelle installasjonen, som består. |
| 9 | low — story-1-1-verifikasjon.md:28 | «Ren» presiserte ikke grensen mot vertens npm-konfigurasjon. Avgrenset til prosjektmappe/cache og logget relevante effektive innstillinger uten auth-data: ingen bruker-/global config, offisielt register, engine-strict=true og ignore-scripts=false. |
| 10 | low — README.md:16 | Testet OS/arkitektur manglet i inngangsoppskriften. README oppgir nå prøvd macOS 26.6.2/arm64 og skiller dette fra uprøvd plattformstøtte. |

#### Rejected

- **5 — false:** Manglende automatisk håndheving av importretning er ikke et
  brudd på AC3, som krever faktisk importgjennomgang. Alle kildefiler er lest:
  frontend importerer React/ReactDOM/egen App, Vite-config importerer
  Vite/plugin, og de øvrige tre grensene har ingen kode. Ingen ulovlig
  avhengighet finnes. README presiserer den manuelle kontrollen; ny
  grenseinfrastruktur er ikke nødvendig i denne storyen.
- **6 — false:** `tsconfig.app.json` inkluderer hele `src` med DOM/Vite-typer,
  men det finnes ingen domain-/contracts-/backend-TypeScript som får feil
  miljø eller bryter AD-1 i leveransen. AC3 beskriver faktisk kode/import,
  ikke isolerte TypeScript-prosjekter. Miljøoppdeling for ennå ikke opprettet
  kode ville være arbeid på forskudd; ingen konfigurasjonsfeil er påvist nå.

### Verifikasjon og endelig status

[Faktiske reviewkontroller](story-1-1-review-kontroller.txt) er nye kjøringer,
inklusive feil og forventede avvisninger. Låste pins er beholdt.

| AC | Resultat og konkret bevis |
|---|---|
| AC1 | **Bestått.** Node 24.21.0/npm 11.19.0; `npm ci` med nett i ny prosjektmappe og opprinnelig tom cache bestod. Første forsøk fikk ENOTFOUND fra sandkassens DNS; nytt forsøk med nettverkstilgang bestod uten pin-/TLS-/policyendring. Alle ni direkte pins og rotmetadata samsvarer; 70 registeroppføringer har integritet. Låsfilens SHA-256 er fortsatt `91a3fbe29cc65f2b4b7dbe19f63439c7c3bcfb4f573b2a6639871c1e657749ea`. Node 26.8.1 avvises med EBADENGINE. |
| AC2 | **Bestått.** `npm run typecheck`, `npm run lint` og `npm ls --depth=0` bestod i den rene mappen; type/lint bestod også i repoet. Reelle type-/hookprober ga forventede feil og kontrollene bestod etter sletting. Rettet renmappe-oppskrift er prøvd med de nettinstallerte pakkene i cache. Ingen nøkkel, betalt tjeneste, dummytester eller framtidige moduler var nødvendig. |
| AC3 | **Bestått.** Minimal offisiell react-ts-tilpasning med React + TypeScript + Vite etter låst startstakk. Hele kilden og import/reeksport/dynamisk import/require/I/O er kontrollert mot AD-1 og SPEC. Ingen ren kjerne med miljøavhengighet, dupliserte kontrakter, død produktkode eller senere finans-/PDF-/KI-/appserverfunksjonalitet er funnet. |
| AC4 | **Bestått.** Faktisk Git-indeks inneholder ingen ignorerte filer. Åtte prøver for avhengigheter/bygg/.env/private originaler/tsbuildinfo ignoreres; nødvendige prosjektfiler og ufarlige miljøeksempler kan versjoneres. Hemmelighetsmønstersøk ga bare eksisterende eksplisitt fiktive testdata, manuelt kontrollert. Diff-/whitespacekontroll består. |

Npm varsler fortsatt om installasjonsscriptet til valgfri `fsevents@2.3.3`;
det er dokumentert og påvirker ikke exit 0 eller type/lint. Bare denne
macOS/arm64-kjøringen er etterprøvd. Ingen påstand om full S6, bygget app,
UX eller live-kvalitet følger av reviewen.

**Endelig status: done.** Sprintnøkkel 1.1 er synkronisert fra `review` til
`done`; Epic 1 er fortsatt `in-progress`, alle øvrige stories er `backlog`,
og porter/planmetadata er bevart. Story 1.2 er ikke startet. Kildekode,
versjoner, låsfil og type-/lint-/Vite-konfigurasjon er byteuendret fra commiten;
rettingene gjelder bare Story 1.1-dokumentasjon og kontrollbevis.
