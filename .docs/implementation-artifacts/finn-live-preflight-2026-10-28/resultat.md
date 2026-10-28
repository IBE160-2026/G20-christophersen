# FINN live — kontroll før aktivering

Dato: 2026-10-28. Kontrollert baseline:
`ca9de2ce89c1130aae533b28e6f63594f7d6bdbb`.
Brukeren bestilte én faktisk import av kode 476576649, høyst ett betalt
forsøk, maks USD 0,15, ingen automatiske retries, lokal commit og ingen push.

**Resultat: Ikke aktivert; live-import er ikke verifisert.** Kontrollen har
avklart nøkkelens modelltilgang og fått brukerbekreftet prosjekt-/budsjettgrunnlaget.
Tilgangsgrunnlaget for FINN-integrasjonen og maksimal kostnad per forsøk er
fortsatt uavklart.
Ingen oppstarts-/gateverdier eller produktkode er endret.

## Vilkår som fortsatt må avklares

- Dokumentert FINN-tilgang: en identifiserbar godkjenning/avtale og hvem som
  har gitt den, med dekning for denne integrasjonen og den valgte annonsen.
- Kontoavstemming: **brukerbesvart i denne økten** for prosjektet IBE160
  Property Acquisition Agent, sist bekreftet USD 2-grense, oppgitt aktiv hard
  limit og ingen andre kjente/uavklarte belastninger. Beregnet prosjektrom
  USD 1,862213. [Bekreftelsen](user-budget-confirmation.json) er manuell;
  dagens faktiske prepaid-saldo eller leverandørinnstillinger er ikke lest.
- Kostnadsgrense: dokumenter en håndhevbar grense eller en etterprøvbar maksimal
  totalpris innen USD 0,15, inkludert input/verktøyinnhold. Et forventningsestimat
  erstatter ikke brukerens maksramme. Hvis dette ikke kan underbygges med dagens
  kanal, kreves en ny uttrykkelig brukerbeslutning om forsøksbetingelsene.

