# Leieagent med ekte PDF: feltfeil rettet, modellgrense bekreftet

Dato: 4. november 2026. Baseline:
`cb944599b89eae2a3e133a991839b881b735a437`.
Bruker bestilte omstart, undersøkelse og retting av boligopplysninger fra ekte
PDF, faktisk Playwright-flyt og lokal commit med promptlogg. Ingen betalte
API-kall, push, oppdiktede tall eller manuell innhenting av allerede tilgjengelige
opplysninger. Oppfølgingen «Fortsett der du slapp» videreførte samme bestilling.

[Spesifikasjon og individuell reviewtriage](../../implementation-artifacts/spec-leieagent-ekte-pdf.md).
[Automatisk promptlogg](../prompts/session-01a1a610-23b7-7fd3-94be-f3734b1cf806.jsonl)
er appendert av eksisterende logging; tidligere linjer og logger er urørt.
Kildesporbarhet og skillet fakta/estimat/ukjent følger faglærers tilbakemelding,
sensorveiledningen og tidligere godkjent Konsept A. Ingen OCR-/TG-algoritme,
historisk budsjettjournal eller finansbekreftelsesregel er endret.

## Server og frisk reproduksjon

Prosessen på port 3000 ble identifisert med PID, kommandolinje og cwd i riktig
prosjekt. Den kjørte Node 24.21 med `.env`. Prosessen ble avsluttet kontrollert
og erstattet med samme runtime og `OPENAI_API_KEY=''`, slik at gamle nøkler
ikke muliggjør modellkall. Etter kode- og reviewrettinger ble serveren lastet
på nytt. Den ferdige serveren beholdes kjørende på http://127.0.0.1:3000.
Testserver på 3107 ble brukt separat for Konsept A-regresjon.

Frisk Playwright-opplasting av `private/incoming/new-salgsoppgave.pdf` ga en
vellykket dokumentimport på 135 sider, SHA-256
`3d0db0a7e84fb863bdeff1bd3390e833bd8fa151be8cbc3709835062d51ab49c`.
Dette er samme reelle fil gjennom hele før/etter-prøven, ikke et syntetisk
substitutt. Før retting ble leiesteg returnert med status unavailable.
Ignorerte før-bevis: `private/incoming/rent-real-before.{json,png}`.

| Opplysning | Før | Etter | Dokumentbevis |
| --- | --- | --- | --- |
| Adresse | Ikke gjenkjent | Gateadresse og poststed fra forsiden | Fysisk side 1 |
| Kommune | Feil: tekst om takterrasse etter ordet «kommune» | Bergen | Eksplisitt eiendomsbetegnelse på side 50 |
| Boligtype | Ikke gjenkjent | Enebolig, semantisk unsupported for leilighetsmodell | SALGSOBJEKT på side 4 |
| Internt areal | Ikke gjenkjent | 196 m² BRA-i | Kompakt intern/total på side 4 og objekttotal på side 35 |
| Antall rom | Allerede korrekt | 3 | ANTALL ROM på side 4; soverom er et annet felt |
| Bydel | Ikke gjenkjent | Ukjent | Ingen bydel fastslås fra gatenavn eller lokalkunnskap |

Ingen ny brukerinput var nødvendig. Ordrette originalspenn, dokumenthash,
navn og fysisk side bevares for alle utledede verdier. Dokumentets areal per
etasje (44/56/58/38 m²) blir ikke konkurrerende objekttotaler eller automatisk
selvstendige leiligheter. Tomme budskjemaetiketter blir ikke adresser. En eldre
lagret respons hadde slike identitetsfeil; frisk import før denne rettingen
hadde ikke disse kandidatene, men leieparseren hadde fortsatt ikke forsideadresse.

## Hva som fortsatt hindrer leieestimat

Tilgjengelig ny ekte PDF gjelder en **enebolig**, ikke en enkeltleilighet.
Dagens modell er avgrenset til enkeltleiligheter. SSB 09897 har dessuten
publiserte 3-romspunkter ved 60, 70, 80, 90 og 100 m², ikke ved 196 m².
Å redusere til en etasje, bytte boligtype eller ekstrapolere ville gi et
ubegrunnet tall. Leie for hele denne eiendommen er derfor **fortsatt ikke løst**.
Det er nå en eksplisitt modellgrense, ikke manglende gjenkjenning av de kjente
nøkkelopplysningene og ikke et mislykket SSB-nettverkskall.

Originalens omtale av hybeldel gir ikke grunnlag for å klassifisere en etasje
som en dokumentert selvstendig, godkjent leilighet eller finne på dens romantall.
Den andre eksisterende private PDF-en gjelder en hel bygård, heller ikke en
støttet enkeltleilighet. Det finnes ingen ekte enkeltleilighets-PDF blant de
tilgjengelige private filene; positiv ekte-leilighetsdekning hevdes ikke.
PAA-LEIE1 i [sentral oversikt](../../implementation-artifacts/deferred-work.md)
forblir Åpen for denne modellgrensen og øvrig kalibrering/dekning.

