# Story 4.4 — godkjent vurdering av generell rapportbegrensning

## Beslutning og hjemmel

Brukerens eksplisitte avklaring 2026-10-24 autoriserer retting av B1 innen
Story 4.4: En **generell** rapportbegrensning kan av brukeren markeres
«kontrollert og ikke kritisk for screening» med kort eksplisitt begrunnelse.
Originalen skal bevares uendret og synlig. Vurderingen er en separat
brukerbekreftet vurdering bundet til rapportidentitet/revisjon, ikke et KI-faktum,
ikke fjerning av begrensningen og ingen teknisk avklaring. Relevant endring
ugyldiggjør vurderingen. Denne nyere bestillingen overstyrer bare tidligere
arbeidsgrense om ingen produktendring for den konkrete B1-rettingen.
Låste FR/S1–S4, kontrakt-/uttrekksversjon 2/1, prompt/schema og fasit består.

Mennesket avgjør semantisk om friteksten er en generell begrensning uten kritisk
betydning for denne screeningen. Kode kan bevise erklæring, begrunnelse og
binding, men **kan ikke bevise fritekstens semantikk**. Ingen nøkkelordliste,
automatisk bortfiltrering, fixtureunntak eller leverandørklassifisering innføres.
UI krever derfor eksplisitt erklæring om at originalen er kontrollert, og at
begrensningen ikke innebærer manglende/motstridende kritisk informasjon,
ufullstendig lesing eller uløst kritisk usikkerhet. Slike faktiske forhold skal
fortsatt blokkere og skal ikke erklæres generelle. En feilaktig menneskelig
semantisk vurdering kan ikke oppdages pålitelig fra `limitations: string[]`.

## Sikkerhetsmodell og implementeringsplan

- `contracts/finding-control.ts`: separat runtimevalidert brukervurdering per
  indeks og eksakt originaltekst; eksplisitt erklæring og ikke-tom begrunnelse.
  Ingen endring av adapterens schema eller originale AnalysisOutcome.
- `domain/finding-control.ts`: anvendbarhet krever completed uten feil, samsvar
  med valgt rapporthash/dokument, requestId, gjeldende originaltekst/indeks,
  listRevision og tg3Revision. Bare den ene limitation-utløseren kan unnlates.
  Alle øvrige utløsere vurderes av eksisterende kode uavhengig.
- `frontend/state/report.ts`: separate vurderinger og endringsrevisjon; ingen
  endring av originalutfall. Brukerhandling avviser ugyldig/stale grunnlag.
  Rapportbytte/nullstilling gir tomme vurderinger. Funnendring eller TG3-endring
  gjør tidligere vurdering uanvendbar; visningsendring gjør det ikke.
- `frontend/screens/LimitationReview.tsx`: originaltekst, eksplisitt begrunnelse,
  egen erklæring og brukerhandling; tilbaketrekking gjeninnfører begrensningen.
  Tidligere uanvendbare vurderinger vises som historiske, ikke gjeldende.
- Resultatbinding/snapshot tar med vurderingene og deres revisjon. Endring gjør
  tidligere resultat historisk; resultatet bevarer original + brukervurdering.

Dette er **ingen generell blocker-override**. Failed/unreadable/unknown/incomplete
kan ikke få en anvendbar vurdering. Kjente kandidatfeil/kildemotstrid,
ubekreftet liste, manglende eller motstridende finansinformasjon og separat
TG3-mangel blir aldri fjernet av en limitation-vurdering. TG3 kan fortsatt stå
Uavklart samtidig som kontrollen fullføres; screening gir da Innhent mer
informasjon. Mekanismen presser ikke bruker til å sette TG3 Avklart.

## Verifikasjonsplan og bevisgrense

Målrettede unitprøver dekker originale F1/F2-uttrekk, eksplisitt vurdering,
originalbevaring, tom/ugyldig/stale registrering, annen rapport/request/revisjon,
ugyldiggjøring, kun én vurdert begrensning, resultatbinding/tilbaketrekking og
at kjente kritiske blokkere består. Bygget-app-E2E i demo/live-modus bruker
originale F1/F2/F4-uttrekk som eksplisitt **offline replay** ved HTTP-grensen.
De bekrefter erklæring/knapp/visning/kodeutfall, ikke nye faktiske KI-resultater,
menneskelig kildekontroll eller S5-tid. Én lokal HTTP-forespørsel, null
leverandørkall. Gamle live-/S2-originaler beholdes byteidentiske.

