# Story 3.2 — implementering og verifikasjon

Dato: 2026-10-21. Baseline `9971a7d2cb2d623c89e73676d2094fc8a5987f23`.
Dette er implementeringsagentens kontroll, ikke den påkrevde uavhengige
BMAD-reviewen. Story leveres ved **in-review/review** til en ny reviewer.

## Krav–kode–test

| AC / låst spor | Implementert atferd og uavhengig fasit |
| --- | --- |
| AC1 | `evaluateNetYieldThreshold` gjenbruker nettoyieldens eksakte teller/nevner og felles Ymin-validering. big.js beregner kun `100 * NOI` og `P * Ymin` og sammenlikner med `>=`. Ingen divisjon, Number/parseFloat, visningsformat, mellomavrunding eller S1-margin. F1 har 150000000 ≥ 112000000. Desimal-P/Ymin med likhet og brudd, samt heltall over Number-safe-grensen, prøves direkte. |
| AC2 / BT-8 / AT-10 | P=16000000, D=400000, Ymin=7 og L=1520000 gir 112000000 ≥ 112000000: bestått. L=1519999 gir 111999900 < 112000000: brutt. I tillegg prøves 27-desimal input like under/over grensen; ingen avrundet yield blir regelinput. Formattersamtolkning tilhører 3.3 og er ikke implementert her. |
| AC3 / BT-9 / AT-3/4/11/15 | Cash=0 består, −1 bryter, og ±0.000000000000000000000000001 beholder rett fortegn. AT-4 gir begge brudd separat samtidig: 100000000 < 112000000 og −1 < 0. Bekreftet J=0 gir cash=1500000. Presis månedsnormalisering beholder negativ cash utover 20 desimaler. |
| AC4 / BT-5/6/18 | Hver P/L/D/J/Ymin prøves separat for blank, ugyldig/negativ, ubekreftet, manglende kilde og uløst konflikt. Berørt terskel får null sammenlikning og konkrete feltårsaker/handlinger. Hele upåvirkede terskelobjektet sammenliknes med originalen. P=0/Ymin-mangel rammer yield, J-mangel rammer cash; L/D rammer begge. Bekreftet Ymin=0 er gyldig også ved null NOI; negativ NOI bryter. Ubekreftet null brukes ikke. |
| AT-2/14 og ytterligere grunnlagskontroll | F2 gir yieldbrudd selv med positiv cash. Eget Ymin=10 brukes uten skjult standard. Bare Ymin-endring endrer ingen av de fire nøkkeltallene. Perioder/år, leieart og ukontrollerbart kostnadsinnhold gjenbruker felles årsaker; gyldig inkludert D/J trekkes ikke fra igjen. Flere samtidige P/Ymin/J-feil samles uten å skjule tilgjengelig separat terskel. |
| Renhet / scope | Fryst input forblir uendret; gjentatt kjøring er identisk, resultatkopier deler ikke kildegrunnlag med input eller andre kjøringer. Registrert Ymin, prosentverdi, kilde, metrikkenes formel/input/enheter/år og normalisering beholdes. Funksjonene tar kun FinancialBasis; ingen rapport, TG3, KI, nettverk, I/O, UI, formatter, anbefaling eller prioritert screening inngår. Strukturfeil som runtime-null kastes av eksisterende kontrakt fremfor å bli skjult null. |

Tilgjengelig økonomisk terskelutfall velger ingen konklusjon. Senere 3.4 må
fortsatt vurdere alle kritiske mangler og teknisk grunnlag med prioritet 1;
en negativ prøve viser både yieldbrudd og J-mangel samtidig og beholder
J-årsaken også i den uendrede felles grunnlagsvalideringen.

## Kontroller

- Målrettet `thresholds`, `finance`, `financial-validation` og
  `financial-basis`: **217/217**, inkludert **67 nye terskelprøver**.
- Full `npm test`: **716/716** i 24 filer, 80,03 s.
  [Rålogg](story-3-2-kontroller.txt). Lokal loopback ble autorisert fra
  første forsøk; ingen kjent EPERM-runde ble gjentatt.
- `npm run typecheck`: bestått etter én retting i testens
  unionindekserte objekttilordning. Direkte oppdatering av felles felter
  rettet TypeScript-feilen; produksjonskoden var uendret.
- `npm run lint`: bestått uten advarsler etter siste testretting.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  typecheck/build bestått, **89/89** bygget-app og **3/3** dev-E2E.
  [Rålogg](story-3-2-e2e-kontroller.txt). Dette er regresjon for eksisterende
  flater, inkludert tastatur/fokus; 3.2 har ingen ny interaktiv flate.
- `git diff --check`: bestått. Eksisterende Vite-varsel om stor PDF-bundle
  og Node-fargevarsler er uendret. Ingen ny buildfeil.

Alle testløp ble kjørt sekvensielt. Lokal implementeringscommit overleveres
hovedagenten uten selvreview eller done-påstand.

Ingen nye produkt-/arkitekturvalg eller blockers. Epic 2 forblir done,
Epic 3 in-progress. Kun 3.2 kan reviewes før brukerens sluttstopp; 3.3–3.9
forblir backlog. Ingen push; aktiv promptlogg holdes utenfor commit.
