# Story 1.7 — BMAD code review

2026-10-19. **Bestått etter reviewretting; Story 1.7 og Epic 1 done.**
Reviewmål: `6a3d8d361f5a738e35e1a00ccccaf185a72ad6f8..f827b51128488755b8c855a26dbdb53fb1e5abf1`
og reviewpatch i samme lokale kjede. 15 filer, +832/−83 før review.
[Råkontroller](story-1-7-review-kontroller.txt).

## Styring og kilder

Full `bmad-code-review`, aktivert med resolver/config og fire nye lesende
underreviewere i rekkefølgen blind-hunter → edge-case-hunter →
verification-gap → acceptance-auditor. Hvert lag var ferdig før neste
startet. Ingen prosjektfil ble endret mens underreviewere leste. Root
skrev ingenting mens faseagenten hadde skriveansvar. Ingen lag feilet;
blindlaget beregnet N=9 fra 80,610 kB, men leverte seks konkrete kandidater
uten hypotetisk kvotefylling. Kvoten er ikke bevis på feil.

Lagene fikk den fullstendige Git-diffen som fil, ingen utdrag. Blindlaget
var kontekstfritt; edge-laget fikk egen prompt og separat commit-claimsfil;
verification-gap brukte egen prompt, repoets tester og søk; AC-auditor fikk
implementeringsspecen og låst Story 1.7 AC1–AC6/testkrav. Alle var eksplisitt
skrivebeskyttet og uten delegering. Diffen kan gjenskapes direkte fra
Git-revisjonene over. Individuell triage nedenfor bevarer alle ti forslag.

Reviewer leste faktisk reducer/domain/UI/testkode, storyspec, epics,
sprintplan/-status, readiness, relevant final UX/DESIGN, AD-1/2/7/8/9/10 og
grensekontrakter. Kursveiledningen ble lest fra eksisterende direkte
sju-siders PDF-uttrekk, og faglærertilbakemeldingen avstemt. Sporbarhet,
realistisk scope, faktiske tester og reviewrettinger dokumenteres uten nye
produktkrav. Brukerens eksplisitte fasebestilling dekker patcher/status og
lokal commit samt generiske skillbekreftelser. Ingen ny produkt- eller
arkitekturavgjørelse. R2 og de øvrige readiness-portene forblir åpne.

## Individuell triage før gruppering

| ID / lag | Kontrollert påstand | Verdict / handling |
|---|---|---|
| B1 / blind | D-periode/år endrer også kostnadspostenes J-kontekst, men bare D ble ugyldiggjort. Domain bruker D-konteksten for annualD og annualJ. | medium / patch; ny bekreftelse av berørt J kreves ved faktisk D-kontekstendring med poster. |
| B2 / blind | Alle postfeil fokuserte gyldig navn selv når beløp/rentedel/inkludering måtte rettes. | medium / patch; konkret feilfokus for berørt kontroll. |
| B3 / blind | Bare blank kildebeskrivelse feilmarkerte også gyldig opphav og leiegrunnlag. | low / direkte patch; manglende metadata markeres per berørt kontroll, eksisterende konflikt-/faktisk-leie-semantikk beholdes. |
| B4 / blind | Fokusert ubekreftet nullcheckbox manglet aria-invalid. | low / direkte patch; ugyldigstatus følger synlig unconfirmed-zero. |
| B5 / blind | Tilbaketrukket nullkontroll viser Ubekreftet fremfor Endret. | false / rejected; det er kontrollstatus som trekkes tilbake, ingen råverdi/kontekst endres. Ubekreftet, eksplisitt ny kontroll og sperret videregang er riktig og nå prøvd. |
| B6 / blind | Etter siste retting forsvinner kandidatens konkrete blokkere, mens faktisk bekreftelse mangler. | false / rejected; status sier fortsatt «Tallgrunnlaget er ubekreftet. Kontroller feltene og bekreft på nytt.» Neste trinn er sperret og kandidaten setter ingen faktisk bekreftelse. Nødvendig handling er synlig. |
| E1 / edge | Samme D→J-kostnadskontekst som B1. | medium / patch, samme rotårsak som B1. |
| V1 / verification-gap | Ingen eksisterende test trekker tilbake en allerede bekreftet nullcheckbox; en tidlig retur for checked=false ville overleve tidligere tester. | medium verifikasjonsgap / patch; ny reducer-test og utvidet faktisk J=0-brukerflyt med sperre og ny bekreftelse. Ingen feil i selve eksisterende tilbaketrekkingsgrenen påvist. |
| A1 / acceptance | Samme D→J-avvik fra AC3/AC4 som B1. | medium / patch, samme rotårsak som B1. |
| A2 / acceptance | Samme kostnadsfeilfokusavvik fra AC2 som B2. | medium / patch, samme rotårsak som B2. |

Åtte overlevende forslag grupperes til **fem patchgrupper**: B1/E1/A1,
B2/A2, B3, B4 og V1. Fire konkrete kodefeil og ett verifikasjonsgap er
rettet. To forslag avvist individuelt; ingen decision-needed/defer,
high-funn eller uløste medium-funn. Ingen funn er løst ved å endre krav.
Storyspecens Review Findings fører samme resultat.

## Alle AC mot faktisk sluttkode

