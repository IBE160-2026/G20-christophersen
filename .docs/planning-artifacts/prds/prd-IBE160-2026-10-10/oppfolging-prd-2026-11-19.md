# Oppfølging av faglærerens PRD-tilbakemelding

Dato: 2026-11-19. Grunnlag: HEAD **684e61d3686f83f05c3f6cb1a3720dfb3f622c68**,
produktkode **6392918** og dokumentert leveransekontroll **6e3fbe6/3a26521**.
[Faglærerens vurdering 12. november](tilbakemelding-prd.md) er formativ, ikke karakter.
Dette er en etterfølgende avstemming av eksisterende arbeid, ikke en ny
produktbestilling eller omskriving av samtidige bevis.

PRD-en er revidert fra omtrent 7 500 til 4 600 ord. Krav-ID-ene beholdes;
gjeldende krav står i [PRD](prd.md), opprinnelige testeksempler i
[addendum](addendum.md) og opprinnelig PRD-ordlyd i Git ved inngangscommiten.
Nøyaktig ordtelling, kontroller og triage dokumenteres i
[arbeidsøkten](../../../process/arbeidsokter/2026-11-19-prd-faglaerer.md).
Ingen fungerende produktkode, stack, pakker eller gamle råbevis er endret.

## Alle kommentarer: behandling og etterprøvbare holdepunkter

Tabellen viser dokumentbehandling. «Innarbeidet» betyr ikke at et produktmål
er bestått eller en sentral sak lukket. Fullt
[kildeuttrekk](reconcile-feedback-2026-11-19.md) dekker alle kommentarer i §1–7;
[implementeringsuttrekket](implementation-evidence-2026-11-19.md) angir kode,
testasserts og grenser for bevisverdien.

