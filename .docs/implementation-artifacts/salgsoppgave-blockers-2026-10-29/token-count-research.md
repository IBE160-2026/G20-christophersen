# Token- og kostnadskontroll: dokumentert undersøkelse

Dato: 2026-10-29. Utgangspunkt: `2b1afd2f875373fcff933a021684a0793c83ceb4`.
Undersøkelsen brukte OpenAI Docs og installert SDK. Ingen API-nøkkel ble lest,
ingen nettbasert tokentelling ble utført, og ingen generering ble startet.

## Dokumentert serveralternativ

[Counting tokens](https://developers.openai.com/api/docs/guides/token-counting)
beskriver eksakt inputtelling med modellens meldingsgrenser og annen framing.
Lokal tegn-/JSON-telling kan ikke erstatte dette. Instruksjoner, tekst og
strict output-skjema må være med i tellegrunnlaget.

[Count API reference](https://developers.openai.com/api/reference/resources/responses/subresources/input_tokens/methods/count)
definerer `POST /responses/input_tokens`, med `object: response.input_tokens`
og heltallsfeltet `input_tokens` i svaret. Requesten støtter `model`, `input`,
`instructions`, `reasoning`, `text` inklusive `json_schema`, og `truncation`.
Dette etablerer en dokumentert tellervei for den uendrede modellen
`gpt-6.1-sol`; kontotilgang og faktisk tjenesteoppførsel er ikke prøvd.

Den installerte pakken `openai` er låst til `6.9.1`. Lokal inspeksjon av
`node_modules/openai/resources/responses/input-tokens.d.ts` og `.mjs` bekrefter
`client.responses.inputTokens.count(body, options)` og den samme POST-ruten.
Ingen SDK-oppgradering er nødvendig. Telleparameterne inkluderer ikke
genereringskontrollene `max_output_tokens`, `service_tier`, `stream`, `store`.
En eksplisitt projeksjon av de støttede inputparametrene må derfor bindes til
digesten av den **hele faktiske genereringsrequesten**, slik at endringer i
disse andre kontrollene også ugyldiggjør vurderingen.

Dokumentasjonen som ble åpnet etablerer ikke en separat endpointpris eller
at en nettbasert telling er gratis. Ingen slik påstand legges til grunn.
Supplerende offisielle søk etter count-pris, gratis telling og rate ga heller
ikke eksplisitt prisbevis. [OpenAI sitt budsjetteksempel](https://developers.openai.com/cookbook/articles/per_run_spending_controller_responses_api)
bekrefter mønsteret med støttede inputparametre i count-requesten og egne
genereringskontroller, men sier uttrykkelig at eksempelprisene er oppdiktet.
Det kan derfor ikke brukes til å godkjenne endpointprisen.

## Prisgrunnlag og tak

[Sol-modellsiden](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
oppgir USD 2/M vanlig input, USD 0,10/M cached input, USD 2,50/M cache write
og USD 10/M output. Modellen støtter `reasoning.effort: low`.
[Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
beskriver standard 30-minutters cache write som 1,25 ganger vanlig inputpris;
write erstatter vanlig input for de berørte tokenene. Ingen rabatt forutsettes.
Den eksisterende konservative global/Standard-reservasjonen på USD 2,50/M
for **alle** inputtokens og USD 10/M for output dekker denne requestprofilen.
40 000 input og 8 000 maksimale output gir USD 0,18 i reservasjon.

[Reasoning](https://developers.openai.com/api/docs/guides/reasoning) forklarer
at `max_output_tokens` omfatter genererte reasoning- og synlige outputtokens.
Inputtellingen må derfor holdes adskilt fra den maksimale outputreservasjonen.
Ufullstendig svar kan koste penger uten synlig output og gir ingen ny kvote.
Verktøy kan ha egne gebyrer; requestprofilen skal fortsatt avvise alle verktøy,
filer, bilder, samtaler, historikk, alternative endepunkter og prisoverstyringer.

`AnalysisBudgetStore` skal gjenbrukes. Salgsoppgaven eier analysens roothash;
separat rapport binder samme root via `parentHash`. Begge deler deler USD 0,20.
Reservasjon må skrives varig før generering og skal beholdes ved timeout,
ukjent usage, restart og feil. Ingen retry, automatisk nullstilling eller
chunking følger av å løse inputtelling.

## Verifikasjonsgrense

Ekte SDK-serialisering gjennom en obligatorisk lokal fetch-stub kan verifisere
telle-URL, metode, fullt tellepayload, strict schema, reasoning, digestbinding,
grenser og avvisning av endringer. Stubtall er fortsatt bare testbevis. De skal
aldri merkes som lokal modellverifisering eller som faktisk servertelling.
En separat autorisert telling med serveren må ligge foran enhver eventuell
faktisk generering. Produksjonsruten og første generering forblir stengt.

## Implementert grense og resultat

`token-count.ts` har ekte SDK-count-fabrikk med eksplisitt nøkkel/fetch og en
separat obligatorisk stubfabrikk. Ingen fabrikk leser nøkkel fra miljøet.
Serverfabrikken stopper før SDK-/HTTP-kallet med `token-count-price-unverified`.
En senere endring må dokumentere count-prisen og reservere eventuell kostnad
under samme varige analysetak **før** dette stoppet kan åpnes. Telleenheten er
derfor implementert, men den faktiske pris-/kontotilgangsforutsetningen er åpen.

Kvitteringer er frosset og attestert i prosessen, knyttet til full
genereringsdigest og SDK-serialisert count-body. Importert JSON og kloner kan
ikke oppgraderes til verifisert servertelling. Stubkvittering har proveniens
`offline-sdk-stub`; den aksepteres bare av eksplisitte offlinetester. Fremtidig
serverkvittering har separat proveniens `responses-input-tokens`.
Live-preflight rapporterer `server-token-count-required` og den ukjente prisen,
og oppretter ingen reservasjon. Svargrensen er 16 KiB; abort, timeout, feil HTTP,
feil format og requestendring prøves uten retry.

Generering forblir eksisterende offline-transport. Usage avregnes konservativt
med maksimal input-/outputpris og `usageCostBasis: provider-usage-upper-bound`,
fordi manglende cache-write-detaljer ikke etablerer faktisk fakturakostnad.
Reasoning telles ikke to ganger. Uventet verktøyoutput/-usage gir ukjent kostnad,
bevart reservasjon og stopp. Ingen finans- eller screeningregel er endret.