## SSB og positiv kontroll av støttet flyt

En separat syntetisk 2-roms på 50 m² i Bergen ble lastet opp i Playwright uten
manuell inntasting, uten stubbet `/api/rent-estimate`, mot faktisk backend og
SSBs gratis åpne API. Ukjent bydel velger begge Bergen-soner, ikke en gjettet
bydel. 2025-celler `03.01/2.050` og `03.02/2.050` var henholdsvis 13 300 og
12 000 kr/mnd. Produktregelen ga avrundet punkt **12 700 kr/mnd**, konservativt
scenariointervall **7 200–18 700 kr/mnd**. Dette er offentlig områdestatistikk
og et ukalibrert produktintervall, ikke faktisk leie for den ekte eneboligen.
Konsept A viste dette estimatet og bruttoyield automatisk i den syntetiske
kontrollen. Samme-år-regel, manuell overstyring og kontrollert screening består.

[SSB 09897](https://www.ssb.no/statbank/table/09897/) og
[tidligere API-undersøkelse](../../implementation-artifacts/leieagent-ssb-research.md)
dokumenterer variabler og metode. Bare statistikkoder sendes til SSB.

## Testbevis og kontroll

Versjonert `tests/e2e/rent-real-document.spec.ts` bruker den ekte PDF-en gjennom
faktisk import og leierute, krever alle feltene og eksakte kildespenn, åpner
originalarealets side og kontrollerer desktop/mobil uten horisontal scrolling.
Den krever unavailable og fravær av månedsleie/yield for eneboligen.
En egen eksplisitt nettprøve i samme fil kjøres med `PAA_TEST_SSB_NETWORK=1`
og bruker en syntetisk støttet leilighet mot faktisk HTTP/SSB. Den hopper over
vanligvis for å unngå at nettuavhengig regresjon blir avhengig av SSB.

I den faktiske sluttprøven skal begge prøver kjøres, uten skip. Original og
privat rårespons/skjermbilder beholdes i
`private/incoming/rent-real-flow-results/`, JSON-rapport i
`private/incoming/rent-real-flow-report.json`. Betalte endepunkter er blokkert
i nettleseren, modellnøkkelen er tom, og ingen nye betalings-/budsjettforsøk er
gjort. Første to forsøk bestod med faktisk import og gratis SSB. Sluttresultat
etter siste review registreres nedenfor.

Tre uavhengige reviewlag fant konkrete grensefeil i kommuneetikett, megler-
kontekst, slash-klassifikasjon og arealets seksjonskontekst/totalrelasjon. Disse
ble rettet og fikk egne regresjoner; revieweren bekreftet rettingene. Uttrekks-
agenten traff en kapasitetsgrense etter et kodeutkast; hovedagenten fullførte
implementering og tester. Ingen kapasitetsfeil har blitt brukt som bevis på
ferdig arbeid.


## Endelig resultat og testkommandoer

- `npm run build` (inkludert typecheck) og `npm run lint`: bestått. Eksisterende Vite-varsel om stor bundle består.
- `npx vitest run`: **2 004 bestått**, 7 eksisterende native vision-tester eksplisitt hoppet over uten PAA_TEST_LOCAL_VISION=1. Alle nye uttrekks-/modell-/paneltester kjørte.
- `PAA_E2E_PORT=3107 npx playwright test --config private/incoming/rent-verification.config.ts tests/e2e/investment-overview.spec.ts tests/e2e/app-shell.spec.ts`: **22 bestått**, med tidligere dokumenterte installerte Chromium 1243.
- `PAA_TEST_SSB_NETWORK=1 npx playwright test --config private/incoming/rent-real-flow.config.ts`: endelig **2/2 bestått uten skip**. Begge tester er versjonert i rent-real-document.spec.ts; config bruker eksisterende port 3000 og lagrer private bevis ignorert.
- `git diff --check`: bestått. Dokumentlenker kontrollert.

Nyeste server kjører på port 3000 med den endelige koden og deaktivert modellnøkkel.
Uttrekksfeilene er rettet og sidereferansene etterprøvd med faktisk PDF-sidevisning.
Et numerisk leieestimat for den ekte eneboligen er fortsatt ikke levert: det
ville kreve et forsvarlig annet datagrunnlag/modell, ikke flere brukerfelt som
gjentar dokumentets kjente opplysninger. Dette skilles uttrykkelig fra den
positive syntetiske leilighetsprøven med ekte SSB-data.

Lokal commit inkluderer denne økten og aktiv promptlogg. Ingen push eller betalte
API-kall er utført. Ingen private originaler, råresponser eller skjermbilder er
lagt i Git. Historiske budsjett-/PDF-/TG-porter og PAA-LEIE1 forblir åpne.