| Kommentar | Håndtering og endring | Bevis / vurderingskobling |
| --- | --- | --- |
| §1 samlet inntrykk: sterk tese, men to produktversjoner | **Innarbeidet.** Gjeldende status per UJ/FR/NFR og mål står først; dagens krav er skrevet inn, ikke bare varslet i banner. | PRD «Gjeldende kravstatus» og «Kildepresedens»; sensor s. 2–3 og varsel s. 6–7 om plan som beskriver annen app. |
| §2 styrke: eksakte finansgrenser | **Bevart.** FR-12/14/16 og BT/AT beholder 7 %-likhet, én krone under og kontantstrøm 0/−1. S1-toleranse endrer ikke regelterskel. | [thresholds](../../../../src/domain/thresholds.ts), [tester](../../../../tests/unit/thresholds.test.ts), BT-8/AT-10/11; sensor s. 4. |
| §2 styrke: KI utenfor beslutninger, feil ≠ tomliste, kontroll på kall/demo | **Bevart og avgrenset.** FR-6/9/16 skiller null modellkall i vanlig lokal import fra ett gammelt rapportkall og særskilt økonomikall. Lagret demo merkes som håndskrevet fiksjon. | [screening](../../../../src/domain/screening.ts), [import-rute](../../../../src/backend/http/import-route.ts), [demoopphav](../../../../src/backend/analysis/data/README.md); sensor s. 3–4. |
| §2 styrke: S1–S6 og K1–K3 | **Bevart.** Ingen gevinst ved oversette TG3, skjulte mangler eller flere Gå videre. Avvik skilles fra beståtte mål. | PRD mål-/kontrolltabeller, S5-W1, åpen S6; sensor s. 2–4. |
| §3 beslutningsklarhet | **Forbedret.** Retningsendring er innarbeidet og «ingen åpne produktspørsmål» erstattet med konkrete porter/eier/revisit før betalt kjøring. | R1, code-first-vedtak og FR-status; sensor prosess 30 %. |
| §3 substans | **Bevart.** Produktspesifikke terskler og én investor; ingen ekstra personas eller generiske krav lagt inn. | PRD begreper/FR, rubrikkontroll; sensor funksjonalitet 20 %. |
| §3 strategisk sammenheng | **Bevart og forklart.** Lokal dokumentanalyse/scenario støtter førstevurdering; senere utvidelser og avkall er datert. | Correct Course og investeringsspec; sensor s. 3, endret/utelatt scope. |
| §3 testbarhet | **Forbedret.** Alle aktive TG3 er avklaringspliktige; utvalg, nevnere og presise feilgrenser er eksplisitte. | FR-5/16, S2 og [TG3-tester](../../../../tests/unit/tg3-resolution.test.ts). |
| §3 scope og avgrensning | **Innarbeidet.** Salgsoppgave og valgfri lokal OCR er nå innen dagens omfang; 30/200-sidersprofilene skilles. Kapital/annuitet er senere godkjente scenariofunksjoner. | [Leveranseavstemming](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md); ingen påstand om at de var opprinnelig v1. |
| §3 brukbarhet for neste fase | **Forbedret.** Stabile ID-er, kortere hovedtekst og samlet bevisinngang. Gamle story-AC peker til sin daterte fasit. | Kravstatus + addenduminnledning; sensor plan–kode. |
| §3 formtilpasning | **Innarbeidet.** Én reise beholdes; gjentatte godkjenninger/kildelinjer per kravgruppe er fjernet fra kravteksten. | Godkjenninger finnes fortsatt i .memlog og beslutningsavstemming. |
| **4.1: retning ikke reflektert i krav** | **Innarbeidet.** Dato 19. november, faktisk scope, ny UJ-1 og revidert FR-1/2/4/6/7/8/9/12/15/18. Alle FR-ID-er har status. Final gjelder dokumentrevisjonen. | Daterte vedtak 28. oktober–6. november. Brief/arkitektur/sporbarhetskart har lesestatus som skiller gjeldende PRD fra historikk; sensor s. 2–3/6–7. |
| **4.2: alvorlig TG3** | **Presisert mot kode.** Hvert aktivt TG3 krever avklaring. Ingen ikke-alvorlig klasse finnes; vi lager derfor ikke et slikt unntak/testeksempel. Korrekt brukerretting til TG2 eller avvisning av feiluttak skilles fra faktisk TG3-avklaring. | [currentTg3Findings](../../../../src/frontend/state/report.ts), [validateTg3Resolution](../../../../src/domain/tg3-resolution.ts), [evaluateKnownDeficiencies](../../../../src/domain/screening.ts), FR5-/bindings-/prioritetstester. Briefens gamle formulering var mindre presis; dette er operasjonell konservativ regel, ikke påstått gammel definisjon. |
| **4.3: lengde/gjentakelser/prosessstoff** | **Innarbeidet.** Prioritet 1 defineres i FR-16; andre FR beskriver sin observerbare konsekvens og viser dit. Prosessgrunnlag samles foran/utenfor kravene. Historiske testtabeller beholdes. | Førversjon i 684e61d, ny PRD og append-only memlog. Ingen historiske godkjenninger slettet. |
| **4.4: KI-kostnad/feilgrense utsatt** | **Innarbeidet med eksisterende tall.** Lokal behandling 60 s, eldre rapport-live absolutt 120 s til validert utfall, økonomi 120 s forespørselstimeout. R1 USD20 prosjekt, senere USD0,20 analyse og USD0,15 økonomireservasjon/0,05 margin beskrives hver for seg. | [R1](../../r1-live-ki-semester-v1.md), [code-first](../../salgsoppgave-code-first-design-2026-10-29.md), [økonomibudsjett](../../../../src/backend/import/economy-local-budget.ts). Faglærers 300 s er eksempel og velges ikke som ny timeout. Nye betalte kall er forbudt her; konto/pris/ukjent belastning må avstemmes før eventuell senere fullmakt. |
| **4.5: S2/S5-utvalg** | **Innarbeidet som plan, ikke resultat.** F1–F4 med verdier/utfall i PRD; minst tre ulike rapporter / ti TG2 / to TG3 foreslås for utvidet korpus. Tallene er planvalg, ikke sensorpålegg eller gamle gjennomførte forsøk. Matching, nevnere, feil side, duplikater og null-nevnere defineres. | RT-16, versjonert finansfasit og ny uutført testprotokoll. Historisk S2 er 4/4 TG2 og 1/1 TG3 i kontrollerte F1–F4, ikke det nye korpuset. Ingen generalisering fra disse tallene. |
| §5: ID-er og krysslenker | **Bevart/kontrollert.** FR-1–18, NFR-1–5, S1–6, UJ-1 og K1–3 er med. Eksisterende RT/BT/AT/TT-ID-er bevares. | Mekanisk lenke-/ID-kontroll og kritisk sluttkontroll i arbeidsøkten. |
| §5: ingen antakelser, selv om modell/kostnad var uavklart | **Korrigert.** Nå dokumenterte vedtak og tydelige restporter; 80 %/6 %/360 er eksplisitte scenarioantakelser. Ingen ubegrunnet generell «antakelsesfri»-påstand. | PRD begreper/UJ og KI-tabell; fersk saldo/pris er ikke verifisert. |
| §5: begrepsdrift | **Innarbeidet.** Uttrekk = opprinnelig maskinresultat, funnliste = gjeldende brukerhåndterte liste, dokumentgrunnlag = original/dekning, kritisk grunnlag = screeningens samlede forutsetninger. | Begrepstabell; TG3-avklaring holdes separat fra listebekreftelse. |
| §5: én reise og korte feilscener | **Innarbeidet.** UJ-1 beholdes, med korte scener for manglende tall og rapport/usikkerhet. | Ingen ekstra brukerroller; FR-3/9/16 konkretiserer feil. |
| §6: tre blokkere før videre fase (4.1/4.2/4.4) | **Dokumentavklart.** Gjeldende krav, TG3-regel og eksisterende frist-/budsjettvedtak er synlige. Dette er etterfølgende avstemming, ikke påstand om at alle gamle faseporter var uavklarte fram til nå. | Plan–kode-kjeden og faktiske vedtak; generell KI-live/kontoport forblir stengt. |
| §6: utvalg, redaksjon og begreper kan vente | **Tatt nå innen dokumentoppdraget.** Korpus-/menneskeprøver er forberedt; gjennomføring gjenstår. | Planen endrer ingen produktfunksjon og lukker ingen sak. |
| §6: brief-oppfølging mangler dagens alternativer | **Innarbeidet.** Kort sammenligning med manuell lesing/regneark, generelle chatboter og rådgivere i PRD. | Hentet fra briefen, ikke ny markedsundersøkelse; bedre tid/kvalitet er fortsatt hypotese. |
| §7 spørsmål 1: hvem foreslo kriteriene, og hvordan kontrollert? | **Besvart med bevisgrenser**, se opphav nedenfor. Ingen sikker menneskelig førsteforfatter til 90 %-tallet tilskrives uten originalkilde. | .memlog, brief-addendum, manuell fasit, konkrete finans-/prioritetstester og kritisk review. |
| §7 spørsmål 2: endret vs historisk krav | **Besvart gjennom struktur og begrunnelse.** Én gjeldende PRD, dato/status per krav og lenkede samtidige vedtak; gamle AC beholdes med profil-/versjonsforklaring. | Git-førversjon, addendum og lesestatus i kompanjonger. Historien er søkbar uten at gammel tekst framstår som gjeldende ikke-mål. |

