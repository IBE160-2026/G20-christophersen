---
title: Automatisk leieestimering for enkeltleiligheter
type: feature
created: 2026-11-04
status: done
route: dispatch
baseline_commit: ea54c2c3bf44f781bfce179f468c3d74113caf40
review_loop_iteration: 0
context: [AGENTS.md]
---

<frozen-after-approval reason="Bruker bestilte uttrykkelig undersøkelse, design, implementering og lokal commit med promptlogg">

## Intent

En investor skal få en første etterprøvbar forventet leie for én leilighet fra salgsoppgaven og SSBs åpne API. Leien vises i Konsept A og brukes automatisk i ubekreftet økonomiscenario når registrert leiegrunnlag mangler. Dokumentets opplysninger gjenbrukes uten ekstra inntasting.

## Boundaries & Constraints

Bevar PDF-/OCR-/TG-analysen med eksisterende begrensninger, økonomiformler, kildekontroll, bekreftelsesporter og historikk. Ingen betalte API-kall, push eller scraping. Bare offentlige statistikkoder sendes til SSB; dokument og adresse behandles lokalt. SSB-estimat er aldri dokumentert faktisk leie. Brukerregistrert leie og konflikt går foran automatikk; ingen bekreftelse skjer automatisk. SSB-år er datagrunnlagets år, ikke et løfte om nåværende markedsnivå. Samme år-regler for økonomiscenario består.

## I/O & Edge-Case Matrix

| Scenario | Inndata | Forventet utfall |
| --- | --- | --- |
| Enkeltleilighet | Entydig adresse/kommune, internt areal, rom og boligtype | Automatisk gratis SSB-oppslag, kr/mnd og kr/år, synlig intervall og regneregel |
| Ukjent bydel | By med flere SSB-soner | Alle relevante bysoner inngår; bredere intervall, ingen gjettet gatepresisjon |
| Ufullstendig eller motstrid | Areal/rom/type/adresse mangler eller strider | Konkret begrensning; ingen fiktiv verdi og ingen null som manglende leie |
| Utenfor modell | Flere boenheter, annen boligtype, areal utenfor SSB-støtte eller ukjent geografi | Synlig utilgjengelighet, eksisterende manuell flyt fungerer |
| Nett-/formatfeil | SSB utilgjengelig, tidsavbrudd, nullcelle eller endret struktur | Ingen gyldig leie; PDF- og økonomibehandling fortsetter |
| Objektbytte | Gammel forespørsel fullfører sent | Gammelt estimat påvirker ikke nytt objekt |
| Eksisterende leie | Registrert faktisk/forventet/manuell leie eller kildekonflikt | Automatisk estimat vises separat og erstatter ikke registrert grunnlag |

</frozen-after-approval>

## Code Map

- `src/contracts/document-import.ts`: validerte tekstsider og `propertyIdentity`; skal leses, ikke endres for OCR/TG.
- `src/contracts/pdf-source.ts`: ordrette dokumentkilder med hash, side og offset.
- `src/backend/server.ts`: separat lokal HTTP-rute før generell API-404.
- `src/frontend/investment/InvestmentOverview.tsx`: Konsept A og gjeldende dokumentgrense.
- `src/frontend/state/scenario.ts`: ubekreftet scenariogrunnlag; gjenbruk økonomimotor og årssperrer.
- `src/frontend/investment/AssumptionsForm.tsx`, `src/contracts/financial-basis.ts`: registrert leie har opphav og `expected`/`actual`, uten automatisk bekreftelse.
- `tests/helpers/import-fixture.ts`: syntetiske, portable PDF-bevis. Private originaler beholdes ignorert.

## Tasks & Acceptance

