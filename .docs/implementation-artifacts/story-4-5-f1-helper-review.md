# F1-manualhelper — uavhengig review 2026-10-24

**Avgrenset helperreview består etter én lifecycle-retting.** Dette er ikke
faktisk F1-gjennomføring, 4.4-akseptanse eller S5-bevis.

Reviewinput: `tools/story-4-5/manual.mjs`, `transport.mjs`, `manual.test.mjs`
og `README.md`. BMADs løste code-linser adversarial, edge-case-hunter og
verification-gap ble anvendt sekvensielt, uten nye subagenter. Brukerens
forenklede gjennomføring gjelder: Mads tar macOS-skjermopptak og utfører
alle menneskehandlinger; ingen ekstra klar-erklæring eller prøveopptaksport
innføres. Root eier faktisk preflight/metode og lokal oppstart.

## Funn og triage

```json
[
  {
    "lens": "edge-case-hunter",
    "location": "tools/story-4-5/manual.mjs, arm/createManualServer",
    "trigger_condition": "Ren dokument-/beviscommit etter godkjenningen sperret omstart med uendret source/build.",
    "guard_snippet": "Krev git merge-base --is-ancestor approval.codeCommit HEAD og fortsatt eksakt sourceFingerprint.",
    "potential_consequence": "Beviscommits kunne gjøre den godkjente engangsplanen ubrukelig uten produktendring."
  }
]
```

Rettet med én felles `validateSourceBinding` for arming og armert oppstart.
Godkjent full commit må finnes i aktuell HEAD-historikk, og kilde/build må
fortsatt ha nøyaktig planens fingeravtrykk. Dette tillater etterfølgende
dokument-/beviscommits; det tillater ikke endret helper, produktkode,
avhengigheter eller dist. README forklarer bindingen.

Eksisterende armingprøve er utvidet med isolert syntetisk Git-historikk:
etterfølgende beviscommit godtas, ukjent commit avvises, og både kildeendring
og dist-endring avvises. Ingen commit ble opprettet i prosjektets repository.
Adversarial fant ingen ytterligere verifisert feil; antallsmål ble ikke brukt
til å konstruere funn. Verification-gap etter rettingen:
No verification gaps found.

Kontrollert ellers: gratis prepare/GET og sperret uarmert POST; ny eksklusiv
forsøksmappe og ingen overskriving; datert hashbundet godkjenning, reservasjon
og budsjett; eksakt F1/request med bare requestId-normalisering; én varig
forsøkstillatelse og ingen retry etter restart; delt eid paidlock før dispatch;
låse-/reservasjonsbevaring ved tvetydige utfall; ingen headerlogging og ingen
lagring av ikke-fullført/usikker provider-body; stopp/abort venter på barnets
lukking. Teknisk oppfanging erstatter ingen menneskelig kontroll eller tid.

## Faktisk verifikasjon og handoff

Node 24.21.0. `OPENAI_API_KEY` og `ANALYSIS_MODE` fjernet. OS-nettprofil
`story-5-3-nettprofil.sb` sperret eksternt nett, kun lokal loopback tillatt.

`node --test tools/story-4-5/manual.test.mjs`: **8/8 bestått**, ingen feil,
hoppet over eller avbrutt. Prøvene bruker midlertidige mapper, lokal HTTP og
injisert falsk providertransport. `git diff --check` består.

Ingen kanonisk forsøksmappe forberedt av reviewer, ingen reell server startet,
ingen nøkkel hentet og ingen faktiske leverandørkall. Ny kostnad **USD 0**.
Ingen produktkrav, appkode, originaler/fasit eller 5.4/5.5 endret.

Root kan nå committe helper/prosesspor, forberede den nye planen, committe
plan/preflight og deretter godkjenne/armere/starte lokal server etter faktisk
grunnlag. En senere ren dokument-/beviscommit hindrer ikke omstart.
Bare Mads skal senere klikke Start analyse og utføre opptak/kontroll.
Ingen commit eller push fra reviewer; aktiv promptlogg følger roots commit.
