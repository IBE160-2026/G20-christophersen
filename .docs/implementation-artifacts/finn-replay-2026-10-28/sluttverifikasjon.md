# FINN 476576649 — faktisk offline UI-verifikasjon

Dato: 2026-10-28. Baseline: `276802c0417106b5d608ab8f9e612a08202f3479`.
[Arbeidskontrakt](../spec-finn-opptak-ui-test.md).

**Resultat:** Hele den kontrollerte brukerflyten fungerer i bygget lokal app
med en uttrykkelig testkonvertering av det lagrede open_page-resultatet og
manuelle testantakelser for manglende økonomi. **Uendret råopptak kan ikke
importeres direkte** med dagens strenge kontrakt. Dermed er dette ikke bevis
for automatisk komplett utfylling fra råopptaket eller for live-import.

## Testoppsett og avgrensning

- Chromium, Node 24.21.0, npm 11.19.0. Ordinær demo-server på loopback.
- Playwright-konfigurasjonen setter `ANALYSIS_MODE=demo`, tom backendnøkkel,
  `FINN_IMPORT_ENABLED=false` og tomme godkjenningsreferanser. Faktisk HTTP
  til `/api/listing` ga 503 / disabled før nettleserresponsen ble erstattet.
- Browserens ene import klikkes gjennom UI. `/api/listing` avskjæres kun i
  testen og sendes gjennom eksisterende adapter og respons-/feltvalidering
  med en lokal transport. Ingen SDK-klient konstrueres for denne transporten.
  Dette tester ikke produksjonsbackendens aktiverte HTTP-/SDK-kobling.
- En separat prøve av uendret råopptak viser trygg avvisning og blank P/D/J.
  Gammel struktur og manglende ordrette sitater løses ikke ved å svekke
  produksjonsvalideringen.
- Den positive prøven konverterer bare gamle feltnavn, desimalrepresentasjon
  og perioder. Seks opprinnelige modellrapporterte beløp gjenbrukes.
  Testens kildetekster er tydelig merket «TESTKONVERTERING — modellrapportert
  opptaksdata, ikke ordrett FINN-sitat». Ingen faktisk annonsetekst konstrueres.
- Original [rårespons](../../process/arbeidsokter/finn-open-page-2026-10-28/response.json)
  er byteidentisk med baseline. SHA-256: `ca86c0b458824de84f66627b9d07047eddb2d9f4740ecce272d38273451c7fbc`.
- Browseren blokkerer eksterne forespørsler i den sammenhengende prøven;
  listen over slike forsøk var tom. Det utføres én offline importtransport
  og én separat demo-rapportanalyse. Ingen live-oppslag, betalte API-kall,
  retries, gateåpning eller push. Kostnad for denne økten: **USD 0,00**.

## Observerte resultater

