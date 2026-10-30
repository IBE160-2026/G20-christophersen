---
title: PAA som investeringsverktøy
status: proposal-awaiting-approval
revision: 2
date: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
decision_owner: Mads
implementation_authorized: false
---

# Forslag 2: eiendommen og investeringsøkonomien først

**Én opplasting åpner en investeringsflate med eiendommen øverst, avkastning
og kontantstrøm som hovedtall og finansiering som kan prøves direkte.**
Risiko oppsummeres kort ved vurderingen. Full TG-kontroll, dokumenter og
kilder ligger i egne fordypningsvisninger.

[Åpne den interaktive HTML-skissen](mockups/designforslag.html). Den starter
på Investering. «Ny eiendom» åpner PDF-/FINN-inngangen. Bruk slidere og
presise tallfelt, prøv manglende leie eller andre mangler, åpne risiko og
kildeutdrag, og tilbakestill scenarioet. Alt fungerer lokalt med fiktive data.
Ingen filinnhold leses, ingen nettverkskall utføres og ingen data lagres.

[DESIGN.md](DESIGN.md) og [EXPERIENCE.md](EXPERIENCE.md) beskriver retningen.
Alle dokumenter er utkast før Mads' godkjenning. Ingen produktkode, nye
agentmoduler, betalte API-kall eller push inngår. Første forslag er bevart
som [historisk øyeblikksbilde](.working/revisjon-1/designforslag.md), med
sin opprinnelige lenkekontekst og kildebaserte audit. Revisjon 2 erstatter
det som gjeldende designforslag, uten å endre godkjente produktkontrakter.

## Hva som er endret etter tilbakemeldingen

| Første forslag | Revidert forslag |
| --- | --- |
| Dokumentstatus og kontroll dominerte. | Eiendomsbilde, adresse, pris og nøkkelinfo kommer først. |
| Fire like store økonomimål inklusive NOI. | Bruttoyield, nettoyield og kontantstrøm er primære. NOI ligger i forklaringen. |
| Bare lån/betaling ble forhåndsvist. | Separat økonomisk scenario viser kontantstrøm under finansjustering. |
| Stor varselflate og kontrolloppgaver før finansieringen. | Kompakt investeringsvurdering ved hovedtallene, enkel risikooversikt ved finansieringen. |
| Rapport og kilder som sentrale kontrollflater. | Eiendom og risiko samt Dokumentasjon er fordypning. Kritiske mangler oppsummeres fortsatt på hovedsiden. |

Samme lyse grafitt/petrol-palett og minimalistiske stil beholdes. Ingen ny
risikoscore, kjøpshandling eller analysemodul innføres.

## 1. Eiendomstoppen

Bilde ved siden av adresse, område, pris og nøkkelopplysninger. Fotoet skal
være stort nok til å kjenne igjen objektet, men ikke skyve investeringstallene
ut av første desktopskjerm. Forslaget bruker omtrent 290 × 195 px illustrasjon,
30 px adresse og lett lesbare pris-/faktalinjer.

Prisene har presise roller:

- **Prisantydning** er den mest fremtredende prisetiketten ved adressen.
- **Totalpris inklusive fellesgjeld, uten kjøpsomkostninger** vises rett under og er yieldgrunnlaget P.
- **Kontantbehov ved kjøp** og beregnet privat lån ligger ved finansieringen.
- Areal viser arealtype, eksempelvis **BRA-i**, og enhet. Eierform, rom og byggeår vises bare med riktig opphav; ukjent forblir ukjent.

Skissen bruker en **lokal vektorillustrasjon av en fiktiv eiendom**, ikke et
foto som hevdes å være hentet fra salgsoppgaven. Adresse, areal og rom er
fiktive designverdier. Ved manglende bilde vises nøytral plassholder eller
senere dokumentforside tydelig merket som dette. Manglende adresse heter
«Adresse ikke funnet»; ingen eiendom gjettes.

## 2. Investering: hovedsiden

På bred skjerm har venstre del, omtrent to tredeler, økonomi og finansiering.
Høyre del har vurdering og risiko. Smal skjerm viser samme prioritet i én
kolonne: eiendom, hovedtall, vurdering, finansiering, risiko og tallgrunnlag.

**Tre hovedtall:** Bruttoyield, nettoyield og kontantstrøm før skatt. Yieldene
forklares med én kort linje; kontantstrøm viser år og gjennomsnitt per måned.
NOI er tilgjengelig under «Det som ligger bak tallene».

