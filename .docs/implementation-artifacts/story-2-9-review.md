# Story 2.9 — uavhengig full BMAD code review

Dato: 2026-10-21. Eksplisitt target: `63627cee85b771f6207c431338eca7a734a9ee24..225aa359c2ddf7167a8391d2ec52886a8854617a`.
18 filer, +641/−25; diff 73 224 bytes / 919 linjer. Full specmodus.
Ny agent etter implementeringscheckpoint; bare Story 2.9 er reviewet/rettet.

## Metode og autoritet

`bmad-code-review/SKILL.md`, resolver, config og steg 1–4 er fulgt.
Ingen prepend/append/persistent facts. Fire reviewlag ble kjørt **ett om gangen**,
uten egne filendringer mens et lag var aktivt. Blind, edge og verification fikk
context-free oppdrag; acceptance fikk story-/kontraktkontekst. Brukerens
uttrykkelige sekvensielle bestilling overstyrer skillens parallelle oppstart
og forhåndsautoriserer konkrete rettinger, status og lokale commits.
Ingen ulåst produkt-/arkitekturbeslutning eller endret låst krav.

AGENTS.md, sensorveiledningens faktiske syvsiders PDF (lest med lokal PDF.js),
faglærertilbakemeldingen, epics.md Story 2.9 AC1–AC4, storyspecens to
kontekstfiler, grensekontrakter og final EXPERIENCE er konsultert.
Sprintplan/-status bekrefter forutsetninger og porter. Kurset brukes til
sporbarhet og faktisk kvalitetssikring, ikke til nye produktkrav.

## Reviewlag, alle kandidater og triage

Blindgulv: `N=min(floor(sqrt(73.224)+1),10)=9`.
Gulvet gir kandidater, ikke ni påviste produktfeil.

| ID / kilde | Dom, konkret kontroll og behandling |
|---|---|
| B1 / blind | medium, patch: Etter eksplisitt Avvis beholdt et 15-linjers utkast sin verdi i en deaktivert trelinjers textarea. Feltet kan ikke tastaturfokuseres/rulles. Ny browserprøve var rød før retting. Samme uendrede draft vises nå som lesbar historisk tekst uten intern clipping eller redigeringshandlinger. |
| B2 / blind | medium, patch, samme historikkrot: Ugyldig side 99 ga fortsatt aria-invalid og aktive rettingsinstruksjoner i låst skjema. Tidligere validering vises nå eksplisitt som historikk uten aktive felt/alert, mens errors og draft bevares uendret i state. |
| B3 / blind | low, rejected: Ingen aggregert «null aktive»-melding er påkrevd i 2.9. Hver avvist rad sier eksplisitt ikke aktivt rapportfunn. Den eksisterende tomanalysebeskjeden brukes bare ved faktisk tom originalanalyse; koden påstår aldri at avvisning betyr at rapporten opprinnelig var tom. Ny aggregert listetilstand tilfører omfang utover en direkte feilretting. |
| B4 / blind | medium verifikasjonsgap, patch: programmatisk focus beviste ikke Tab-rekkefølgen. RT-12 når nå Bekreft → Korriger → Avvis via faktiske Tab fra valgt overskrift og aktiverer med Enter. |
| B5 / blind | medium verifikasjonsgap, patch: Kort 850×480-skjerm målte bare fokusidentitet. Ny prøve med langt ugyldig utkast krever hele fokusknappen innen faktisk synlig workspace etter Avvis. Ingen ny fokusfeil ble påvist. |
| B6 / blind | medium verifikasjonsgap, patch: Siste statustekst beviste ikke én kunngjøring. MutationObserver på kontrollstatus måler nå nøyaktig én avvisningskunngjøring gjennom handling, annet funn og trinnretur. Ny historikkprøve krever tom status ved remount og bevart valgknappfokus. |
| B7 / blind | medium verifikasjonsgap, patch: Historisk overskrift alene beviste ikke brukt korrigeringsinnhold. RT-12 krever TG2 «Brukt representasjon», dokument og fysisk side 2 før/etter retur, samtidig som originalkilden vises på side 3. |
| B8 / blind | medium verifikasjonsgap, patch: Ny to-kandidat-prøve krever at avvisning fjerner bare valgt kandidats mangler. Den andres konkrete issue-grunner og rapportbegrensning består, og outcome er identisk. |
| B9 / blind | medium verifikasjonsgap, patch: Tre nye prøver starter med original som har feil hash, feil dokumentnavn eller side 99, bruker gyldig korrigering på side 5 og avviser. Originalens mismatch/null-side eller kjente ugyldige 99 bevares ærlig; brukt korrigering gjør ikke avvist funn aktivt, og outcome/correction er uendrede. Eksisterende sourceTarget/PDF-visning eier feilforklaring, ingen ny kildepolicy. |
| E0 / edge | Ingen funn. Første retur var `[]`; laget bekreftet deretter uttrykkelig at instruksfil, hele diffen, handlings-/slettings-tracing og claims var fullført. Ingen feilet eller ufullført linse. |
| V0 / verification | «No verification gaps found.» Ingen separate funn; blindlagets kandidater er selvstendig etterprøvd. |
| A0 / acceptance | Ingen AC1–AC4-brudd eller motsigelser med EXPERIENCE/grensekontrakter. Tydelig opplyst at laget leste kode/tester og ikke kjørte dem. Reviewagenten kjørte egne negative og browserprøver etterpå. |

