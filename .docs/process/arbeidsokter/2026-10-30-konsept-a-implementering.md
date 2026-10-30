# Konsept A implementeres i PAA

## Autorisasjon og utgangspunkt

Mads valgte og godkjente konsept A og ba uttrykkelig om fungerende produktimplementering, subagenter, visuell nettleserkontroll, nødvendige tester, BMAD-review og lokal commit med promptlogg. Ingen betalte API-kall eller push. Baseline: `06d8962a5fc5812b4b76c35e8a4798cd1d5f473e`.

[Spesifikasjon](../../implementation-artifacts/spec-konsept-a-produkt.md). [Visuell referanse](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/mockups/konsept-a.html). Autorisasjonen gjelder eksisterende ukommitterte designfiler og tilhørende sesjonsevidens; ingen ukjente produktendringer fantes ved start. Aktiv promptlogg er samme sesjon som designarbeidet og føres automatisk uten omskriving.

## Arbeidsdeling og beslutninger

BMAD-build ble rendret én gang med prosjektets renderer. Planen er én sammenhengende produktendring, ikke en ny prototype. Brukerens eksplisitte implementeringsgodkjenning erstatter ekstra spekgodkjenning; ønsket parallellarbeid erstatter generisk sekvensiell dispatch. Reversible kontroller og lokal commit er allerede autorisert.

Tre parallelle subagenter undersøkte først uavhengig, deretter implementerte de avgrensede filer: design_direction eide konsept-A-CSS; ui_audit eide separat Big.js-scenario/selektor, graf og lokale workere; technical_preservation eide kildebundet bildevisning fra PDF og egne tester. Hovedagent eide integrasjon, kontrollnavigasjon, faktiske metadata, egne forutsetninger og regresjoner.

Den eksisterende import-/analyse-/kontrollpipelinen, finansmotoren og sikkerhetsportene beholdes. Scenarioberegninger bekrefter ingen tall og endrer ingen screening. Manglende drift er ikke kjent delsum, pris inkl. fellesgjeld er ikke kontantbehov, ukjent er ikke null, og årsgrunnlag må samsvare.

Ingen dokumentert bildekontrakt finnes. Avgrenset lokal PDF.js-visning finner et støttet stort raster på inntil tre sider eller viser første originalside. Motivet erklæres ikke identifisert; fil/side bevares. Ingen illustrasjonsfoto går inn i produktet. Adresse velges bare ved én unik kildekandidat; areal/byggeår er tydelig ukjent.

## Foreløpige kontroller

Node24.21.0 fra eksisterende lokal runtime. Ingen pakker eller nettlesere installeres. Første typecheck/lint/build passerte etter integrasjon. Vite ga kjent advarsel om stor PDF.js-bundle; ingen byggefeil.

Første `npm test` innen sandbox: 1524 bestod,50 feilet,4 miljøfeil. De fleste feil var forbudt lokal server/prosess (`listen/spawn EPERM`); en ny sensitivitetsprøve avdekket faktisk treg eksakt potensregning. Finansmotorens numerikk ble bevart, og scenario/grafer flyttet til bundne, kansellerbare lokale workere. Testen kjøres på nytt med nødvendig lokal prosessadgang før konklusjon.

Innebygd nettleservert var utilgjengelig. Visuell kontroll gjennomføres i installert lokal Chromium via Playwright. Første fullstendige nettleserrunde gikk mot lokal dev-server og avdekket forventede navigasjons-/reloadoppdateringer og kortskjerm/fokusjusteringer. En samtidig komponentprøve slettet testspor; påfølgende nettleserrunder kjøres sekvensielt med separate outputmapper.

## Sluttresultat og verifikasjon

Konsept A er implementert i applikasjonen, med faktiske dokument-/brukerdata, tydelige ukjente verdier, interaktiv finansiering/grafer og bevarte kontrollflater. Tre uavhengige BMAD-reviewere ga 16 individuelt triagerte funn. Alle er rettet; ingen nye saker er utsatt. Tidligere sentrale kvalitetsporter står fortsatt åpne etter eksisterende regler.

Endelig `npm test`: 72 filer/1587 tester bestått. `npm run build`/typecheck og lint bestått. Første komplette bygde E2E-runde: 218 bestått/to feil; testharnessens 50 MiB-buffergrense og Offline-headertekst ble rettet. Siste relevante E2E-runde: 38/38, med begge rettinger og alle tre anbefalinger. Komponenttester: 45/45, dev: 3/3. Ekstra FINN-klient-/finansieringstest og lukking av original-PDF: begge bestått. Sene workersvar, unmount og 15/30 sekunders frister ble fremtvunget i faktiske Chromium-komponenttester.

Bildereview avdekket at per-rastergrense ikke var nok. Ny lokal worker håndhever 24 raster/8Mp samlet før overføring, inkludert inline-bilder og cachekopiering, med korrekt avslutning av PDF.js-strømmer. Faktisk flerbilde-PDF, native JPEG/VideoFrame, originalsidefallback og ny fil etter stopp består. Ingen hard OS-minnegaranti påstås.

Visuell kontroll er gjennomført i bygget app ved 320/390/768/1024/1440 px, uten vannrett rulling, JavaScript-feil eller eksterne forespørsler. Skjermbilder bruker et tydelig syntetisk dokument med opprinnelig illustrasjonsfoto innebygd i test-PDF-en. Ingen testfoto/-verdier er produktstandard. Siste visuelle finpuss gjelder headerens knappemarg og grafkontrollens grønnfarge. Lukking av kildevisningen frigjør originalens worker.

[Samlet verifikasjon og skjermbilder](../../implementation-artifacts/konsept-a-verifikasjon.md) og [reviewtriage](../../implementation-artifacts/konsept-a-review.md) er varig evidens. Midlertidige maskinspesifikke Playwright-konfigurasjoner fjernes før lokal commit. En eldre skjermbildefil som regresjonstesten overskrev ble tilbakeført; testen lagrer nå sitt nye bilde i eget outputområde.

Ingen betalte API-kall, nye avhengigheter, agentmoduler, backendgateendringer eller push. Lokal commit inkluderer aktiv automatisk promptlogg og tidligere designhistorikk. Den bygde appen kjører lokalt på http://127.0.0.1:3000 med demo/offline-import og FINN-port stengt.
