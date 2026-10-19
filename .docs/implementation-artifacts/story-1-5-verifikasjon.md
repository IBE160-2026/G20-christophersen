# Story 1.5 — implementeringsbevis

2026-10-19. Baseline: `04efbe3ecd1c82d0e55d2a4f0b590144dd42dd69`. Implementeringen er **in-review**, sprintnøkkel **review**. Ingen uavhengig review eller done-påstand i denne fasen.

| AC | Faktisk implementering og bevis |
|---|---|
| AC1 | Fem synlige source-note-grupper med eksplisitt opphav og beskrivelse. L skiller forventet/faktisk oppgitt leie; faktisk leie uten kilde er utilstrekkelig. Opphav følger FinancialBasis-schemaet sammen med de numeriske verdiene. Vitest dekker hvert felt; bygget-app-test registrerer alle fem og kontrollerer semantisk tilknytning. |
| AC2 | Hver oppgitt kostnad deles i D=beløp−renter/avdrag og J=renter/avdrag. Eksplisitt inkludert post vises og summeres ikke igjen. Ugyldig/manglende beløp, umulig gjeldsdel, ukjent inkludering, sirkler og kjent bidrag over registrert total gir domain-årsaker. Delvis innhold krever ikke full detaljering. |
| AC3 | Uavhengig FR-2-fasit: 120000 gir eksakt D100000/J20000. Andre kostnader/gjeld og manuelt oppgitte D/J-totaler endres ikke. Vitest dekker separat forsikring/gjeld, måned/år og store presise desimaler. UI viser ligningen og de bevarte totalene. |
| AC4 | To kildeverdier beholdes synlig som gjeldende registrering og annen kildeverdi, med begge opphav. Konflikten gir insufficient/source-conflict uten kildevalg. BT-14/AT-12s L-konflikt er kontrollert i Vitest og faktisk UI. Endret verdi alene avklarer ikke konflikten; eksplisitt fjerning skjer først etter brukerens kildekontroll. |
| AC5 | Én reducer holder kilder, leiegrunnlag, konflikt og kostnadsinnhold i aktiv økt. FinancialBasis-valideringen bruker samme numeriske autoritet/parser som 1.4 og returnerer hele registrerte grunnlaget. Vitest med fryst input dekker retting, navigasjon/bevaring, gjentakelse og uavhengige resultatkopier. UI dekker retting, inkludering, slettet forelder og bevart rå D/J. |

## Egne kontroller

83 Vitest (60 eksisterende + 23 nye), typecheck og lint: bestått. `npm run test:e2e` bygget appen og bestod 24 demo-E2E og to dev-E2E. `git diff --check`: bestått. [Faktiske råutdata og E2E-råutdrag](story-1-5-kontroller.txt). Ingen avhengighet eller lockfil er endret; ren installasjon ble kontrollert i foregående fase og gjentas ikke uten ny avhengighetsendring.

Eksisterende offline-probe, HTTP-/private ressursgrenser, HMR, palett/kontrast, stepper og fokus/zoom er bevart. Nytt: fem opphav med forventet leie, kildekonflikt/retting og FR-2-oppdeling/overlapp; dynamiske konflikt-/kostnadsfelt er også kontrollert ved 1440×900, 360×225 og 320×160. Første E2E fant lang ny knapp som klippet fokus ved 320×160; kortere tekst rettet feilen. Gamle antallsforventninger ble oppdatert for kildefeltene. Alle sluttester består. Første sandbox-start ble blokkert av miljøets loopback-sperre; lokal eskalert kjøring bestod.

## Visuell inspeksjon og presis grense

[Fem opphav og forventet leie](story-1-5-opphav.png) og [kostnadsoppdeling med inkluderte avgifter](story-1-5-kostnader.png) er tatt fra faktisk bygget app med fiktive tall og inspisert av implementeringsagenten. Opphav/etiketter er lesbare og knyttet til hver verdi. Forventet leie står uttrykkelig som ikke dokumentert faktisk leie. Kostnadsbildet viser `120000 NOK = D 100000 + J 20000 NOK`; kommunale avgifter står som inkludert og ikke telt på nytt. Teksten forklarer delgrunnlag og at dette er innhold i totalene, ikke tillegg. D400000/J800000 er bevart, se [registrerte kontrolltekster](story-1-5-visuell-kontroll.json).

Dette er målrettet visuell inspeksjon av Playwright-styrt Chromium, supplert med automatisert tastatur/fokus/viewport-kontroll. Ingen ny native Chrome-zoomøkt, ekstern brukerstudie, S5/S6 eller skjermleserattest påstås. 1.7s komplette validerings-/bekreftelsesflyt er ikke levert. Ingen screening/økonomisk anbefaling, automatisk kostnadsutfylling eller senere story er implementert.

Kontrollserveren ble identifisert med PID24308, `node src/backend/server.ts`, cwd dette repoet, og stoppet etter bildene. Ingen fremmed prosess ble stoppet. Prosess-/promptreferat: [arbeidsøkt](../process/arbeidsokter/2026-10-19-story-1-5.md). Neste fase er separat BMAD code review før eventuell done.
