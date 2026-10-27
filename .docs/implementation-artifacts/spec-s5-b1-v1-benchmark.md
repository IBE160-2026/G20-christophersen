---
title: 'Opprette og fryse S5-B1-v1 før første uttrekksanalyse'
type: 'chore'
created: '2026-10-27'
status: 'done'
route: 'oneshot'
review_loop_iteration: 1
context: []
---

<frozen-after-approval reason="Mads har godkjent løsningen og uttrykkelig bestilt oppretting/frysing">

## Intent

Opprett ett separat S5-benchmarkcase i `tests/fixtures/s5-benchmark/S5-B1-v1/`:
tydelig fiktiv, realistisk tekstbasert rapport på 12–16 innholdsrike sider med
flere bygningsdeler, omtrent åtte TG2, minst ett TG3 og en relevant generell
inspeksjonsbegrensning/usikkerhet. Lag original PDF, separat forhåndsfastsatt
fasit med alle funn/fysiske PDF-sider/kildepassasjer og begrensninger, gyldige
finansforutsetninger, manifest med case-ID/versjon og SHA-256-bindinger.
Kryssjekk innhold, fulldekning, fysiske sider, PDF-kontrakter og egnethet for
meningsfull menneskelig førstevurdering. Render og inspiser alle sider.
Frys materialet i lokal commit med aktiv promptlogg før noe faktisk
uttrekks-/leverandørkall. Dokumenter AI-assistert forfatterskap ærlig.
Ingen live-analyse, tidspunkter/målinger eller fabrikkerte menneskedata.
F1–F4, deres fasit og historiske S2-bevis forblir byteidentiske. Ikke endre
låste kontrakter, markere Story 4.5 done, lukke 4.4-avhengigheten, starte 5.5
eller berøre 5.4/S6. Eksisterende S5-definisjoner og uavklart TG3 består.

</frozen-after-approval>

## Implementation Notes

2026-10-27: Lesende kontraktskontroll i forrige turn bekreftet at separat
S5-case er tillatt. Egen deloppgave med story_key unset: ingen sprintstatus-
synk til done. Story 4.5 er fortsatt backlog/draft og 4.4 review. Lokal live-
server og gammel F1-arming er fortsatt stoppet/ugyldiggjort. Bare aktiv,
bekreftet promptlogg er endret ved start; den følger arbeidet i commit.

Ingen åpne intensjonsvalg, ingen ekstern irreversibel handling og ingen ny
produktfunksjon/API. Arbeidet følger oneshot-ruten i allerede rendret BMAD-
workflow. Konkret egnethet begrunnes som en rikere kontrollert fiktiv oppgave,
ikke statistisk representativitet eller generell tidsgevinst.

## Implementation / Review / Verification

14-siders fiktiv PDF, separat fasit (8 TG2 / 1 TG3), begrensninger, finans,
kilde/generator og manifest er fullført og fryst før første KI-uttrekkskall.
Se [samlet frysebevis og alle 10 triageavgjørelser](story-4-5-s5-b1-v1-frys.md).
Sekvensiell uavhengig blindreview, retting og oppfølgingskontroll er ferdig.
To offlineparsere bekrefter 54 passasjer og fysisk sidedekning, ingen ekstra
gradefunn, determinisme, gyldige finansverdier og 6 manifesthashbindinger.
Alle 14 sider er visuelt kontrollert. Beskyttede 80 filer er byteidentiske.
Ingen produktkode/kontrakt, live-kall eller mennesketid er endret/opprettet.

Done gjelder kun denne bestilte materialleveransen. story_key er ikke satt:
4.4 forblir review med åpen AC6/B2-avhengighet, 4.5 backlog/draft, Epic 4
in-progress og R4-S5 open. Detaljert gjennomføringsarbeid gjenstår før S5.