## Opphav og kritisk styring av KI

Briefens revisjonskontroll dokumenterer Mads' valg av den smale kjernen,
formlene og prioriteten 8. oktober. PRD-memloggen dokumenterer Mads'
bekreftede brukerreise, alle eksplisitte TG2/TG3, TG3-status + begrunnelse +
grunnlag og kodebestemt anbefaling/begrunnelse, samt godkjenning av kvalitetsdelen
og S1–S6. Dette er dokumenterte beslutningsreferater. De er ikke fullstendige
ordrette originalprompter.

Det finnes derfor belegg for at terskelen 90 % ble tatt inn/godkjent i
kravgrunnlaget, men ikke sikkert belegg for hvem som først foreslo akkurat
tallet. Vi tilskriver det ikke i ettertid til studentens egen statistiske
analyse eller til faglærer. Tilsvarende er flere grensetilfeller presiseringer
formulert under KI-assistert kravarbeid: BT-8 følger matematisk av
nettoyieldformelen og er kontrollert mot faste tall og uavrundet sammenligning,
ikke en selvstendig «ny investeringsregel» fra KI.

Motstrid kontrolleres med uavhengig håndskrevet fasit, rene
[finans-/terskeltester](../../../../tests/unit/finance.test.ts),
[prioritetstester](../../../../tests/unit/complete-screening.test.ts),
separate kontroll-/TG3-bindinger og review. «Håndskrevet» i testkoden betyr
fasit uavhengig av funksjonen under test; det beviser ikke uavhengig
menneskelig fagvalidering. Denne grensen står nå eksplisitt.

[Prosess-/KI-guiden](../../../process/leveranse-2026-11-06/prosess-og-ki.md)
gir konkrete samtidige kjeder: Mads stanser misvisende S5-framstilling,
bestiller salgsoppgave og lokal analyse med kostnadstak, avviser feilaktig
økonomioutput og krever norsk beløpstolkning i kode. Promptlogger, commits,
avviste modellresultater og rettingstester er bedre bevis for kritisk styring
enn denne senere oppsummeringen alene. Øktens egen promptlogg inngår i den
lokale commiten; automatisk logging er uendret og tidligere logger urørt.

