---
title: 'Automatisk logging av Codex-prompter'
type: 'chore'
created: '2026-10-08'
status: 'done'
route: 'oneshot'
---

<frozen-after-approval reason="Brukerens bestilling">

## Intent

Lagre brukerprompter automatisk i `.docs/process/prompts/` via en offisiell,
prosjektbasert Codex-hook. Bruk JSONL per sesjon, med tidspunkt, sesjons-ID,
turn-ID og hele prompten med tydelige hemmeligheter erstattet med REDACTED.
Ikke les miljøvariabler, transkripsjoner eller andre hemmelighetskilder.
Dokumenter aktivering, test og deaktivering. Ikke commit, push eller endre
andre deler av prosjektet. Stopp dersom installert Codex ikke støtter mekanismen.

</frozen-after-approval>

## Implementation Notes

- Undersøkt før implementasjon: CLI 0.153.4 og motor 0.162.0-alpha.2 i
  VS Code-utvidelse 26.1002.51308 støtter `hooks` (stable, true).
- Offisiell dokumentasjon beskriver `.codex/hooks.json`, `UserPromptSubmit`,
  `prompt`, `session_id`, `turn_id` og engangs tillitskontroll via `/hooks`.
- Repoet er allerede betrodd. Ingen globale innstillinger endres.
- Liten, reversibel endring uten uavklarte produktvalg; BMAD oneshot-rute.
- Omfang: hookdefinisjon, Python-logger, sikkerhetstester og dokumentasjon her.
- `.codex/config.toml` aktiverer hooks eksplisitt i prosjektlaget.
- Sensorveiledning del 1, særlig kriterium 1 og 7, og faglærers tilbakemelding
  2026-10-06 er lest. Loggeren støtter sporbar KI-bruk uten å endre produktomfang.
- Sju automatiserte tester bestod. Codex `hooks/list` fant prosjektets hook
  uten konfigurasjonsfeil i begge versjoner. Tillitsstatus var `untrusted`.
- Runtime-test via `codex exec` lyktes separat med begge motorer; JSONL-innhold
  ble kontrollert mot testprompt, sesjons-ID og turn-ID. Modelladressen var
  lokal og utilgjengelig. Engangs bypass av hook-tillit gjaldt bare testen.
- Ingen global konfigurasjon, Git-indeks, commit eller push ble endret.

## Review Triage Log

- medium, rettet: escaped anførselstegn kunne lekke resten av en passordverdi.
  Regexen håndterer nå escape-sekvenser; regresjonseksempel bestod.
- medium, rettet: siterte flerlinjepassord og YAML-blokker kunne lekke verdier.
  Begge formater maskeres nå; regresjonseksempler bestod.
- false: manglende ID-er skulle avvises. Brukerens bestilling tillater eksplisitt
  ID-er «dersom tilgjengelig» og dagsfil som fallback. Dette er testet.
- medium, løst: integrasjonstest manglet. Begge installerte motorer har nå
  skrevet logger via den faktiske hooken. Normal aktivering krever fortsatt
  brukerens engangs tillitsgjennomgang i Codex; dette er dokumentert.
