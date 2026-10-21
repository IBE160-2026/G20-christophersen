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
Den komplette screeningen bruker samme autoritet, som beskrevet nedenfor.

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

Story 3.2 leverer `thresholds.ts`: separate `evaluateNetYieldThreshold` og
`evaluateCashFlowThreshold` gjenbruker 3.1 og felles grunnlagsvalidering.
Yieldkravet bruker eksakt `100 * NOI >= P * Ymin`, cash bruker `>= 0`.
Likhet består uten divisjon eller avrundingsmargin. Beslutningen har
bestått/brutt/ikke-vurderbart, eksakte sammenlikningsverdier og relevante
feltårsaker; metrikkgrunnlag og Ymin med kilde følger for etterprøving.
Funksjonene velger ingen anbefaling og erstatter ikke senere screeningens
kritisk-mangelvurdering. Ingen presentasjonsformat eller rapportinput inngår.

Story 3.4 fullfører `screening.ts`: `evaluateScreening` krever både hele
finansgrunnlaget og det eksisterende rene `FindingListBasis`. Rapportstatus,
enkeltkontroll og listebekreftelse vurderes av `assessFindingList`; alle
kritiske mangler og forholdsbundet TG3 anvendes gjennom den samme
`evaluateKnownDeficiencies` som lokale flater bruker. Først når disse er
tilstrekkelige, velges Forkast ved ett/begge økonomiske brudd, ellers Gå videre
til grundigere vurdering/befaring. Økonomiske utløsere følger fast yield-/cash-
orden, med faste koder/tekster og eksakte terskelobjekter fra 3.2. Alle kjente
mangler på prioritet 1 beholdes med eksisterende handling/orden. Gyldige tall
følger som delgrunnlag også når prioritet 1 avgjør. En isolert kopi av mottatt
grunnlag bevarer rapportfunn og brukerens TG3-avklaring. Dette er ingen
snapshot-/revisjonsbinding eller UI-kobling; de følger i senere stories.

Felles rapportvurdering kontrollerer også at hvert kjent aktivt TG3 har et
samsvarende separat TG3-grunnlag. Manglende eller motstridende projeksjon gir
en navngitt avklaringsmangel, også for kjente TG3 i failed delresultat. Brukt
TG2-korrigering og avvisning respekteres; ukjent avklaring gjettes aldri.
