# Økonomiseksjon: tre presise hovedtall

Dato: 2026-11-19. Utgangspunkt: `11a8b8933b18f2b15dc3f509c3b5a4bbe7868fbb`.
Brukeroppdrag og prompt: [aktiv logg](../prompts/session-01a1f4b7-1ca9-7ea0-806c-04eb9306d1e3.jsonl).
Spesifikasjon: [tre nøkkeltall](../../implementation-artifacts/spec-okonomi-tre-nokkeltall.md).

## Undersøkelse og beslutning

`calculateFinancialScenario` beregner bruttoyield = L/P×100, netYield = (L−D)/P×100 og preliminaryNetYield = (L−dokumentdelsum)/P×100. `InvestmentOverview` bruker automatisk dokumentdelsum som scenarioets D når full D mangler. Derfor var de to prosentboksene identiske i utgangspunktet. Egen månedlig drift erstatter D med 12×beløpet; den gamle foreløpige boksen fulgte fremdeles dokumentdelsummen. Finansiering endrer ingen yield: månedlig kontantstrøm = (L−D−J)/12. J er 12×øreavrundet privat terminbeløp pluss kjent årlig fellesgjeldbetaling.

Valg: én prosentboks «Avkastning etter drift». Opphav skiller dokumentert delsum (foreløpig), egen totalforutsetning og registrert drift. Samme opphav vises ved kontantstrøm. Aktiv utregning følger D; dokumentdelsummen beholdes som eksplisitt referanse i fordypning. Ingen endring av domeneformler, dokumentimport, screening eller kontrollporter. Tre kolonner på desktop, to øverst og kontantstrøm over hel rad på mobil; øvrig Konsept A beholdes.

Faglig avgrensning: avkastning på pris inkl. fellesgjeld, uten kjøpsomkostninger, før finansiering/skatt, ikke egenkapitalavkastning eller full nettoavkastning. Ukjente kostnader blir ikke null. Egne kostnader er en totalforutsetning og ingen garanti for fullstendighet.

## Uavhengig matematikk

Fasit med Python Decimal, 40 sifres presisjon, annuitet avrundet til øre før årsberegning. Automatisk scenario: 80 % lån, 6 % rente, 360 måneder, ingen fellesgjeldbetaling.

| Original | Pris | Årsleie | Dokumentdelsum/år | Bruttoyield | Etter drift | Privat termin/mnd | Kontantstrøm/mnd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Nøstegaten 65 A | 4 050 000 | 144 000 | 12 240 | 3,56 % | 3,25 % | 19 425,44 | −8 445,44 |
| Rostockgata 96 | 8 600 000 | 226 800 | 43 920 | 2,64 % | 2,13 % | 41 249,08 | −26 009,08 |

Begge driftsavhengige tall er foreløpige her. Nøstegatens mulige overlapp med kommunale avgifter er fortsatt uavklart, eksplisitt forbehold beholdes. Ved 3 000 kr egen månedsdrift brukes 36 000 kr/år én gang, ikke i tillegg til dokumentdelsum. Ekte endeprøve bruker uavhengig annuitetsformel og kontrollerer 3 000→4 000→3 000 kr drift, endret leie, rente, løpetid, belåning, nullrente og kontantkjøp. Unitprøver dekker null drift, registrert drift og blank/negativ/ugyldig drift uten skjult fallback.

## Kvalitetssikring

Autoritative føringer lest: Sensorveiledning IBE160 del 1 side 2–5, faglærers brief-/PRD-feedback og godkjent Konsept A EXPERIENCE. Ingen nye kurskrav utledet. bmad-build oneshot valgt fordi endringen er liten og reversibel uten intensjonsgap.

Uavhengig blind-hunter gjennomgang, fire funn kontrollert:

- Lav: kontantstrøm manglet opphav «egen totalforutsetning». Rettet med samme tre opphav som avkastning og eksplisitt før skatt også ved foreløpig tall.
- Lav: manglende test for registrert D. Tilføyd med gyldig kilde og år. Selector tillater ikke dokumentdelsum samtidig med manuelt registrert D; testen kontrollerer den faktisk nåbare grenen.
- Lav: manglende nullgrense. Tilføyd eksplisitt 0 som gir samme prosent som brutto uten dokumentfallback.
- Lav: mobilprøven kontrollerte bare sidebredde. Tilføyd konkret plassering, bredde og overløp for de tre kortene.

Ingen funn utsatt, ingen sentrale deferred-oppføringer lukkes. Full kontrollhistorikk bevares.

Miljø: Node 26.8.1 i tilgjengelig terminal, prosjektets deklarerte versjon er 24.21.0. Eksisterende lokal Chromium 1243 brukes via privat testconfig; ingen avhengigheter endret. Sandbox blokkerte loopback-server: første fullpakke avbrutt med EPERM, deretter samme tester kjørt med lokal prosesstilgang. Testserver i demo, tom OPENAI_API_KEY, ingen betalte KI-kall, ingen push. Private PDF-er og skjermbilder holdes utenfor Git.

Sluttverifikasjon:

- `npm run build` og `npm run lint`: bestått. Eksisterende Vite-varsel om store chunks, ingen byggefeil.
- Målrettede domenetester og UI-prøver: første 37 bestått; etter review 12/12 visningstester bestått.
- Første brede fullpakke med fire workers samtidig med ekte PDF: 2 242 bestått, sju skip og tre 5-sekunders tidsavbrudd (import-review-ui, combined-import-budget, http-analysis). Ingen assertionsfeil. Ingen testfrister endret.
- Ren sluttkjøring `npm test -- --maxWorkers=1`: **2 245 bestått, sju skip**, 111 filer bestått / én eksisterende skip, 326,61 s. De tre tidsavbruddene reproduseres ikke uten samtidig PDF-belastning.
- Bred Playwright: **36 bestått / fem skip**, 5,0 min. Begge obligatoriske originaldokumenter faktisk kjørt; de fem skip gjelder andre valgfrie private dokumenter. Import, kildevisning, scenario, ugyldige felt, kontrollporter, risiko og gamle/sene svar dekket. De ekstra KI-statusprøvene bruker testresponser, ingen betalt backendanalyse.
- Begge ekte investeringsprøver har tomme lister for sidefeil og eksterne forespørsler, kun import-/leie-POST. Kompakt [ekte dokumentbevis](okonomi-2026-11-19/ekte-dokumenter.json) bevares i repoet. Skjermbilder fra Nøstegaten mobil og Rostockgata desktop kontrollert visuelt: tre tydelige kort, ingen overlapp, egne driftsforutsetninger synlige, negativ kontantstrøm med fortegn.

Rålogger: [verifikasjon](okonomi-2026-11-19/).


Endelig Playwright etter siste rettinger: **10/10 bestått**, 48,8 s, uten skip. Både ekte Nordvik og ekte Nøstegaten passerte oppdaterte leie-/delsumforventninger og kilde-/kontrollprøver. Alle fem mobil-/desktopbredder 320–1440 px passerte, inklusive direkte geometri og overløp for de tre KPI-kortene. Ingen uavklarte reviewfunn. Endringen, dette prosessbeviset, rålogger og aktiv promptlogg inngår i samme lokale commit. Ingen push.
