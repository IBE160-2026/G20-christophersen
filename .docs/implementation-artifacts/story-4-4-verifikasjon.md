# Story 4.4 — originale live-uttrekk og S2, 2026-10-23

Originaluttrekkene består S2 i dette lille forhåndsdefinerte utvalget: **4/4 TG2
(100 %), 1/1 TG3 (100 %), alle med korrekt fysisk PDF-side; ingen oppdiktede
funn eller oversette funn**. Dette er implementeringsagentens kildevurdering; den fullførte
[uavhengige evalueringen og visuelle kontrollen](story-4-4-uavhengig-evaluering.md)
bekrefter utvalgsresultatet med samme AC6-/F1-forbehold. Storyen er
ikke fullt verifisert: F1/F2 gir faktisk «Innhent mer informasjon» i bygget app,
mens uendret fasit forventer «Gå videre»/«Forkast» ved tilstrekkelig rapportgrunnlag.
Ingen originaler, limitations, prompt, schema, fasit eller produktkode er rettet.

## Grunnlag og metode

Fasit var låst før kallene. SHA-256 før og etter hvert kall:
`d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce`.
`story-4-4/F*-plan.json` inneholder rapporthash, baseline, modell-/SDK-/prompt-/
schema-/kontraktversjon, serialisert størrelse, pris, kostnad hittil og reservasjon.
Hele fire siders ekte PDF.js-grunnlag finnes i `F*-basis.json`. Produksjons-SDK
6.9.1 / gpt-6.1-sol / low / default, strict schema 1, prompt 1, kontrakt 2/1,
128000 outputtak og absolutt 120 s-frist er uendret. Ingen retry.

`F*-dispatch.json` registrerer faktisk requesthash før ekte fetch; bare kodegenerert
requestId normaliseres ved sammenlikning med planen. Eksakt request, originale
leverandørbody, allowlistede headere og adapterutfall finnes i `F*-request.json`,
`F*-provider.json`, `F*-http.json`, `F*-outcome.json`. Authorization er aldri lagret.
F1/F2/F4 gikk gjennom bygget app, ekte HTTP-router, dokumentarbeid og produksjons-
adapter. F3 brukte ekte PDF.js og produksjonsadapter direkte; L er fortsatt null,
og ingen finansstart eller S5-start er konstruert.

Vurderingen matcher semantisk innhold, grad, dokument/hash og fysisk side, ikke
modellens selvvalgte ID eller tegnsetting. Alle sider i basis ble lest. For
F1/F2/F4 valgte UI-automatiseringen hvert originalfunn, viste original-PDF,
leste rendret tekst og kontrollerte fysisk side **før** funnbekreftelse. Deretter
fulgte separat listebekreftelse og uavklart TG3. Dette er automatiserte handlinger
med agentens kildevurdering, ikke målt menneskelig kontroll. Ingen rettinger eller
avvisninger er brukt. Screenshots og `F*-control.json` viser hovedflytene.

## Hvert originalfunn

| Fasit | Original modell-ID | Semantisk kontroll mot original | Grad/side | Resultat |
|---|---|---|---|---|
| F1-TG2-1 | F1-001 | «Slitt overflate på baderomsgulv.» er samme avvik; punktum tilfører ingen påstand | TG2 / PDF 2 | korrekt |
| F2-TG2-1 | funn-001 | Samme gulvslitasje, ingen udokumenterte tillegg | TG2 / PDF 2 | korrekt |
| F3-TG2-1 | F3-001 | Samme gulvslitasje, ingen udokumenterte tillegg | TG2 / PDF 2 | korrekt |
| F4-TG2-1 | F4-001 | Samme gulvslitasje, ingen udokumenterte tillegg | TG2 / PDF 2 | korrekt |
| F4-TG3-1 | F4-002 | «Alvorlig lekkasje i tak.» og setningen om videre avklaring støttes begge ordrett i rapporten | TG3 / **PDF 4**, trykt 2 | korrekt |

Per rapport: F1/F2/F3 har 1/1 TG2, ingen TG3; F4 har 1/1 TG2 og 1/1 TG3.
Feil side, usikre kandidater, oversette og oppdiktede funn: 0 i alle fire.
F4s ene TG3 er vurdert individuelt mot side 4, inklusive det avvikende trykte
sidetallet. Ingen ny tilstandsgrad, kostnad eller finansverdi er lagt til.