**Execution:**
- [x] `.docs/implementation-artifacts/leieagent-ssb-research.md`: dokumenter faktiske gratis metadata-/datakall, tabeller, soner, nuller, år og begrensninger.
- [x] `src/contracts/rent-estimate.ts`, `src/domain/rental-property.ts`: streng kontrakt og kildebundet, konservativt uttrekk av opplysninger fra eksisterende tekstlag.
- [x] `src/backend/rent/ssb-rent.ts`: avgrenset offentlig klient med timeout, validering og kortvarig cache; nyeste metadataår, eksplisitt sonemapping og interpolasjon mellom støttede arealpunkter for samme romgruppe.
- [x] `src/backend/http/rent-route.ts`, `src/backend/server.ts`: separat gratis endepunkt som validerer dokumentet, utleder grunnlaget og aldri sender person-/dokumentdata til eksterne tjenester.
- [x] `src/frontend/investment/useRentEstimate.ts`, `RentEstimatePanel.tsx`, `InvestmentOverview.tsx`, `src/frontend/state/scenario.ts`: automatisk oppstart, hashbundet tilstand, synlige kilder/forutsetninger og ubekreftet scenariofallback.
- [x] `tests/unit/`, `tests/integration/`, `tests/e2e/`: test matematikk, uttrekk, nettfeil, kilde-/objektbinding, økonomiprioritet og faktisk brukerflyt uten betalte kall.
- [x] `README.md`, `.docs/process/arbeidsokter/`: dokumenter oppstart, metode, begrensninger og testbevis; lokal commit med aktiv promptlogg.

**Acceptance Criteria:**
- Gitt en støttet leilighet med nødvendige opplysninger i PDF, når importen er fullført, så hentes offentlig statistikk automatisk uten mer brukerinndata.
- Gitt et estimat, når grunnlaget åpnes, så kan dokumentverdier, SSB-tabell/år/soner/celler, interpolasjon, avrunding og usikkerhetsregel kontrolleres.
- Gitt SSB-områdestatistikk, når intervallet vises, så merkes det som et konservativt scenariointervall valgt i produktet, ikke et statistisk konfidens- eller prediksjonsintervall fra SSB.
- Gitt et automatisk estimat, når økonomien beregnes, så påvirkes bare ubekreftet scenario; full drift, finansiering og kontrollert anbefaling beholder eksisterende krav.

## Implementation Notes

Ingen uavklarte intensjonsvalg eller irreversible endringer. Omfanget er én samlet brukerfunksjon. Brukerens uttrykkelige implementeringsbestilling er godkjenning til å fortsette uten ekstra spekgodkjenningsrunde. SSB 09897 støtter kombinasjoner av rom og areal og 16 soner; 09895 brukes som forskningsmessig sammenligning, ikke reserveformel som om alle leiligheter skalerer lineært per kvadratmeter.

## Spec Change Log

## Review Triage Log

Tre uavhengige reviewlag er kjørt mot `/tmp/paa-rent-review-20261104.diff`. Hvert funn er kontrollert før samling. Alle konkrete funn håndteres i denne leveransen.

| ID | Vurdering, bevis og håndtering |
| --- | --- |
| B1 | medium / patch: Sameietelling kunne gi flerboligsperre for ett salgsobjekt. Kontekstavgrensning og regresjonstest skiller sameie/bygning fra solgte boenheter. |
| B2 | medium / patch: Hypotetisk/historisk x-roms kunne velges som dagens romantall. Slike kontekster filtreres; gjeldende romantall og mangler testes. |
| B3 | medium / patch: Ugyldig eksplisitt BRA-i/rom kunne forsvinne ved siden av gyldig verdi. Synlig blokkering med fysisk side/utdrag bevares. |
| B4 | medium / patch: Ukjent boligtype ble ignorert ved siden av Leilighet. Generell etikettlesing bevarer usikker klassifikasjon som blokkering. |
| B5 | medium / patch: Nummererte gatenavn ble avvist uten propertyIdentity. Mønsteret støtter nummerert gatenavn med separat husnummer og tester dette. |
| B6 | medium / patch: estimated-kontrakten tillot positivt beløp uten bevis. Støttet boliggrunnlag uten issues, statistikkår, SSB-kilde, celler og formel kreves nå. |
| B7 | medium / patch: Bare actual-valg ble omtalt som registrert faktisk leie. Eksisterende finansvalidering krever gyldig beløp, periode, år, kilde og fravær av konflikt før teksten vises; egen UI-test. |
| B8 | medium / patch: Henteår ble brukt som leieår. Automatisk scenario beholder nå statistikkåret; drift fra annet år sperres til en eksplisitt egen forventning er registrert. Tester krever dette uavhengig av hentetid. |
| B9 | medium / patch: Injisert fetch deaktiverte cache i alle tester. Ny test bruker global stub og kontrollert klokke, bekrefter hit, utløp, revisjon og separate objektgrunnlag. |
| B10 | medium / patch: Retry-knappen ble bare vist i test. Nettlesertester klikker etter feil, krever nytt estimat/yield og at manuell leie bevares. Sen respons fra tidligere objekt testes separat. |
| E1 | medium / patch: Samme konkrete sameietelling som B1, bekreftet i kode og test. Håndtert med samme kontekstavgrensning. |
| E2 | medium / patch: Uleste sider kunne skjules bak estimatstatus. HTTP legger eksplisitt dekningsbegrensning til resultatet, og hovedpanelet varsler om ufullstendig dokumentgrunnlag. Dette hevder ikke at boligens nøkkelfelt er uleselige når de faktisk er lesbare; PDF-/TG-komplettstatus endres ikke. Integrasjonstest bekrefter varslet. |
| E3 | medium / patch: Samme manglende estimated-bevis som B6; streng kontrakt og negative bevis-/feltprøver dekker dette. |
| V1 | medium / patch: Verifisert testhull for retry, samme rotårsak som B10. Nye faktiske knappeklikk beviser gjenoppretting med/uten manuell leie. |
| V2 | medium / patch: Verifisert testhull for produksjonscache, samme rotårsak som B9. Ny test stopper udokumentert evig cache og sammenblanding av boliggrunnlag. |

