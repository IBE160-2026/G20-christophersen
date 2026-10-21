# Story 3.2 — uavhengig BMAD code review og sluttregresjon

Dato: 2026-10-21. **Bestått. Story 3.2 done.** Review av bare implementeringsdiffen
`9971a7d2cb2d623c89e73676d2094fc8a5987f23..a9fb442eedec6068849712c3432371ad30f5ecc7`:
11 filer, 718 tilføyelser og én sletting. Dette er en ny reviewagent etter
implementeringsagenten. Autoritet er Story 3.2 AC1–AC4 i epics.md, kortspec,
Epic 3-kontekst, låst PRD-addendum, final UX, AD-1/7/10, SPEC CAP-5/CAP-6,
grensekontraktens finansregler og sprintplan/status. Sensorveiledningens
kildeuttrekk og faglærerfeedback brukes til sporbarhet, avgrensning og
vanlig deterministisk finanskode med uavhengig fasit. Ingen nye kurskrav.

## Reviewlag og arbeidsform

Fire separate reviewbarn ble kjørt sekvensielt, uten egne filendringer
mens et barn var aktivt. Brukerens eksplisitte sekvensregel overstyrer
standardworkflowens parallelle lag. Brukeren har også forhåndsautorisert
konkrete Story 3.2-rettinger, statusoppdatering og lokal commit.

- **Blind Hunter:** åtte kandidater, etter 57 953 bytes / 1000 = 57,953 kB;
  min(floor(sqrt(57,953)+1),10) = 8. Alle triageres nedenfor.
- **Edge Case Hunter:** først `[]`. En separat oppfølging bekreftet fullført
  analyse uten konkrete funn: likhet/brudd, små desimaler/store heltall,
  Ymin/J=0, mangler, kildekonflikter, periode/år, kostnader, isolasjon og renhet.
  Ingen påkrevd fil var uleselig. Et tilleggssøk traff en manglende Vitest-
  deklarasjon uten å hindre analysen. Oppfølgingen avklarer at laget fullførte,
  fremfor en uavklart tom/feilet kjøring.
- **Verification Gap Reviewer:** ingen verifikasjonshull funnet.
- **Acceptance Auditor:** ingen funn mot AC1–AC4, låste presisjons-/grunnlagskrav
  eller scope; kontrollerte også faktiske produksjonsavhengigheter og fasit.

Deretter fulgte revieweren selv faktiske kall og autoritative krav, la til
16 egne negative prøver og kjørte målrettet og full sluttregresjon.

## Triage — alle åtte kandidater

| ID / kilde | Verdikt og konkret bevis | Behandling |
| --- | --- | --- |
| 1 Blind: terskelskjema tillater feil metrikk-kind | low som kontraktforbedring. Schemaet er strukturelt bredt, men evaluateNetYieldThreshold velger eksplisitt netYield og krever ratio; evaluateCashFlowThreshold velger cashFlowBeforeTax og krever amount. Ingen annen produsent eller inngående terskelobjekt finnes. | Forkastet: ekstra semantiske guards/typer tilfører kompleksitet uten demonstrert feilende produsent eller konsument. |
| 2 Blind: skjema tillater motstridende tilgjengelighet | low som kontraktforbedring. Tverrobjektrelasjonen håndheves av de eneste produsentene: unavailable returneres før compare dersom metrikk eller Ymin er utilstrekkelig. Matrisen over mangler/kilder/år bekrefter dette. Ingen ekstern terskelinnlesing. | Forkastet: ikke legg til nye semantiske kontraktforgreninger for håndlagde outputkombinasjoner som ikke kan oppstå i nåværende program. |
| 3 Blind: skjema kontrollerer ikke sammenlikningsresultatet | low som kontraktforbedring. Schemaet aksepterer strukturelt status passed med 0>=1, men programmets compare setter status direkte fra strict big.js gte. Uavhengig fasit kontrollerer faktisk resultat. | Forkastet: en ny aritmetisk regelkopi i contracts ville ikke rette noen aktuell feil. |
| 4 Blind: hver funksjon beregner alle fire metrikker | low som effektiviseringsforslag. Begge terskler samlet gjør ni grunnlagsvalideringer via eksisterende 3.1-API og separat Ymin-kontroll. Dette er reelt ekstraarbeid, men ingen målt ytelsesfeil eller feil resultat er påvist. | Forkastet: ny delmetrikk-API/cache krever mer kompleksitet enn lokal, ubetydelig kostnad forsvarer. Ingen finansrefaktor uten behov. |
| 5 Blind: mangler kostnadsoverløpsprøver ved terskelgrensen | low verifikasjonsforbedring. De eksisterende grunnlagsprøvene dekker valideringen, men terskeltestene manglet eksplisitt cost-exceeds-total og D/J-isolasjon. | Rettet: to nye prøver bruker D-del=400001 eller J-del=800001. D rammer begge terskler; bare J gjør cash unavailable mens yieldavgjørelsen består uendret. Årsak/handling og null sammenlikning kontrolleres. |
| 6 Blind: mangler prøver for ugyldig inkludering | low verifikasjonsforbedring. Terskeltesten viste bare gyldig inkludering og ugyldige beløp. | Rettet: tre nye prøver med syklus, manglende forelder og duplisert id. Begge terskler er unavailable med invalid-cost-inclusion og konkrete D/J-årsaker, uten sammenlikning. |
| 7 Blind: global Big-konfigurasjonsisolasjon er ikke testet | low verifikasjonsforbedring. Privat konstruktør er riktig implementert, men påstanden manglet direkte prøve. | Rettet: én ny prøve setter global DP/RM/NE/PE/strict og etterprøver eksakt yieldbrudd samt negativ cash på 28. desimal. finally gjenoppretter alle innstillinger. |
| 8 Blind: mangler enkelte felles årsaker på terskelnivå | low verifikasjonsforbedring. Unknown-period/blankt år var prøvd, men manglende/ustøttet periode, ugyldig år og unsupported-actual-rent manglet egne terskelprøver. | Rettet: ni parametriske L/D/J-prøver og én prøve for faktisk leie registrert som egen forutsetning. Berørte terskler får konkret årsak/handling; upåvirket yield ved J-feil bevarer hele resultatet. |