Alle originalene har limitations om fiktiv rapport og/eller tekstgrunnlag.
F3 sier at original-PDF ikke er tilgjengelig for kontroll: dette beskriver
modellens tekstinput, mens appen og evaluator faktisk har originalen. Bevares
som leverandørbegrensning, ikke nytt TG-funn. Disse begrensningene endrer ikke
TG-tellerne, men har praktisk effekt i skjermingen nedenfor.

## Hovedflyt og ærlige avvik

| Case | Fasit | Faktisk bygget resultat | Tall |
|---|---|---|---|
| F1 | Gå videre | Innhent mer informasjon | 11,875 % / 1500000 NOI / 9,375 % / 700000 kontantstrøm |
| F2 | Forkast | Innhent mer informasjon | 8,750 % / 1000000 NOI / 6,250 % / 200000 kontantstrøm |
| F3 | Innhent mer informasjon ved manglende L | Ikke startet i hovedflyt; L=null ved adaptergrensen | Ingen beregning |
| F4 | Innhent mer informasjon | Innhent mer informasjon | 11,875 % / 1500000 NOI / 9,375 % / 700000 kontantstrøm |

Eksisterende `src/domain/finding-control.ts` behandler hver limitation som
`incomplete-report`. Dette gir prioritet 1 før økonomisk forkastelse også i F2.
Dermed er tallene riktige, men AC6s forventede tre screeningsutfall ikke fullt
oppnådd. Ingen limitation er fjernet, og ingen produktretting er utført.
F4 bevarer separat uavklart alvorlig TG3; kodebestemt resultat samsvarer med fasit.

F1s første lokale oppstart ble blokkert av sandboxens loopback-EPERM før API.
Deretter nådde ett ekte F1-kall completed, og original- og kilde-screenshots ble
lagret. Originalrunneren stoppet før resultat-screenshot. Den første runneren fanget ikke
feilmeldingen, så nøyaktig opprinnelig stoppsted er ikke bevist. Den hadde en
assertion om «Gå videre», som ville feile med det bevarte originaluttrekkets
limitations og det senere observerte resultatet; dette er en forklaring fra
kode/data, ikke en lagret original feilmelding.
Kostnaden ble avstemt fra original usage. Det finnes ingen `F1-ui-failure.json`;
`F1-replay-ui-failure.json` (15:11:17Z) tilhører første lokale replay etter
receipt (15:11:03Z). NBSP-feilen dokumenterer dermed bare denne replayen. Separat lokal replay av nøyaktig samme
originale uttrekk (kun ny HTTP-korrelasjon) ble brukt til resterende UI-bevis og
merket `F1-replay-control.json` / `F1-replay-*-result.png`. Første replay stoppet
på NBSP i formaterte tall; normalisering av whitespace ga fullført andre replay.
Replay har én lokalt avskåret frontend-forespørsel (`apiCalls: 1`), **0 ekte
leverandørkall**. Replay er ikke nytt live-bevis. F1s opprinnelige live-resultat
ble aldri erstattet. Opprinnelig receipt markerer manglende ferdig UI-bevis ved
avstemmingen; replay-dokumentet supplerer denne historikken.

## Forsøk og budsjett

