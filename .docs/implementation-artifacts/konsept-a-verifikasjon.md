# Konsept A: implementering og verifikasjon

Dato: 2026-10-30. Baseline: `06d8962a5fc5812b4b76c35e8a4798cd1d5f473e`.
Mads har godkjent konsept A og produktimplementering. Dette er den eksisterende
React-/Express-applikasjonen, med samme import- og kontrollpipeline.

[Spesifikasjon](spec-konsept-a-produkt.md) · [BMAD-review](konsept-a-review.md) ·
[Visuell referanse](../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/mockups/konsept-a.html) ·
[Arbeidsøkt](../process/arbeidsokter/2026-10-30-konsept-a-implementering.md).

## Levert opplevelse

En lys side med seriftypografi, stort originalbasert dokumentbilde, adresse/pris,
åpen rad med bruttoyield, nettoyield og kontantstrøm, finansiering til venstre og
graf til høyre. Mobilvisningen stabler innholdet. Detaljert økonomi-, dokument-
og TG-kontroll er tilgjengelig gjennom fordypning. Opplasting starter fortsatt
lokal analyse automatisk, og FINN-alternativet bruker den eksisterende porten.

Dashboardet starter tomt. Ingen eksempeladresse, standardrente, konstruert leie,
illustrasjonsfoto eller eksempeløkonomi er lagt inn som produktdata. Adresse
krever én unik kildekandidat; areal og byggeår er ukjent når kontrakten mangler
dem. Prisantydning skiller dokumentfakta fra dokumentets estimat. Egne leie-/
driftsforutsetninger krever et oppgitt positivt år og forblir ubekreftet.

Scenarioene bruker Big.js og eksisterende annuitetsmotor. Kontantbehov holdes
atskilt fra totalpris inklusive fellesgjeld; betaling av fellesgjeld inngår én
gang. Ukjent er ikke null, driftssubtotal er ikke full D, og relevante år må
samsvare. Scenarioet endrer verken finansbekreftelse, rapportkontroll,
TG3-avklaring eller revisjonsbundet screeningresultat.

Lånegrafen gjelder privat lån; akkumulert konstant kontantstrøm er ikke
avkastning inklusive egenkapital, skatt, verdiendring eller salg.
Rentefølsomhet bevarer valgt rentes nøyaktige desimaler. Grafpunkter finnes også
i tabell og kan utforskes med tastatur. Inputbundne workere avbrytes ved bytte,
og stopper etter 15/30 sekunder med synlig årsak.

Bildevisning bruker bare opplastet original: inntil tre sider, støttet raster
eller første originalside. Motivet erklæres ikke identifisert. Dedikert lokal
preview-worker stopper før rasteroverføring overskrider 24 bilder/8 millioner
samlede piksler, med 4 millioner per raster og 1 million i visningscanvas.
Inline-raster, cachekloning og native JPEG/VideoFrame er dekket. Sidecache,
worker og ventende kall ryddes. Dette er ikke en hard OS-minnegaranti mot
kortvarige native dekodingstopper. Originaldialogen frigjør PDF-worker ved lukking.

## Automatiske kontroller

Eksisterende lokal Node 24.21.0 ble brukt. Ingen pakker, nettlesere eller nye
avhengigheter ble installert. Standard Playwright forventer en browser som
mangler lokalt; verifikasjonen brukte den allerede installerte Chromium 1243
med midlertidig konfigurasjon. Konfigurasjonene med maskinspesifikke stier
inngår ikke i produktet eller committen.

| Kontroll | Resultat | Evidens |
| --- | --- | --- |
| `npm run build` inklusive `tsc -b` | Bestått | [Bygglogg](konsept-a-2026-10-30/build.txt) |
| `npm run lint` | Bestått, ingen advarsler | [Lint](konsept-a-2026-10-30/lint.txt) |
| `npm test` | 72 filer, 1587 tester bestått | [Unit/integrasjon](konsept-a-2026-10-30/unit-integration.txt) |
| Hele bygde E2E-suiten | 218 bestod i første runde; to konkrete feil nedenfor rettet og gjenkjørt | [Første komplette runde](konsept-a-2026-10-30/e2e-forste-bygg.txt) |
| Siste bygg: hovedflate, investering, FINN og salgsoppgave | Alle 38 bestått, inklusive begge tidligere feil | [Sluttkontroll](konsept-a-2026-10-30/e2e-sluttkontroll.txt) |
| FINN-klientens levetid og finansiering til oversikten | Bestått | [Målrettet bevis](konsept-a-2026-10-30/finn-klientlivslop.txt) |
| Alle komponenttester i Chromium | Alle 45 bestått | [Komponenter](konsept-a-2026-10-30/components.txt) |
| Dev-server/HMR og privat ressursgrense | Alle 3 bestått | [Dev](konsept-a-2026-10-30/dev.txt) |
| Originaldialogens worker-cleanup | Bestått | [Lukking](konsept-a-2026-10-30/kilde-cleanup.txt) |

