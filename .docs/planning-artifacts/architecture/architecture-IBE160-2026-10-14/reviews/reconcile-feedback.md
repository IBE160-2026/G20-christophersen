# Kildeavstemming — faglærerens tilbakemelding

Dato: 2026-10-14. Uavhengig avstemming av arkitekturutkastet som planleggingsartefakt.

**Verdikt: Samsvar. Ingen vesentlige avvik eller blokkerende funn.** Arkitekturen følger den avgrensede v1 som ble låst etter faglærertilbakemeldingen. Den omsetter tilbakemeldingen til tydelige modul-, kjøre- og verifikasjonsgrenser uten å gjeninnføre det historiske brede MVP-et.

## Grunnlag og autoritet

Gjennomgått:

- [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), [beslutningslogg](../.memlog.md) og [teknologigrunnlag](../.working/teknologigrunnlag.md).
- [Faglærerens tilbakemelding, 2026-10-06](../../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md).
- [Revisjonskontroll og låste oppfølgingsbeslutninger, 2026-10-08](../../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md), særlig «Oppfølging: låste v1-beslutninger før PRD» og «Ny verifikasjon».

Faglærerens omtale av sju agenter, DSCR, score, stresstesting, helhetlig risikoanalyse og stort MVP gjelder briefversjonen ved commit `3ac6267`. Gjeldende oppfølging avgrenser v1 til manuelle tall, én TG2/TG3-rapportanalyse, fire nøkkeltall og faste screeningregler. De tidligere forslagene om ekstra kostnadsfratrekk og endret yieldnevner er også erstattet. Historiske forslag er derfor ikke avvikskriterier for denne arkitekturen.

## Avstemming

| Relevant tilbakemelding | Arkitekturens behandling | Vurdering |
| --- | --- | --- |
| Smal kjerne og enkel sekvensiell pipeline fremfor samarbeidende agenter | AD-1, AD-3 og AD-6 samt pipelinediagrammet: dokumentvalidering → sidemerket tekst → én analyseadapter → brukerkontroll → kodebasert finans/screening. Ingen agentrammeverk, score eller utvidet analyse. | Samsvar. De fire godkjente UX-trinnene er brukerflyt, ikke fire KI-analyser. |
| Finans i vanlig kode med kjente fasitsvar | AD-7 skiller validering, årsnormalisering, finans, eksakte terskler og visningsformat. L/P, L−D, NOI/P og NOI−J beholdes; desimalstrenger og big.js unngår flyttallsfeil. | Samsvar med låst oppfølging. Økonomisk likhet vurderes eksakt uten visningsavrunding. |
| Tre faste anbefalinger og menneskelig kontroll | AD-8 prioriterer mangler/uavklart alvorlig TG3 før økonomiske brudd og deretter Gå videre. Ingen KI-generert anbefaling eller automatisk investeringsbeslutning. | Samsvar. Listekontroll, TG3-avklaring og finansbekreftelse er separate. |
| Kilder, usikkerhet, dokumentlesbarhet og asynkrone feil | AD-2–AD-5 skiller originalt uttrekk, brukerutkast, bekreftet grunnlag og resultat. PDF-posisjon beholdes, original-PDF vises separat, uleselig tekstlag gir feil, og gamle/avbrutte svar kan ikke bli gjeldende. | Samsvar. Gyldig struktur/sidetall brukes ikke som bevis på korrekt eller komplett TG-uttrekk. |
| Egne tester for deterministisk logikk og separat KI-evaluering | AD-10 og «Verifikasjonsgrenser» peker til F1–F4 og PRD-eksempler for finans/regler, faktiske PDF-fixtures, kontrollerte adaptersvar, reducer og bygget E2E-app. Live-uttrekk vurderes mot fasit før brukerretting. | Samsvar. Demo, lokal flyt, live KI-kvalitet og live analysetid holdes atskilt. |
| Kjørbarhet for sensor uten egne nøkler eller betalte kontoer | AD-6 og AD-9: standard demo, rapport-/versjonsbundet lagret uttrekk, ingen live-fallback, lokale ressurser og én Express-server for bygget frontend og API. Planlagte kommandoer og ren lokal README-verifikasjon er eksplisitte. | Samsvar som arkitekturplan. Installering, bygg, kommandoer og S6 er ikke påstått gjennomført. |
| Kostnad, mock og gjenbruk | AD-5–AD-6 hindrer automatisk retry/duplikatkall og gjenbruker uendret uttrekk i aktiv økt. Demo/testadapter bruker samme grense uten nettverk. Leverandør, modell, pris og budsjett har navngitt avklaringspunkt før live-adapter/betalte tester i «Deferred». | Samsvar. Kostnadsvalg er synlig utsatt med konkret trigger; ingen kostnadsfri live-analyse påstås. |
| Enkel, forklart stakk og ryddig repo | Ett TypeScript/npm-miljø, én package.json/låsfil, Vite-starter, React reducer og vanlig CSS. Bibliotekene har avgrensede oppgaver. Structural Seed angir testfixtures/bevis; AD-9 holder private dokumenter og nøkler utenfor Git og statisk server. | Samsvar. Teknologigrunnlaget skiller dokumentert fit fra senere installasjons- og kompatibilitetsbevis. |
| Sporbar vei fra plan til implementering | Kildeliste, krav-ID-er i hver AD, «Capability → Architecture Map» og AD-10 binder senere kode/testbevis til krav, AD og PRD-eksempler. Beslutningsloggen dokumenterer Q-1–Q-7 og kildehierarkiet. | Samsvar. Epics/stories er ikke opprettet; arkitekturen gir grunnlag for senere autorisert arbeid. |

## Funn og avgrensning

Ingen severity-funn er identifisert innen denne kildeavstemmingen. Det kreves ingen endring av produktkrav, finansregler, scope eller godkjent UX for å oppfylle faglærerens relevante arkitekturføringer.

Gjenstående fixtures, faktisk README, installasjon, testbevis, live-evaluering og løpende commits er leveransearbeid. De er ikke mangler som gjør arkitekturplanen i strid med tilbakemeldingen; arkitekturen oppgir dem som senere arbeid og påstår ingen beståtte produktkriterier. Denne avstemmingen har ikke kjørt app eller tester, kontrollert nye nettutgivelser eller vurdert hele PRD-/UX-samsvaret på nytt. Spine og autoritative kilder er ikke endret.