Standardprisen ble kontrollert i OpenAI Docs i denne økten av root:
[input 2 / cached 0.10 / cache-write 2.50 / output 10 USD per million](https://developers.openai.com/api/docs/models/gpt-6.1-sol).
Langkontekstgrensen >272000 input ble kontrollert; disse små requestene er
3867–3922 UTF-8-bytes, godt innen konservativ 100000 inputreservasjon. Dette er
ikke en påstand om eksakt lokal tokentelling. Hver plan reserverte USD 1.48
(100000 input + 128000 output inklusive reasoning). Reservasjonen passet under
strengere operativ USD 2-grense før hvert kall. Brukerens manuelle kontokontroll
og eksisterende preflight ligger i planene; minimalkallet ble ikke gjentatt.

| Betalt forsøk | HTTP/status | Input | Output | Kostnad USD | Kumulativ USD |
|---|---|---:|---:|---:|---:|
| Eksisterende preflight | 200/completed | 9 | 5 | 0.000068 | 0.000068 |
| F1 | 200/completed | 963 | 146 | 0.003386 | 0.003454 |
| F2 | 200/completed | 972 | 149 | 0.003434 | 0.006888 |
| F3 | 200/completed | 943 | 192 | 0.003806 | 0.010694 |
| F4 | 200/completed | 994 | 339 | 0.005378 | **0.016072** |

Alle returnerte modell-IDer er gpt-6.1-sol og service tier default. cached,
cache-write og reasoning er 0 i hvert usage-objekt. Forbruk beregnes av faktisk
leverandørusage, ikke av synlig tekst alene; ingen ekstra cacheregning skjules.
Alle rate-headere viser 5000 RPM / 1000000 TPM. Ingen billing-/rate-/timeoutfeil,
uavklarte belastninger, automatisk retry eller ekstra betalte prosjektforsøk.
Fire nye fixturekall og ett tidligere preflight = fem betalte kall totalt.
Uavklart reservasjon: 0. Gjenværende under USD2 er 1.983928.
En statusmelding oppga ved feil F1 som 1508/37; denne skrivefeilen ble straks
rettet mot uendrede provider/receipt-filer: faktisk 963/146, samme korrekte kostnad.

## Verifikasjon og grenser

`node --test tools/story-4-4/evaluate-s2.test.mjs`: etter review er metoden
utvidet til fem prøver med separat komplett expected-ID/grade-sett og eksakt
dekning. En utelatt vurderingsrad (TG3 eller oversett TG2), ekstra/mismatchet/
duplisert rad eller duplisert fasit-ID avvises før telling. RT-16–18 viser
9/10 TG2 + 2/2 TG3 består med registrert utelatelse; manglende TG3, oppdiktet,
feil side under terskelen og 8/10 består ikke. Hjelperen muterer ikke fasit-/originalvurderinger og tar ikke et rettingsargument.
Dette er input-immutabilitet, ikke en test av isolasjon fra brukerrettinger i
produktet. Dette er metodekontroll, ikke simulert bevis for betalt modellkvalitet.

Eksisterende målrettet regresjon: 117/117 i live-adapter, finding-control,
screening og live-analysis bestått. Syv live-http-tester traff sandbox-EPERM og
ble kjørt separat med loopbacktilgang: 7/7 bestått. Totalt 124/124 målrettede eksisterende tester bestått.
`npm run lint`, `npm run build` inklusive typecheck: bestått. Vite varsler som
før om store chunks. Den fullførte uavhengige evalueringen er lenket over; root eier sluttregresjon
og review. Disse metodeendringene endrer ikke originalt S2-resultat eller åpne
AC6-/F1-bevisforbehold.
Ingen produktkode, låst krav, finansfasit eller PDF er endret. Ingen S5-måling,
Story 4.5 eller påstand om generelt modelltreff utover dette lille utvalget.


## Reviewrettinger og hjelperproveniens

Etter review er `replay-control F3` avvist før backendarbeid. Nye låser har
fixture-/forsøks-ID; `reconcile` krever samme eier i startbevis og lås før
known-cost-kvittering eller sletting. Historiske bevis er ikke utstyrt med en
oppdiktet låseidentitet. Tokenfelter må være sikre ikke-negative heltall,
cachetotaler må passe i input, og tidligere/faktiske kostnader må være gyldige,
endelige og ikke-negative før reservasjon frigis. Bind-feil fanges og beholder
feilbevis samt eid lås/reservasjon.

Nye, avgrensede offline-prøver bruker fetch-felle og simulert bind-feil: de
kontrollerer null fetch/dispatch/låsemutasjon ved F3-replay, eierkontroll ved
reconciliation, token-/kostnadsavvisning og trygg bind-feil. Ingen ny API-request.
13/13 avgrensede offline-prøver er bestått (5 S2-metodeprøver og 8 sikkerhetsprøver).
Den eksplisitte kommandoen er
`node --test tools/story-4-4/evaluate-s2.test.mjs tools/story-4-4/run-safety.test.mjs`.

[Sluttmanifestet for hjelperne](story-4-4/helper-manifest-post-review.json) er
uttrykkelig **etter review**, og viser ingen historiske forsøksversjoner.
Hjelperen ble endret under de opprinnelige kjøringene uten bevarte tidligere
snapshots/hjelperhash. Eksisterende request-/dispatch-hash dekker original
prompt/schema som finnes i requestfilene, og planenes commit-hash identifiserer
produktkoden. Disse bevisene rekonstruerer ikke de tidligere hjelpersnapshotene.
Fremtidige `prepare` legger ved hjelperhash; originale planer, providersvar og
receipts er ikke endret for å fremstå som historisk hashregistrerte.
