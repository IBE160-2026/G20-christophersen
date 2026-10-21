# Arbeidsøkt 2026-10-21 — Story 3.3 implementering

## Bestilling og arbeidsdeling

Brukeren bestilte en kontrollert mini-sprint med sekvensielle subagenter:
3.3 → uavhengig BMAD-review/retting/done → 3.4 → uavhengig review/retting/done,
med relevante tester per fase, full sluttregresjon og lokale commits uten push.
Stopp ved ny produkt-/arkitekturbeslutning og etter review av 3.4.

Denne underagenten implementerer bare 3.3. En ny agent skal reviewe den før
3.4 starter. Ingen ekstra barn eller parallelle implementeringsagenter ble
startet. Brukerens eksplisitte fasebestilling overstyrer bmad-builds integrerte
review/done; checkpointet skal være in-review/review med lokal commit.
Baseline: `c3c2214db47fe6b76459c8d6a2413b976131cc49` på tilsiktet `main`.
Den aktive usporede promptloggen beholdes urørt og samles av orkestratoren.

## Brukte kilder og ruting

- Eksisterende Story 3.3 AC1–AC4/testkrav, Epic 3-kontekst, done-spec/review fra 3.1/3.2, PRD-addendum BT-fasit og faktisk eksisterende finans-/terskel-/valideringskode.
- Final UX DESIGN tallformat/metric-grid og EXPERIENCE metric-grid/recommendation, SPEC CAP-5/CAP-6/grensekontrakt, arkitektur AD-7/9/10 og presentation-grensen.
- Sprintplan/status og porter; ingen relevant port eller ny beslutning hindrer denne rene modulstoryen.
- AGENTS.md, faglærertilbakemelding og eksisterende sidehenvist sensoruttrekk. Orkestratoren har kontrollert sensor-PDFens sju sider direkte med Swift/PDFKit i denne økten. Ingen krav er lagt til fra historisk feedback eller generelle kurseksempler.
- Rendret `bmad-build` workflow, step-02-plan, spec-template, step-oneshot og sync-sprint-status. Ingen intensjonsgap/irreversible handlinger; liten reversibel story bruker oneshot uten nytt godkjenningspunkt.

## Resultat og implementeringsvalg

Se [spec](../../implementation-artifacts/spec-3-3-formatere-nokkeltall-uten-a-skjule-okonomiske-brudd.md)
og [verifikasjon](../../implementation-artifacts/story-3-3-verifikasjon.md).
En ny ren presentasjonsmodul og delt kontrakt bevarer hele eksakte grunnlaget,
gjør norsk visning med hele NOK/tre yielddesimaler og forklarer skjulte brudd.
Terskelobjektet eier sin egen presenterte metrikk, kjent delgrunnlag kommer fra
kalleren og ingen ny gyldighet/anbefaling utledes. Modulene har ingen UI/I/O.
TypeScript inkluderer den allerede arkitekturbestemte presentation-mappen.

Åtte desimaler er startpresisjon for yielddetalj; faktisk nødvendig presisjon
økes ved mottatt eksakt brudd. Beløpsdetaljer og Ymin-detaljer beholder alle
desimaler. Tilnærmet yielddetalj er merket og eksakt ratio bevares.
Eksakt grunnlag/terskelutfall klones og lokalisering går aldri tilbake til domain.

36 nye meningsfulle prøver dekker AC/fasit, små og store desimaler, negativ
avrundet null, ikke-beregnbarhet, årsmetadata og ekte før/etter-terskelintegrasjon.
Første kjøring fanget tre feil i testoppsett/forventninger; de er rettet mot
eksisterende kostnadsperioder og norsk detaljformat uten endring av produksjonsregler.
186/186 målrettede prøver, typecheck/lint og 768/768 full Vitest består.
En for tidlig E2E-start ble avbrutt for å kjøre endelig E2E etter avsluttet
Vitest; den endelige råloggen erstatter det avbrutte forsøket. Egen etterlatt
demoserver fra forsøket ble identifisert og ryddet før ny E2E, som består
med 89/89 bygget-app, 3/3 dev og grønn build. Dette var testkoordinering,
ingen appfeil. Siste kontraktpresisering bevarer også registrert Ymin/kilde
som klonet originalt terskelgrunnlag; to prøver er strammet inn. E2E var før
denne additive metadataendringen, uten UI-konsument; full Vitest/typecheck/lint
ble kjørt igjen og består på endelig kode før commit: 768/768 Vitest samt
typecheck/lint.

## Videre checkpoint

Implementeringsagenten stopper med lokal commit og status **in-review/review**.
Ny uavhengig BMAD-reviewagent overtar. 3.4 og alle senere stories er urørt;
ingen ny produkt-/arkitekturbeslutning, ekstern handling eller push.
