# Ren domenekjerne

Denne grensen eier ren inputvalidering, årsnormalisering, finans, terskler og
screening etter AD-1. Tillatt intern importretning er domain → contracts.
Kjernen har ingen React-, Express-, PDF-, fil-, nettverks- eller miljøavhengighet.

Story 1.4 leverer `validation.ts`: ren numerisk validering, eksplisitt
bekreftelsesbehov og eksakt årsnormalisering med big.js. Registrering og
normalisert kontrollgrunnlag bevares sammen; utilstrekkelige verdier har
konkrete feltårsaker. Ingen bekreftelseshandling utføres av modulen.

Story 1.5 leverer `financial-basis.ts`: `validateFinancialBasis` bruker samme
numeriske validering og desimalparser, og samler kilder, leiegrunnlag,
uløste konflikter og oppgitt kostnadsinnhold med verdiene. Kostnadsoppdeling
er innhold i manuelt registrerte totaler, og kan være et delgrunnlag.
Oppgitte inkluderinger summeres ikke igjen; rente-/avdragsdelen hører til J.
Ingen total endres automatisk og ingen økonomisk anbefaling gis.

Senere kontroll må bruke hele finansgrunnlaget, ikke tolke numerisk
tilstrekkelighet fra `validation.ts` som tilstrekkelig kilde-/kostnadsgrunnlag.
Full mangelvurdering, finans, terskler og screening følger sine stories.
