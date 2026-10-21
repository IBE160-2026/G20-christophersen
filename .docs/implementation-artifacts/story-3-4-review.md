# Story 3.4 — uavhengig BMAD-review

Dato: 2026-10-21. Modus: **full**. Implementeringsdiff:
`4cd8532ae00fec30093a5ade7390d13920edaeae..5371bd73bef47faad05420228cf4091bf262dd26`.
13 filer, 805 tilføyelser og 2 slettinger. Revieweren er en ny agent etter
implementeringen og har selv lest kode, tester og autoritetskilder.

## Autoritet og metode

[Story 3.4 AC1–AC6](../planning-artifacts/epics.md#story-34-gi-én-komplett-regelbasert-anbefaling-med-fast-begrunnelse),
[storyspec](spec-3-4-gi-en-komplett-regelbasert-anbefaling-med-fast-begrunnelse.md),
Epic 3-kontekst, SPEC CAP-4/5/6 og grensekontrakten Finans og screening,
arkitektur AD-1/7/8/10, final UX recommendation/basis-detail, FR-5/13/16/17/18,
PRD-addendums AT-/BT-/FR-5-fasit, brief-addendum og sprintplan/status er
sammenholdt med implementeringen. Ingen UI, snapshot-/revisjonsbinding eller
senere endringsforløp regnes levert av denne rene modulstoryen.

Faglærerfeedback og det sidehenviste sensoruttrekket er lest i tråd med
AGENTS.md. Orkestratoren har i denne økten kontrollert uttrekket direkte mot
alle sju sider i sensor-PDFen. Her brukes støtten for avgrenset omfang,
fasittester, plan–kode–test-spor, lagret arbeidsøkt og konkret review/retting.
Ingen nye kurskrav eller produktkrav er innført.

`bmad-code-review` ble aktivert gjennom `uv run --no-cache` og rendret
workflow. Fire context-free barn med samme modellkapabilitet kjørte **ett
om gangen**: Blind Hunter → Edge Case Hunter → Verification Gap Reviewer →
Acceptance Auditor. Brukerens sekvenskrav overstyrte parallelldefaulten.
Ingen filer ble endret mens et lag var aktivt. De tre første fikk bare
instruksjons-/diffstier; Edge Case Hunter fikk separat claims-fil. Acceptance
Auditor fikk spec og autoritetskilder. Ingen lag feilet eller ble hoppet over.
Blind Hunters gulv var `min(floor(sqrt(59,672 kB) + 1), 10) = 8`.

## Individuell triage før gruppering

Alle ni kandidater beholdes individuelt, inklusive overlapp og avvisninger.
Alvorlighetsgrad og håndtering er reviewerens vurdering etter egen kontroll.

| ID / lag | Kandidat og konkret bevis | Dom / håndtering |
|---|---|---|
| B1 / Blind Hunter | `screening.ts:73–74` stoler på separat `tg3Findings`. Completed rapport med bekreftet aktivt TG3, bekreftet liste og tom projeksjon er tillatt av den nye `ScreeningInput`-typen og ga prioritet 3. Samme feil oppstår når projeksjonen inneholder et annet, internt gyldig avklart forhold. | **medium**, patch G1. Ny modulgrense kan skjule kjent TG3 for en konsument som bygger input. Eksisterende state-selektor lager riktig liste, men API-et deklarerer ingen slik forutsetning og har hele rapportfunnet tilgjengelig. Tre røde prøver demonstrerer feilen/manglende utløser. |
| B2 / Blind Hunter | Completed outcome sammen med `error='interrupted'` ignorerer error i eksisterende `assessFindingList`. `report-response` setter derimot completed/error=null atomisk; alle errorbaner setter failed/outcome=null. | **low**, avvist. Tilstanden krever manuell selvmotsigende konstruksjon og finnes ikke i eksisterende brukerflyt. Ny statuskonfliktgren i den eldre autoriteten er mer kompleksitet enn en direkte retting uten en aktuell nåbar feil. |
| B3 / Blind Hunter | Assessoren skipper enhver rejection uten separat revisjonssammenlikning. Faktisk reducer oppretter `rejection.revision === revision` atomisk, og alle etterfølgende funnhandlinger avvises når rejection finnes. | **low**, avvist. Ingen nåværende endringsbane lager gammel rejection; ekstra gyldighetsgren ville kontrollere en håndlaget tilstand produsenten ikke lager. |
| B4 / Blind Hunter | Den faste `explanation`-strengen har ikke økonomiske tall eller avrundingsforklaring. Hver økonomisk trigger har imidlertid det ekte eksakte terskelobjektet, med metrikkens verdi, Ymin eller nullgrense, input/kilder og eksakt sammenlikning. AT-2/3/4/14 og små desimalbrudd verifiserer dette. | **false**, avvist. AC2s aktuelle verdier/grenser leveres i strukturert regelgrunnlag. Modulen velger ingen visningspresisjon; FR-17s synlige avrundingsforklaring hører sammen med senere presentasjon. Dette er ikke et manglende regelgrunnlag. |
| B5 / Blind Hunter | `EconomicScreeningTrigger` kan manuelt konstrueres med bestått kode og brutt terskel. Faktisk produsent setter koden fra samme `threshold.decision.status` og returnerer først etter unavailable-guard. | **low**, avvist. Ingen konsument eller ekstern innlesingsgrense konstruerer slike utdata. Flere statusbundne krysstyper ville øke kompleksiteten uten en faktisk feil fra produsenten. |
| B6 / Blind Hunter | Resultattypen tillater manuelt tomme trigger-arrays og feil koder for proceed. Produsenten filtrerer brudd og krever lengde >0 for rejected; proceed returnerer fast to beståtte økonomivilkår og teknisk tilstrekkelighet. Fasitprøvene verifiserer alle tre utfall. | **low**, avvist. Ingen demonstrert tomt/selvmotsigende resultat fra den faktiske produsenten; ekstra konstruksjonsmekanikk ville bare begrense håndlagde DTO-er. |
| B7 / Blind Hunter | Finans og validering beregnes flere ganger gjennom de eksisterende terskelfunksjonene. | **low**, avvist. Ingen målt ytelsesfeil eller problematisk nåværende datamengde ble demonstrert. Sammenslåing av eksisterende finans-/terskel-API-er er mer enn en direkte retting og er unødvendig for korrekt screening. |
| B8 / Blind Hunter | De nye fullscreeningfixturene bygger rapport-/TG3-projeksjonen manuelt og kontrollerer ikke den faktiske reportReducer-/selektorgrensen for korrigert eller avvist rapportfunn. | **medium**, patch G2. Tre nye prøver bruker ekte handlinger og `currentTg3Findings` til full screening: gyldig avklart TG3, brukt TG2-korrigering og avvist funn. Original TG3 bevares i alle tre. |
| E1 / Edge Case Hunter | Egen Node-reproduksjon viste at kontrollert aktivt TG3 med tom separat projeksjon gir Gå videre og technical-basis-sufficient. | **medium**, patch G1; samme rotårsak som B1. |

Verification Gap Reviewer rapporterte **ingen verifikasjonsgap** etter sine
søk. Acceptance Auditor rapporterte **ingen bekreftede AC-avvik** og fant at
eksisterende `currentTg3Findings` avleder korrekt liste fra aktive/korrigerte/
ikke-avviste funn. Denne vurderingen er bevart: revieweren fant heller ingen
feil gjennom eksisterende stateflyt. B1/E1 rettes likevel ved den **nye rene
API-grensen**, som tar en separat projeksjon uten dokumentert forutsetning om
selektorbruk. Rettelsen innfører ingen ny produkt-/arkitekturbeslutning.

Etter individuell triage og gruppering: **0 decision_needed, 2 patch,
0 defer, 6 avvist**. Ingen funn krever endring av låst krav eller plan.

## Retting og bevis

G1: `assessFindingList` kontrollerer hvert kjent aktivt TG3 mot separat
TG3-grunnlag med eksisterende `sameTg3Basis`. Manglende/motstridende grunnlag
gir navngitt `unresolved-tg3` med beskrivelse, dokument, fysisk PDF-side og
nødvendig avklaring. `tg3Handled/controlCompleted` forblir false. Failed
delresultat bevarer kjent TG3 som egen utløser uten å godta brukerkontroll.
Brukt korrigering og avvisning respekteres. Både lokale flater og full
screening konsumerer dermed samme mangelautoritet; ingen parallell regel
eller semantisk gjetning er lagt til.

Tre negative prøver ble kjørt før produksjonsrettingen. Manglende og feil
projeksjon ga feil prioritet 3; failed delresultat mistet den kjente
TG3-utløseren. **3 feilet / 69 besto**. [Rå rødlogg](story-3-4-review-rod.txt).
G1/G2 tilfører totalt **6** meningsfulle prøver, slik at fullscreeningfilen
har **72** prøver. Ekte reducer/selektorer demonstrerer at rettingen ikke
feilblokkerer avklart, korrigert eller avvist grunnlag.

Målrettet reviewerregresjon: **149/149** i fire filer
(fullscreening, funnlistekontroll, funnkontroll og TG3-avklaring).
[Rålogg](story-3-4-review-malrettet.txt).

## Sluttregresjon og checkpoint

Denne revieweren kjørte alle sluttkontroller **etter siste kode-/testendring**,
sekvensielt i bestilt rekkefølge:

- Full `npm test`: **853/853**, 26 testfiler. [Rålogg](story-3-4-review-regresjon.txt).
- `npm run typecheck`: bestått. [Rålogg](story-3-4-review-typecheck.txt).
- `npm run lint`: bestått uten advarsler. [Rålogg](story-3-4-review-lint.txt).
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  build/typecheck, **89/89 bygget-app** og **3/3 dev-E2E** bestått.
  [Full rålogg](story-3-4-review-e2e.txt). Forventede private Vite-ruteavvisninger
  er negative sikkerhetsprøver; eksisterende bundle-størrelsesvarsel og
  NO_COLOR/FORCE_COLOR-varsel er ikke testfeil.
- `git diff --check`: bestått.

Råloggenes avsluttende blanklinjer og linjeavsluttende mellomrom er fjernet
for diffkontroll; ingen testutdata eller feilmeldinger er utelatt.
HTTP-/E2E-kontroller fikk nødvendig lokal loopbacktilgang. Ingen kjent
bind-EPERM-runde ble gjentatt. Kode og tester er uendret etter disse
sluttkontrollene. Dette er lokale testbevis, ikke live-/S2-/S5-/S6-bevis.

## AC-vurdering og endelig status

| AC | Faktisk bevis | Vurdering |
|---|---|---|
| AC1 | AT-5/6/7/8/12/13/18, BT-3/5/6/17/18, alle samtidige mangler, kildekonflikt, ugyldig/ubekreftet finans, completed/tom/bekreftet kontra failed/usikker. Nye manglende/feil TG3-projeksjoner og failed delresultat prøves mot lokal autoritet. | Én prioritet 1; alle kjente utløsere/handlinger i stabil orden. |
| AC2 | AT-2/3/4/14, eksakte faktiske metrikkverdier/Ymin/nullgrenser, positivt motvilkår og begge brudd. | Én prioritet 2, ett/begge økonomiske brudd bevart. |
| AC3 | AT-1/9/10/11/15, likhet, én krone under, mindre desimalbrudd, bekreftet J=0 og L=D=J=Ymin=0. | Én prioritet 3 med to økonomiske vilkår og teknisk screeninggrunnlag, neste handling grundigere vurdering/befaring. |
| AC4 | AT-6/20, alle sju FR-5-eksempler, TG3-binding mot beskrivelse/hash/dokument/side, tillatt representasjonsretting og ekte reducer/selektor. | Mangel overstyrer økonomi; gyldig avklaring bevarer TG3 og lar økonomien avgjøre. |
| AC5 | AT-19 F1/F2/AT-18 sammenlikner full fast tekst, utløsere og handling. Fryst input, gjentatt JSON-likhet, permutert rapportorden, utdataisolasjon og før/etter mot ekte finans/terskler. | Deterministisk, uten KI/nettverk/avrunding/S1-margin i avgjørelsen. |
| AC6 | Samme fullstendige grunnlag gjennom felles lokale vurderinger og full screening, også ny TG3-mangel. Feilårsaker/mål bevares; ukjent årsak gjettes ikke. | Samme mangelbetydning og nødvendig handling. |

**Bestått etter retting og full sluttregresjon.** Begge patchgrupper er lukket;
ingen åpne high/medium-funn, defer eller beslutningsbehov. Storyspec og
sprintnøkkel settes **done**. 3.3 forblir **done**, Epic 3 **in-progress** og
3.5–3.9 **backlog**. Ingen senere story er startet; ingen push eller endring
av autoritative planer/porter. Lokal review/done-commit rapporteres med full
canonical SHA til orkestratoren. [Egen arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-4-review.md).
