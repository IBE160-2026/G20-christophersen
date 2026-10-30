---
title: 'Kodeeide beløp og dokumenterte begrensninger'
type: 'bugfix'
created: '2026-10-30'
status: 'done'
route: 'dispatch'
baseline_commit: '6e3f31ad67db4ce82094d75ffe6c49a9914fcb09'
review_loop_iteration: 0
context: []
---

<frozen-after-approval>
## Intent

Rett årsaken til 3/11 i siste økonomiprøve: AI transkriberte norske beløp feil,
mens kode avviste dem korrekt. Flytt numerisk transkripsjon til deterministisk
kode og la AI velge beløpsreferanser og semantiske relasjoner. Kontroller alle
11 godkjente fasitpunkter og dokumentbegrensninger med eksisterende privat
rårespons/fasit. Dette er brukerens implementeringsbestilling, uten ny
planleggings-/godkjenningsrunde.

## Boundaries & Constraints

Bevar originalbeløp, eksakte øre som desimalstrenger/heltall, fysiske sider og
UTF-16-kilder. Ukjent/tvetydig er aldri null kroner. Sikker lokal dokumentverdi
kan ikke overstyres av AI. Kvartal skal ikke omregnes til måned/år; behold mva,
termin og periodetekst uten utledede skatte-/finansregler. Ukjent semantisk
dekning og menneskelig kontroll består. Ingen nye betalte kall, push, privat
Git-innhold, endring av finans/screening, reset av journal eller gjenbruk av
forbrukt kallgodkjenning. Hele endelige request/schema må fortsatt passere
samme lokale USD 0,20-port med 6000 output og sikkerhetsmargin.

## I/O & Edge-Case Matrix

| Scenario | Input | Forventning |
| --- | --- | --- |
| Norske beløp | mellomrom/NBSP/punktumgruppe, desimalkomma, eksplisitt ,– | eksakt kodeeid krone-/øreverdi og originalkilde |
| Tvetydighet | bar enkel punktumgruppe, prosent/dato, signert/ugyldig token | synlig uavklart; aldri gjettet pengefelt |
| AI-beløp | ukjent/tvetydig verdi-ID eller fritt beløp | sikker avvisning |
| Kvalifikasjoner | kvartal, mva, termin, eksplisitt måned/år | rå kilde bevares; ingen omregning |
| Begrensninger | umålt areal, egne fagfolk, datarom/undersøkelser, ingen aktiv leie | kodeeide kildeutdrag bevares selv ved AI-utelatelse |
| Historisk respons | syv gale beløp, en utelatelse | opprinnelig feilrespons endres ikke og utropes ikke til bestått |

</frozen-after-approval>

## Code Map

- `economy-request.ts`: compact-2 har motstrid mellom «ordrett» og kanonisk
  desimalschema; kildekatalogen dekker hele valgte teksten.
- `economy-compact.ts`: eksisterende utvidet hydrering/kilde-/verdi-/periode-
  kontroll skal gjenbrukes som siste valideringslag og historisk replay.
- `economy-trial.ts`, `economy-local-budget.ts`: pakken/digest og hele faktiske
  SDK-wire eier godkjenning og USD 0,15-reservasjon; ingen transport nå.
- `representative-oracle.ts`: konservativ leksikalsk kontroll skal ikke svekkes.
- Privat `approved-test-03` og godkjent `reference-proposal.json`: faktisk
  modellkvalitet; aldri syntetisk eller ny menneskelig attestasjon.

## Tasks & Acceptance

- [x] `economy-money.ts`, tilhørende unit-test: egen parallell leveranse fra
  money_catalogue_impl; integrasjonsagenten skal ikke redigere disse filene.
- [x] `economy-request.ts`: nytt versjonert kompakt schema med valueId i stedet
  for AI-transkribert amount, alternativer velger kodeeid valueId; prompt og
  kompakt katalog med referanser til originaltekst, ikke gjentatte sitater.
- [x] Ny `economy-evidence.ts`: deterministiske relevante kvalifikasjoner og
  begrensnings-/leieutdrag med kilde, råtekst og eksplisitt uavklart semantikk.
  Ikke hardkod dette dokumentets tall, sider eller fasit. Ta med nabokontekst.
- [x] `economy-compact.ts`: ny referansevalidator som løser beløps-ID til
  katalogverdi, krever fullt kildebelegg for valgt beløp, bevarer gammel
  validering og original modellrespons. Tilføy deterministisk evidens i
  analyseresultatet; AI-fritekst erstatter aldri denne.
- [x] `economy-local-budget.ts`: bruk ny validator, behold alle budsjettporter.
- [x] Relevante unit-tester: schema, ID/ambiguitet/øre/kilder, lokale verdier,
  kvar­tal/mva/termin/begrensninger og én offline SDK-stubb med nytt schema.
