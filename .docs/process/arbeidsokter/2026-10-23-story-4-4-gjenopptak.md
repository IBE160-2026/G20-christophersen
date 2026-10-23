# Story 4.4 — gjenopptak og stopp ved kontoinnsyn

Dato: 2026-10-23. Bestilling: Fortsett eksisterende 4.4-checkpoint med
miljønøkkel tilgjengelig. Verifiser nøkkel, modelltilgang, kontogrense/rate
limit og ledig ramme innen USD 20 før betalte forsøk. Kjør så F1–F4 etter
eksisterende AC, dokumenter tokens/kostnad og evaluer S2 mot fasit. Ikke start
4.5. Stopp ved fortsatt konfigurasjonsfeil. Ved ferdig leveranse: review og
lokal commit, ingen push.

BMAD build og OpenAI Docs ble lest. Eksisterende checkpoint, R1, story-AC,
kursuttrekk og faglærertilbakemelding ga grunnlaget. Ingen nye krav innføres.
Preflight ble utført før implementering/spec og betalte analyser.

Nøkkelen finnes. Modelloppslaget ga HTTP 200 for riktig modell. Kostnadsinnsyn
ga HTTP 403; adminmiljø og prosjektidentitet mangler. Ingen faktiske RPM/TPM,
betalingskvote eller avstemt gjenværende prosjektramme er tilgjengelig.
Brukerens stoppregel ble fulgt. Detaljer og neste nødvendige oppsett står i
[checkpointet](../../implementation-artifacts/story-4-4-checkpoint.md).

Ingen F1–F4, S2, produktendringer, review eller 4.5. Null genereringskall,
null genereringstokens og USD 0 i ny genereringskostnad; historisk total er
fortsatt ukjent. Bare dokumentasjon committes. Eksisterende usporede JSONL-filer
inngår ikke i committen. Ingen secrets skrives eller committes.

Verifikasjon: `git diff --check` og kontroll av de to dokumentene mot den
faktiske preflighten. Ingen nye produkttester; tidligere regresjonsresultater
er eksplisitt historiske. Lokal checkpointcommit uten push; status beholdes
som backlog fordi 4.4 ikke er gjennomført.
