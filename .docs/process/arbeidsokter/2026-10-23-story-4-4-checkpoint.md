# Story 4.4 — bestilling og preflightstopp

Dato: 2026-10-23. Mads bestilte komplett Story 4.4 med sekvensielle subagenter:
først implementering og ekte live-kjøringer etter eksisterende AC/R1, deretter
ny uavhengig F1–F4/S2-evaluator og ny BMAD code review-agent. Bare verifiserte
4.4-funn skulle rettes; done først etter bestått review. USD 20 totalt,
ingen Story 4.5, ingen endring av låste krav, relevante tester/full regresjon,
lokale commits uten push. Ved lav usage skulle neste reviewlag ikke startes.

Eksplisitt stoppregel fra bestillingen:

> Hvis API-nøkkel, kontogrense eller annen nødvendig live-konfigurasjon mangler, stopp på et rent checkpoint og rapporter konkret hva jeg må gjøre.

Root startet første subagent for BMAD build og påla tidlig trygg preflight,
uten nøkkelutskrift og uten flere subagenter under implementeringsagenten.
Step-01 og nødvendig eksisterende kontekst ble lest. `OPENAI_API_KEY` manglet
eller var tom i arvet miljø; ingen `.env*` i reporoten. Ingen leverandørkall
ble utført. Root fikk umiddelbar blockerstatus og bekreftet stopp før
implementering/live/evaluering/review; root håndterer eksisterende regresjon
separat etter brukerens testbestilling.

[Checkpointet](../../implementation-artifacts/story-4-4-checkpoint.md)
dokumenterer bevisgrenser, manglende live-oppsett og konkrete gjenopptaksvilkår.
Baselinen er `91d4c8661a413d4bdded8a59e92ef91a635bb057`. Bare disse to nye
dokumentene skal inngå i checkpointcommiten. Ingen kode, fasit, story-AC,
budsjettbeslutning, sprintstatus eller eksisterende rålogger endres.

Usporede rålogger ved start, bevart urørt og utenfor committen:
`session-01a16919-6b71-7793-89c9-43e6d6132d8a.jsonl` og
`session-01a16928-6cd7-7e83-b169-3414facb3b85.jsonl`.

Root fullførte deretter bestilt regresjon: typekontroll, lint, build,
1059 Vitest-tester, 189 bygget-app-E2E, 3 dev/offline-E2E og 37 komponenttester
bestod. Build-/demooppstartskontrollen fant 0 nøkkellekkasjer i 204
frontendfiler. Node 24.21.0, uten API-nøkkel/modus og med OS-sperret eksternt
nett; alle kommandoer exit 0. Detaljer er bevart i checkpointet.
Ingen produktendringer, live-kall, evaluator eller review ble lagt til.
