# Story 1.5 — BMAD code review

2026-10-19. **Bestått etter retting; story og sprintnøkkel: done.**
Reviewmål: `04efbe3ecd1c82d0e55d2a4f0b590144dd42dd69..99c7e54e1702b818fcabb87a375f84f395c4529b`.
Sluttkontrollen omfatter også reviewpatchene i arbeidstreet.

## Metode og spor

Dette er fullføring av den allerede påbegynte fase 3 i den autoriserte
mini-sprinten. Forrige reviewer fullførte blind-hunter, edge-case-hunter,
verification-gap og acceptance-auditor og etterlot ni grupperte patchpunkter
og B6-avvisningen i storyspecen. Arbeidet ble avbrutt ved bruksgrensen før
rapport/status/commit. Hovedagentens overlevering bekrefter 14 enkeltforslag
(B1–B9, E1/E2, V1, A1/A2) og ingen mislykkede lag.

Gjenopptatt reviewer har selv lest faktisk kode, originaldiff/reviewdiff,
direkte AC og storygrensene 1.4/1.6/1.7, final UX, arkitektur, SPEC med
grensekontrakter, sprintplan/-status og relevante kurs-/faglærerkilder.
Alle nedenstående faglige påstander er kontrollert mot bevart før-/etterkode,
tester og/eller bevarte prober. Råmeldingene fra underreviewerne er ikke
tilgjengelige som egne repoartefakter; teksten nedenfor er normalisert
triage basert på overlevering og egen verifikasjon, ikke gjengitte sitater
eller påstand om en ny kjøring av de fire lagene.

Brukeren autoriserte eksplisitt retting innen Story 1.5 og videre sekvens.
Ingen ny rutinegodkjenning innhentes. Ingen låste krav/UX/arkitektur/SPEC,
epics eller storydefinisjoner endres. Ingen ny avhengighet, screening,
1.6-anbefaling eller 1.7-bekreftelsesflyt bygges.

## Individuell triage før gruppering

Hver av de 14 forslagene beholder egen vurdering. Alvorlighet beskriver
det verifiserte forholdet før patch. `patch` betyr her ferdig rettet og testet.
Lokasjoner viser sluttkodens relevante område.

