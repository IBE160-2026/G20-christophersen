# Reviewer Gate — rubric walker

Dato: 2026-10-14. Uavhengig vurdering av arkitekturspinen på feature-nivå.

**Verdikt: Godkjent som arkitekturgrunnlag. Ingen konkrete kritiske, høye, middels eller lave funn er identifisert mot good-spine-sjekklisten.** Spinen binder de reelle modulgrensene i godkjent v1, holder senere gjennomføringsarbeid innenfor disse grensene og påstår ingen leverte produktresultater.

## Grunnlag og avgrensning

Gjennomgått [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), hele [beslutningsloggen](../.memlog.md), [Reviewer Gate-instruksjonen](../../../../../.agents/skills/bmad-architecture/references/reviewer-gate.md), prosjektets AGENTS.md og arkitekturskillens kriterium for hva som hører hjemme i en spine. PRD/UX/brief er kontrollert direkte der de avgjør eierskap, økonomi, tilstand, rapportanalyse, gjenbruk, screening og lokal levering. Den eksisterende [kursavstemmingen](reconcile-course.md) og [faglæreravstemmingen](reconcile-feedback.md) er brukt for vurderingshensyn og kildehierarki; denne rapporten gjentar ikke deres separate kontroll av original sensor-PDF.

Brukerens Q-1–Q-7 er behandlet som låste valg: React/TypeScript/Vite med liten Node/Express-backend, frontend som eier av vurderingen i minnet, ren finans-/regelkjerne, lokalt sidemerket tekstuttrekk, felles demo/live-adapter, desimalstrenger med desimalbibliotek og terskler uten divisjon, én bygget lokal server og ett ventende HTTP-forløp uten jobber/polling/retry. Rapporten endrer ikke disse valgene eller scope, finans, UX eller kildedokumenter.

Den deterministiske kontrollen ble kjørt mot den gjennomgåtte spinen med `python3 .agents/skills/bmad-architecture/scripts/lint_spine.py --workspace .docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14`: `ok: true`, null funn. Dette er dokumentkontroll. Ingen app-, installasjons- eller produkttester er kjørt.

## Good-spine-sjekklisten

| Kriterium | Vurdering og dokumentsted |
| --- | --- |
| Reelle divergenspunkter på nivået under er låst | AD-1–AD-10 samler eierskap/importretning, original/utkast/gjeldende data, kildeidentitet, terminal kontrakt, asynkron korrekthet, adaptergrense, tallpresisjon, screeningmyndighet, lokal levering og verifikasjon. Disse valgene hindrer at frontend, dokumentkomponent, analyseadapter, kontrakter og domenemoduler bygges med uforenlige antakelser. |
| Hver AD har håndhevbare Binds/Prevents/Rule | Alle ti beslutninger har de tre delene. Reglene beskriver konkrete avhengigheter, dataeierskap, gyldighetsbetingelser, svaridentitet, kallbegrensninger eller leveranse-/testgrenser. De kan undersøkes gjennom kode, kontrakter, overgangstester og lokal kjøring. |
| Reglene hindrer divergensen de navngir | Importreglene hindrer dobbel finans-/regelautoritet; revisjoner og bekreftelser hindrer stale grunnlag; sideidentitet og originalbytes hindrer kildebytte; felles kontrakt og terminalstatus hindrer feil som tomliste; adapteren hindrer separate demoregler; eksakte terskler hindrer visningsavrunding som regelinput. |
| Capability-dekning | Kravkartet på linje 189–204 fordeler UJ-1, FR-1–FR-18 og NFR-1–NFR-5. AD-10 og verifikasjonsgrensene knytter S1–S6 til riktige typer bevis. Kartet har modulansvar, ikke bare en liste over krav-ID-er. |
| Stille føringer er bevart | Null og blank holdes atskilt; kostnadsgrunnlag/år/kilder følger finansverdiene; kontroll/bekreftelse er noe annet enn beregnbarhet; brukerretting bevarer KI-opphav; TG3-avklaring er separat fra funnkontroll; tom fullført liste er noe annet enn feil; demo er tydelig merket og uten skjulte live-kall. Godkjent UX er eksplisitt bindende. |
| Deferred åpner ikke for uforenlige moduler | Valg av leverandør begrenses av sidemerket helt input, ett kall og AD-4. Timeout-/ressursvalg har backendansvar og frist før integrasjon. PDF-lesbarhetskontroll må være løst før uttrekket brukes som gyldig grunnlag. Detaljfelter har én kontraktautoritet. Senere valg kan detaljere, men ikke svekke AD-1–AD-10. |
| Teknologi er dokumentert aktuell og relevant | Startstakken har konkrete versjoner og primærkilder i teknologigrunnlaget. En egen nettstikkprøve bekreftet de oppgitte utgivelsene og starterverdiene, se nedenfor. Installasjon/kompatibilitet er korrekt avgrenset til senere verifikasjon. |
| Brownfield og arv | Det avgrensede filsøket fant ingen applikasjonskode eller package.json/låsfil utenfor verktøy-/BMAD-områdene. Spinen framstiller derfor stakken og treet som startfrø. De låste PRD-/UX-/brukerbeslutningene ratifiseres; ingen konkurrerende foreldrespine er oppgitt. |
| Ingen hel arkitekturdimensjon er taus | Lokal drift, miljø/config, providerstrategi, operasjonell livssyklus, data/state og kvalitetsgrenser har enten bindende regler eller navngitt avklaringspunkt. Det innføres ingen skyldimensjon, database eller driftstjeneste for å fylle et hypotetisk hull. |

