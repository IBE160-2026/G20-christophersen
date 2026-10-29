# Privat mottak og uavhengig fasit før modellprøve

Status 2026-10-29: **Ingen ekte original er mottatt. Ingen menneskelig fasit,
representativ kvalitetsprøve, serverbasert tokentelling eller modellkjøring er
gjennomført.** De automatiserte prøvene bruker bare den eksisterende syntetiske
PDF-en og eksplisitt simulerte operatørpåstander. De beviser kodeporter og
feilhåndtering; de beviser ikke faktiske menneskelige handlinger eller modellrecall.

Denne prosedyren gjennomfører AC3–AC5 i
[arbeidsspecen](../spec-salgsoppgave-blocker-resolution.md). Den bevarer skillet fra
[forrige syntetiske prøve](../salgsoppgave-live-preflight-2026-10-29/verifikasjon.md).
Faglærerens [tilbakemelding til briefen](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
underbygger uavhengige fasiter, dokument-/sidereferanser og varsom behandling av
ekte salgsoppgaver i offentlig repo. Sensorveiledningens sporbarhets-/testgrunnlag
er oppsummert i [eksisterende kildeuttrekk](../../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md).
Inntaket tilfører ingen finansregler eller nye universelle kurskrav.

## 1. Brukeren velger en faktisk original

Neste faktiske brukerhandling er å gjøre en salgsoppgave tilgjengelig lokalt og
oppgi lokal filsti. Ikke hent dokumenter fra nettet eller konstruer en «ekte»
salgsoppgave. Velg en vanlig salgsoppgave med integrert tilstandsrapport som
representerer den konkrete arbeidsflyten som ønskes prøvd. Dokumenter begrunnelsen
privat i menneskeskjemaet. Ett dokument gir høyst en avgrenset dokumentprøve;
det etablerer ikke generell kvalitet for alle salgsoppgaver.

Bruk et nøytralt case-id uten adresse, navn eller annen personinformasjon.
Original, tekst, fasit, sjekklister og senere output skal forbli lokalt i
`private/representative-cases/<case-id>/`. Ikke lim dokumentinnhold eller privat
fasit inn i versjonerte prosessdokumenter, prompts eller offentlige testbevis.
Et eventuelt senere testreferat må være uten private utdrag.

## 2. Kjør kun det lokale inntaket

Fra prosjektroten, med README-ens låste Node/npm-versjoner:

```sh
npm run representative:document -- intake /lokal/sti/salgsoppgave.pdf prove-01
```

Kommandoen validerer PDF-beholderen, tar SHA-256 av originale bytes og bruker det
eksisterende isolerte PDF.js-uttrekket for **alle fysiske sider i original rekkefølge**.
Den godtar høyst 50 MiB/200 fysiske sider og oppretter en ny privat case-mappe
eksklusivt. Den bruker ingen nøkkel, netttransport, API, tokenteller eller budsjett.
Ingen forventede TG-funn eller økonomiverdier fylles fra kode eller modell.

| Privat fil | Innhold |
| --- | --- |
| `original.pdf` | Byteidentisk kopi av originalen, lokalt skrivebeskyttet |
| `manifest.json` | Originalhash, fysisk sideantall, hash av hele sidesnapshotet og inntakstid |
| `pages.json` | Samtlige fysiske sider, tekst, lesbarhetsstatus, rasterstatus og oppdagede vedlegg |
| `coverage.json` | Maskinelle tekstblokker, TG-kandidater, restoversikt og vedlegg; aldri menneskelig fasit |
| `oracle.json` | Tom forventningsmal som senere må fylles uavhengig av modelloutput |
| `human-review.json` | Uutfylt attestasjon, hver side/blokk/TG-kandidat, ni økonomifelt og rapportgrense |

Inntak returnerer alltid `ready:false` og `humanVerificationPerformed:false`.
Trykte sidetall kan noteres i menneskelige notater, men `pdfPage` betyr alltid
fysisk PDF-side fra 1. Original, manifest og snapshots skal ikke redigeres.
Ny original krever ny case; overskriving av eksisterende case avvises.

Hvis en skrivefeil eller avbrutt prosess etterlater en delvis case, behold hele
den ufullstendige mappen privat som feilevidens. Ikke forsøk å fryse den, fylle
inn manglende maskinfiler for hånd eller gjenbruke samme case-id. Finn årsaken
til feilen og kjør et nytt inntak fra den uendrede originalen med en **ny, nøytral
case-id**. Det finnes ingen automatisk sletting eller annen destruktiv opprydding;
en delvis pakke er aldri en gyldig frysing eller en gjennomført prøve.

Destinasjonen er fast under repoets `private/`; kommandoen har ingen offentlig
output-parameter. Den kontrollerer ignore-regel, avviser alle allerede versjonerte
stier under `private/`, symlink-komponenter og symlink-/hardlink-filer ved lasting.
`.gitignore` og disse kontrollene reduserer feilaktig lagring. De hindrer ikke at
en operatør etterpå bruker `git add -f`, kopierer innhold til andre mapper eller
endrer rettigheter. **Ekte filer skal aldri stages eller committes, heller ikke
med force.** Bruk vanlig `git status` og kontroller de faktiske staged-filene før
en senere commit; offentlig bevis må ikke inneholde dokumenttekst.

## 3. Et menneske lager fasit før noen modelloutput

Åpne `original.pdf` visuelt i en lokal PDF-leser. Les hele dokumentet før du ser
modellresultater. Skriv fasiten manuelt i de to private JSON-filene. Kodeuttrekket
er bare en kildeindeks; det er ikke fasit, menneskelig kontroll eller bevis for at
tabeller og grafiske grader er riktig tolket.

`human-review.json` fylles slik:

- `attestation`: oppgi `reviewer`, ISO-tid `reviewedAt` etter inntaket,
  `originalReadIndependently:true`, `beforeAnyModelOutput:true`,
  `realSalesProspectus:true`, privat `selectionRationale` og
  `scope:"single-document-trial"`. Ikke sett dette på vegne av et menneske.
- Hver `pages`-rad: kontroller hele den fysiske originalsiden og tekstuttrekket,
  inklusive tabeller, grafiske grader og sidefortsettelser. Først etter utført
  kontroll settes `visualOriginalChecked`, `textLayerMatchesOriginal` og
  `rasterChecked` til `true`. Velg `role` blant `report`, `economy`,
  `report-and-economy` og `other`; skriv et konkret `note`.
- Hver `blocks`-rad: bevar `id/pdfPage/start/end`, les også tekst uten søkeord og
  sett `reviewed:true` med `note`. Ingen blokker eller sider kan utelates.
- Hver `candidates`-rad: bevar identitet/offset/grad. Velg `finding`, `duplicate`
  eller `not-finding`, med konkret `reason` og ordrette `evidence` i formen
  `{"pdfPage":2,"quote":"ordrett tekst"}`. Belegget må dekke den faktiske
  kandidatmarkøren. `findingIndex` er null for `not-finding`, ellers nullbasert
  indeks i fasitens `findings`. Både `finding` og `duplicate` krever at målfunnet
  bevarer samme fysiske kandidat som kilde; oppsummering og original kan være
  ulike kilder til samme forhold. Forklaring av en ikke-funnmarkør må komme fra
  originalen, for eksempel en tegnforklaring; avvisning er aldri automatisk.
- Hvert av de ni faste `economy`-feltene: kontroller hele originalen, sett
  `reviewed:true` og forklar `note`, også når feltet ikke er oppgitt. Manglende
  beløp skal aldri fylles med null som et tall.
- `reportBoundary`: sett `reviewed:true`, forklar grensen i `note`, og legg ved
  ordrette `sources` på både første og siste fysiske rapportside.

`oracle.json` bruker den eksisterende `FrozenOracle`-formen:

- Bevar `original` uendret, `version:1` og
  `kind:"representative-single-document-trial"`. Fyll `authoredBeforeComparison`
  med beskrivelse av faktisk uavhengig fasitarbeid før modelloutput.
- `reportPages` er alle menneskelig identifiserte fysiske rapportsider i stigende
  rekkefølge, identisk med sideregnskapets rapportroller.
- `findings` lister **alle** TG2/TG3-forhold fra hele originalen, med `component`,
  `grade`, `description` og ordrette `sources` med fysisk side. Samle samme
  forhold på tvers av oppsummering, tabell og fortsettelse. Bevar ulike bad og
  andre ulike forhold separat. Hvert funn trenger minst ett rapportbelegg;
  supplerende oppsummeringsbelegg utenfor rapporten kan beholdes.
- `economy.ownership` er `eierseksjon`, `borettslag` eller eksplisitt `unknown`;
  kjent eierform krever ordrett `ownershipSources`.
- `economy.fields` inneholder oppgitte fakta med felt-id, desimalbeløp som streng,
  `period` (`once/month/year/unknown`), `year` (streng eller null), `includedIn`,
  `debtPart` og ordrett `source`. Inkludering og gjeldsdel trenger egne
  `relationSources`; samme originalutdrag kan brukes dersom det faktisk uttrykker
  både beløp og relasjon. `allowedYears` kan bare brukes for faglig begrunnede,
  på forhånd bestemte alternativer, aldri for å tilpasse fasiten etter output.
- Alle øvrige faste felt skal stå i `unknownFields` med `status:missing` eller
  `unavailable`, `amount:null`, eksplisitt periode, `year:null`, `nature:unknown`,
  `includedIn:null`, `debtPart:null`, tomme `sources` og `alternatives`. De ni
  id-ene er `price`, `totalPrice`, `purchaseCosts`, `documentTax`, `sharedDebt`,
  `commonCosts`, `propertyTax`, `municipalFees`, `sharedDebtPayment`; hver må
  forekomme nøyaktig én gang på tvers av kjent/ukjent.

Stopp ved uleselig/ufullstendig/ukjent side, ubehandlet vedlegg, uklare grader eller
fortsettelser, ubehandlet raster i rapportområdet, manglende kilde eller
ukjent rapportgrense. Attestasjon kan ikke reparere manglende tekst. Oppdagede
vedlegg sperrer frysing; separat rapport krever eget avklart grunnlag under samme
logiske budsjett, ikke sletting av vedleggslisten. Den nåværende sammenligningsformen
støtter eksplisitte faktabeløp/ukjente faste felt; motstridende beløp, oppgitte
estimater eller andre forventninger som ikke kan uttrykkes korrekt må avklares
før prøven. Ikke forenkle originalen for å få grønn status.

## 4. Frys og kontroller de utfylte filene

```sh
npm run representative:document -- freeze prove-01
npm run representative:document -- check prove-01
```

Frysing leser originalen på nytt gjennom PDF.js, kontrollerer original-/sidehash,
alle sjekklister, kilder, økonomifelt og attestasjoner. Beløp, gjeldsdel og
eksplisitte år må kunne gjenfinnes som tall i sine relevante kildeutdrag;
kontrollen gjør ingen økonomiske beregninger eller semantiske slutninger.
Den godtar mellomromsgruppering, flere punktumgrupper (`3.000.000`),
punktum-/kommadesimal med én eller to desimaler (`3000000.50`) og entydig
gruppering med kommadesimal (`3.000.000,50` eller `3.000,50`). Originalsitater
endres ikke. En enkelt separator med tre etterfølgende sifre (`3.000` eller
`3,000`) er fortsatt tvetydig, og andre ustøttede tallformer må avklares før
prøven; ikke gjett tusenskille kontra desimal eller rediger originalen for å
omgå sperren.
En vellykket frysing lager
`freeze.json` eksklusivt og lokalt skrivebeskyttet med tidspunkt og SHA-256 av
alle seks inntaksfiler. Frysing skjer ikke automatisk ved inntak. Eksisterende
kvittering overskrives aldri. `check` verifiserer kvittering og alle bundne bytes
og kildekontroller på nytt. Endringer, også uskyldig whitespace, gir stopp.

Kvitteringen sier **selvrapportert menneskelig før-modell-attestasjon**,
`productionBenchmark:false`. Programmet kan verken autentisere hvem som leste
PDF-en eller bevise at en avkrysning er sann. Skrivebeskyttelse og hashes er
lokale kontrollspor, ikke en ekstern signatur eller beskyttelse mot en operatør
som bevisst endrer både filer og kvittering. Ta vare på den opprinnelige fryste
pakken privat. Feil oppdaget senere skal dokumenteres uten å tilpasse den fryste
fasiten til modellresultatet; en revidert prøve trenger nytt eksplisitt grunnlag.

## 5. Klargjør senere request, fortsatt uten kall

```sh
npm run prepare:live-test -- --representative-case prove-01
```

Etter bestått frysekontroll kan denne kommandoen bruke samme lokale plan og
schema som den syntetiske prøven. Den skriver en ny privat `preflight-*`-mappe
under casen med request, count-request og pakke. Ingen budsjettjournal opprettes,
ingen reservasjon gjøres, ingen API/count-forespørsel sendes og ingen nøkkel leses.
Vilkårlig output-/budsjettsti avvises for representativ case. Manglende faktisk
tokentall, prisavklaring, budsjettgrunnlag eller live-fullmakt forblir sperrer.

Første senere modellretur skal bevares uendret privat og sammenlignes med den
fryste fasiten **før menneskelige rettinger**. Bruk eksisterende schema-/kilde-
og oracle-sammenligning, og rapporter også konservative avvik ved annen ordlyd.
En selvrapportert fasit alene etablerer ingen modellkvalitet. Dette oppdraget
stopper ved mottaksporten fordi brukerens faktiske dokument ennå mangler.
