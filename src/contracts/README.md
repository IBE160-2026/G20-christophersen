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
rapportert uttrekksstatus. Kontraktversjon 2 innfører `blank` etter
[R2-regelen](../../.docs/planning-artifacts/r2-pdf-lesbarhet-semester-v1.md);
uttrekksformatversjon 1 beholdes. Bare deterministisk bevist fravær av
innhold gir blank. Skjemaet avviser blank med tekst/readable uten tekst;
det utfører ingen blankdeteksjon. Binding tillater readable/blank og
blokkerer unreadable/incomplete/unknown med alle berørte fysiske sider.
En helt blank PDF er ingen støttet tekstbasert rapport.
Dokumentkomponenten eier trygg kodegenerert sideårsak eller null ved ukjent
årsak; den skal aldri sende rå parserfeil, PDF-tekst eller hemmeligheter i
årsaksfeltet. Binding bevarer denne kjente årsaken. Adapterens rå feiltekst
brukes ikke som trygg årsak. Funn-ID bevares likt i original, resultat og
feilmål, også når ID-en inneholder innledende/avsluttende mellomrom.
Faktisk PDF-/bytehashberegning, adaptere, HTTP og frontend kobles i senere
stories. R2 er lukket som beslutningsport; Story 2.3 er fortsatt backlog.
Ingen ekstraktor, OCR/vision eller manuell semantisk klassifisering er lagt til.

Story 2.8: `finding-control.ts` eier separat brukt korrigering med gjenbrukt
kilde-/gradform fra analysekontrakten, rått redigeringsutkast og revisjonsbundet
enkeltfunnkontroll. Adapteroriginalen omskrives aldri av brukerkontroll.

Story 3.4: `screening.ts` eier også `ScreeningInput` og det diskriminerte
`ScreeningAssessment` for full screening. Input gjenbruker hele finansgrunnlaget
og `FindingListBasis`; output har nøyaktig én anbefaling/prioritet, avgjørende
utløsere, fast tekst/neste handling, eksakte nøkkeltall/terskler og bevart
grunnlag. Prioritet 1 gjenbruker de eksisterende kritiske mangeltypene;
økonomiske utløsere peker på de delte terskelkontraktene. Ingen lokaliserte
visningstall, KI-tekst eller snapshotgyldighet innføres i regelinput.

Story 3.5: `result.ts` eier binding og tilstander for siste resultatsnapshot i
den aktive frontendøkten. Snapshotet har hele screeningutfallet med eksakt
økonomi, kontrollgrunnlag og provenance. Finans-, liste-, TG3- og rapportrevisjon
suppleres med rapportidentitet/generasjon og faktiske bekreftelser. Frontend
lager en isolert, dypt fryst kopi; endringsårsaker/oppdateringsbehov holdes
separat. Ubrukt utkast er selektormetadata og aldri anvendt screeninginput.
Ingen varig historikk eller ny produktflate innføres.