**Investeringsvurdering:** De eksisterende utfallene Gå videre, Forkast og
Innhent mer informasjon beholdes. Korte begrunnelser viser alle avgjørende
forhold og gir tilgang til fordypningen. Før en faktisk kodevurdering finnes,
brukes arbeidsstatus «Kontroll gjenstår». Et godt finansscenario er ikke en
bekreftet investeringsanbefaling.

I det fiktive eksemplet er vurderingen **Innhent mer informasjon** fordi
alvorlig TG3, ufullstendig rapport og økonomisk kontroll gjenstår. Finansiering
kan gjøre scenariokontantstrømmen positiv eller negativ; den opphever ingen
av disse grunnene. Ved siden av vises om scenarioet møter de illustrerte
økonomiske kravene, uten å kalle dette et nytt screeningutfall.

## 3. Interaktiv finansiering

Egenkapital, årlig rente og nedbetalingstid har presise tallfelt og supplerende
slidere. Skissen bruker hele år; senere produkt kan vise år og måneder med
entydig konvertering til eksisterende hele månedsgrunnlag. Ingen nye lånetyper.

Gyldige endringer oppdaterer umiddelbart:

- beregnet privat lån;
- månedlig privat lånebetaling og samlet årlig renter/avdrag;
- scenariokontantstrøm før skatt og endring mot utgangspunktet.

**Bruttoyield og nettoyield endres ikke av finansiering.** Dagens formler er
L/P og (L−D)/P. Egenkapital, rente og nedbetaling påvirker J og dermed
kontantstrømmen L−D−J. Bare endret pris, leie eller drift endrer yieldene.
Ingen ekstra analyse eller modellkall trengs for lokal justering.

Tallområdet merkes **«Scenario · ikke bekreftet»**, og endringer merkes
«Endret scenario». Dette erstatter første forslags begrensning til bare
låne-/betalingsforslag. Det er en ny foreslått atferd, ikke noe som allerede
er implementert i dagens finansdomene.

«Tilbakestill» gjenoppretter eksempelverdiene. «Bruk scenario i vurderingen»
viser i skissen hva neste steg innebærer: kontroll og bekreftelse av endrede
forutsetninger. Ingen bekreftelse eller investeringsvurdering endres i HTML-en.
I produktet skal en slik handling gjøre endret grunnlag ubekreftet, bevare
opphav og kreve relevante kontroller før nytt revisjonsbundet resultat.

Ugyldig/tom rente, egenkapital over kontantbehov eller ugyldig tid gir
feltfeil og ingen gyldig kontantstrøm. Ukjent leie, drift eller samlet
gjeldsbetaling erstattes aldri med null. Beregnbart privat lån kan fortsatt
vises selv om full kontantstrøm mangler grunnlag.

## 4. Risiko og dokumentasjon som fordypning

Hovedsiden viser en kort oppsummering av konkrete forhold, ikke samlet score:

- **Teknisk:** ett kjent TG3 uavklart og to TG2-kandidater i eksemplet.
- **Leie:** egen forventning, ikke dokumentert faktisk inntekt.
- **Dokumentgrunnlag:** rapportanalysen er ufullstendig.

«Kjente» og «kandidater» er bevisste ord når full dekning mangler. Funnantall
betyr ikke at alle forhold er funnet. Øvrige mangler, eksempelvis ukjent
byggeår, vises ved eiendomsdata og i fordypningen. Ingen ny markeds-,
regulerings- eller områdeanalyse antydes.

**Eiendom og risiko** inneholder alle tilgjengelige rapportfunn, alvorlighet,
dekning og TG3-avklaring. **Dokumentasjon** samler tallopphav, originale
perioder, år, mva, kildekonflikter, inkludering, kostnadsinnhold og begrensninger.
Kildedialogen åpner riktig originalkontekst uten å miste valgt tall eller funn.
I skissen er kildeutdragene fiktive og originalvisningen skjematisk.

Uttrekkskontroll, bekreftelse av full liste og avklaring av reelt alvorlig TG3
er fortsatt separate handlinger. Ufullstendig analyse kan ikke bekreftes bort;
skissens rapportbekreftelseshandlinger er derfor sperret. Når tilstrekkelig
rapportgrunnlag finnes i produktet, beholdes bekreft/korriger/avvis og originalen.

## 5. Fakta, egne forutsetninger og ukjent

Bruk korte opphavsmarkører ved tallene, uten en kontrollbadge etter hvert ord:

| Opphav | Betydning |
| --- | --- |
| Fra dokumentet | Dokumentet oppgir dette. Separat kildekontroll kan fortsatt gjenstå. |
| Dokumentets estimat | Dokumentet beskriver selv beløpet som estimat. |
| Egen forutsetning | Investorens forventning eller tillegg, med begrunnelse. |
| Ukjent | Det finnes ikke tilstrekkelig verdi. Ingen automatisk null. |

Blandet grunnlag brytes ned. Eksemplets drift er 36 000 kr fra dokumentet og
12 000 kr egen forutsetning; summen omtales aldri som rent dokumentfaktum.
Dokumentfaktum er ikke det samme som bekreftet verdi. Kontrollstatus og
original/korrigering vises i fordypningen, mens kritiske konsekvenser for
investeringsvurderingen alltid er synlige i oversikten.

## 6. PDF- og FINN-inngang

«Ny eiendom» åpner én enkel startflate med PDF-opplasting og synlig FINN
URL-felt. Filvalg skal starte eksisterende lokale behandling i det fremtidige
produktet; **prototypen viser bare valgt filnavn og behandler ikke innholdet**.
«Åpne fiktivt eksempel» lar Mads gå direkte til designet.

Støtteprofilen på 200 fysiske sider, 50 MiB per fil og samlet beholdt
salgsoppgave/separat rapport videreføres. Ingen OCR eller automatisk
vedleggsutpakking. FINN har synlig sperre, deaktivert henting i skissen og
ingen nettverkshandling. Eksisterende URL-/objektbytteregler, backendporter,
autorisasjonsreferanser og duplikatvern endres ikke av designarbeidet.

## 7. Tre subagenters vurdering av revisjon 2

| Perspektiv | Hovedfunn | Beslutning i utkastet |
| --- | --- | --- |
| UX | Dagens forslag prioriterte kontroll før investeringsinnsikt. | Tre hovedtall og finansiering i sentrum; kritisk risiko oppsummert ved vurdering. |
| Visuell utforming | Eiendomsidentitet og økonomi må dele første skjerm uten stort kontrollbanner. | Moderat bilde, tydelig adresse/pris, 2/3 økonomi og 1/3 vurdering i bred desktop. |
| Teknisk | Bilde/areal/type/rom og separat scenario mangler som etablerte produktkontrakter. | Merk fiktive data; beskriv senere modell-/kontraktarbeid, behold kontrollert beregning autoritativ. |

Alle tre påpekte at yield ikke følger rentefeltet, at opphav og kontroll er
ulike egenskaper, og at god økonomi ikke overstyrer ufullstendig rapport/TG3.
Ingen ekstra agentmoduler eller eksterne analyser er nødvendig for skissen.

## 8. Teknisk gjennomførbarhet

| Område | Finnes ved 06d8962 | Senere arbeid før produktstøtte |
| --- | --- | --- |
| Adresse/pris/eierform | Kildebundne identitetskandidater og økonomifelt i `src/contracts/document-import.ts:32–39,89–96`. | Presenter tilgjengelige kandidater med konflikt-/mangeltilstand. |
| Eiendomsfoto | Ingen bildekontrakt i import eller FINN. | Avgrenset lokal bilde-/forhåndsvisning med proveniens. PDF-forside kan rendres med eksisterende PDF.js, men er ikke automatisk eiendomsfoto. |
| Areal/type/rom/byggeår | Ingen dedikerte kildebundne felt. | Versjonert kontrakt/parser i eksisterende importpipeline; bevar arealtype, enhet og kilde. Ingen nye agenter. |
| Lån og betaling | Eksakt Big.js-annuitet i `src/domain/financing.ts:8`. | Gjenbruk aritmetikk og gyldighetsregler, med nye presentasjonskontroller. |
| Interaktivt økonomiscenario | Ingen etablert egen scenariokontrakt. | Egen tydelig scenariomodell med opphav, basisrevisjon, gyldighet og mangler. Del presise aritmetiske primitiver. Returner scenariotall, aldri autoritativ `ScreeningAssessment`. |
| Kontrollert økonomi/anbefaling | `finance.ts:16` krever bekreftet relevant grunnlag; `screening.ts` og `frontend/state/result.ts` eier autoritativ vurdering/revisjonsbinding. | Behold FR-13/FR-16. Ingen falsk `confirmed:true` for å beregne scenario. Bruk av scenario går via ekte kontroll. |
| Risiko/kilder/TG | Eksisterende funn, dekning, tekst-/sidebinding og separate kontroller. | Ny oppsummering og fordypningsnavigasjon; ingen ny risikomotor. |

