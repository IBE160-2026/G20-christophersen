# Retting av økonomiflyt i Konsept A

Brukeren bestilte gjenskaping og retting med den ekte private salgsoppgaven, spor gjennom opplasting/PDF/backend/UI og manuell nettleserkontroll. Ingen betalte API-kall eller push er autorisert. [Spesifikasjon](../../implementation-artifacts/spec-konsept-a-analyseflyt.md).

## Årsak og opprinnelig bevis

Ved HEAD `88cab245442ec83e0d4e4f81c143c699d6d3bd15` går Konsept A gjennom ImportClient til `/api/document-import`, isolert import-child, PDF-validering/tekstuttrekk og createCodeFirstImport. Offline-adapteren avviser ekte dokument som unsupported-synthetic; code-first bruker en smal lokal feltgrammatikk og ingen semantisk transport. Importert betyr derfor at dokumentuttrekket er klart, ikke at den tidligere økonomiprøven er utført.

Faktisk HTTP-opplasting av `private/incoming/salgsoppgave.pdf` ga 146 sider og alle ni faste økonomifelt som missing. cost.reason var `live-disabled; local-tokenizer-unavailable`. Privat førrespons: `private/incoming/concept-a-before.json`. Bildet rendres fra den lokale filen og dokumenterer ingen vellykket økonomianalyse.

Den separate [11/11-prøven](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-4.md) var ikke integrert i produktflyten. Lokal kontroll av ekte original viser identisk SHA-256 og hele ferske 146-siders tekstledger mot den lagrede pakken. Pakkeverifisering og ny rehydrering med fersk requestId/dokumentnavn passerer uten API. Leie og fullstendig drift er fortsatt ukjent. Pris er dokumentets estimat, og kostnadsavvik bevares som konflikter.

## Prosess og rammer

bmad-build benyttes, med separat undersøkelsesagent, implementeringsagent og senere review. Brukerens bestilling autoriserer rettingen. Ingen ny godkjenningsrunde eller kostnad. Faglærers tilbakemelding på brief og eksisterende parafrasert kildeuttrekk fra sensorveiledningen brukes for sporbarhet, relevante tester og tydelig usikkerhet; det opprettes ingen nye kurskrav.

Nettleserverten var utilgjengelig ved første forsøk. Tre native Chrome-tilkoblinger svarte med `Computer Use server error -10005: timeoutReached`. Dette er ikke manuell verifikasjon av appen. Brukeren er varslet via kort avklaringsspørsmål mens retting og lokale tester fortsetter.

## Retting og faktisk verifikasjon

Den tidligere faktiske compact-3-responsen lastes fra det private arkivet med pinnede SHA-256 for pakke, rå API-respons og modelloutput. Samme PDF-bytes, hele ferske tekstledger, valgte sider og forespørsel kontrolleres før økonomihydrering. Nytt filnavn/requestId bindes til ferske kilder. Kostnadsjournalene og TG-/rapportportene endres ikke. Manglende/ugyldig arkiv eller annen PDF gir tydelig lokal fallback, aldri lånte eiendomstall.

Den første ekte ende-til-ende-testen avdekket at den historiske pakken hadde transportmarkøren `kind: extracted`, som dagens HTTP-basis mangler. Ren replay med historisk basis fant ikke dette. Rettelsen bevarer historisk ekstraksjonsmetadata under pakkekontrollen og overstyrer alle semantiske basisfelt med fersk opplasting. En egen regresjonstest dekker forskjellen og avviser fortsatt endret fersk tekst.

`npm run build` består. Vite gir samme ordinære varsel om stor klientchunk; ingen byggefeil. Lokal server ble restartet i demomodus med tom API-nøkkel. Ingen nye API-kall eller push.

