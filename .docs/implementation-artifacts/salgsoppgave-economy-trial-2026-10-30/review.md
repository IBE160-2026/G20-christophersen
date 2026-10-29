# Uavhengig BMAD-review

Tre kontekstfrie reviewere undersøkte integrert diff fra full baseline
`58f11cfd9e3d25481ed3a385464e31aec4b1df1c`: blind hunter, edge-case hunter og
verification gap. Alle tre ble startet før triage. Ingen reviewer har brukt
eller attestert det private dokumentet. Root kjører integrasjon og ekte lokal
kildesjekk separat, uten modell-/count-kall.

| ID | Individuelt funn | Dom og evidens/rute |
| --- | --- | --- |
| B1 | Tom økonomiliste passerer | Medium: fields hadde bare max40; alle faste felt kreves, ukjent er tillatt. Patch. |
| B2 | Beløp/etikett/kategori er ikke tilstrekkelig koblet | Medium: numerisk samforekomst er ikke semantisk bevis. Fast kategori/lokalt eksplisitt felt kontrolleres, hele resultatet forblir uavklart kandidat til menneskelig fasitsammenligning. Patch. |
| B3 | includedIn mangler relasjonsbevis | Medium: feltet kunne påvirke senere forståelse av drift. Ikke-verifisert inkludering/gjeldsfordeling avvises i denne avgrensede prøven. Patch. |
| B4 | Tallparser mister fortegn | Medium: negativ kilde kunne støtte positivt tall. Gjenbruk eksisterende komplette leksikalske transkripsjon. Patch. |
| B5 | Perioderegex aksepterer år-header/andre ord og once på gjentakende | Medium: kildebevis for periode var for svakt. Krev eksplisitt uttrykk; kvartal forblir rå opplysning/ukjent normalisert periode. Patch. |
| B6 | Rå kvartal/mva/avvik kan utelates | Medium: optional observations var ikke fullstendighetsbevis. Bevar originalkvalifikasjoner deterministisk og krev relevante råobservasjoner, fortsatt ikke komplett/godkjent økonomi. Patch. |
| B7 | originalText kunne oppdiktes | Medium: kontrollert quote gjorde ikke originalText automatisk sann. Kontroller/avled den fra kilde. Patch. |
| B8 | Dekodingslimit skjuler samtidig kjent teksttap | Medium: tidlig return foran rejected/loss. Bevar kjent tap og grenseårsak. Patch. |
| E1 | Tallparser godtar del av punktgruppert tall | Medium: separat etterprøvd feil med samme parser som B4. Fulltoken-kontroll og formatregresjoner. Patch samlet med B4. |
| E2 | includedIn uten eksplisitt belegg | Medium: samme verifiserte tilstand som B3; selvstendig dom før gruppering. Patch samlet med B3. |
| E3 | Limit foran kjent tap | Medium: samme verifiserte prioritetsfeil som B8. Patch samlet med B8. |
| V1 | Orakeltampering testes på allerede request-endret objekt | Medium, forhåndsverifisert testgap: eksisterende avvisning beviser ikke orakelbinding. Uavhengige ferske kloner for orakel, ledger og teknisk status. Patch. |

Ekstern count-pris er en kjent stopp fra før endringen, ikke et reviewfunn som
kan løses ved å anta gratispris. Kvalitets-/live-grensen holdes eksplisitt åpen.
Ingen reviewretting skal innføre nye finans-/screeningregler eller attestasjon.

Status: rettinger og endelig nykontroll pågår. Første fullkjøring fant dessuten
en historisk AP-statusregresjon; denne ble rettet uten å endre frosset fasit.

| Nykontroll | Individuelt funn | Dom/rute |
| --- | --- | --- |
| B9 | Like beløp med forskjellig periode kan gjenta bare én kilde | Medium: lokal plan beholder konfliktens separate kilder, men ny validering kontrollerte bare beløpsmengde og ett kildeoverlapp. Krev alle opprinnelige konfliktkilder og behold uavklart normalisert periode/år. Patch. |
| E4 | Unicode-minustegn kan bli positivt tall | Medium: eksisterende delt leksikalsk kontroll sperret bare ASCII-minus. Ny økonomivei eksponerer samme feil. Utvid minusvakten og test syntetisk. Patch. |

Verification-gap-nykontroll var uten nye funn. B9/E4 ble sendt tilbake til
samme implementeringsagent; videre nykontroll og testresultat føres nedenfor.

## Endelig nykontroll

B9 krever nå hvert komplette originale konfliktbelegg, med ukjent periode og
null år når kildene motsier hverandre. E4 avviser begge minustegn i delt parser.
Blind nykontroll: «No remaining actionable findings». Edge nykontroll: `[]`.
Verification-gap nykontroll: «No verification gaps found». Alle 14 individuelle
funn er rettet; ingen funn er utsatt. Resten er eksterne menneske-/pris-/live-porter,
ikke påstått løst av review eller teststub.