Ett samlet avklaringsspørsmål er sendt og bevart i
[kontrollkvitteringen](local-checks.json). Brukeren har svart med
[kontoavklaringen](user-budget-confirmation.json), men ingen tilgangsreferanse.
Ingen nøkler etterspørres. FINN-1 forblir åpen i [sentral oversikt](../deferred-work.md#finn-1--tilgangsblokkert-2026-10-28).

## Utførte kontroller

| Kontroll | Resultat og begrensning |
| --- | --- |
| API-nøkkel | Finnes i backendmiljøet og består lokal syntakskontroll. Én GET til `https://api.openai.com/v1/models/gpt-6.1-sol` ga HTTP 200 og eksakt modell-ID. Dette verifiserer autentisering og lesetilgang til modellmetadata, ikke Responses-generering, kvote eller saldo. [Redigert kontrollbevis](key-check.json) inneholder ingen nøkkel |
| Administrativ kontotilgang | Ingen `OPENAI_ADMIN_KEY`, prosjekt-ID eller organisasjons-ID i kontrollert miljø. Ingen administrative kostnads-/grensekall forsøkt med vanlig nøkkel. Ingen budsjettkobling tilgjengelig i verktøyinventaret. Forsøk på lesende Chrome-kontroll via computer-use feilet med timeout før sidetilgang |
| Historisk prosjektgrense | Tidligere prosjektbevis angir operativ USD 2-grense og brukerbekreftet USD 5 prepaid. Dette er historikk, ikke en ny bekreftelse av dagens prosjektinnstillinger eller saldo. [Tidligere preflight](../story-4-4-b2/preflight-2026-10-27.json) og [prepaid-historikk](../../process/arbeidsokter/2026-10-23-story-4-4-live.md) |
| Lokal kostnadsavstemming | Eksisterende `projectCost` ga USD 0,070243. Tillegg fra FINN-søk USD 0,043535 og open_page USD 0,024009 gir beregnet sum USD 0,137787. Begge tillegg har ukjent faktisk fakturert beløp og cache-antakelser. Uendret gammel ledger utelater disse FINN-mappene; de er derfor lagt til eksplisitt i denne kontrollen |
| Beregnet plass innen tidligere ramme | USD 2 − 0,137787 = USD 1,862213. Dette er bare differansen mot historisk operativ ramme, **ikke verifisert tilgjengelig kreditt**. Brukeren bekrefter nå ingen andre kjente/uavklarte belastninger; dette er ikke en administrativ kontoavlesning |
| Aktuell brukerbekreftelse | Prosjekt IBE160 Property Acquisition Agent, sist bekreftet månedlig grense USD 2, oppgitt aktiv hard limit og ingen andre kjente/uavklarte belastninger. Beregnet prosjektrom USD 1,862213. Dette er uttrykkelig manuell kontoavstemming; opprinnelig USD 5 prepaid er ikke bekreftet som dagens saldo. [Bevis](user-budget-confirmation.json) |
| Brukerens ramme for nytt forsøk | Uttrykkelig autorisasjon til ett forsøk med maks USD 0,15 foreligger. Ingen antakelse om større ramme eller ekstra forsøk gjøres |
| Kostnadsbegrensning i koden | Låst modell `gpt-6.1-sol`, default/low, 12 000 maksimale outputtokens og ett web_search-verktøykall. Offisiell modellside angir USD 10/M outputtokens: output alene kan nå USD 0,12. Verktøyinnhold/input kommer i tillegg og har ingen påvist dollargrense. Ref-feltene, 120 s-fristen og responsbytegrensen er ikke en USD-sperre. Maks USD 0,15 er derfor ikke underbygget før dispatch |
| FINN-tilgang | Tidligere dokumenterte krav om tillatt tilgang er fortsatt uavklart i FINN-1. Ingen ny godkjenningsreferanse funnet i undersøkte prosjektartefakter eller miljø. Brukerens bestilling av et betalt oppslag dokumenterer ikke i seg selv en tredjepartstillatelse. Dette viderefører prosjektets eksisterende tilgangsport; det er ingen ny juridisk vurdering |
| Tilgangsgate | `FINN_IMPORT_ENABLED` er ikke true; tilgangs- og kostnadsreferanser mangler i kontrollert miljø. Ingen av disse verdiene er satt eller endret av kontrollen |

Kostnadsregnestykket gjenbruker [FINN-søkets rapport](../../process/arbeidsokter/finn-web-search-2026-10-28/report.json)
og [open_page-rapporten](../../process/arbeidsokter/finn-open-page-2026-10-28/report.json),
ikke faktura. Det leser ikke eller endrer hemmelige verdier.

Bevarte kontrollresultater, undersøkte miljøkilder, søkeomfang, ledgerkommando,
Chrome-feilobservasjon og kildeobservasjoner: [local-checks.json](local-checks.json).
Dette beskriver bare kontrollprosessens miljø; backendens fremtidige miljø er
ikke antatt identisk. Tidspunktet i filen er bevaringstidspunkt for observasjoner,
ikke en råeksport av alle tidligere verktøysvar.

Aktuell bestilling og USD-ramme er lagret i [aktiv promptlogg](../../process/prompts/session-01a1820a-3587-7673-83f0-9a277d30ac25.jsonl),
melding `2026-10-28T20:30:27.424704+00:00`.
Kodegrunnlag: [requestbygger](../../../src/backend/listing/request.ts),
[backendgate](../../../src/backend/listing/backend.ts),
[SDK-innstillinger](../../../src/backend/analysis/backend-config.ts) og
[adapterfrist/forsøksvern](../../../src/backend/listing/adapter.ts),
alle på oppgitt baseline.

## Stoppgrunnlag og gjenstående arbeid

Spørsmålet om konto er nå brukerbesvart og dokumentert. Reell
tilgangsreferanse er ikke gitt. API-nøkler skal ikke deles i svar eller Git.
Tillatt datatilgang må avklares før aktivering; i tillegg må
maks USD 0,15 kunne underbygges for forespørselen. Å senke outputgrensen alene
beviser ikke maksimal totalpris når eksternt verktøyinnhold ikke er avgrenset.

PAA ble ikke startet og FINN-annonsen ble ikke hentet i denne kontrollen.
**0 betalte importforsøk, 0 Responses-genereringer og ingen retries.** Én
lesende modellmetadata-GET ble gjort. Kostnad fra modellgenerering/import i
denne økten: **USD 0,00**. Ingen ny kontofaktura er kontrollert.

Pris-/kostnadsfelt, kilder, mangler, dobbeltelling, korrigering, finansiering
og rapportanalyse er derfor **ikke live-testet på nytt**. Tidligere
[93 offline UI-tester](../finn-replay-2026-10-28/sluttverifikasjon.md) er
historisk testbevis og omtales ikke som nye live-resultater. Produktets
finans- og screeningregler er uendret.

## Review og lokale kontroller

[Uavhengig BMAD-review og individuell behandling](review.md), med
[kanoniske funn](review.json), gjelder dette kontrollnotatet. Kilder og
avgrensninger er presisert etter review. Kontoopplysningene som kom senere,
er bevart som separat brukerbekreftelse.
Kostnadsaritmetikk og lokale lenker er kontrollert; produkt- og testkode er
uendret mot baseline. Ingen nye produktregresjoner er nødvendige for disse
dokument-/bevisendringene, og ingen tidligere testresultater presenteres som
kjørt på nytt.

## Offisielle kilder kontrollert i økten

- [Modell og priser](https://developers.openai.com/api/docs/models/gpt-6.1-sol):
  faktisk åpnet. Standard output USD 10/M; øvrige input-/cachekostnader kommer
  i tillegg. Modelltilgang er ikke en kontosaldokontroll.
- [Organisasjonens Costs API](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/usage/methods/costs):
  faktisk åpnet. Dokumentert eksempel bruker adminnøkkel og kan gruppere
  kostnader på prosjekt; historiske kostnader alene beviser ikke restkreditt.

Ingen push er utført. Lokal commit skal inneholde dette beviset og aktiv promptlogg.