| # / ID / lag | Påstand og egen verifikasjon | Verdict / håndtering / lokasjon |
|---|---|---|
| 1 / B1 / blind-hunter | To direkte inkluderte barn på 80 hver kunne godtas i en forelder på 100, fordi bare hvert barn ble sammenlignet. Før-proben `siblings` viser ingen feil. Nå kontrolleres summen av kjent direkte D/J-innhold; testsvar er utilstrekkelig ved overskridelse, mens ufullstendig delinnhold fortsatt tillates. | medium / patch G1 / `src/domain/financial-basis.ts:69` |
| 2 / B2 / blind-hunter | Statusendring under kjedegjennomgang gjorde etterkommerens status avhengig av radrekkefølge. `chainForward`/`chainReverse` viser forskjellen. Nå avgjøres alle kjeder før statusmutasjon; testen krever samme status per ID i begge rekkefølger. | medium / patch G2 / `src/domain/financial-basis.ts:83` |
| 3 / B3 / blind-hunter | J-bidrag over gyldig J ble oversett når D-beløpet manglet/var ugyldig, selv med kjent D-periode/år. `missingD` viser J sufficient ved 1001 mot total 1000. Nå brukes delt periodekontekst uavhengig av D-beløpet; blank, tekst og negativ D testes. | high / patch G3 / `src/domain/financial-basis.ts:119`, `src/domain/validation.ts:24` |
| 4 / B4 / blind-hunter | Én uferdig rad kunne skjule kjent overskridelse i en annen selvstendig post. `unfinished` viser bare radfeilen. Nå beholdes overskridelsesårsaken fra kjent innhold, mens ufullstendig sum fortsatt er null. Test krever begge årsaker for D/J. | medium / patch G4 / `src/domain/financial-basis.ts:108` |
| 5 / B5 / blind-hunter | Synlige leverte kilde-/kostnadsfeil var ikke programmatisk knyttet til berørte kontroller. Førdiffen mangler feil-ID-er/aria-describedby; nå kobles de eksisterende feilene og aria-invalid til felt, kildekontroller og kostnadsfelt. Bygget-app-test kontrollerer tilgjengelig beskrivelse og retting. | medium / patch G5 / `src/frontend/screens/FinancialBasisInput.tsx:15`, `src/frontend/screens/FinancialInput.tsx:33` |
| 6 / B6 / blind-hunter | Krav om komplett bekreftelsesstyrt feilvisning som del av 1.5 er feil scope. Story 1.7 AC2 eier bekreftelsesforsøk, første feilfokus og lokal mangelvisning; 1.5 har bevisst ingen bekreftelseshandling. Eksisterende synlige kilde-/kostnadsfeil er likevel knyttet korrekt gjennom G5. | false / rejected / `epics.md`, Story 1.5/1.7 |
| 7 / B7 / blind-hunter | To ugyldige kostnader med samme navn fikk identisk feiltekst som UI dedupliserte. Nå har hver feil «Kostnadspost N (navn)»; både Vitest og bygget-app-test viser to konkrete radkontekster. | medium / patch G6 / `src/domain/financial-basis.ts:50` |
| 8 / B8 / blind-hunter | Den opprinnelige E2E-dekningen prøvde forventet leie, men ikke faktisk leie uten korrekt kilde og retting. Ny E2E prøver egen forutsetning, blank kilde, gyldig kilde og bevart brukeropphav/verdi. | medium / patch G7 / `tests/e2e/financial-input.spec.ts:160` |
| 9 / B9 / blind-hunter | Fokusproben fokuserte utvalgte felt direkte og beviste ikke faktisk Tab-rekkefølge gjennom dynamiske fjernhandlinger. Ny test bruker Tab gjennom alle kontroller, Enter ved fjerning og kontrollerer fokusretur og klipping ved tre viewporter. | medium / patch G8 / `tests/e2e/financial-input.spec.ts:221` |
| 10 / E1 / edge-case-hunter | Samlet inkludert innhold kunne overstige forelderen selv om hvert barn isolert passet. Samme påviste utfall som B1, verifisert med før-probe og tester for både D og J. | medium / patch G1 / `src/domain/financial-basis.ts:69` |
| 11 / E2 / edge-case-hunter | Lange sammenhengende kostnadsnavn i feiltekst ga vannrett overløp. Før-proben viser scrollWidth 4737/4713 ved viewport 1440/320. `overflow-wrap:anywhere` og ny bygget-app-test sikrer ombryting i begge bredder. | low / patch G9 / `src/frontend/styles.css:240` |
| 12 / V1 / verification-gap | Manglende bygget-app-bevis for faktisk leie, manglende kilde og retting lot AC1-grenen stå uprøvd. Originaltestene og ny test er sammenlignet; alle tre forløp og tilknyttet feil prøves nå. | medium / patch G7 / `tests/e2e/financial-input.spec.ts:160` |
| 13 / A1 / acceptance-auditor | Kjent J-motsigelse måtte ikke bli tilstrekkelig bare fordi D-beløpet var ugyldig. Dette verifiseres konkret av `missingD` og tre regresjoner; AC2/AC5 bruker nå den samme periodekonteksten uten å kreve gyldig D-beløp. | high / patch G3 / `src/domain/financial-basis.ts:119` |
| 14 / A2 / acceptance-auditor | Levering av synlig konflikt-/kostnadsfeil uten semantisk kobling bryter NFR-2/final UX. Før-/etterdiff og E2E-beskrivelser bekrefter den samme konkrete mangelen som B5 og at den er rettet. | medium / patch G5 / `src/frontend/screens/FinancialBasisInput.tsx:60` |

