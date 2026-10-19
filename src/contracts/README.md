# Felles kontrakter

Denne grensen eier runtime-skjema og avledede delte typer etter AD-1/AD-4.
Frontend, backend og domain skal bruke samme autoritet.

Kontraktene er uavhengige av React, Express, PDF, filer, nettverk og miljø.
`financial-input.ts` eier råregistrering og registrert kontrollstatus som
schemas med avledede typer. Rå UI-registrering forblir alltid ubekreftet;
domenekontrakten kan også motta eksplisitt bekreftet grunnlag og ustøttede
perioder som skal forklares. Den utfører ingen bekreftelseshandling.

`financial-validation.ts` eier kanoniske desimalstrenger og numerisk
valideringsresultat med målrettede feltårsaker og bevart normaliseringsgrunnlag.
Det er ingen komplett framtidig finans-/rapportkontrakt.

`financial-basis.ts` binder de samme registrerte verdiene til kilde eller
egen forutsetning, forventet/faktisk oppgitt leie, uløst alternativ kildeverdi
og manuelt oppgitt D-/J-innhold. Kontrollresultatet beholder hele grunnlaget
og målrettede årsaker. Kostnadsbidrag beskriver mulig delinnhold i totalene;
de er aldri et nytt tillegg eller et estimat.
