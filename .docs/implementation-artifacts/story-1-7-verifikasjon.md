# Story 1.7 — egenverifikasjon før separat review

Dato: 2026-10-19. Baseline: `6a3d8d361f5a738e35e1a00ccccaf185a72ad6f8`.
Autoritet: [uendrede seks AC og testkrav](../planning-artifacts/epics.md#story-17-kontrollere-bekrefte-og-rette-gjeldende-tallgrunnlag),
[sprintplan](sprint-plan.md), [readiness](../planning-artifacts/implementation-readiness.md),
final UX og AD-1/2/7/8/9/10. Dette er egenverifikasjon, ikke Fase 3-review.

## AC-bevis

| AC | Faktisk kode og observerbart bevis |
|---|---|
| AC1 | `FinancialInput` viser råregistrering, NOK/%, periode/år, kilder/forutsetninger/kostnadsinnhold og eksakt normalisering fra eksisterende domain. Ingen registreringshandling bekrefter. F1 med årsbeløp og separat månedstest viser `150000 × 12 = 1800000 NOK/år · 2026`. Eksisterende 1.5-tester viser kostnadsdeling og opphav. |
| AC2 | `confirmationCandidate` vurderes med `validateFinancialBasis`; ugyldig forsøk endrer ingen registrering/bekreftelse. UI kobler konkrete feil til input/perioder/år/kilder/nullkontroll; `evaluateKnownDeficiencies` fra 1.6 gir lokal Innhent mer informasjon med faste årsaker og nødvendige handlinger. Bygget-app viser F3 blank L → value-L, P=0 → value-P, ulike år → year-L, J=0 → zero-J, L-konflikt → conflict-value-L og manglende L-kildebeskrivelse → source-L. Retting bevarer input og flytter ikke fokus automatisk. |
| AC3 | Bare eksplisitt `confirm-financial` etter gyldig full kandidat setter feltbekreftelsene. Egen checkbox kontrollerer gjeldende null uten alene å bekrefte tallgrunnlaget. J=0 blir gyldig etter begge handlinger; blank er fortsatt mangel. Bygget app åpner neste trinn uten rapport-/analysehandling. |
| AC4 | Reducer opphever berørt felt ved faktisk råverdi/år/periode/kilde/leiegrunnlagendring og D/J ved kostnadsendring; uendrede felt bevares. `financialRevision` øker bare ved faktisk grunnlagsendring. `changedFields` vises frem til gyldig ny bekreftelse. 28 tabulerte endringsscenarioer, fire kostnadsinnholdsdeler og ny nullkontroll etter kildeendring verifiseres direkte. F1→endre L→ny bekreftelse testes i bygget app. |
| AC5 | Reducer bevarer datareferanser, revisjon og kontrollstatus ved identiske registreringer og gjentatt frem/tilbake. Appens samme frontendøkt bevarer input/kontekst og gyldige bekreftelser. Ingen `/api`-forespørsel under F1-bekreftelse/endring/trinnretur. Reload gir blank initialtilstand; ingen lagring/effekt/analysesnarvei er innført. |
| AC6 | Native Chrome/CUA-runde observerte hoppelenke→h1, ugyldig forsøk→P og synlig tastaturfokus på kildevalg/-felt. Verifisert faktisk Chrome-zoom 200 % og 400 % med nettleserens zoompopup, ikke bare viewportemulering. Fokus beholdt synlig i arbeidsområdet under stepperen. Bygget-app-tester måler nav-/fokusgrenser ved 1440×900, 1280×800, 720×450 og 320×200; eksisterende regresjoner dekker også 320/360×160. Status har kort `role=status`/polite-tekst og feltfeil semantisk beskrivelse. Kontrasttall nedenfor og faktisk bildeinspeksjon støtter kontrollen. |

## Kommandoer og utfall

[Bevarte sluttkommandoer og råutdata](story-1-7-kontroller.txt):
Node **24.21.0**, npm **11.19.0**. **177/177 Vitest**, typecheck/lint/build,
**38/38 demo-E2E og 2/2 dev-E2E** består. 49 nye reducer-tester og 11 nye
bygget-app-forløp; eksisterende tester består. Ingen betalt API/nøkkel.
Testnettleser: prosjektets eksisterende Chromium-cache i
`/private/tmp/ibe160-story-1-2-browsers`.

Første miljøforsøk ble stoppet av sandboxens loopback-sperre og deretter
manglende standard nettlesercache. Eksplisitt eksisterende Node/Chromium-miljø
og autorisert loopback-kjøring løste dette uten avhengighetsendring.
Første korrekte miljøkjøring ga 35/37: ny bekreftelsesknapp klippet
fokusring på korte 320/360×160-flater. Knappen ble rettet fra 40 til 36 px
med eksisterende tokens; ingen testtoleranse ble utvidet. Siste fulle
kjøring omfatter også presist kildefokus, månedstest og kontrastmåling.
Lint fant manglende effect-avhengigheter; komplett dependency-liste med
forsøksvakt er rettet og ny full testkjøring består.

## Faktisk visuell kontroll og kontrast

Native Chrome/CUA, lokal bygget demo: ny egen kontrollfane, tom registrering,
Tab/Enter på hoppelenke, eksplisitt ugyldig bekreftelse, første P-fokus,
videre Tab til opphav/kilde; ekte 200/400 % zoom valgt og verifisert i Chromes
zoomkontroll. Feil, etiketter og fokusring ble visuelt inspisert ved rulling.
Zoom ble satt tilbake til 100 % og egen kontrollfane lukket. Ingen andre
faner ble endret. Native skjermbilder/AX-observasjoner finnes i arbeidsøktens
toolhistorikk; de to bevarte bildene under kommer fra den faktiske bygde
appens Playwright-runde og ble inspisert med bildeverktøyet:

- [L-kilde med fokus, lokal feil og månedlig årsgrunnlag](story-1-7-tallgrunnlag-kilde-feil.png).
- [Gyldig eksplisitt bekreftelse og tilgjengelig neste trinn](story-1-7-tallgrunnlag-bekreftet.png).

Målt fra faktiske computed styles: primærknapp **6,70:1**, feiltekst
**7,10:1**, lokal mangeltekst **11,60:1**, kontrollgrense **3,81:1** og
fokus **6,70:1**. Tekst består 4,5:1, kontroller/fokus 3:1 fra DESIGN.
Ingen skjermleser eller annen-person-S6 er påstått gjennomført.

## Integritet og grense

**101/101 låste hasher uendret** mot
`/tmp/ibe160-mini-sprint-1-6-2-2-locked.json`. Epics/AC, UX, arkitektur,
produkt-SPEC og readiness er urørt. Ingen nye avhengigheter, økonomisk motor,
rapportanalyse eller resultatsnapshot. Epic 1 er fortsatt in-progress;
Story 1.7 er in-review/review frem til ny uavhengig Fase 3. Story 2.3 er
ikke startet og R2 krever fortsatt brukeravklart PDF-lesbarhetsmetode.
Ingen blocker eller nytt produkt-/arkitekturvalg. Ingen push.
