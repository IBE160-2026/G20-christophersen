---
title: To visuelle retninger for PAA
status: approved-concept-a
revision: 3
date: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
decision_owner: Mads
implementation_authorized: true
---

> **Vedtak 2026-10-30:** Mads har valgt og godkjent konsept A som endelig designretning og autorisert implementering i eksisterende PAA. Konsept B bevares som alternativhistorikk. Senere omtale av «venter på valg» beskriver forslaget før dette vedtaket. Se [implementeringsspesifikasjonen](../../../implementation-artifacts/spec-konsept-a-produkt.md).


# Forslag 3: to forskjellige investeringsopplevelser

[Åpne sammenligningssiden](mockups/designforslag.html),
[konsept A](mockups/konsept-a.html) eller [konsept B](mockups/konsept-b.html).
Alle åpnes lokalt i nettleseren. Ingen bygging, server eller API-nøkkel kreves.
Behold HTML-filene og `assets/` i samme mappe ved flytting.

Tre parallelle subagenter utviklet A og B uavhengig og vurderte tekniske
bevaringskrav. Dette er alternative designutkast. Mads velger retning før
produktimplementering; ingen retning er godkjent eller anbefalt som et vedtak.

## Konseptene

| | A — Eiendomsopplevelsen | B — Investeringsarbeidsflaten |
| --- | --- | --- |
| Utgangspunkt | Lys, eksklusiv eiendomsplattform. | Mørk, profesjonell analyseplattform. |
| Komposisjon | Stor fotohero, redaksjonell adresse, åpen tallrad, finansiering til venstre og bred graf til høyre. | Eiendomstopp, kompakt vurderingslinje, store tall og graf til venstre, finansiering til høyre. |
| Typografi | Georgia på adresse, overskrifter og hovedtall; enkel sans på kontroller. | Lett sans på store tall; tabellariske siffer og monospace på presise lånetall/grafdata. |
| Farge og kontrast | Papirhvit, dyp grønn og dempet petrol. | Dyp grafitt, lys mint, varm rav og tydelig faresignal. |
| Visuell rytme | Få flater, store pauser, tynne skillelinjer. | Tettere økonomisk arbeidsflate, presise kolonner og grafisk kontrast. |
| Fordypning | Tre redaksjonelle lenker og dialoger. | Diskré navigasjonsrail, datarader og dialoger. |

Begge endrer hele komposisjonen fra revisjon 2. Ingen rekke med like KPI-kort,
kontrollsjekklister eller filadministrasjon foran eiendommen og økonomien.

## Samme eiendom og samme økonomi

Samme lokale interiørbilde brukes i begge. Det er en illustrasjon fra
[Spacejoy / Unsplash](https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-large-window-ctyssSFmXmU),
ikke et bilde av eksempeladressen eller en analysert eiendom.
[Lokalt opphavsnotat](mockups/assets/BILDEKILDE.md).

| Felles eksempelgrunnlag | Verdi |
| --- | ---: |
| Adresse / areal / soverom | Eksempelveien 14 / 86 m² BRA-i / 2 |
| Prisantydning | 3 000 000 kr |
| Fellesgjeld | 200 000 kr |
| Yieldgrunnlag, uten kjøpsomkostninger | 3 200 000 kr |
| Kontantbehov ved kjøp, inklusive 75 000 i omkostninger | 3 075 000 kr |
| Forventet leie, egen forutsetning | 252 000 kr/år |
| Drift: 36 000 fra fiktivt dokument + 12 000 egen forutsetning | 48 000 kr/år |
| Fellesgjeldsbetaling, holdes atskilt fra drift | 12 000 kr/år |
| Egenkapital / rente / nedbetaling | 1 000 000 kr / 5,5 % / 25 år |
| Privat lån / månedsbetaling | 2 075 000 kr / 12 742,32 kr |
| Samlet renter og avdrag | 164 907,84 kr/år |
| Bruttoyield / nettoyield | 7,875 % / 6,375 % |
| Kontantstrøm før skatt | 39 092,16 kr/år |

Alle tall, kilder og adresse er fiktive. Byggeår er ukjent. Dokumenterte
opplysninger i eksemplets historie, egne forutsetninger og ukjente verdier
merkes hver for seg; opphav er forskjellig fra faktisk kontrollstatus.

## Det som kan prøves

- Egenkapital, rente og nedbetalingstid med tallfelt og skyveknapper.
  Kontantstrøm, betaling og grafer oppdateres; yieldene er uendret av finansiering.
- Grafvalg mellom akkumulert kontantstrøm, restgjeld på privat lån og
  årlig kontantstrøm ved ulike renter. Punkter kan undersøkes med mus eller
  tastatur; tabeller gir et lesbart alternativ.