## Semantisk kontroll av beslutningene

**AD-1 og AD-2:** Eierskap til vurderingen er entydig. Frontend har den aktive økten, mens backend utfører dokument-/KI-I/O og aldri returnerer en finansanbefaling. `contracts` er felles autoritet; `domain` har ikke rammeverk eller I/O. Utkast, brukt endring, opprinnelig uttrekk, separat TG3-avklaring og resultat er forskjellige tilstander. Bekreftelser følger faktisk grunnlag, og et historisk snapshot kan ikke bli gjeldende bare ved navigasjon. Arbeidstap ved lukking/oppdatering følger eksplisitt brukeraksept og er ingen skjult mangel.

**AD-3 og AD-4:** Uttrekket bevarer alle PDF-posisjoner og sender hele det støttede sidemerkede grunnlaget samlet. Original-PDF er en separat kilde i frontend. Uleselig/upålitelig dokumentbehandling kan ikke bli vellykket tomtekst. Runtime-skjema og typer har én eier, og ukjent kilde/side/grad blir synlig usikkerhet. Backendberegnet hash og kodestyrt metadata unngår at KI eller klientpåstand definerer rapportidentiteten. Strukturell kontroll beskrives korrekt som noe annet enn semantisk fullstendighet eller brukerens bekreftelse.

**AD-5 og AD-6:** Ett ventende POST-forløp binder dokumentsteg, adapter og terminalt svar uten jobbkontrakt. Frontend avviser svar for forlatt/erstattet analyse, også når abort ikke stopper backend. Duplikatsperren er eksplisitt prosesslokal metadata, settes før adapterkall og beholdes til serverstopp; ny requestId/generasjon gir ingen omvei. Dette er en at-most-once-grense innen samme økt/modus/rapport, ikke et løfte om gjenopptaking etter transportfeil. Demo/live deler dokumentbane, kontrakter og senere kontroll-/finans-/regelbane. Feil fixture gir feil, aldri betalt fallback. Finans-/funn-/TG3-endringer bruker tilgjengelig uttrekk og gjør ingen KI-kall.

**AD-7 og AD-8:** Den godkjente presisjonsstrategien er bindende. Kanoniske desimalstrenger bevarer input før aritmetikken, yieldformelgrunnlaget skilles fra presentasjon, og `100 * NOI >= P * Ymin` med gyldig positiv P er den samme låste prosentterskelen uten divideringsavrunding. Negative beregnede resultater beholdes; blank/null og delberegninger har selvstendige gyldighetsregler. Finansdefinisjonene og D/J-dobbelttelling følger kildene. Screening er ett deterministisk kodeutfall med alle utløsere på avgjørende prioritet. Bekreftet liste fjerner ikke dokument-/analysefeil eller behovet for separat TG3-avklaring.

**AD-9 og AD-10:** Sensorløpet er en bygget app fra én loopback-prosess med frontend og API på samme origin. Lokale worker-/font-/PDF-ressurser inngår i leveransen; demo trenger ingen nøkkel eller ekstern tjeneste. Live-konfigurasjon har backendautoritet, og serveren eksponerer verken reporot eller private dokumenter. Godkjent UX er bindende uten å bli omprosjektert. Rene tester, dokument-/adaptertester, bygget E2E, live-uttrekkskvalitet, tidsmåling og ren lokal kjørbarhet er atskilte bevisgrenser. Det er riktig at spinen definerer dem uten å påstå at de allerede er bestått.

