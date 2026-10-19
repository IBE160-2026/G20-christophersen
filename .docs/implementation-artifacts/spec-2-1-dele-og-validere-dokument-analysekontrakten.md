---
title: 'Story 2.1 — Dele og validere dokument-/analysekontrakten'
type: 'feature'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
story_key: '2-1-dele-og-validere-dokument-analysekontrakten'
baseline_commit: '856c72bd47e8477c2e21acb3ec4fa40fc6209125'
---

<frozen-after-approval reason="Brukerbestilt Fase 4 innen godkjent Story 2.1; låst kravgrunnlag beholdes">

## Intent

Implementer bare Story 2.1 AC1–AC4 og testkrav i godkjente epics. Gitt dokumentgrunnlag og terminalt utfall, når felles runtime-validering brukes, skal samme versjoner, requestId, reportHash, modus, sideantall og completed/failed gjelde på begge sider. Pages inneholder én post per PDF-posisjon med tekst/status; manglende obligatoriske felt er aldri suksess. Gitt completed med eksplisitt tom funnliste, manglende findings eller failed, når de valideres, skal bare første variant være fullført tomliste. Feil skiller document/analysis, stabil kode, kjent berørt mål og trygg kjent årsak. Delresultater er fortsatt ufullstendige.

Gitt uklar/manglende/umulig grad, dokumentkilde eller PDF-side, når retur valideres, skal kontrollerbare TG2/TG3 skilles fra usikre kandidater med bevart originalt opphav og konkrete kjente mangler. Ingen side/grad gjettes eller konfidensprosent brukes som kildebekreftelse. Gitt adapterretur og backendkontekst, når dokument-/korrelasjonsidentitet bindes, skal kode kontrollere identiteten fra rapportkonteksten. Modellens metadata bestemmer ikke identiteten. Strukturell kildekontroll er ingen påstand om semantisk fullstendighet eller brukerbekreftelse.

Runtime-schemas med avledede typer i contracts og rene felles validatorer. Ingen PDF-parser, faktisk bytehash, adapterintegrasjon, HTTP, frontend, betalt API eller senere story. Kjør målrettet Vitest for gyldig funn/tomliste, ugyldig/manglende felt/versjoner/status, feil med/uten delresultater, RT-7 og adapterens metadataforsøk; kjør relevant regresjon. Sett in-review/review og Epic 2 in-progress, dokumenter bevis og lag lokal commit uten push. Separat Fase 5 gjør review; ingen integrert review/done. Stopp ved reell blocker eller nytt produkt-/arkitekturvalg. R2 beholdes åpen og 2.3 startes ikke.

</frozen-after-approval>

## Implementation Notes

- BMAD build rendret én gang; workflow, clarify/compile-context/plan/template/oneshot/sprint-sync lest. Eksplisitt brukerbestilling autoriserer teknisk detaljering, implementering/test/status/commit; ingen generisk ny godkjenningsrunde. Ny sekvensiell reviewer kommer i Fase 5. Ingen underagenter eller parallelle filendringer.
- Undersøkt Story 2.1 og tilstøtende grenser, sprintplan/status/readiness, final AD-1/3/4/6/10 og SPEC/grensekontrakter, PRD FR-7–9/RT-7 samt kursuttrekk og faglærerfeedback. Ny Epic 2-kontekst sammenfatter disse uten å endre kildene. Ingen tidligere done-story i Epic 2. Ingen uløst intensjonsgap eller irreversibel handling.
- Kodemap: nye `src/contracts/document-analysis.ts` eier versjoner, dokumentmetadata/pages, opprinnelig kandidat, kontrollerbart funn/usikkerhet, terminale feil/resultater og avledede typer. Nye `src/contracts/analysis-validation.ts` binder adapterinnhold til kodekontekst og validerer kilde/identitet. `tests/unit/document-analysis.test.ts` verifiserer AC/RT-7. `src/contracts/README.md` beskriver grensen. Ingen ny avhengighet; eksisterende Zod/strictObject og ren teststruktur gjenbrukes.
- Detaljvalg innen låst betydning: eksplisitte versjonsliteraler, nullable ukjent mål/sideantall ved feil, ingen defaults for suksesslister, bevarte rå kandidater med eksplisitte nullverdier ved ukjent opplysning. Kontrollerbar betyr bare struktur/kildeområde; ingen bekreftelsesstatus. Dokumentstatus representerer rapportert uttrekksstatus og velger ingen lesbarhetsmetode.
- Levert to rene contracts-filer med Zod-avledede typer. Original grad/kilde kan også være utelatt; dette bevares som utelatelse og forklares som usikkerhet. Original beskrivelse/usikkerhetstekst omskrives ikke; original, kildeobjekt og usikkerhetsarray er readonly/frosset etter validering. Ingen original endres ved klassifisering.
- `bindAnalysisOutcome` gir stabil trygg feil ved manglende/ugyldig adapterutfall; feilens kjente mål beholdes og sideområde kontrolleres. Strukturelt ugyldig internt dokument-/kodegrunnlag avvises eksplisitt med Zod-feil fremfor å bygges fra adaptermetadata. Det er ingen HTTP-feilhåndtering her.
- Sluttkontroll: 90/90 målrettede kontrakttester, 270/270 samlet Vitest, typecheck/lint/build og 101/101 låste hasher bestått på Node 24.21.0/npm 11.19.0. Ingen avhengighetsendring. E2E/manuell UI ikke kjørt på nytt fordi ingen UI-/serverkode eller eksisterende appkobling er endret; dette er ren kontraktleveranse. Råutdata og AC-spor i `story-2-1-kontroller.txt` og `story-2-1-verifikasjon.md`.
- Storyspec in-review og sprintnøkkel review; Epic 2 in-progress. Ingen integrert review/done, blocker eller produkt-/arkitekturbeslutning. R2 fortsatt open; 2.3 ikke startet. Fase 5 skal gjøre uavhengig BMAD code review før neste implementering.

### Review Findings — gjenopptatt Fase 5

- [x] [Review][Patch] Bevar kjent trygg sideårsak fra kodekontrollert dokumentgrunnlag i failed-resultatet (AC2).
- [x] [Review][Patch] Bruk samme ikke-trimmende funn-ID-semantikk for feilmål og original/delresultat (AC2).
- [x] [Review][Patch] Verifiser ikke-tomme limitations i completed-resultat (AC1/AC2).
- [x] [Review][Patch] Verifiser spesifikk stabil dokumentfeilkode for hver ikke-lesbar sidestatus (AC2).

Blind Hunter fra checkpointet og tre nye, sekvensielle, kun-lesende lag er fullført.
Fem individuelle funn ga fire patchgrupper; ingen avviste/defer/beslutningsbehov.
Full triage og AC-spor føres i `story-2-1-review.md`. Ingen endring av låst Intent.

Sluttstatus etter separat review: **done**, AC1–AC4 bestått. Før retting feilet
4/95 målrettede tester; etter retting 95/95 målrettede og 275/275 totale Vitest,
lint og typecheck/build bestått. 101/101 låste hasher og frozen Intent uendret.
Epic 2 forblir in-progress, Story 2.2 backlog, R2 open. Ingen push eller senere
story startet. Historiske implementeringsnotater ovenfor bevarer Fase 4-statusen.