## Teknologioversikten fra et annet produkt

[Prinsippvurderingen](../../architecture/technology-principles-2026-11-19.md)
går gjennom 17 kategorier fra [technology.md](../../architecture/technology.md).
Overførbart er eksplisitt konfigurasjon, demo uten nøkkel, skille
tillitsgrenser, validerte kontrakter, kostnadsvern og kjørbar dokumentasjon.
Prinsippene knyttes til PAA sin eksisterende kode og faktiske begrensninger.

Vi følger **ikke** forslaget som en PAA-stackoppskrift: ingen Next/FastAPI,
database, Redis, Caddy, Compose, betaling, kontoer, auth-/e-posttjenester eller
ny modellleverandør innføres. Det andre produktets butikk-/konto-/driftsbehov
er ikke PAA-behov. Full CSP, offentlig produksjonssikkerhet, backup og
flerbrukerdrift påstås heller ikke. Dette er begrunnede avgrensninger etter
sensor s. 4–6, ikke mangler som skal «løses» ved å legge til tjenester.

## Uavhengig testing og tidsbesparelse

Det finnes ett faktisk historisk S5-forsøk. 32:16 manuell TG-identifisering,
0:41 synlig KI-liste og 5:18 kontroll er bevart som observasjoner med
metodeavvik. Det finnes null komplette godkjente manuelle sammenligningsreferanser.
Vi beregner ingen gevinstprosent av dette og endrer ikke
[S5-W1](../../../implementation-artifacts/story-4-5-s5-waiver-2026-10-27.md).
AI-assistert ren klon beviser teknisk kjørbarhet, ikke annen persons
førstegangsforståelse eller S6.

[Ny testprotokoll](../../../process/evaluering/testprotokoll-del1-2026-11-19.md)
forbereder én uavhengig README/S6-person og en separat firepersoners
manuell/PAA-studie med likeverdige syntetiske A/B-caser, motbalansert
rekkefølge, uavhengig fasit, fulle kilde-/regeloppgaver, tidsgrenser,
kvalitetsporter og tom rådatamal. Alle feil og frafall skal rapporteres.
Casepakker/fasit må fortsatt produseres og fryses, deltakere rekrutteres og
prøvene faktisk gjennomføres. Planen er eksplisitt **uutført** og bruker ingen
betalt KI. Manglene følges bare i [deferred-work](../../../implementation-artifacts/deferred-work.md).

## Begrunnet vurdering mot A-ambisjonen

Sensorveiledningen gir felles A–B-kjennetegn og faglig skjønn, ikke en
automatisk A-sjekkliste. Prosess/KI-styring (30 %) styrkes ved at senere
beslutninger, avviste KI-forslag og faktisk kode nå kan følges uten
motstridende aktive krav. Relevante deterministiske tester, dokumenterte
feil/rettinger og nøkkelfri kjøring er sterke holdepunkter for testing,
arkitektur og kjørbarhet. Dette er ikke en full ny sensur av appen.

Det største innholdsmessige hinderet for en trygg A-vurdering er fortsatt
**dokumentfunksjonalitetens begrensede generalisering**: hovedproduktet skal
spare sammenstillingsarbeid, men generell TG-/layout-/juridisk dekning er ikke
bevist, og sentrale reelle dokumenter gir ufullstendig teknisk grunnlag.
Ny bredde i scenario erstatter ikke komplett og stabil kjerne (20 %).
Uavhengig menneskelig prøving/forståelse og faktisk README/S6 mangler dessuten,
og tidsgevinsten er ikke validert (testing 15 %, UX 10 %, kjørbarhet 10 %).
Sensor krever ikke et bestemt antall testpersoner eller bevist tidsgevinst,
men prosjektets egne løfter kan ikke omtales som oppnådd uten disse bevisene.

Den etterfølgende dokumentrevisjonen gjør vurderingen ærligere og mer
etterprøvbar. Den kan ikke alene bevise menneskelig forståelse, generell
dokumenttreffsikkerhet eller lukke det aksepterte S5-avviket. En begrunnet
A-konklusjon krever at sensor finner den faktisk leverte, tydelig avgrensede
kjernen tilstrekkelig komplett og stabil, med sterk kvalitetssikring og
kjørbarhet. Denne økten reduserer dokumentasjonsgapet; de empiriske grensene
står fortsatt åpent.
