---
title: 'R4-S5 — separat benchmark S5-B1-v1 fryst'
date: 2026-10-27
decision_status: preparation-only
gate: R4-S5
gate_status: open
decision_owner: Mads
before_stories: ['4.5']
---

# Gjeldende casevalg og åpen gjennomføringsport

Mads har godkjent separat representativt S5-benchmarkcase med egen identitet.
`S5-B1-v1` er primærcaset for senere menneskelig førstevurdering, faktisk
AI-analysetid og Mads sin kontrolltid av AI-resultatet på samme PDF.
F1–F4 beholdes uendret som eksisterende S2/live-evalueringscaser. F1 er for
liten til å være hovedbevis for menneskelig tidsgevinst. Ingen tidligere
S2-resultater flyttes til benchmarken. Dette erstatter det tidligere
F1/F2/F4-utvalget for primær S5-måling, ikke historiske forsøksbevis.

Story 4.5 krever forhåndsdefinert case og samme-case manuell referanse, ikke
et låst F1-identitetskrav. PRD-addendumets S5-definisjoner og R1s mulighet
for tilleggscaser tillater oppsettet. Ingen terskler, AC, TT-krav, kontrakter
eller modellvalg endres. Se [frys/validering](../implementation-artifacts/story-4-5-s5-b1-v1-frys.md)
og [manifest](../../tests/fixtures/s5-benchmark/S5-B1-v1/manifest.json).

Rapport og fasit er AI-assistert forfattet; ingen reell befaring eller
uavhengig menneskelig fagvalidering påstås. Fasiten er fastsatt før første
produksjonsuttrekk/leverandørkall og må aldri sendes som providerinput.
Materialet er en meningsfull kontrollert oppgave, ikke statistisk dokumentert
representativitet. Eksponering for fasit/funn før måling må dokumenteres.

## Før faktisk gjennomføring

1. Story 4.4s åpne AC6/B2-sluttkontroll og review må fullføres; benchmarken
   erstatter eller lukker ikke denne avhengigheten. 4.4 står review.
2. Oppdater forsøksplan, internregistrering og kort Mads-instruks til eksakt
   benchmarkidentitet og manifesthash. Den stoppede F1-instruksen og gamle
   F1-arming er ugyldige for dette caset. Ny casebundet bevisoppsamling må
   kontrolleres offline; F1-helperen kan ikke uten videre gjenbrukes.
3. Bekreft ferskt miljø-, pris-/budsjett- og finansgrunnlag i preflight etter
   R1, med aktuelle dokument-/kodehash, én eksplisitt start og ingen automatisk
   retry. Tidligere USD 2-kontobekreftelse er historikk, ikke ny arming.
4. Fastsett nøyaktige manuelle start/stopp-punkter, opptak og aktiviteter
   etter eksisterende S5. Mads gjør faktisk manuell førstevurdering før
   nytt AI-uttrekk, deretter faktisk AI-analyse og egen kildekontroll.
   Tidligere case-/fasitkjennskap registreres som metodebegrensning.
5. Sammenstill ekte aktiviteter, resultater og tider etterpå; ingen estimert
   mennesketid. Faktiske observasjoner og uavhengig 4.5-review gjenstår.

Mads er fortsatt faktisk deltaker. R4-S5 forblir **open**; frysing er ikke
lukking av gjennomføringsporten. Story 4.5 er fortsatt backlog/draft,
Epic 4 in-progress. Ingen live-kall, menneskemålinger eller medianer er
opprettet. Story 5.4/S6 og 5.5 er urørt. Dette dokumentet autoriserer ingen
analyse eller oppstart av menneskelig måling.
