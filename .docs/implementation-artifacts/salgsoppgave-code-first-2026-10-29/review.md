# Uavhengig BMAD-review

Tre kontekstfrie reviewere ble startet samtidig etter `bmad-build` step-04,
uten modelloverstyring, og leste samme komplette diff på 148238 bytes mot
`15402fc307726e0528c1ae0a068b36ab3dee5845`. Ingen lag ble hoppet over.
Alle rapporter ble innhentet før hovedagentens triage. Reviewerene endret
ingen kilde-/testfiler og startet ingen ekstern eller betalt transport.
Hvert funn har egen dom og evidens i
[arbeidsplanens triagelogg](../spec-salgsoppgave-code-first.md#review-triage-log).

## Blind hunter: returnerte funn

Reviewerens finding floor: 148238 / 1000 = 148,238 kB;
`min(floor(sqrt(148.238) + 1), 10) = 10`.

- **B1:** Kandidater fra bevart tekst på incomplete-sider hoppes over, mens
  kontrakten krever dem; hele importen kaster i stedet for partielt utfall.
- **B2:** Lokal TG-match over 2000 tegn kaster i `sourceFor` før trygt utfall.
- **B3:** 13 prislinjer eller 21 adresser overstiger kontraktens kildelister.
- **B4:** TG3 over en 1600-tegnsgrense kan ikke få ett tillatt kildespenn.
- **B5:** `Tilstandsgrad: 2` gjenkjennes som kandidat, men ikke gradbelegg.
- **B6:** Semantisk unknown/null kan overskrive lokal kjent måned og år.
- **B7:** `includedIn: price` aksepteres uten riktig kategori/relasjonsbelegg.
- **B8:** Lokalt funn kan ikke oppdateres med semantisk fortsettelse;
  identiske eksplisitte oppføringer gir to funn og komplettstatus uten avstemming.
- **B9:** En begrensning om uleselig tabellkobling i modellens `limitations`
  hindrer ikke komplettstatus.
- **B10:** Oppdiktet garasje/bygningsdel/beskrivelse kan passere når kilden
  bare inneholder riktig grad.
- **B11:** Sentral oversikt trenger aktuell oppfølging etter det bevarte
  historiske designcheckpointet.

## Edge-case hunter: returnerte funn

Reviewerens selvstendige offline-reproduksjoner bekrefter:

- **E1:** Gjentatte adresse-/økonomikilder overstiger arrays; bevar delresultat.
- **E2:** Tillatt `amount:null` mot lokalt beløp setter conflict uten alternativ;
  terminal schema-parse kaster og mister delresultatene.
- **E3:** `Tilstandsgrad: 3` gjenkjennes i kandidatparser, men avvises som belegg.
- **E4:** TG-markør ved 1600-tegnsgrense kan ikke dekkes av et tillatt kildespenn.

## Verification-gap: returnerte funn

- **V1:** Den nye lokale priskonfliktgrenen mangler prøve frem til
  `economySuggestions(importEconomyDraft(outcome), { requireReview: false })`.
  Eksisterende code-first-fasit har bare én pris. Mutasjon som fjerner
  konfliktgrenen ville derfor ikke bli fanget. Legg til to priser, bevar
  belegg og kontroller at automatisk P forblir null.
- **V2:** Selvstendig reproduksjon av E2 med
  `sdkStub({mutate(value){value.economy[0].amount=null;return value}})`.

## Triage og oppfølging

Alle 17 funn er beholdt individuelt i triageloggen før gruppering av felles
rotårsaker. Ingen er avvist eller utsatt. Funnene gjelder håndtering av
allerede observerbar tilstand innen godkjent intensjon og eksisterende
offentlige schema, og er sendt til implementeringsagenten som avgrensede
rettinger. Hovedagenten tilføyde kontroll av vilkårlig SDK-feiltekst i offentlig
kostnadsgrunn; sikre interne feilkoder skal brukes.

Første rettingsrunde: [96 målrettede tester](review-fixes-targeted.txt) består.
Nykontrollen fant to ytterligere feil, beholdt som B12/E5 i triageloggen:
case-sensitiv terminalkontroll av tak/Tak og for lav kapasitet i residual-listen
for en 200-siders original innen PDF-/tekstgrensene. Begge er rettet og
[85 fokuserte prøver](review-round-two-targeted.txt) består. Den sistnevnte
bruker faktisk PDF.js på 200 sider med nær 1 MiB tekst, 401 kandidater og
over 1000 restposter, bevarer originalintervaller og lokalt økonomiforslag.

Alle 17 opprinnelige funn, ett ekstra hovedagentfunn og begge nyfunn er rettet.
**Siste uavhengige nykontroll returnerer `[]` fra alle tre linser**, bundet
til SHA-256 av de 23 berørte kilde-/testfilene i
[review-recheck.json](review-recheck.json). Ingen reviewfunn er utsatt.
Hovedagentens sluttrunde har [1384 beståtte unit/integrasjonstester](final-acceptance-tests.txt).
Endelig nettleser-/bygg-/lintbevis føres i leveringsverifikasjonen.