| Brukersteg | Faktisk verifisert |
| --- | --- |
| FINN-lenke inn | Eksakt legacy-URL med `finnkode=476576649` beholdes gjennom request og adapter |
| Automatisk feltutfylling | Importpanelets kontrollfelt får pris 22 900 000, total 23 478 641, dokumentavgift 572 600, fellesgjeld 4 951, felleskostnader 7 226/måned og eiendomsskatt 5 125/år fra opptaket |
| Kilder og mangler | Seks kilde-URL-er og merkede modelltekster; samlet kjøpsomkostning, kommunale avgifter og fellesgjeldsbetaling blanke/ukjente. År, inkludering og rentedeler forblir ukjente |
| Eksisterende økonomiskjema før supplering | P/D/J forblir blanke: oppgitt total kan ikke avstemmes uten samlet omkostning. Kontantbehov ukjent og bruksknapp sperret |
| Manuell komplettering | Testeren oppgir 573 690 i omkostning med eksplisitt notat om differanseberegnet testantakelse, og avgiften inkludert i summen. Dette hevdes aldri å være oppgitt FINN-omkostning |
| Første kontrollert bruk | P=22 904 951 (pris + gjeld, uten omkostninger), ubekreftet. Kontantbehov 23 473 690; avgiften legges ikke til en gang til |
| Brukerkorrigering | Pris rettes til 22 800 000 og total til 23 378 641. Før bruk beholdes tidligere P; etter bruk P=22 804 951. Originalen og rettingsbegrunnelse er bevart, også i P-kilden |
| Finansiering | Kontantbehov 23 373 690, EK 10 000 000 gir eget lån 13 373 690. Fellesgjeld finansieres ikke på nytt. 0 %/240 mnd gir 55 723,71/mnd. 6 % gir 95 813,27/mnd og 1 149 759,24/år; positiv rentefasit beregnet uavhengig med Python Decimal (50 siffer) |
| Egenkapital-slider | End flytter EK til hele kontantbehovet og eget lån til 0; tallfeltet settes tilbake til 10 000 000 |
| Ufullstendig økonomi | D/J forblir blanke etter bruk av importen; kjent månedsbeløp omgjøres ikke til komplett D eller J |
| Separat PDF | F1-tilstandsrapport.pdf velges manuelt. Ingen analyse før eksplisitt klikk. Én ekte lokal HTTP-demoanalyse og nøyaktig ett TG2-funn, riktig beskrivelse, original PDF-side 2 og lesbart tekstlag |
| Eksisterende analyse og screening | Etter eksplisitte manuelle testantakelser L=1 500 000, D=100 000, J=700 000, Ymin=5 og kontrollert F1: Gå videre, bruttoyield 6,578 %, NOI 1 400 000/år, nettoyield 6,139 %, kontantstrøm 700 000/år |

F1 er en eksisterende fiktiv PDF, ikke en tilstandsrapport fra denne FINN-annonsen.
Resultatet gjelder kombinasjonen av opptaksdata, testens brukerrettinger,
manuelle økonomiske antakelser og fiktiv rapport. Det sier ingenting om en
faktisk investeringsanbefaling for annonsen.

## Kjørte tester og review

- [10 FINN-UI-tester etter review](replay-ui.txt), inkludert to nye opptaksprøver: bestod.
- [83 eksisterende økonomi-/screeningtester](regression.txt): bestod.
  Regresjonenes «live»-etikett bruker eksisterende injisert offline-adapter,
  ikke ekstern modelltransport.
- `npm run build` (inkludert typekontroll): bestod, eksisterende bundlevarsel.
  [Ny typekontroll etter review](typecheck.txt) og [lint](lint.txt): bestod.
- Første nye testkjøringer hadde feil forventet UI-feiltekst, feil resultat-
  seksjon og venting på en smalskjermknapp som ikke finnes i bredt automatisk
  PDF-panel. Bare testselektorer ble rettet. [Første kjøring](first-run.txt),
  [andre kjøring](second-run.txt) og [bestått før review](before-review.txt)
  er bevart. Ingen produktfeil påvist eller produktkode endret.
- Uavhengig BMAD-review fant fire hull i testdekningen; alle er rettet og
  verifisert av samme reviewer: eksakte nøkkeltall med korrigert P,
  rettingsproveniens, positiv rente og eksakt PDF-funn/side. Individuell
  triage i arbeidskontrakten. Ingen funn utsatt.
- Finans-, screening- og øvrig produktkode, sprintstatus og tidligere
  FINN-bevis er uendret. Historiske S5/S6-bevis er bevart.

[Skjermbilde av manglende samlet omkostning](01-opptak-med-mangler.png) og
[skjermbilde av sluttresultat](02-resultat.png) er visuelt kontrollert.

Reproduksjon: `npm run build`, deretter
`npx playwright test tests/e2e/listing-import.spec.ts --workers=1`.
Bruk prosjektets dokumenterte Node/Chromium-oppsett. Ingen nøkkel eller
FINN-tilgang skal aktiveres for denne prøven.

Fortsatt åpent: FINN-1 med dokumentert tilgang og reell kvalitetstest av ny
live-request. Dette arbeidet verken åpner gaten eller lukker den oppføringen.