- Nullstilling, negativ kontantstrøm og feltvalidering. A viser også en
  eksplisitt tilstand med ukjent leie; lån/restgjeld er fortsatt tilgjengelig.
- PDF-inngang, redigerbart FINN-felt med sperret Hent, kilder og TG-fordypning.
  PDF-valg viser bare filnavn. Ingen filinnhold leses, sendes eller analyseres.

Vurderingen **Innhent mer informasjon** skyldes uavklart TG3, ufullstendig
rapport og ubekreftet grunnlag. Den endres aldri av finansscenarioet.
Positiv kontantstrøm betyr ikke kjøpsanbefaling. Risiko er synlig og kort
på hovedsiden, med detaljer i egne dialoger.

## Grafenes betydning

Akkumulering er **år × dagens årlige kontantstrøm**, med start på null og
samme valgte tidshorisont som lånet. Leie, drift, rente og årlig betaling
holdes faste. Initial egenkapital, verdiendring, salg og skatt inngår ikke;
kurven er ingen totalavkastning, prognose eller tilbakebetalingstid.

Restgjeldskurven viser bare privat lån, ikke fellesgjeld eller boligverdi.
Den lokale illustrasjonen modellerer månedlig amortisering og setter saldo
til null ved valgt forfall; sluttermin kan avvike på grunn av øreavrunding.
Senere produktgrafer må definere nøyaktig betalingsplan med Big.js og
håndtering av sluttermin, særlig ved ekstreme rente-/løpetidskombinasjoner.

Rentefølsomhet holder øvrige forutsetninger faste og viser 2–12 % med valgt
rentepunkt innen intervallet. Rente utenfor intervallet merkes eksplisitt.
Negativ kontantstrøm og nullinje skal kunne leses uten farge alene.

## Teknisk bevaring og avgrensning

Felles [lokal scenariologikk](mockups/assets/paa-scenario.js) sørger for at
begge viser identiske økonomiske eksempler. Den bruker JavaScript Number
som prototypearitmetikk, ikke produktets presise desimalmodell.
Hovedtall er kontrollert mot eksisterende
[src/domain/financing.ts](../../../../src/domain/financing.ts).

Produktets eksisterende regler og sikkerhet endres ikke: bekreftet relevant
grunnlag før autoritativ beregning, kilde-/periodekontroll, mangler ulik null,
revisjonsbinding, separate uttrekks-/liste-/TG3-kontroller, PDF-grenser,
avbryt/duplikatvern og alle backend-, live-, kostnads- og FINN-porter.
Checkpoint 06d8962 åpner ingen av disse portene.

Senere implementering trenger en eksplisitt separat scenariokontrakt og
presise grafregler i vanlig kode. Eksisterende import har ikke dedikerte
kildebundne foto-/areal-/romfelt; dette må avklares innen eksisterende
pipeline. Ingen ny agentmodul foreslås. Dialogene skisserer tilgang til
kontrollarbeidet, men implementerer ikke ekte PDF-visning eller bekreftelser.

## Kilder, historikk og valg

Inspirasjonsvedleggene omtalt i bestillingen var ikke synlige i mottatt
melding. Bruker er orientert; ingen påstand om å ha analysert bildene gjøres.
Konseptene bygger på brukerens uttrykkelige beskrivelse av A og B.

[DESIGN.md](DESIGN.md) beskriver begge visuelle alternativer og
[EXPERIENCE.md](EXPERIENCE.md) deres felles atferd. Revisjon 2 er bevart som
[historisk forslag](.working/revisjon-2/designforslag.md), med tilhørende
spines og HTML. Arkivkopiene har sin opprinnelige relative lenkekontekst.
Revisjon 1 og tidligere godkjent UX er også urørt.

Videre grunnlag: [PRD](../../prds/prd-IBE160-2026-10-10/prd.md),
[godkjent opplastingsretning](../../sprint-change-proposal-2026-10-28.md),
[code-first-design](../../salgsoppgave-code-first-design-2026-10-29.md),
[faglærertilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
og [sensorveiledning](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf).
Disse begrunner sporbarhet og avgrensning; den visuelle komposisjonen er et
forslag til valg, ikke et nytt kurskrav eller en produktgodkjenning.

Lokale kontroller dokumenteres i
[kontrollskript](.working/check-concepts.mjs),
[kontrollkvittering](.working/concept-check-result.json) og
[arbeidsøkt](../../../process/arbeidsokter/2026-10-30-ux-redesign-forslag.md).
Ingen produktkode, betalte API-kall, commit eller push.