B2 er separat: F1s opprinnelige receipt har `uiControlCompleted: false`.
Ingen offline produktretting kan skape dette historiske live-sluttbeviset.
Neste agent skal gjøre uavhengig sekvensiell review. Eventuelt nødvendig nytt
F1-liveforsøk planlegges senere med ny identitet/budsjettavstemming, gjerne
sammen med Mads' faktiske S5-kontroll for å unngå ekstra betalt prøve. Ingen nye
betalte kall i denne implementeringsfasen. 4.4 settes ikke done her.

## Faktisk implementeringscheckpoint

Implementert etter beslutningen over; klar for neste uavhengige reviewagent.
Dette checkpointet følger den tidligere samme-dags rapporten
`story-4-4-gjenopptatt-review-2026-10-24.md`: B1s daværende beslutningsgap er nå
avklart av brukeren og produktrettingen er gjennomført. B2 er fortsatt åpen.
Spec/sprint settes tilbake til in-review/review, aldri done fra offline replay.

| Kontroll på implementeringen | Resultat |
|---|---|
| `npm run build` (inkludert typecheck) | bestått; eksisterende Vite-varsel om chunk >500 kB |
| `npm run lint` | bestått, ingen advarsler |
| `node node_modules/vitest/vitest.mjs run tests/unit/limitation-review.test.ts tests/unit/finding-list-control.test.ts tests/unit/finding-control.test.ts tests/unit/result-snapshot.test.ts --maxWorkers=1` | 4 filer, 136/136 bestått; 23 nye begrensningsprøver |
| `node node_modules/@playwright/test/cli.js test tests/e2e/screening-result.spec.ts --grep '4.4 B1 offline originalreplay' --workers=1` | 6/6 bestått etter siste UI-endring |
| Original-/fasit-/modellkontrakt-integritet mot HEAD | 77 sporede filer kontrollert, 0 endret |
| `git diff --check` | bestått |

Node 24.21.0 og eksisterende Playwright-cache ble brukt. Unit- og UI-prøvene
bestod med `OPENAI_API_KEY` og `ANALYSIS_MODE` fjernet og OS-nettsperren
`story-5-3-nettprofil.sb` aktiv (bare lokal loopback tillatt). F1/F2 ga korrekt
Gå videre/Forkast etter eksplisitt vurdering; F4 beholdt Uavklart TG3 og Innhent
mer informasjon. Hver UI-prøve gjorde én lokal HTTP-request og null
leverandørrequests; tilbakekalling ga igjen Innhent mer informasjon.
Prøvene etterprøvde også deaktivert lagring før begrunnelse/erklæring,
synlig original/brukeropphav i resultat og fokus etter lagring/tilbakekalling.
Full regresjon er avtalt hos root etter uavhengig review og er ikke påstått her.

Fasithash er fortsatt
`d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce`.
Nye modellkall: 0. Ny kostnad: USD 0. Opprinnelig samlet USD 0.016072 og S2
TG2 4/4, TG3 1/1 uten oppdiktede funn består som historisk validert bevis.

Ingen Story 4.5-/5.4-/5.5-fil er endret av denne implementeringsagenten.
Brukerens avklaring er i aktiv promptlogg og denne beslutningsfilen; root tar
lokal commit med aktiv promptlogg etter kontroll. Ingen commit/push her.

## Uavhengig review og triage

[Sekvensiell BMAD-review](story-4-4-b1-uavhengig-review-2026-10-24.md) er
gjennomført av separat agent. Ingen verifisert produktfeil; ett testhull i
UI-invalidasjon av tidligere erklæring/usendt utkast ved funnrevisjon er rettet
i F1-originalreplay i begge moduser. Ny kontroll: 23/23 målrettede unitprøver
og 6/6 UI-prøver bestått. B1-produktrettingen består avgrenset review; B2 og
faktisk live-akseptanse gjenstår, så 4.4 er fortsatt review. Ingen nye
leverandørkall, USD 0 ny kostnad. Full regresjon gjenstår hos root.