Privat Playwright-test `private/incoming/concept-a-real.spec.ts`, kjørt med `npx playwright test --config=private/incoming/concept-a-real.config.ts`, består gjennom faktisk filvelger og HTTP-rute. Den sammenligner alle ni økonomifelt og kilder mot tidligere reelt validert resultat (kun øktens dokumentnavn normaliseres), kontrollerer motstrid, at de tre KPI-ene fortsatt mangler ved ufullstendig grunnlag, at kildeknappen åpner riktig fysisk originalside, at mobilbredden ikke gir horisontal sidescroll og at ingen eksterne requests eller nettleserfeil oppstår. Response/skjermbilder/tekst er private, ikke versjonert. Brukte allerede installert Chromium 1243 med eksplisitt executablePath siden standard Playwright-nedlasting 1248 ikke finnes; ingen nedlasting ble gjort.

Eksisterende `investment-overview.spec.ts` og `prospectus-import.spec.ts`: 15/15 består via lokal privat regresjonskonfigurasjon med samme nettleser. Desktop, mobil og originalside ble visuelt kontrollert på de faktiske nettleserskjermbildene. Dokumentprisen og bevarte kostnadsalternativer er synlige. Dette erstatter ikke brukerens bestilte direkte manuelle nettleserinteraksjon: siste tilgangssjekk viste fortsatt utilgjengelig nettleservert.

## Praktisk grense

Dette kobler produktet til validering og gjenbruk av den tidligere faktiske analysen for nøyaktig samme dokument. Det aktiverer ingen ny betalt analyse av vilkårlige PDF-er. En ren checkout uten det private arkivet viser eksplisitt lokal fallback. Ingen fiktive produktverdier eller private analysefiler legges i git. Historisk 11/11 gjelder fortsatt avgrenset økonomi/begrensninger, ikke full TG-analyse eller bekreftet økonomi. Eksisterende åpne kvalitetsporter lukkes ikke av denne rettingen.


## Sluttkontroll etter review

Brukeren svarte på tilgangsspørsmålet og ba uttrykkelig om lokal Playwright i stedet for Chrome-styring, med opplasting av samme ekte original og kontroll av frontend/backend/nettverkskall/konsoll. Denne avklaringen erstatter behovet for direkte CUA-tilgang. Sluttesten ble derfor kjørt med synlig lokal Chromium (allerede installert 1243) mot **http://localhost:3000**: 1/1 består, inkludert faktisk filvalg, alle økonomifelt mot historisk reelt resultat, synlig dokumentbilde og ferdiglenke, åpning av riktig originalside, mobilbredde, null konsollfeil og null eksterne nettverkskall. Sluttskjermbildet med bilde og dokumentpris er visuelt kontrollert.

Tre uavhengige reviewlag er gjennomført og hvert funn triagert i spesifikasjonen. Rettede funn: faktisk HTTP-regresjon med standard privat arkivleser, E2E-assert for økonomiseksjon, tydelig ferdiglenke, status uten sekundvise skjermleserannonser og presis tekst for motstrid. Ingen funksjonelle funn utsatt.

Endelig målrettet kommando, med tom API-nøkkel: `npm test -- tests/unit/saved-economy.test.ts tests/unit/document-economy-ui.test.tsx tests/unit/economy-references.test.ts tests/unit/code-first-import.test.ts tests/unit/document-import.test.ts tests/unit/import-session.test.ts tests/unit/investment-property.test.ts tests/integration/document-import.test.ts tests/integration/saved-economy-real.test.ts`: **152/152, ni filer, ingen skip**. Den nye private HTTP-testen hopper bare over når originalen faktisk mangler i en annen checkout; her kjørte den og bestod.

`npm run build` og `npm run lint` består etter siste produktendring. Alle 15 eksisterende E2E bestod før de små reviewrettingene; den berørte første Konsept A-testen og ekte PDF-testen bestod på nytt etter disse. Ingen betalte API-kall, budsjettjournalendringer, fiktive produktverdier eller push. Lokal demo står på port 3000 med tom API-nøkkel.
