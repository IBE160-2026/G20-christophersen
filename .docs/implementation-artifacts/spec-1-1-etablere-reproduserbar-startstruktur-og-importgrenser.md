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