Den lokale HTML-aritmetikken er en illustrasjon, ikke en erstatning for
produktets Big.js-presisjon og validering. Før implementering må FR-4s gamle
sekvens, UI-arkitektur og scenariomodell avstemmes sporbar mot de godkjente
beregnings-/kontrollreglene. Ingen gjeldende resultatkontrakt svekkes nå.

Ressursgrenser, én aktiv behandling, hash/generasjon/korrelasjon, avbrudd,
original/korrigering, manuelt eierskap, ingen automatisk retry og nøkler kun i
backend beholdes. FINN og salgsoppgave-live åpnes ikke. Checkpointets
økonomiprøve 11/11 gjelder separat avgrenset prøve, ikke full TG-/produksjons-
kvalitet eller automatisk mapping til vanlig UI. PAA-SO2 forblir åpen.

## 9. Eksempel og verifikasjonsgrunnlag

Alle eksempelfakta er fiktive: Eksempelveien 14, 0000 Eksempelby, leilighet,
86 m² BRA-i, to soverom, eierseksjon og ukjent byggeår. P=3 200 000 kr,
L=252 000 kr/år, D=48 000 kr/år, kontantbehov 3 075 000 kr og kjent
fellesgjeldsbetaling 12 000 kr/år. Minstekrav 6 % og år 2026 er fiktive
brukerforutsetninger, ikke skjulte eller anbefalte standardverdier.

| Finansscenario | Privat betaling/md. | Samlet J/år | Kontantstrøm før skatt/år |
| --- | ---: | ---: | ---: |
| 1 mill. egenkapital, 5,5 %, 25 år | 12 742,32 | 164 907,84 | 39 092,16 |
| 1,5 mill. egenkapital, 5,5 %, 25 år | 9 671,88 | 128 062,56 | 75 937,44 |
| 1 mill. egenkapital, 6,5 %, 25 år | 14 010,55 | 180 126,60 | 23 873,40 |
| 1 mill. egenkapital, 5,5 %, 20 år | 14 273,66 | 183 283,92 | 20 716,08 |
| 1 mill. egenkapital, 0 %, 25 år | 6 916,67 | 95 000,04 | 108 999,96 |
| Fullt dekket privat kontantbehov, 5,5 %, 25 år | 0,00 | 12 000,00 | 192 000,00 |

Bruttoyield er 7,875 %, nettoyield 6,375 % og NOI 204 000 kr i disse radene.
Tallgrunnlaget er kontrollert lokalt mot eksisterende `financingSuggestion`.
Månedlig kontantstrøm er en visning av årsbeløp/12, ikke en ny betalingsplan.
Prototypens hovedbeløp avrundes til hele kroner; månedsverdi/differanse viser øre.

Prototypesjekker og begrensninger dokumenteres i
[sesjonsnotatet](../../../process/arbeidsokter/2026-10-30-ux-redesign-forslag.md).
Dette er ikke brukertest, produksjonsakseptanse eller kvalitetsbevis for
faktisk dokumentuttrekk. Ingen implementering starter før designet godkjennes.

## Kilder og sporbarhet

- [AGENTS.md](../../../../AGENTS.md), [README](../../../../README.md) og [arkitektur](../../architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md).
- [Sensorveiledning](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), særlig plan–kode-spor, kvalitet og design/tilgjengelighet; lest i forrige del av samme økt.
- [Faglærertilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md): smal kjerne, finans i kode, kilder, menneskelig beslutning og egne skisser.
- [PRD](../../prds/prd-IBE160-2026-10-10/prd.md), FR-1–FR-18, særlig FR-13/FR-16; [tidligere UX](../ux-IBE160-2026-10-13/EXPERIENCE.md).
- [Godkjent salgsoppgaveretning](../../sprint-change-proposal-2026-10-28.md) og [code-first-design](../../salgsoppgave-code-first-design-2026-10-29.md).
- [Checkpointets økonomiprøve](../../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-4.md) og eneste [sentrale utsattarbeidsoversikt](../../../implementation-artifacts/deferred-work.md).
- [Brukerbestillingene i aktiv logg](../../../process/prompts/session-01a18c6d-0a58-7063-ac77-b64541b4ec72.jsonl) og [beslutningshistorikken](.memlog.md).