- [x] Hovedagent: privat audit av alle 11, ny faktisk wire uten API og lokale
  budsjettkontroller, typecheck/lint, uavhengig review, offentlig sanitert bevis.

Given norsk råtekst, when kandidatverdier bygges, then er beløp eksakt og
kildefast eller eksplisitt uavklart. Given AI velger verdi-ID, when resultatet
hydreres, then eier kode siffer/øre og gamle sikkerhetskontroller gjelder.
Given AI utelater støttede begrensningsmarkører, when resultatet returneres,
then finnes originale kildeutdrag i deterministisk evidens uten påstand om
universell semantisk fullstendighet. Given ny request, when preflight kjøres,
then teller hele faktiske SDK-body inklusive schema, ellers stopper testen.

## Implementation Notes

Integrasjonsagent eier request/compact/evidence/local-budget og tilhørende
tester, aldri private rådata, money-modulen eller offentlige prosessdokumenter.
Hovedagent eier audit, privat preflight og dokumentasjon. Historiske response-
schemas/artefakter er kun replay, aldri tillatelse til ny transport.

## Review Triage Log

| Funn | Vurdering og bevis | Tiltak |
| --- | --- | --- |
| B1 Alternative kilder | Medium: legacy-mellomformat beholdt bare første alternativ-ID i lokal fullstendighetskontroll. | Bevar hele alternativbelegget i kontrollen. |
| B2 Delt observasjonstoken | Medium: kodeankeret for et komplett tall på tvers av segmenter gjaldt felt, ikke observasjoner. | Samme eksakte ankerkontroll for observasjoner og regresjon. |
| B3 Kvalifikasjonsbøyning | Medium: sluttvalidering krever kvartal-/merverdiavgift-bøyninger som ny fallback ikke fant. | Samsvarende leksikalsk dekning; ingen ny semantisk antakelse. |
| B4 Komma/en dash | Medium: eksplisitt helkronesuffiks med en dash ble avvist som område. | Smal suffiksstøtte og behold fortegns-/områdeavvisning. |
| B5 Setningspunktum | Medium: sluttpunktum ble del av talltoken og utelukket gyldig beløp. | Skill setningspunktum fra tallfortsettelse, test ugyldige fortsettelser fortsatt. |
| B6 Valuta før årslikt tall | Medium: årsvurdering tok bare hensyn til valuta etter token. | Kontroller eksplisitt valuta på begge sider. |
| B7 Mva som periode | Medium: kodefallback ga mva-belegg typen period. | Bevar korrekt mva-/periodetype. |
| E1 Ugyldig mellomromsgruppe | Medium: eksplisitt `kr 12 34,50` ga valgbare tallfragmenter. | Hele feilgruppen uavklart; fakturakolonner må fortsatt være separate. |
| E2 Setningspunktum | Medium: uavhengig reproduksjon av B5. | Samme årsaksretting som B5. |
| E3 Valuta før årslikt tall | Medium: uavhengig reproduksjon av B6. | Samme årsaksretting som B6. |
| E4 200 observasjoner pluss fallback | Medium: schema tillot 200; tillegg nummer 201 traff legacy-cap før sammenslåing. | Sammenslå kompatibelt belegg før gammel cap, ingen tap av tolkninger. |
| V1 Serialisert katalog uprøvd | Medium: responsstubber hentet ID-er direkte fra katalog, og oppdaget ikke tom/feil request-katalog. | Test faktisk wire-payload, alle relative spenn og lokale verdireferanser. |

Alle funn er verifisert i de respektive kodebanene og rettet med regresjoner.
De endrer ikke brukerens intensjon, finansregler eller offentlig API-flate.
Blind nykontroll fant også sluttpunktum før ny linje som starter med et tall:
medium, samme B5/E2-årsak, rettet med LF/CRLF-test og uavhengig nykontroll.
Alle tre reviewlag har nå ingen restfunn. Ingen funn er utsatt.

## Verification

Målrettet Vitest for money/evidence/compact/local-budget/economy-trial/oracle,
typecheck og lint med tom API-nøkkel og demo. Privat replay av alle 11 og faktisk
ny SDK-wire; ingen journalinit, nettverkskall eller betalt test.

Sluttresultat: 89/89 tester i åtte filer, typecheck/lint exit 0.
Alle åtte numeriske fasitpunkter er gjenfunnet med eksakte øre; alle elleve
punkter har regnskap, og tre dokumentbegrensninger har originale kilder.
Ny wire er 15899 byte / konservativt 35894 inputtokens / 6000 output:
USD 0,149735 maksimum, USD 0,15 reservasjon og USD 0,05 margin.
Historisk feilrespons avvises fortsatt; ingen nye modellresultater er hevdet.
Se [årsaksrapport og verifikasjon](salgsoppgave-economy-trial-2026-10-30/deterministiske-belop.md).
