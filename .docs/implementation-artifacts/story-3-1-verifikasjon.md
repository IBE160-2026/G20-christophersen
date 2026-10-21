# Story 3.1 — implementering og egenverifikasjon

Dato: 2026-10-21. Baseline: `b143d4ba5e4efe48d040852065f64eda87cdc1cc`.
Dette er implementeringsagentens kontroll, ikke uavhengig code review eller
done-bevis. Se [kortspec](spec-3-1-beregne-fire-nokkeltall-fra-hvert-sitt-gyldige-arsgrunnlag.md)
og [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-1.md).

`calculateFinancialMetrics(FinancialBasis)` leverer fire egne tilgjengelig/
ikke-beregnbart-resultater. Delt kontrakt bevarer formel, enhet, registrerte
input/bekreftelse, kilde/forutsetning, kanonisk verdi, årsnormalisering, felles
relevant år og kostnadsinnhold. Ikke-beregnbart har `value: null` med konkrete
feltårsaker og handlinger. Yield er eksakt teller/nevner; ingen divisjon eller
formatering inngår. Finans tar ikke rapport, modus, TG3, nettverk eller KI.

## AC og uavhengig fasit

| AC | Faktisk implementering og prøver |
|---|---|
| AC1 | L/P, L−D, (L−D)/P og L−D−J beregnes med egen strict big.js-konstruktør. F1: 1900000/16000000, 1500000, 1500000/16000000, 700000. F2: 1400000/16000000, 1000000, 1000000/16000000, 200000. Uendelig 1/3 bevares som 1/3. Formler/input/enheter følger hvert tall. |
| AC2 | Eksisterende felles normalisering gir BT-7/BT-15: 1440000/240000/600000 og NOI 1200000/cash 600000. Måned/år/blanding har samme årsverdier, faktor 1/12 og bevart råtekst/kilde/år. Hver ukjent/ustøttet periode og manglende/ugyldig år testes. Ulike J-år stopper bare cash; ulike L/D-år stopper L/D-beregningene, mens L/P alene fortsatt er gyldig. Standard valideringskall beholder hele L/D/J-kontrollen. |
| AC3 | Alle fem input testes separat med blank/whitespace. Manglende L stopper alle; P bare yield; D alle unntatt bruttoyield; J bare cash; Ymin ingen. P=0 beholder NOI 1500000/cash 700000. Ingen skjult null eller gammel verdi. F3 og F2 uten J har eksplisitt fasit. |
| AC4 | Alle felt testes for ubekreftet verdi, ikke-numerisk/negativ input, manglende kilde og uløst kildekonflikt. Bekreftet/ubekreftet null og særlig J=0 kontrolleres. Alle samtidige relevante årsaker følger ikke-beregnbare tall i stabil rekkefølge. Runtime-null råverdi er kontraktfeil, uten automatisk konvertering. Ugyldig kostnadsinnhold påvirker D/J-avhengigheter. |
| AC5 | BT-11 bevarer NOI −100000, nettoyield −100000/16000000 og cash −900000. BT-9 bevarer 0 og −1. Kostnadsinnhold 120000=100000 drift+20000 gjeld og inkludert avgift 30000 trekkes ikke fra totalene igjen; bruttoyield bruker ingen kostnader. Ingen ekstra finansfratrekk. |
| AC6 | F4 bruker samme økonomi som F1 uavhengig av rapport-/TG3-/modusmarkører, som holdes utenfor finans-API-et. Fryst input gjentas identisk; returmutasjon endrer verken innkommende grunnlag eller andre nøkkeltalls kontrollobjekter. Feil Ymin endrer ingen av de fire resultatene eller deres inputgrunnlag. Ingen terskel, screening eller anbefaling leveres. |

Alle forventede numeriske verdier i de 64 nye finance-testene er faste og
uavhengige av funksjonen som testes, uten Big/Number/divisjon som fasitgenerator.
De kommer fra eksisterende PRD-addendumets F1–F4/BT-1–BT-11/BT-14–BT-18 og
eksplisitte desimaleksempler. Prosentvisningsfasit prøves gjennom bevart eksakt
grunnlag her; faktisk divisjon/format tilhører 3.3. Terskelutfall tilhører 3.2,
og komplette anbefalinger tilhører 3.4.

## Verifikasjon

- Målrettet finance + eksisterende numerikk/kostnadsvalidering: 147/147 tester.
- Full `npm test` med lokal loopback tillatt: **646/646 i 23 filer**, 80,63 s.
  [Faktisk rålogg](story-3-1-kontroller.txt).
- `npm run typecheck` og `npm run lint`: bestått uten feil/advarsler.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  typecheck/build og **89/89 bygget-app + 3/3 dev-E2E bestått** med lokale
  servere/Chromium. [Build/E2E-rålogg](story-3-1-e2e-kontroller.txt).
- `git diff --check`: bestått.

Første ueskalerte fullkjøring var miljøblokkert av sandboxens `listen EPERM:
operation not permitted 127.0.0.1`: 624 bestått/22 avledede HTTP-feil og én
uhåndtert loopback-feil. Identisk eskalert kjøring ovenfor var grønn. Ingen kode
ble endret for denne miljøfeilen. Testløp kjøres sekvensielt.

## Avgrensning og overlevering

Ingen React/UI-/state-/backend-endring eller ny offentlig testrute.
Ny finansmodul importerer bare big.js, kontrakttyper og eksisterende ren
finansvalidering. Felles valideringsutvidelse har valgfritt `yearFields` med
uendret standard; regler/parser/normalisering er fortsatt én autoritet.
Ingen låste krav, UX, arkitektur, SPEC eller porter er endret. Ingen blocker
eller ny produkt-/arkitekturbeslutning er funnet.

Neste tillatte steg er separat uavhengig full BMAD-review av **kun Story 3.1**.
Storyspec og sprintnøkkel er satt til in-review/review etter grønne kontroller.
3.1 må bli done etter bestått review før 3.2 vurderes. Epic 2 forblir done og
Epic 3 in-progress. Ikke start 3.3.

Oppfølging etter separat review 2026-10-21: [uavhengig BMAD-review](story-3-1-review.md)
er bestått og Story 3.1 er nå **done**. Ingen produksjonsfeil; én testkontroll
av hele uberørte resultater er strammet inn og tre egne reviewerprøver lagt
til. Full sluttregresjon: 649/649 unit, 89/89 bygget-app, 3/3 dev-E2E og
typecheck/lint/build grønt. Rapporten bevarer alle ni kandidater og triage.
Epic 3 er fortsatt in-progress; bare 3.2 kan følge i brukerens bestilling.
