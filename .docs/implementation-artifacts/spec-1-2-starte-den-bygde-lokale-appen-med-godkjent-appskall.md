---
title: 'Story 1.2 — Starte den bygde lokale appen med godkjent appskall'
type: 'feature'
created: '2026-10-16'
status: 'done'
route: 'oneshot'
story_key: '1-2-starte-den-bygde-lokale-appen-med-godkjent-appskall'
---

<frozen-after-approval reason="Godkjent Story 1.2 og eksplisitt implementeringsbestilling 2026-10-16">

## Intent

Implementer bare [Story 1.2, AC1–AC5](../planning-artifacts/epics.md#story-12-starte-den-bygde-lokale-appen-med-godkjent-appskall), videre på godkjent Story 1.1. `npm run build` og `npm run demo` skal gi bygget frontend fra én Express-prosess på dokumentert loopback-adresse med samme origin for senere `/api`. `npm run dev` starter nødvendig Vite/Express-forløp. Appskallet fungerer uten eksternt nett, API-nøkkel eller KI-klient.

Produktnavn og «Demo · lagret KI-uttrekk» vises. Stepper har eksakt Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat, nummer og tekststatus. Tallgrunnlag er gjeldende; neste trinn er utilgjengelige med konkret forklaring. Ingen kontroll, analyse eller resultat er feilaktig fullført. Bruk eksakte grafitt-/petrol-/systemfont-/geometritokens fra final DESIGN og app-header/stepper-atferd fra final EXPERIENCE. Tastatur, synlig fokus, lesbar kontrast og ombryting ved zoom må fungere uten at stepper dekker fokusert arbeidsinnhold.

Statisk server eksponerer bare bygde appressurser, ingen reporot/private dokumenter eller hemmeligheter. README, faktiske HTTP-/oppstarts-/offline-/UX-kontroller og prosesspor skal dokumentere leveransen. Ingen registreringsfelt, finansmodell, rapportpipeline, KI-integrasjon eller resultater fra Story 1.3 eller senere implementeres. Reell motstrid eller nødvendig ny produkt-/arkitekturbeslutning krever spørsmål til Mads før løsning velges.

Autoritet: [epics](../planning-artifacts/epics.md), [DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md), [EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), [arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), [SPEC med kompanjonger](../specs/spec-IBE160/SPEC.md), [sprintplan](sprint-plan.md) og [sprintstatus](sprint-status.yaml). Kravspor: NFR-2–NFR-4, lokal del av S6, AD-1/AD-2/AD-9/AD-10, CAP-8 og storyens UX-DR-spor. Kursveiledning og faglæreroppfølging brukes til etterprøvbar kvalitet uten nytt produktomfang.

</frozen-after-approval>

## Implementation Notes

- Utgangspunkt: `4db56a119fc72f9d881b9a3e16a8cd406d9c5f35` på `main`. Story 1.1 er `done`. Den eneste eksisterende uversjonerte filen er denne øktens automatiske promptlogg; den bevares som autorisert prosesspor, som i Story 1.1. Ingen annen pågående kodeendring finnes.
- Epic 1-konteksten er gyldig og tidligere story er lest for kontinuitet. Bestillingens eksplisitte autoritative dokumenter er også lest direkte. Kontekstfilens historiske «bare 1.1» beskriver forrige bestilling; dagens eksplisitte bestilling gjelder bare 1.2.
- Rutevurdering: én liten, reversibel leveranse med forhåndsbestemt brukeroppførsel; ingen uløste produktvalg eller irreversible handlinger. Eksisterende frontend, pins og importretning gjenbrukes. Script-/adresse-/filvalg er implementeringsdetaljer innen arkitekturens Deferred.
- Planlagte endringer: App.tsx og lokal CSS; Express-server; nødvendige build/demo/dev-scripts, avhengigheter og låsfil; Node/frontend-typegrenser og lint; avgrenset Playwright-kontroll av bygget skall; README, denne storyfilen, sprintstatus og faktiske prosess-/verifikasjonsbevis.
- Teknisk plan: loopback `127.0.0.1:3000`; demo serverer bare `dist/`. Utvikling bruker Vite-middleware i samme Express-prosess, inklusive lokal HMR. Node 24s innebygde støtte for erasable TypeScript brukes i backend; separat typekontroll beholdes. Ingen ny runtime-transpiler eller prosessorkestrator er nødvendig. Demo er eneste implementerte modus; ingen live-konfigurasjon eller analysekontrakt opprettes på forskudd.
- Skallet viser en ærlig tom arbeidsflate uten framtidige felt/handlinger. Ingen trinn kan fullføres i denne storyen; «Fullført» vises derfor ikke som oppnådd status. Arbeidsinnhold og eventuell ombrutt stepper har egne rulleområder slik at de ikke overlapper, også ved sterk zoom.
- Implementert App.tsx/styles.css/main.tsx, lokal Express-server, build/demo/dev, avgrensede Playwright-tester, README og nødvendige type-/Vite-konfigurasjoner. Express 5.3.0 og Playwright 1.64.0 er tilføyd ved første behov; alle ni eksisterende direkte pins er beholdt. Ingen domene-/analysekontrakt eller registreringsfunksjon er opprettet.
- Faktisk ren installasjon og offline build/demo bestod på Node 24.21.0/npm 11.19.0. Eksternt TCP-forsøk ble avvist med EPERM under samme sandboxprofil. Én lytter på 127.0.0.1:3000, private kontrollfiler/HTTP-grense og dev-nettleser/HMR er etterprøvd, også i mappe med parenteser etter reviewretting. S6/full demo er ikke påstått.
- Åtte E2E-tester bestod etter reviewrettingene, inklusive faktisk privat kontrollfil, 412/416, selvbygging, rulling og fokusringens klippegrenser. Manuell native Chrome-kontroll ved 100/200/400 % bekreftet tastatur/ombryting/rulling; zoom ble tilbakestilt. Faktisk kontrast og alle kontrollfunn finnes i [verifikasjonen](story-1-2-verifikasjon.md) og [råutskriften](story-1-2-kontroller.txt).
- Implementeringsfeil er bevart og rettet: watcher-løkke, foreldet Vite-ws-oppsett og for bred dev-sperre under /private/tmp. Feil i kontrollprober er rettet uten å endre produktkrav/pins. Ingen nye produkt-/arkitekturbeslutninger eller utsatte oppgaver er nødvendige.

## Review Triage Log

Én uavhengig, kontekstfri Blind Hunter på samme modellnivå ble kjørt etter
implementering. Ingen konfigurerte review-lag ble hoppet over. Råsvaret er
bevart i [arbeidsøkten](../process/arbeidsokter/2026-10-16-story-1-2.md).

| ID | Dom og bekreftet håndtering |
|---|---|
| 1 | **medium — patch.** Prosjektsti var uescapet glob. Escapet spesialtegn før privat-/docs-/backendmønstrene settes sammen; faktisk ren dev/privatfil/HMR-kontroll bestod i `ibe160-story-1-2-(2026)-…`. |
| 2 | **low — patch.** 412/416 ble til 500. Relevante statuskoder beholdes med trygg tekst; reell If-Match/Range-regresjon består i E2E. |
| 3 | **low — patch.** Handler manglet kontroll av headersSent. Et allerede påbegynt svar avsluttes nå uten et nytt headerforsøk eller rå feileksponering. Kodeforløpet er gjennomgått; midtstrøms I/O-feil er ikke særskilt injisert. |
| 4 | **low — patch.** Review leste dokumentet før manuell sluttkontroll var ført inn. Faktisk native Chrome-kontroll ved 100/200/400 % er nå dokumentert med konkrete fokus-/rulleobservasjoner. |
| 5 | **low — patch.** E2E etablerte ikke privatfilen. HTTP-testen oppretter nå en unik faktisk privat kontrollfil, krever 404/fravær av innhold og rydder bare sin egen tempmappe i finally. |
| 6 | **low — patch.** Testkommando kunne bruke gammelt dist. `test:e2e` bygger nå gjeldende kilde før Playwright; README er tilpasset. |
| 7 | **low — patch.** Automatisk test rullet ikke innhold. Smale viewporttester bruker nå PageDown, etterprøver scrollTop og uendret stepperplassering, og refokuserer overskriften uten overlapp. |
| 8 | **low — patch.** Kontroll målte elementboks alene. Testen inkluderer nå outline-bredde/-avstand, viewport og nav-klipping; alle fire visninger består. |
| 9 | **low — patch.** Historisk logghelper pekte på én bestemt checkout. Repohelper utleder nå rot fra egen plassering; de nye kontrollene er faktisk kjørt gjennom denne helperen. |
| 10 | **low — patch.** Oppstartsfeil i kontrollscript kunne etterlate prosessgruppe. Serve rydder nå i eget exception-forløp; en faktisk startet ventende kontrollprosess blir terminert ved timeout. |

Ingen reviewfunn er forkastet eller utsatt. Alle rettinger holder seg innen
Story 1.2. Story 1.3 og senere funksjonalitet er ikke startet.

## Sluttstatus

AC1–AC5 er oppfylt. Storyfilen er `done`; sprintnøkkel 1.2 er `review` etter
bmad-builds oneshot-workflow. Epic 1 forblir `in-progress`, Story 1.1 er
fortsatt `done` og alle senere stories er `backlog`. Ingen avklaringsport,
låst plan eller produktbeslutning er endret. Ingen åpne spørsmål gjenstår
innen Story 1.2.