## Dimensjonsdekning og Deferred

| Dimensjon | Bindende ramme / senere valg |
| --- | --- |
| Deployment og miljø | AD-9 og Structural Seed: lokalt bygget sensorløp, én Express-prosess, samme origin, én utviklingskommando; konkrete navn/adresse dokumenteres ved implementering. |
| Infrastruktur/provider | Ingen ekstern driftstjeneste/database/kø. Live-leverandør/modell/SDK/budsjett utsettes med trigger før adapter/betalte tester og må oppfylle den allerede låste kontrakten. |
| Operasjonell livssyklus | AD-5 bestemmer kall/fullføring/abort/duplikatlivstid. AD-9 bestemmer lokal start og ressursleveranse. Ressurstimeouts/bufferopprydding detaljeres før integrasjon, uten skjult ny produktgrense. |
| Data og tilstand | AD-2/AD-4/AD-6 og konvensjonene bestemmer økteierskap, original/utkast/revisjoner, rapporthash, findingId, versjoner og gyldighet. Private data blir ikke varig vurderingslagring. |
| Kvalitet og verifikasjon | AD-10 og egen tabell bestemmer uavhengig fasit, feil-/racegrenser, separat live-evaluering, tidsprotokoll og S6. Faktiske bevis er gjennomføringsarbeid. |
| Scope og UX | Produktkildene er bindende. Hosting/varig lagring/innlogging/samarbeid/OCR/utvidet analyse er eksplisitt utenfor v1, og gir ingen fri implementeringsvariant innen v1. |

Deferred inneholder dermed gjennomføringsvalg under eksisterende invariants. Det er ikke en åpen invitasjon til at to moduler velger ulike kontrakter, ulike grunnlag eller forskjellig fullføringssemantikk.

## Størrelse og teknologigrunnlag

Spinen har 228 linjer, 2 867 ord, ti AD-er og to diagrammer. Dette ligger i den detaljerte enden for et kort byggegrunnlag, men er rimelig for hele denne v1-en: finanspresisjon, brukerbekreftelser, rapportopphav og asynkron korrekthet har ulike divergenspunkter som ikke dekkes av et stakknavn alene. Den unngår full datamodell, API-feltinventar, epics/stories, leverandørrammeverk og driftsplattform. Begrunnelser og alternativhistorikk ligger i memloggen, og starttreet er uttrykkelig et frø som kode kan overta.

Nettkontrollen bekreftet Node 24.21.0 LTS og den oppgitte React/Vite-starteren med TypeScript 6.0.2, plugin-react 6.1.2 og Oxlint 1.87.0. [Node-utgivelse](https://nodejs.org/en/blog/release/v24.21.0), [React-utgivelse](https://github.com/react/react/releases/tag/v19.3.0), [Vite-utgivelse](https://github.com/vitejs/vite/releases/tag/v8.3.4), [offisiell react-ts-starter](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json).

Oppgitte Express/PDF.js/big.js/Zod/Vitest/Playwright-versjoner hadde de angitte primærkildene. Denne kontrollen bekrefter ikke et installert samlet avhengighetstre. [Express 5.3.0](https://github.com/expressjs/express/releases/tag/v5.3.0), [PDF.js 6.4.299](https://mozilla.github.io/pdf.js/getting_started/), [big.js 7.0.1](https://raw.githubusercontent.com/MikeMcl/big.js/main/package.json), [Zod 4.6.7](https://github.com/colinhacks/zod/releases/tag/v4.6.7), [Vitest 5.0.4](https://github.com/vitest-dev/vitest/releases/tag/v5.0.4), [Playwright 1.64.0](https://github.com/microsoft/playwright/releases/tag/v1.64.0).

## Funn og triage

Ingen severity-funn å autofikse, diskutere, utsette eller ignorere. Ingen hel dimensjon mangler og ingen identifisert AD svekker de låste brukervalgene. Spinen og kildene er ikke redigert av denne reviewen. Senere installasjon, typekontroll, fixtures, README og S2/S5/S6-resultater må fortsatt gjennomføres, slik spinen allerede krever; fraværet av disse produktresultatene er ikke et arkitekturfunn.