| AC | Egen kontroll og resultat |
|---|---|
| AC1 | Faktiske felt viser råverdi/enhet/periode/år, eksakt faktor/årsverdi fra domain, opphav/forutsetning og kostnadsdeling. Registreringshandlinger bekrefter aldri. F1 og måned ×12 prøves i bygget app. **Bestått.** |
| AC2 | Samme validateFinancialBasis og evaluateKnownDeficiencies styrer kandidatfeil/lokale faste blokkere. F3 blank L, ugyldig P, ulike år, L-konflikt, kildebeskrivelse og J0 gir tilknyttet konkret feil, inputbevaring, riktig første feilfokus og ingen gyldig bekreftelse. Nye beløps-/rentedels-/inkluderingsforløp avslørte gammel feil og består etter patch. **Bestått.** |
| AC3 | Eksplisitt gyldig confirm-financial binder aktuelle verdier/kontekst/kostnader. J0 trenger egen nullkontroll pluss samlet bekreftelse; blank forblir mangel. Tilbaketrekking opphever kontroll og sperrer videregang til ny eksplisitt nullkontroll/bekreftelse. Tilstandsrapport åpnes uten analyse. **Bestått.** |
| AC4 | Rene tabulerte reducer-tester dekker hver råverdi, periode/år, kilde/leiegrunnlag og kostnadsdel. Bare berørte bekreftelser oppheves; identiske handlinger er no-op. Ny D→J-regresjon gir korrekt ugyldiggjøring når postenes felles kontekst endres; uendrede P/L beholdes. F1-endring/ny bekreftelse prøves i app. **Bestått.** |
| AC5 | Samme reducerøkt bevarer datareferanser/kontekst/bekreftelser/revisjon ved navigasjon. E2E frem/tilbake gir ingen API-kall; reload starter blankt. Ingen lagring eller KI-/analyseeffekt er innført. **Bestått.** |
| AC6 | Native etiketter/enheter/kilder/feil, presist fokus, kort role=status/polite og h1 ved trinnbytte. Nye metadata-/nullfeilregresjoner består. Egne Chrome/CUA-observasjoner og tester bekrefter synlig fokus under stepper og kontrast. **Bestått.** |

## Egne tester og faktisk UI-kontroll

- Før patch: nye reducerforventninger viste **2 feil / 50 bestått** (52); J.confirmed var true etter D-periode/-år. De fem målrettede bygget-app-regresjonene viste **5/5 forventede feil**. Full rå-E2E bevart; første reducerkjøring er bare bevart i toolhistorikk og presis beskrivelse i råkontrollfilen.
- Etter patch: **180/180 Vitest**, fem filer; Story 1.7-reducerdelen **52 tester**, tre nye fra review.
- `npm run lint`: **bestått**, ingen lintdiagnostikk.
- `npm run test:e2e`: **typecheck/build, 41/41 demo-E2E og 2/2 dev-E2E bestått**. Tre nye kostnadsforløp og utvidede null-/metadataforløp. F1/F3/ugyldig P/L-konflikt/ulike år/retting/ny bekreftelse inngår.
- `git diff --check`: **bestått** før commit. Låste kilder **101/101 uendret**.

Eksakt eksisterende Node 24.21.0/npm 11.19.0-runtime og lokal Chromium-cache
står i råfilen. Lokal server/Chromium ble autorisert kjørt utenfor sandboxens
kjente loopback-sperre, uten installasjon eller eksternt KI-kall.

Egen native Chrome/CUA-runde etter patch: ny kontrollfane i bygget app,
Tab/Enter på hoppelenke → h1; ugyldig bekreftelse → første P-felt; videre
Tab til opphav og kilde. Faktisk **200 % og 400 %** ble satt og bekreftet i
Chromes zoompopup. Fokusert kildekontroll var synlig under stepperen;
ombryting og fokusring ble inspisert på faktiske skjermbilder. Første
pluss-snarvei på norsk tastatur skrev aksenttegn i testfeltet; det ble
observert, og riktig zoom ble deretter valgt i Chrome-kontrollen. Ingen
zoom påstås fra dette mislykkede snarveiforsøket. **100 % gjenopprettet**,
bare egen fane lukket, lokal kontrollserver stoppet. Automatiske
viewport-/tastaturkontroller dekker også korte flater. Ingen skjermleser,
annen-person-S6 eller senere funksjon er påstått.

Målt i faktisk bygget app: primærknapp/fokus **6,70:1**, feiltekst **7,10:1**,
lokal mangeltekst **11,60:1**, kontrollgrense **3,81:1**; DESIGN-mål består.

## Integritet og overlevering

101/101 kildehasher i mini-sprintens manifest er uendret. Reproduserbar
kontroll uten midlertidig manifest:

```sh
git diff --exit-code 6a3d8d361f5a738e35e1a00ccccaf185a72ad6f8 -- AGENTS.md .docs/planning-artifacts .docs/specs .docs/reference/course .docs/implementation-artifacts/sprint-plan.md
```

Storyspecens frosne Intent er urørt; bare status og reviewnotater er ført.
Alle sju Epic 1-stories er done, derfor settes **Epic 1 done**.
Epic 1-retrospective forblir optional. Epic 2 og 2.1 forblir backlog.
Ingen ny beslutning, blocker, senere story eller push. Neste fase er ny
implementeringsagent for **kun Story 2.1** etter lokal reviewcommit og
uttrykkelig retur av skriveansvar. Story 2.3/R2 er ikke startet/omgått.
