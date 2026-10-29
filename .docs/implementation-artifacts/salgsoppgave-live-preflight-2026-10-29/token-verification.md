# Lokal tokentelling: faktisk undersøkelse

Dato: 2026-10-29. Låst modell: `gpt-6.1-sol`, Responses API, low/Standard.
Ingen nøkkel eller modell-/token-count-endepunkt er brukt.

Den offisielle Python-pakken `tiktoken` ble undersøkt i en midlertidig cache,
uten endring av prosjektets avhengigheter. Faktisk installert versjon er
**0.14.0**. Både eksakt modellmapping og treffende modellprefiks mangler.
`encoding_for_model('gpt-6.1-sol')` gir KeyError.
[Uendret råbevis](local-tokenizer-probe.txt).

Reproduserbar undersøkelse: midlertidig `uv run --no-project --with
tiktoken==0.14.0 python`, les `MODEL_TO_ENCODING`,
`MODEL_PREFIX_TO_ENCODING` og kall `encoding_for_model`. Ingen `get_encoding`
med antatt eldre encoding brukes som erstatning.

[Offisiell token-count-guide](https://developers.openai.com/api/docs/guides/token-counting)
beskriver at serverens telling omfatter requeststruktur som ikke nødvendigvis
finnes i tekstfeltene som lokale tokenizere ser. Schema og modellspesifikke
forhold påvirker tellingen. En modellmapping alene ville derfor ikke bevise
hele Responses-requestens lokale tokenantall.

Guiden dokumenterer serverbasert telling av samme payload, men det er ingen
lokal teller. Vi har ikke etablert et eksplisitt pris-/gratisgrunnlag for
token-count-endepunktet i kontrollerte offisielle kilder. Det er derfor ikke
kalt under brukerens forbud mot betalte API-kall. «Ingen generert tekst»
behandles ikke som dokumentasjon på gratis bruk.

**Konklusjon:** Lokal telling av modell + fullt request-format er ikke verifisert.
Faktisk SDK-serialisering kan bindes og kontrolleres offline, men den bindingen
gjør ikke en ukjent tokenizer riktig. Ingen testteller, tegn-/byteheuristikk
eller selvdeklarert sikkerhetsmargin får verifisert produksjonsstatus.

Neste eksterne forutsetning er dokumentert lokal Sol-tokenizer og fullt
request-format, eller særskilt avklart og autorisert serverbasert kalibrering.
Ingen av alternativene er gjennomført eller autorisert som betalt prøve her.
