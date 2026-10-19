# Ren domenekjerne

Denne grensen eier ren inputvalidering, årsnormalisering, finans, terskler og
screening etter AD-1. Tillatt intern importretning er domain → contracts.
Kjernen har ingen React-, Express-, PDF-, fil-, nettverks- eller miljøavhengighet.

Story 1.4 leverer `validation.ts`: ren numerisk validering, eksplisitt
bekreftelsesbehov og eksakt årsnormalisering med big.js. Registrering og
normalisert kontrollgrunnlag bevares sammen; utilstrekkelige verdier har
konkrete feltårsaker. Ingen bekreftelseshandling utføres av modulen.

Kilder/kostnader, full mangelvurdering, finans, terskler og screening følger
sine godkjente stories. Numerisk tilstrekkelighet alene bekrefter ingen av dem.
