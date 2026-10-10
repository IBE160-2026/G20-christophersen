# Avstemming mot sensorveiledningen

Kontrollert 2026-10-10 mot originalen [Sensorveiledning IBE160 – Del 1](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf), alle sju sider lest med macOS PDFKit, og [kildeuttrekket](kildeuttrekk-sensorveiledning.md). Sammenligningsgrunnlag: [PRD](prd.md), [PRD-addendum](addendum.md) og beslutningene i [.memlog.md](.memlog.md).

## Resultat

Ingen nødvendig kravjustering eller scope-utvidelse identifisert. PRD-en gir et konkret planleggingsgrunnlag for kursens vurderingsområder. Den dokumenterer ikke at appen eller leveransen allerede oppfyller dem. Kildeuttrekket samsvarer med de relevante kriteriene i originalen.

| Kursgrunnlag | Dekning og vurdering |
|---|---|
| Sporbar plan–kode og dokumentert KI-styring, s. 1–3 | Kildepresedens, bekreftet UJ-1, stabile FR-/NFR-ID-er, kildehenvisninger og kravkoblet S1–S6 gir videre sporbarhet. Beslutningsloggen viser konkrete presiseringer og godkjenninger. Testgrunnlag/prosessbevis fører sporbarheten videre til UX, arkitektur, stories, kode og tester. Faktisk kodekobling og iterativ commit-/reviewhistorikk gjenstår. |
| Kjerneflyt, feil input og gjentatte handlinger, s. 2–3 | UJ-1 og FR-1–FR-18 konkretiserer start–slutt-flyten. NFR-1 og feil-/grensetestene dekker validering, gjentatt regelkjøring og at endrede input ikke bruker gammel anbefaling. Scope følger godkjent brief; kursens eksempler på roller, integrasjoner og lagring gjøres ikke til nye produktkrav. |
| Meningsfulle automatiserte og dokumenterte manuelle tester, s. 3–4 | Finans- og regeltester har uavhengig fasit, kritiske mangler, prioritet, likhetsgrenser og negative/nullverdier. Rapportuttrekk evalueres separat mot forhåndsdefinert fasit. Manuell plan dekker kontroll mot original, tilgjengelighet og lokal kjørbarhet. Ingen prosentvis kodetestdekning eller krav om alle testtyper er oppfunnet. Kodegjennomgang og faktiske funn/rettinger er senere prosessbevis, ikke levert kodearbeid i denne økten. |
| Tydelig UX og grunnleggende tilgjengelighet, s. 4–5 | NFR-2 dekker etiketter, kontrast, tastatur, fokus, tekst fremfor bare farge, eventuelle tekstalternativer og feil-/tomtilstander. FR-18 krever synlig steg, status og samlet forståelig resultat. Relevant desktop-oppsett og designspor hører til senere UX; mobilapp eller sertifisering innføres ikke. |
| Dokumentert, forståelig arkitektur og kode, s. 5 | Sekvensiell flyt og skillet KI-uttrekk/kodebasert finans er produktføringer. PRD-en overlater stakk og lokal datahåndtering til senere arkitektur. Ingen bestemt stakk, formatter, modulstruktur eller kvalitetsresultat er påstått valgt/oppnådd. |
| README og rent lokalt miljø, s. 2 og 5–6 | NFR-3 og S6 krever dokumenterte versjoner, eksakte kommandoer, demo/testdata, tester og valgfri live-konfigurasjon uten hemmeligheter. En annen person skal verifisere kjørbarheten. Hele demoen kan kjøres etter installasjon uten nøkkel eller betalt konto; dette konkretiserer briefen og hevdes ikke være en universell ekstra kursregel. Faktisk README og kjørbarhetsbevis gjenstår. README skal ved implementering følge kursens øvrige føringer om formål, mappestruktur, plan-/prosesslenker og samsvar med koden. |
| Ryddighet og hemmeligheter, s. 6–7 | NFR-4 krever at nøkler ikke finnes i versjonerte filer eller historikk og at testdokumentenes publiserbarhet vurderes. Planlagt fixture-/bevisplassering gir ryddig skille mellom testdata og dokumentasjon. Faktisk repo-/historikk- og ignorekontroll hører til leveransearbeidet; denne avstemmingen hevder ikke at kontrollen er gjennomført. |
| Ærlige resultater og dokumentasjon knyttet til faktiske endringer, s. 1–2 og 6–7 | PRD og addendum merker tester, målinger og evalueringsmål som planlagt. Konstruert tidsfasit er skilt fra produktmålinger; live KI er skilt fra lagret demo. Verken vellykket demo, regnefasit eller dokumentavstemming presenteres som bestått produktkvalitet. |

## Avgrensning og neste fase

Veiledningen er faglig vurderingsstøtte, ikke en mekanisk sjekkliste. Den bestemmer ingen PRD-mal, teknologistakk, numerisk testdekning eller nye funksjoner. PRD-ens talltoleranser, rapportgrenser, screeningregler og tidsmål har produktkilder og brukerbeslutninger som grunnlag.

PRD-en er tilstrekkelig for videre planlegging innen låst v1. Faktisk design, arkitektur/kode, README, repoorden, kodegjennomgang, kjørte tester og målinger må dokumenteres når arbeidet gjennomføres. Dette er gjenstående gjennomførings- og leveransebevis, ingen åpne produktbeslutninger eller grunnlag for å utvide scopet nå. PRD er ikke endret gjennom kontrollen.
