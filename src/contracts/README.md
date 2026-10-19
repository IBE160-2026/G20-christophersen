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

`document-analysis.ts` eier Story 2.1s versjonerte dokument-/analysekontrakt:
kodekontekst, én tekst-/statuspost per PDF-posisjon, originale kandidater,
kontrollerbare TG2/TG3, usikkerhet med konkrete mangler og completed/failed
med egne dokument-/analysefeil og eksplisitt ufullstendige delresultater.
Alle delte TypeScript-typer avledes fra disse skjemaene.

`analysis-validation.ts` binder ukjent adapterinnhold til validert
kodekontekst og validerer det delte utfallet mot forventet identitet igjen.
Adapterens ekstra toppmetadata ignoreres. Manglende kilde/grad/side og
umulige verdier beholdes i originalen som usikker kandidat; ingen
konfidensprosent oppgraderer kilden. Gyldig tomliste krever eksplisitt
completed med findings, uncertainCandidates og limitations.

`checkable`/`structure-and-source` betyr bare kontroll av struktur,
dokumentidentitet og sideområde. Det beviser ingen semantisk fullstendighet,
faktisk støtte i originaltekst eller brukerbekreftelse. Sidestatus er en
rapportert uttrekksstatus; skjemaene velger ingen PDF-lesbarhetsmetode.
Dokumentkomponenten eier trygg kodegenerert sideårsak eller null ved ukjent
årsak; den skal aldri sende rå parserfeil, PDF-tekst eller hemmeligheter i
årsaksfeltet. Binding bevarer denne kjente årsaken. Adapterens rå feiltekst
brukes ikke som trygg årsak. Funn-ID bevares likt i original, resultat og
feilmål, også når ID-en inneholder innledende/avsluttende mellomrom.
Faktisk PDF-/bytehashberegning, adaptere, HTTP og frontend kobles i senere
stories; R2-porten før Story 2.3 er fortsatt åpen.