Fire direkte testforbedringer, fire forkastede forslag, ingen defer eller
decision-needed. Ingen produksjonskode eller låst kontrakt/UX/arkitektur ble
endret. Alle kandidater er lukket, ingen alvorlige eller middels funn gjenstår.

## AC mot faktisk kode og uavhengige prøver

| AC / låst fasit | Etterprøvd atferd |
| --- | --- |
| AC1 | thresholds.ts bruker privat strict big.js og eksakt 100*NOI >= P*Ymin. Nettoyieldens eksakte teller/nevner kommer fra 3.1; ingen yielddivisjon, Number/parseFloat, toleranse, mellomavrunding eller formatter inngår. Desimal-P/Ymin og heltall over Number-safe-grensen prøves med faste forventninger. |
| AC2 / BT-8 / AT-10 | L=1520000 gir 112000000>=112000000 og passed; L=1519999 gir 111999900<112000000 og breached. 27-desimal input rett under/over grensen beholder nøyaktig utfall uten visningskode. Ingen 3.3-formattering bygges. |
| AC3 / BT-9 / AT-3/4/11/15 | J=1500000 gir cash 0 og passed; J=1500001 gir -1 og breached. Små positive/negative desimalbeløp, presis månedsnormalisering og bekreftet J=0 prøves. AT-4 beholder både yieldbrudd og cashbrudd samtidig, uten å velge anbefaling. |
| AC4 / BT-5/6/18 | Blank/ugyldig/ubekreftet/konflikt/kildemangel gir konkret berørt unavailable uten sammenlikning. P=0 og Ymin-mangel hindrer ikke cash; J-mangel hindrer ikke yield. L/D rammer begge. Periode/år, faktisk leie og kostnadsinnhold gjenbruker felles autoritet. Ymin=0 er gyldig bare ved bekreftelse og gyldig kilde. Samtidige P/Ymin/J-årsaker samles; tilgjengelig økonomi overtar aldri senere prioritet 1. |
| Renhet og scope | Input er FinancialBasis, uten rapport/TG3/demo/live. Fryst input, gjentatt kjøring og kopiert kildegrunnlag prøves. Ingen KI, nettverk/I/O, presentasjon, anbefaling, snapshot eller 3.4-screening. Runtime-null er kontraktfeil og blir ikke skjult null. |

BT-/AT-forventningene er konkret fasit fra låst addendum, ikke beregnet med
funksjonen under test. Storyen endrer ingen interaktiv flate; tastatur/fokus
etterprøves derfor med eksisterende bygget-app-E2E som regresjon, ikke en
påstand om ny resultatflate.

## Siste kontroller på endelig kode

Målrettet `npx vitest run tests/unit/thresholds.test.ts`: **83/83**, inkludert
16 nye reviewerprøver. Deretter én full sluttregresjon, sekvensielt etter
siste testendring og uten annen samtidig testlast:

- `npm test`: **732/732** i **24 filer**, **80,95 s**.
  [Rålogg](story-3-2-review-unit-kontroller.txt).
- `npm run lint`: bestått uten advarsler.
  [Rålogg](story-3-2-review-lint-kontroller.txt).
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  typecheck og build bestått, **89/89** bygget-app (**37,1 s**), deretter
  **3/3** dev (**1,7 s**). [Rålogg](story-3-2-review-e2e-kontroller.txt).
- `git diff --check`: bestått. Kjente Vite-varsel om PDF-bundlestørrelse,
  Node-fargevarsler og forventede avvisninger av private dev-ruter er uendret.

Fulltesten og E2E fikk autorisert lokal loopback fra første forsøk, uten
gjentatt kjent EPERM-runde. Ingen betalt KI eller eksternt nett er brukt.
Etter sluttregresjonen er bare status-/review-/prosessbevis oppdatert;
produktkode og tester er de samme som i den grønne kjøringen.

## Sluttstatus og overlevering

Storyspec og sprintnøkkel: **3.2 done**. **Epic 2 done**, **Epic 3 in-progress**;
3.1/3.2 done, 3.3–3.9 backlog. Ingen ny blocker, ulåst produkt-/arkitektur-
beslutning eller endring av R1/R4-portene. Ingen push. Aktiv JSONL-promptlogg
holdes utenfor reviewcommit etter orkestratorens instruksjon.

Neste handling er bare orkestratorens dokumenterende sluttrevisjon og én
samlet sluttrapport for brukerens arbeidsrunde. **Stopp før Story 3.3.**