## Verification

Kjør relevante unit-/integrasjonstester, typecheck, lint, build og eksisterende regresjoner. Verifiser Konsept A i Playwright med syntetisk PDF og deterministisk offentlig datasvar; utfør separat faktisk gratis SSB-oppslag. Ingen live KI-kall. Dokumenter forskjellen mellom nettverksverifikasjon og deterministiske tester.

2026-11-04: Bruker autoriserer hensiktsmessig parallelt arbeid. Avgrenset eierskap: integration_map har kontrakt/eiendomsuttrekk/test; ssb_research har SSB-klient/matematikk/test og forskningsnote; hovedagent har HTTP, frontend, økonomikobling og sluttverifikasjon. Dette konkretiserer brukerens delegeringsønske og erstatter generisk sekvensiell dispatch.

Reviewpresisering: SSBs statistikkår beholdes som automatisk scenarioår. Brukeren kan registrere en eksplisitt forventning for et annet år i eksisterende forutsetningsskjema. Ingen hentetidsbasert omdatering eller inflasjonsjustering skjer.

Oppfølgingsreview: B2-filteret var først for bredt og avviste «2-roms leilighet med mulighet for hjemmekontor». Filteret gjelder nå konkret romantallomtale, med regresjonstest. B6 krevde i oppfølging også kommune, i samsvar med produksjonsklientens geografi. Begge er rettet; 55 bolig-/kontrakttester består. Eksisterende økonomistatus er presisert til «Ingen nye KI-API-kall», siden det nye gratis SSB-steget faktisk bruker et offentlig API.

Sluttverifikasjon unit/integrasjon: 1 983 tester består, 7 eksisterende native vision-tester er eksplisitt hoppet over. Alle nye leietester kjører. Build/typecheck/lint og diffkontroll består. Full nettleserregresjon og endelig lokal commit dokumenteres i [arbeidsøkten](../process/arbeidsokter/2026-11-04-automatisk-leieestimering.md).

Sluttverifikasjon nettleser: 243/243 kjørte tester består; 5 valgfrie private tilfeller uten eksplisitt testmiljø ble hoppet over. Alle nye leietester kjørte. Endelig build bekreftet separat med 4/4 nye leieflyter. Matrisen er dekket av rental-property/ssb-rent (mangler, motstrid, flerbolig, areal og geografi), rent-http (gratis oppslag og ufullstendig dekning), rent-scenario/rent-panel (økonomiprioritet, år og faktisk leie) og investment-overview (automatikk, kilder, sent svar, nettfeil og retry). Ingen konkret reviewfeil står åpen. Empirisk kalibrering og videre dekning er registrert Åpen som PAA-LEIE1; eksisterende PDF-/TG-arbeid er ikke lukket.
