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
Terskler og komplett screening følger sine stories.

Story 3.1 leverer `finance.ts`: `calculateFinancialMetrics` returnerer
bruttoyield, NOI, nettoyield og kontantstrøm før skatt med egen gyldighet
fra `validateFinancialBasis`. Felles årsvalidering kan få de relevante
årsfeltene; standardkall vurderer fortsatt hele L/D/J-grunnlaget.
Nøkkeltallene bruker P/L, L/D, P/L/D og L/D/J, og manglende Ymin endrer
ingen beregning. Yield beholder eksakt teller/nevner; beløp er kanoniske
desimalstrenger i NOK/år. Ikke-beregnbare tall har null verdi og konkrete
feltårsaker. Formler, registrerte input, kilder, årsnormalisering og
kostnadsinnhold følger resultatet for senere kontrollvisning. Ingen
divisjon, format, terskelavgjørelse, rapportinput eller anbefaling inngår.

Story 2.8: `finding-control.ts` validerer brukerens korrigering mot kjent
rapportidentitet og fysisk sideområde med det delte korrigeringsskjemaet.
Det validerer struktur/kilde, ikke semantisk støtte eller teknisk tilstandsgrad.
