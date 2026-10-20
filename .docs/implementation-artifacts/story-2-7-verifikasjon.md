# Story 2.7 — egenverifikasjon og sporbarhet

Dato: 2026-10-20. Baseline:
`5d05698e501703c6e12d08d3b63c2f058b0873ce`.
Bare Story 2.7 fra godkjent epics.md er implementert. Dette er build-kontroll;
separat uavhengig BMAD-review gjenstår før done.

## AC og faktisk bevis

| AC / kravspor | Implementering og kjørte bevis |
|---|---|
| AC1 / FR-8/9, RT-5 | Bygget produksjonsdemo med ekte F4-original: valgt TG3 åpner fysisk PDF-side 4, mens tekstlaget og canvas inneholder originalens trykte side 2. Dokumentnavn og «PDF-side 4 av 4» vises. Forrige/Neste, Hel side og lokal zoom; ingen ekstra analyse. |
| AC2 / AD-3/9, NFR-3 | Låst pdfjs-dist 6.4.299 browser-build og samme pakkes worker bundlet lokalt. CMaps, standardfonter, wasm og ICC kopieres ved build og leveres lokalt i dev. Browserprøve sperrer eksterne URL-er, observerer lokal worker og ekte visning. Målt 44/56 og 24 px mellomrom. |
| AC3 / NFR-2 | Under 1200 CSS px finnes ingen standard stablet viewer. Åpne PDF gir native modal med kort funn, dokument/side, overskriftsfokus og eksplisitt Tab/Shift+Tab-felle. Esc og Tilbake gir åpnerfokus uten rulling; valgt funn, side, zoom og kontekst bevares. |
| AC4 / RT-7/8 | Kontrolladapter gir ukjent kilde og side 999; intet gjettes. Blokkert worker og kontrollert canvasfeil gir konkret lokal dokument-/sidestatus uten canvas/fullføringsendring. Kjent kilde med usikker grad og utelatt valgfri originalhash bruker eksisterende kontraktbinding, uten oppdiktet hashkrav. |
| AC5 / AD-2/10 | Tastaturvalg beholder funnfokus ved automatisk sideskift; PDF har semantiske knapper, valgtstatus, fokus og tastaturstyrt rulleregion. Korte navngitte statuser. 1440×900, 1280×800, 850×700 og 320×400 kontrolleres uten vannrett arbeidsflateoverflow. Eksisterende stepper-/sterk-zoom-prøver består. |

## Race, originalvern og cleanup

Parseren får `selected.bytes.slice()`; workerens overføring kan ikke detachere
øktens original. En ny frakoblet canvas og tekstlag bygges per renderforsøk.
Gammel side skjules ved endret forespørsel før ny side publiseres. Alle await-
grenser kontrollerer aktivt forsøk; cleanup avbryter render/tekstlag, fjerner
DOM og destroyer loading task/worker ved avsluttet visning.

Raceprøven holder faktisk requestAnimationFrame-render tilbake, skifter
funn 4→2→4→2, krever ingen gammel canvas under lasting og slipper deretter
forsinkelsen. Bare side 2 og dens originaltekst er tilgjengelig. Egen prøve
forlater visningen mens worker lastes; null workers etter retur og ny vellykket
visning fra samme original beviser cleanup og at originalbytes fortsatt virker.

Fem unitprøver dekker fysisk/trykt side, utenfor-grense-side, feil original,
ukjent/tekst/NaN/desimal, valgfri originalhash, generasjonsvern og bevart/nullstilt
visningskontekst. Ni nye E2E-prøver dekker faktisk bruk, feil og race.

## Funn og rettinger under build

- Første innlasting målte en skjult holder som 0 px. Mål synlig PDF-region;
  ResizeObserver og viewporthøyde oppdaterer Hel side ved størrelse/zoom.
- Hele PDF.js viewer-CSS lastet unødvendig redigerings-/viewerflate. Bare
  nødvendig, lisensmerket TextLayer-geometri brukes (12,6 kB samlet CSS).
- Et sentsvar fra getTextContent kunne lage tekstlag etter cleanup. Ny aktiv-
  kontroll før oppretting, og separat cancel på tekstlag.
- Kjent mismatchet dokumentkilde fikk for upresis ukjent-side-forklaring.
  Ren sourceTarget gir faktisk kjent kildeårsak og gjetter ingen navigasjon.
- PDF-rulling fikk eksplisitt tastaturfokus/region og synlig fokus.
- Første raske klikkprøve forsinket ikke faktisk render. Kontrollert rAF-
  sperre beviser at gammel canvas aldri presenteres som ny.
- Full regresjon reproduserte en reell AC3-feil: Tab fra siste rulleregion
  kunne nå nettleserfokus. Eksplisitt første/siste Tab- og Shift+Tab-felle
  retter dette; samme E2E krever fokus inne i panelet.
- Kontrakttracing fant at originalkildens hash er valgfri for usikre kandidater.
  Kjent dokument/side bruker den allerede validerte analysebindingen når hash
  er utelatt. Kun eksplisitt hashmismatch avvises. Unit og bygget-app-prøve
  beskytter denne eksisterende kontrakten.

Første regresjonslogg er bevart i [kontroller](story-2-7-kontroller.txt);
endelig ny fullkjøring etter rettinger står i
[sluttkontroller](story-2-7-sluttkontroller.txt). Ingen senere story ble brukt
som retting, og ingen produkt-/arkitekturavgjørelse var nødvendig.

## Visuell og praktisk kontroll

Skjermbildene viser original-PDF på 1440/1280 og behovspanelet på 850/320 CSS px.
Originalen er visuelt kontrollert mot F4-fasiten: alvorlig lekkasje, TG3,
trykt side 2 på filside 4. Paneltekst og handlinger ombrytes; todimensjonal
PDF-lesing holdes i egen rulleregion. Hel side tilpasses både høyde og bredde;
200 % gir lokal rulling uten å skjule dokument-/sidekontroller.

Tastaturforløp er prøvd i bygget Chromium med faktisk fokus: funnvalg,
sidekontroller, zoom, rulleregion, panelåpning, Tab/Shift+Tab, Esc og retur.
Dette er agentutført browser-/visuell QA, ikke en påstått ekstern brukertest.
Eksisterende DESIGN-tokenpar brukes: primærtekst 12,81:1, sekundærtekst
5,95:1, fokus petrol/hvit 6,70:1 og kontrollkant/hvit 3,81:1. Valgt flate
har fortsatt lesbar tekst/fokus. Ingen tilgjengelighetssertifisering påstås.

## Sluttresultat

505/505 Vitest i 19 filer, typecheck, lint, build og 66/66 bygget-app +
2/2 dev-E2E består etter rettingene. Vite har en informativ størrelsesmelding
for PDF.js-bundlen (ca. 806 kB); ingen funksjonell test feiler. Story 2.7 er
review, 2.8 backlog.

Visuelle bevis: [1440](story-2-7-original-1440.png),
[1280](story-2-7-original-1280.png), [smalt panel](story-2-7-panel-850.png)
og [sterk zoom/smal flate](story-2-7-panel-320.png). Ingen live-kjøring, KI-kvalitet eller S5-tid
bevises. Originalvisning bekrefter aldri et funn eller listen.

Prosess: [egen arbeidsøkt](../process/arbeidsokter/2026-10-20-story-2-7.md) og
[sekvensiell orkestratorlogg](../process/arbeidsokter/2026-10-20-mini-sprint-2-5-2-7.md).