Den første komplette bygde E2E-runden hadde to feil: Playwright avviser
bufferopplasting større enn 50 MiB før appen mottar filen, og kontrollheaderens
Offline-etikett hadde ekstra tekst. Storfiltesten bruker nå en faktisk browser-
File/change-hendelse, og etiketten er rettet. Begge består i sluttkontrollen;
ingen mislykkede kontroller er skjult som bestått.

Testene dekker blant annet eksakt finansfasit, uavhengig mellomliggende lånesaldo,
ukjente verdier/årskonflikter, uendret kontrollert resultat/TG3 ved scenarioendring,
mislykket filbytte før hashing, kilde-/hashkontroll, presis rente 5.04,
tastaturfaner/-inspektør, sene workersvar, unmount, workerfeil og fremtvunget
15/30 sekunders stopp. Faktiske flerbilde-PDF-er prøver kumulativt rasterbudsjett,
JPEG, riktig originalside og gjenåpning etter cleanup.


### Akseptmatrisens testbinding

| Matrise | Kjørte, beståtte kontroller |
| --- | --- |
| Tom økt | `app-shell`: PDF først, ukjente verdier og bevarte kontrollporter |
| Gyldig PDF | `prospectus-import`: faktisk offline import til alle tre anbefalinger og generell lokal PDF |
| Manglende/motstridende verdi | `scenario-basis`, `financial-scenario`, `investment-overview`: nuller, konflikter og år |
| Gyldig scenario | Uavhengig finansfasit og E2E med uendret kontrollert resultat/TG3 |
| Ugyldig scenario | Tom/negativ/rente101/løpetid utenfor grense, ingen foreldet kontantstrøm/graf |
| Endret objekt | Ny hash og mislykket for stor fil før hashing; gammel vurdering/tall skjules |
| Rapportkontroll | Eksisterende komplette `report-analysis`/`screening-result`-regresjoner og ny kildesnarvei/cleanup |

Vite viser fortsatt advarsel om stor PDF.js-bundle. Bygget har exit 0.
Ingen full WCAG-sertifisering eller ny representativ semantisk TG-benchmark
påstås; eksisterende åpne kvalitetsporter består.

## Visuell kontroll i nettleser

Hovedagenten inspiserte de gjengitte desktop-/mobilbildene mot konsept A.
Georgia, papirhvit bakgrunn `#f7f8f5`, grønn profil, bildehero, åpen KPI-rad,
finansiering/graf og fordypningsinnganger er beholdt. Siste finpuss fjernet
arvet knappemarg i header og ga grafinspektøren riktig grønn aksent.

[Desktop](konsept-a-2026-10-30/oversikt-desktop.png) ·
[Mobil](konsept-a-2026-10-30/oversikt-mobil.png) ·
[Originalkilde](konsept-a-2026-10-30/originalkilde.png) ·
[Tom økt](konsept-a-2026-10-30/tom-okt.png) ·
[Maskinlesbar kontroll](konsept-a-2026-10-30/visual-check.json).

Skjermbildene bruker en uttrykkelig syntetisk PDF, generert lokalt for visuell
verifikasjon. Den inneholder illustrasjonsfotoet fra den godkjente skissen med
opphavsmerking i selve testdokumentet. Appen trekker bildet og adressen fra denne
faktiske opplastingen; bildet eller tallene følger ikke med som produktstandard.
Økonomien i denne visuelle prøven har eksplisitt null fellesgjeld og er derfor
forskjellig fra skissens økonomieksempel. Testene kontrollerer også skissens
opprinnelige finansfasit separat.

Ingen horisontal rulling ved 320, 390, 768, 1024 eller 1440 px. Ingen JavaScript-feil
eller eksterne forespørsler i den visuelle kjøringen. Skjermbildene inneholder
ingen ekte kundedokumenter.

## Review og porter

Tre uavhengige BMAD-reviewere ga 16 funn. Alle er individuelt triagert og rettet;
intet er utsatt. Målrettet ny kontroll bekreftet begge verifikasjonsgap og de
fire edge-case-rettingene. Ingen tidligere sentrale saker lukkes av dette.

Backendens live-, FINN-, kostnads-, duplikat-, korrelasjons- og ressursporter
forblir uendret. Generell lokal PDF-analyse kan fortsatt gi ufullstendig grunnlag
som må avklares. Ingen betalte API-kall eller push ble utført. Endringen
leveres som lokal commit med aktiv promptlogg og design-/prosesshistorikk.
