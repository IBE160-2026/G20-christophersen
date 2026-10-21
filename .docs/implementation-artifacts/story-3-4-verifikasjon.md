# Story 3.4 — egenverifikasjon før uavhengig review

Dato: 2026-10-21. Baseline: `4cd8532ae00fec30093a5ade7390d13920edaeae`.
Scope: bare én ren samlet domain-screening, ikke Story 3.5+, UI eller live.

## Kravspor og faktisk atferd

Autoritet: [Story 3.4 AC1–AC6](../planning-artifacts/epics.md#story-34-gi-én-komplett-regelbasert-anbefaling-med-fast-begrunnelse),
[storyspec](spec-3-4-gi-en-komplett-regelbasert-anbefaling-med-fast-begrunnelse.md),
Epic 3-kontekst, SPEC CAP-4/5/6 og grensekontrakten Finans og screening,
FR-5/13/16/17/18, AD-1/7/8/10, final UX recommendation/basis-detail,
låst PRD-/brief-addendum og sprintplan/status. Faglærerfeedback og
sidehenvist sensoruttrekk er kontrollert; orkestratoren har lest alle sju
PDF-sider direkte denne økten. Ingen nye kurs- eller produktkrav er innført.

`evaluateScreening` krever helt finansgrunnlag og eksisterende rent
`FindingListBasis`. Den kaller `assessFindingList`, `evaluateKnownDeficiencies`,
`calculateFinancialMetrics` og begge ekte terskelfunksjoner. Felles kritisk-
mangel-/TG3-anvendbarhet er dermed faktisk gjenbrukt. Ingen React, I/O, KI,
nettverk, formatering eller ny aritmetikk deltar i screeningen.

| AC | Uavhengig fasit / meningsfulle prøver | Resultat |
|---|---|---|
| AC1 | AT-5/6/7/8/12/13/18, BT-3/5/6/17/18 og briefets mangler/konflikter/feil. AT-18 kontrollerer nøyaktig fire ordnede forhold: L, Ymin, analysefeil, navngitt TG3 på PDF-side 4. Full fast begrunnelse og neste handling sammenlignes med uavhengige strenger. | Prioritet 1, én Innhent mer informasjon. Alle kjente forhold/handlinger med; intet tidlig stopp. |
| AC2 | AT-2/3/4/14, eksakt yield/cash-grunnlag, positivt motvilkår og begge brudd samtidig. | Prioritet 2, én Forkast, fast yield-/cash-orden og eksakte aktuelle verdier/grenser. |
| AC3 | AT-1/9/10/11/15, bekreftet null, grenselikhet, hele nullgrunnlaget L=D=J=Ymin=0. | Prioritet 3, én Gå videre, begge oppfylte økonomiske krav og tilstrekkelig teknisk førstevurderingsgrunnlag; neste handling grundigere vurdering/befaring. |
| AC4 | AT-6/20 mot F2 og uavklart TG3; alle sju FR-5-eksempler, gyldig/ugyldig binding mot beskrivelse/hash/dokument/side og tillatt representasjonsretting. | Prioritet 1 overstyrer svake delresultater. Gyldig avklaring bevarer TG3/funn/kilde/status/begrunnelse/grunnlag; økonomien avgjør ved ellers tilstrekkelig grunnlag. |
| AC5 | AT-19 ved F1/F2/AT-18, gjentatt byteidentisk resultat fra fryst input, permutert TG3-/begrensningsrekkefølge, mutert utdatabasiskopi og ekte finans-/terskelobjekter før/etter. fetch er stubbet til å feile og aldri kalt. | Identisk prioritet/anbefaling/ordnede utløsere/full begrunnelse/neste handling uten inputmutasjon. |
| AC6 | Samme input gjennom lokale fellesfunksjoner og full screening; ekstra perioder/år/kilder/kostnader. | Identiske kritiske forhold, betydning og handling. Ukjent årsak erstattes ikke med gjettet forklaring. |

BT-8/9/15 og mye mindre desimalavvik kontrollerer eksakte grenser og kjent
månedsnormalisering. Completed/tomliste/bekreftet sammenlignes med manglende,
uferdig, failed, ubekreftet, feil rapportidentitet, ukontrollert enkeltfunn,
usikker kandidat og eksplisitte begrensninger. Failed beholder kjent feilårsak
og fysisk sidemål. Gyldige nøkkeltall følger alle utfall; prioritet 1 markerer
dem som delgrunnlag. Denne storyen leverer ingen snapshot-/revisjonsbinding.

## Kjørte kontroller

- **461/461 Vitest** i ti relevante testfiler, inklusive **66 nye** fullscreeningprøver. [Rålogg](story-3-4-kontroller.txt).
- `npm run typecheck`: bestått. [Rålogg](story-3-4-typecheck.txt).
- `npm run lint`: bestått uten advarsler. [Rålogg](story-3-4-lint.txt).
- `git diff --check`: bestått.

[Første rålogg](story-3-4-forste-kontroll.txt) bevarer to feilaktige
testforventninger: negativ D/J var korrekt avvist av eksisterende autoritet,
men testen forventet feil kode. Forventningen er korrigert til den allerede
etablerte `must-be-nonnegative`; ingen produksjonsregel ble endret for testen.

Full sluttregresjon/E2E kjøres som planlagt av orkestratoren etter uavhengig
3.4-review. Ingen ny E2E er påstått her; dette er en ren modul uten UI-konsument.
Det foreligger heller ikke live-/S2-/S5-/S6-bevis fra disse testene.

## Overleveringsstatus

Implementering ferdig, **spec in-review / sprint review**. Integrert build-review
og done er utsatt etter brukerens eksplisitte bestilling av en ny uavhengig
BMAD-reviewagent. Ingen ny beslutning eller blocker. 3.5–3.9 er fortsatt backlog;
ingen push eller endring av autoritative planer. Lokal implementeringscommit
rapporteres med full canonical SHA til orkestratoren.
