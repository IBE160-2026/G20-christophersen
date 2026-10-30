# Første ekte økonomitest: avvist API-schema

2026-10-30. Brukeren godkjente uttrykkelig mottakeren OpenAI Responses API
(`api.openai.com`), `gpt-6.1-sol`, tekst fra fysiske sider 6–8 og 12–13 og
ett betalt genereringskall innen samlet USD 0,20. Oppstarten ble denne gangen
tillatt. **Ett faktisk HTTP-kall** ble utført; ingen count, retries eller
andre modellkall. Requesten inneholdt bare valgt tekst, instruksjoner,
kildeankere og schema. Hele PDF-en ble ikke lastet opp.

## Faktisk resultat

API-et returnerte **HTTP 400**, `invalid_request_error`,
`code: invalid_json_schema`, `param: text.format.schema`:

> Invalid JSON schema: regex lookaround is not supported.
> Found at $.properties.fields.items.properties.id.pattern.

Den generelle ListingFieldSchema sin sikkerhetsregex for felt-ID inneholder
negativ lookahead og var arvet inn i økonomiens API-schema. Lokal Zod-/SDK-
validering og stubbtesting fanget ikke opp serverens regex-begrensning. Dette
er en reell feil i klargjøringen, ikke en avvisning fra den økonomiske modellen.
[Offisiell Structured Outputs-dokumentasjon](https://developers.openai.com/api/docs/guides/structured-outputs)
ble kontrollert som bakgrunn; den konkrete serverresponsen er primærbeviset.

| Kontroll | Resultat |
| --- | --- |
| Faktisk fakturert API-kostnad | **Ukjent**; feilsvaret har ingen `usage`. Ingen dokumentert modelltokenbruk, men null fakturering kan ikke attesteres fra dette svaret. Ingen separat kostnads-API-forespørsel er gjort. |
| Økonomi mot godkjent fasit | Ikke vurderbar: ingen modellrespons, ingen rader vurdert som riktige eller feil |
| Modellens kildehenvisninger | Ikke vurderbare; ingen kildehenvisninger returnert |
| Mangler/hallusinasjoner | Ingen modelltekst å kontrollere; dette er ikke bevis for fravær av hallusinasjoner |
| Bestått | **Nei**, integrasjonstesten feilet ved API-schema; modellens økonomiske kvalitet er uprøvd |

Modellreserven USD 0,15 ble varig skrevet før nettverk. Journalen har
`actualUsd: null`, `state: uncertain`; reservasjonen og engangsmarkøren er
beholdt. De representerer ikke faktisk kostnad. Ingen ny kvote, omstart av
samme forsøk eller automatisk ekstrakall er tillatt.

Eksakt request, transportkvittering, API-feilsvar og eksplisitt ikke-vurderbar
fasitsammenligning er lagret kun i ignorert privat område. Tidligere fasit,
godkjent pakke og sendte request er bevart. Teknisk/TG-dekning er uavklart.

## Lokal retting etter forsøket

Økonomiens prøve-schema begrenser nå `id` til eksisterende ListingKeySchema-
enum. Dette tilsvarer allerede påkrevd fastfelt-validering og fjerner den
API-avviste regexen uten å endre den generelle kontrakten, sikkerhetsreglene,
økonomifeltverdier, finans- eller screeningregler. Ny målrettet regresjonstest
kontrollerer faste ID-er, avvisning av `constructor` og fravær av lookaround i
alle utsendte regexer.

8/8 målrettede schema-/lokalbudsjett-tester, typecheck og avgrenset lint består.
Ingen omfattende testrunde. Dette er **ikke** verifisert API-kompatibilitet for
den rettede requesten. Et nytt forsøk trenger ny uttrykkelig kallgodkjenning,
ny requestbinding og avklaring av beholdt reservasjon/faktisk kostnad innen
samme totalramme. Ingen ny request er sendt eller gammel journal nullstilt.

Ingen private dokumenter eller nøkler i Git. Ingen push.