Gruppering etter individuell triage: G1 B1/E1, G2 B2, G3 B3/A1, G4 B4,
G5 B5/A2, G6 B7, G7 B8/V1, G8 B9 og G9 E2. **Ni patchgrupper med 13
enkeltforslag er lukket; ett forslag avvist; ingen defer/decision-needed.**
G1 krever ikke likhet, full detaljering eller ny kostnadsmodell: bare
eksplisitt oppgitt direkte innhold og kjent motstrid kontrolleres.

## Alle AC mot faktisk sluttkode

| AC | Faktisk bevis og utfall |
|---|---|
| AC1 | `FinancialBasisSchema` holder fem opphav; `SourceNote` viser dem ved verdien. Domain skiller forventet/faktisk og krever oppgitt kilde for faktisk leie. Vitest for fem kilder og faktisk leie + bygget-app-test med alle fem opphav og ny faktisk-leie/retting: består. |
| AC2 | `validateFinancialBasis` splitter D/J eksakt, utelater eksplisitt inkluderte poster fra summen og kontrollerer ugyldige kjeder/dekning. FR-2/overlapp, renter utenfor D, G1–G4 og UI med inkluderte avgifter: består. Ingen kostnad legges til de manuelt registrerte totalene. |
| AC3 | Uavhengig fasit 120000 = D100000 + J20000 prøves i Vitest og bygget app. Separate andre kostnader/gjeld, ulike kjente perioder og store presise desimaler prøves. Registrerte D400000/J800000 og øvrige poster bevares: består. |
| AC4 | BT-14/AT-12s L1900000 mot L1400000 beholder begge kildeverdier/opphav og `source-conflict`/insufficient. Endret hovedverdi fjerner ikke konflikten; brukeren må selv avklare/fjerne den. Ingen automatisk kildeprioritering. Vitest og faktisk UI: består. |
| AC5 | Reducer holder opphav/konflikt/kostnadsinnhold sammen med finansverdier og opphever berørt bekreftelse. Én domain-validering gjenbruker 1.4-parser/normalisering; React viser data. Fryst input, gjentakelse, uavhengige resultatkopier, retting/bevaring og slettet forelder er prøvd: består. |

## Egne sluttkontroller og grense

Gjenopptatt reviewer kjørte selv: **92/92 Vitest, lint uten varsler,
typecheck/build, 27/27 demo-E2E og 2/2 dev-E2E: bestått.**
`git diff --check` bestod. [Råutdata](story-1-5-review-kontroller.txt) skiller
historiske før-prober fra egen sluttkjøring. Første E2E-forsøk ble stoppet
av sandboxens lokale serversperre; autorisert eskalert lokal kjøring bestod.
Dette er ingen produktfeil eller godkjenningsavvisning. Ingen TLS-policy,
versjonspins eller lockfil er endret. Ren installasjon var allerede verifisert
før fasen, og gjentas ikke for disse kildekodeendringene.

Tastatur, dynamisk fokusretur, semantiske beskrivelser og smale viewporter
er kontrollert med Playwright-styrt Chromium. Ingen ny skjermleserattest,
native nettleserzoom, brukerstudie, S5/S6 eller full screening påstås.
Implementeringsfasens [bilder/visuelle bevis](story-1-5-verifikasjon.md)
beholdes som historisk implementeringsbevis, ikke nye reviewbilder.

Ingen åpne implementeringsfeil eller beslutningsblocker. Story 1.5 er done;
Epic 1 er in-progress; Story 1.6/1.7 er fortsatt backlog ved overlevering.
Reviewer har ikke staged, committet eller pushet. Hovedagenten kontrollerer
fasecheckpoint og lager lokal reviewcommit før ny agent eventuelt får 1.6.

### Rejected

- B6: false som manglende 1.5-krav; den påståtte komplette
  bekreftelsesflyten eies uttrykkelig av Story 1.7 AC2. Låst scope beholdes.
