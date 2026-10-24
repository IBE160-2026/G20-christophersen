# Story 4.4 — gjenopptatt AC6-review 2026-10-24

**Resultat: fortsatt review, ikke done.** S2s validerte originalresultat beholdes:
TG2 4/4, TG3 1/1, ingen oppdiktede funn. Ingen nytt leverandørkall er utført;
ny kostnad USD 0, historisk samlet kostnad inklusive preflight USD 0.016072.
Ingen originaler, fasit, produktkode, kontrakter eller låste krav er endret.

Kontrollert utgangspunkt er commit `d7da466d62918caba2362a5d5932e4797f22fd43`.
Bestillingen er kontrollert avslutningsrunde med sekvensielle subagenter.
Eksisterende BMAD-review er gjenopptatt for de åpne akseptanseforholdene B1/B2;
allerede lukkede verktøyfunn er ikke gjenåpnet. En separat reviewer har deretter
etterprøvd AC6, kontrollhandlinger, kontrakter og krav uten å endre filer.

## B1: rapportbegrensninger kan ikke avklares gjennom eksisterende handlinger

`src/domain/finding-control.ts` gjør hver `extraction.limitations` til
`incomplete-report`. De originale F1/F2-svarene beskriver fiktiv rapport og
tekstgrunnlag, og F4 nevner også manglende visuell kontroll. Dette er ikke
identisk med dokumentert ufullstendig lesing, men dagens kontrakt skiller dem
heller ikke fra reelle begrensninger som må blokkere screening.

`src/contracts/document-analysis.ts` har bare `limitations: string[]`.
`FindingControl` i `src/contracts/finding-control.ts` gjelder ett `findingId`;
ingen handling finnes for separat kontroll/avklaring av en rapportbegrensning.
I `src/frontend/state/report.ts` setter listebekreftelsen bare gjeldende
listerevisjon, og funnkontroll/avvisning endrer ikke limitations. Fullført
listekontroll gir derfor fortsatt feil forventet hovedutfall for F1/F2.

FR-9/FR-11/FR-16 og Story 2.11 AC2 krever at reell ufullstendighet og uløst
kritisk usikkerhet fortsatt blokkerer; AD-4 tillater ikke at bekreftelse opphever
dokument-/analysefeil. Disse kravene gir ingen entydig regel for automatisk
klassifisering av fritekstbegrensninger. Å ignorere alle etter bekreftelse kan
skjule reelle mangler, mens tekst-/fixturefiltrering tilfører ny semantikk.
Demoens tidligere opphavsretting i `src/backend/analysis/data/README.md` gjaldt
konkret håndskrevet demodata og innførte uttrykkelig ingen runtime-filtrering.
Den er ikke hjemmel for å endre live-originaler eller stilletiende godkjenne dem.

**Nødvendig avklaring før produktretting:** Hvem kan avgjøre at en generell
begrensning er informativ eller avklart, hvilket konkret grunnlag kreves,
og hvordan bindes avgjørelsen til rapport/revisjon samtidig som reelle
feil/kritiske usikkerheter fortsatt blokkerer? Ingen slik beslutning er tatt
her. Når den foreligger, kan produktrettingen først prøves offline mot de
bevarte originalene, uten å endre målt S2 eller bruke nye modellkall.

## B2: F1s historiske sluttflyt mangler

`story-4-4/F1-receipt.json` har `uiControlCompleted: false`. Det betalte
originaluttrekket er gyldig og bevart; dokumentert full sluttkontroll kommer
fra separat lokal replay med null leverandørkall. Replay kan undersøke
produktrettingen, men kan ikke produsere manglende historiske hendelser i
det opprinnelige live-forløpet. Dette er et eget bevisgap, uavhengig av B1.

Story 4.4 AC6 krever korrekt kontroll/resultat gjennom faktisk live-hovedflyt
for F1/F2/F4. Et eventuelt nytt nødvendig F1-forsøk må derfor planlegges med
ny forsøksidentitet, uendret historikk og ny budsjett-/kostnadsavstemming.
Det bør først vurderes etter at B1 er løst offline. Ingen ny betalt kjøring
utføres for å forsøke å omgå det uløste produktavviket.

## Ny målrettet verifikasjon

Node 24.21.0. `OPENAI_API_KEY` og `ANALYSIS_MODE` var fjernet.
`story-5-3-nettprofil.sb` sperret eksternt nett og tillot lokal loopback.

| Kommando | Resultat |
|---|---|
| `node node_modules/vitest/vitest.mjs run tests/unit/finding-list-control.test.ts tests/unit/finding-control.test.ts --maxWorkers=1` | 2 filer, 51/51 bestått |
| `node --test tools/story-4-4/evaluate-s2.test.mjs tools/story-4-4/run-safety.test.mjs` | 13/13 bestått, 0 feil/hoppet over |

Første forsøk på å starte nestet OS-sandbox stoppet før teststart med exit 71
(`sandbox_apply: Operation not permitted`). Samme kontroll ble deretter kjørt
med godkjent lokal utføringstillatelse og OS-nettsperre; begge testkommandoer
bestod. Ingen test hentet nøkkel eller brukte betalt API.

Prøvene bekrefter blant annet at ekte rapportbegrensninger består etter
avvisning av usikker kandidat og listebekreftelse, samt allerede rettede
S2-deknings-, låseier-, kostnads- og F3-replaysperrer. De dokumenterer dagens
regelvern og reparerer ikke AC6. Ingen full regresjon er påstått fra disse
målrettede kontrollene; forrige fullregresjon står i
[sluttkontrollen](story-4-4-sluttkontroll.md).

## Avgrensning og neste checkpoint

Spec forblir `in-review`, sprintstatus forblir `review`, Epic 4 forblir
`in-progress`. Denne deløkten har ikke startet Story 4.5, 5.4 eller 5.5.
Root fortsetter overordnet bestilling fra dette dokumenterte checkpointet.
Aktiv promptlogg skal følge lokal commit som dokumenterer denne kontrollen;
tidligere promptlogger er urørt. Ingen push.