To patchgrupper: historisk utkastvisning (B1/B2), målrettet verifikasjon (B4–B9).
Ingen decision-needed, defer eller uløst medium/high. B3 er eneste rejected.

## AC mot faktisk kode og egne negative prøver

| AC | Faktisk kontroll |
|---|---|
| AC1 | Bare report-finding-reject setter separat rejection.revision. Originalt outcome/PDF-bytes og provenance overskrives ikke. currentFinding returnerer null for avviste originaler, som fortsatt er valgbare med fysisk kilde og original grad/tekst. Correction/draft bevares separat, historisk/inaktivt. RT-12 viser uavhengig faktisk dokumentfasit og oppdiktet TG3. |
| AC2 | Avvis øker funn-/listerevisjon én gang, nullstiller relevant enkeltfunns-/listebekreftelse, bevarer andre kontroller ved referanse/innhold. Ny negativ prøve beviser isolasjon av en annen usikker kandidats mangler. Ingen listebekreftelseshandling er innført. |
| AC3 | Lokal status sier brukeravvist uttrekk og ingen TG3-avklaring, utbedring eller teknisk godkjenning. Ingen TG3-status opprettes. Completed/rapportidentitetsvern hindrer avvisning i feilet/delvis analyse. Dokument-/analysefeil og rapportbegrensninger består i egne eksisterende negative tester. |
| AC4 | Rejection-guarden gjør gjentatt Avvis, redigering, Bruk, Avbryt og Bekreft idempotent uten reaktivering. Generasjon, ukjent ID, rapportmismatch og erstatning er negativt dekket. RT-12 verifiserer ett analyse-POST gjennom avvisning, kildepanel og funn-/trinnretur. Ingen ny HTTP-/adapter-/KI-analyse. |

Låst UX/kontrakt krever ingen egen reverseringshandling; den er ikke innført.
Ingen 2.10, 2.11 eller Epic 3-funksjonalitet er implementert gjennom reviewen.

## Reproduksjon og verifikasjon

Ny rød browserprøve og skjermdump bekreftet at lesbar utkasthistorikk manglet;
lang tekst lå i disabled felt og aktive feiltilstander var beholdt. Etter
rettingen er hele teksten vanlig innhold uten intern scroll/clipping, og
historiske feil er merket uten aktiv rettingsoppgave.
Fire nye unit-prøver og én ny E2E-prøve, samt utvidet RT-12, dekker funnene.
Første nye unit-prøve forventet rå reason i stedet for eksisterende prefikset
trigger.message; testforventningen ble rettet, ingen produktendring nødvendig.

Målrettet resultat: 33/33 finding-control unit, 4/4 Story 2.9 E2E, separat
1/1 oppdatert status/Tab-prøve. Én full sluttregresjon kjøres etter siste
produkt-/testendring. Lokal server krever tillatt loopback; eksisterende Chromium
brukes uten installasjon/betalt API. Dette er agentutført Chromium-/semantikk-/
tastaturkontroll, ikke fysisk skjermleser- eller ekstern brukertest.

| Kontroll etter siste kodeendring | Resultat |
|---|---|
| Full Vitest, 20 filer | 538/538, 91,72 s |
| Full bygget-app-E2E | 80/80 |
| Full dev-E2E | 3/3, 1,8 s |
| Typecheck (tsc -b i build), lint, build | bestått |
| git diff --check | bestått |

PDF.js gir eksisterende informativ stor-bundlemelding. Forventede Vite-avslag
beviser dev-testenes private filgrense; de er ingen feil. Ingen ny avhengighet.
Storyspec og sprint 2.9 er **done**. Epic 2 er **in-progress** med 2.1–2.9 done,
2.10/2.11 backlog. Epic 3 er backlog. Readiness CONCERNS og R1/R4 er uendret;
R2/R3 er lukket. Ingen ny blocker/beslutning. Neste steg for orkestrator er
bare 2.10 med ny implementeringsagent og separat reviewagent. Denne agenten
stopper ved lokalt reviewcheckpoint, uten push eller start av senere story.

Rålogger: [reproduksjon](story-2-9-review-reproduksjon.txt),
[sluttregresjon](story-2-9-review-kontroller.txt).
