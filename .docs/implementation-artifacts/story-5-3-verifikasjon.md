# Story 5.3 — Egen gjennomkjøring av README

Dato 2026-10-22. Baseline `0ddbeb7132d7790fdb5bf63bd2bca9bc0d6d82a4`. Produktkode, pakkeversjoner og låsfil er uendret fra denne baseline; README, bevis, spec og status er endret. Implementeringscommit identifiseres i overleveringen. Dette er egen gjennomkjøring som forberedelse til 5.4, **ingen annen-person-kontroll eller S6**. Status før separat review: in-review/review.

## Grunnlag og miljø

[Story 5.3 AC1–5](../planning-artifacts/epics.md#story-53-dokumentere-en-komplett-oppskrift-for-lokal-demo-og-tester), [Epic 5-kontekst](epic-5-context.md), [forrige done-spec](spec-5-2-manuell-ux-kontroll.md), SPEC, final UX, arkitektur og sprintplan/status ligger til grunn. Kursens bevarte kildeuttrekk om README/kjørbarhet (s.2/5–6) og faglærerens brief-feedback om nøkkelfri demo er kontrollert. README beholder lenker til originalveiledning, feedback og låst grunnlag. Ingen nye produktkrav, Epic4/R1-valg eller senere story.

macOS 26.6.2 arm64, faktisk manuell Google Chrome155.0.8059.85, automatisk Playwright1.64.0 med Chromium156.0.8078.4/revision1248. Node24.21.0/npm11.19.0 fra `/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin`. Kommandoer kjørt fra reporoten. Cacheforberedelse brukte `npm_config_cache=/private/tmp/ibe160-resume-npm-cache-20261019` og `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers`; disse er miljøplasseringer i agentmiljøet, ikke skjulte produktforutsetninger for leseren. Brukeren trenger vanlig Node/npm og Playwrights normale browserinstallasjon.

`npm ci` erstattet bare generert node_modules, aldri kilde/privat arbeid. Repoets låsfil er uendret. De tre autoriserte fremmede untrackedfilene ble ikke endret/staget. Ingen push.

## Faktiske kommandoer og miljøavvik

| Kommando fra README | Faktisk resultat / bevis |
|---|---|
| `node --version`, `npm --version` | v24.21.0 /11.19.0; terminalobservasjon og låste engines. |
| `npm ci` | Første nettbegrensede kjøring feilet ENOTFOUND registry.npmjs.org da cache manglet pdfjs-dist; [første logg](story-5-3-install.txt). Ny identisk kommando med autorisert registertilgang:130 pakker, audit131,0 vulnerabilities, exit0; [installasjonslogg](story-5-3-install-network.txt). Valgfritt fsevents-script gir varsel, ingen godkjenning/versjonsendring utført. |
| `npx playwright install chromium` | Første forsøk feilet ENOTFOUND cdn.playwright.dev; [første logg](story-5-3-browser.txt). Samme kommando med autorisert CDN-tilgang lastet full Chrome1248; exit0, [browserlogg](story-5-3-browser-network.txt). Headless-shell1248/ffmpeg var allerede forberedt i samme cache; ikke påstått helt tom browsercache. |
| `npm run build` | Typecheck/build exit0; [logg](story-5-3-build.txt). Vites eksisterende varsel om chunk over500kB er bevart. Ny build skjer også i faktisk E2E-kommando under nettsperre. |
| `npm run demo` | Faktisk startet på127.0.0.1:3000, manuelt betjent og automatisk prøvd. Ctrl+C stoppet mellom oppstarter og før testserver. Første manuelle del hadde for vid nettprofil, se nedenfor. F4 og automatisk støtte kjørte under korrekt negativt prøvd profil. |
| `npm run dev` | Startes/stoppes faktisk av den dokumenterte `npm run test:e2e` sin separate dev-konfigurasjon, på samme loopback-origin; dev-suite kontrollerer skall/HMR/private filer. Ikke en påstand om separat manuell dev-redigering. |
| `npm run typecheck`, `npm run lint` | Begge exit0 under nettsperre/env-i; [typecheck](story-5-3-typecheck.txt), [lint](story-5-3-lint.txt). |
| `npm test` |962/962,31 filer,80,04s, exit0 under nettsperre/env-i; [rålogg](story-5-3-vitest.txt). |
| `npm run test:components` |37/37,5,1s, exit0 under nettsperre/env-i; [rålogg](story-5-3-komponenter.txt). |
| `npm run test:e2e` | Typecheck/build,114/114 bygget-app (59,2s) og3/3 dev (1,9s), exit0 under nettsperre/env-i; [rålogg](story-5-3-e2e.txt). |

Vitest-loggen inneholder også PDF.js-varsler om manglende valgfri native canvas-binding/DOMMatrix/Path2D etter npm ci. Alle faktiske tekst-/HTTP-/PDF-integrasjonstester består; originalrendering er separat faktisk prøvd i Chromium og manuelt. Ingen serverbasert canvas-rendering påstås, og låsfilen ble ikke slettet slik avhengighetens generiske melding foreslår.

Installasjonsforsøkene viser hvorfor installasjons-/browsernett må skilles fra lokal kjøring. Ingen integritetskontroll, låsfil eller pakkeversjon ble omgått. Linux/systembiblioteker er bare dokumentert som plattformforberedelse, ikke påstått egenprøvd.

## Nøkkel- og nettgrense

Korrekt [bevart macOS-profil](story-5-3-nettprofil.sb) nekter `network*`, tillater bind/inbound bare på localhost og outbound bare **remote localhost**. Negativ TCP-probe mot1.1.1.1:443 ga **EPERM/exit0** før lokal sluttkjøring; [probe](story-5-3-offline-probe.txt). Første prøveprofil tillot `network*` når lokal ende var localhost, som også lot et eksternt TCP-kall slippe gjennom. Denne profilen ble forkastet etter faktisk negativ prøve; den beviser ingen offline-kjøring. Et mellomforsøk med numerisk IP i profilen ble avvist av macOS-syntaks; endelig profil bruker `localhost`.

Server, automatisk oppskriftsprøve og alle slutt-tester kjørte gjennom:

```sh
export PATH="/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH"
/usr/bin/sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb \
  /usr/bin/env -i PATH="$PATH" \
  PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers npm test
```

`npm test` ble erstattet med de faktiske kommandoene i tabellen, sekvensielt. `env -i` fjernet hele det arvede nøkkel-/tjenestemiljøet, uten å lese/skrive ekte nøkler. Demo leser ingen nødvendig miljøfil og oppretter ingen live-klient. Profilen arves av Node-, server- og Chromium-underprosesser. Dette er testmiljøtiltak, ikke ny produktkonfigurasjon eller R1-beslutning.

Den manuelt betjente, allerede åpne native Chrome-prosessen arvet ikke profilsperren. Manuell F1/null/retur startet dessuten før første profil var forkastet; disse radene er faktisk UI-bevis, **ikke bevis på global nettisolasjon i Chrome**. Manuell F4 brukte serveren med korrekt profil. Den separate automatiske støtteprøven kjørte både hele Chromium under korrekt profil og en browser-route som aborterer alt utenfor127.0.0.1:3000. Den observerte0 eksterne forespørsler og brukte ekte standarddemo/rapportbytes. Sammen med negative probe og slutt-E2E gir dette faktisk nøkkel-/nettfri funksjonskontroll etter forberedelse, uten å tilskrive native Chrome en sperre den ikke hadde.

## Faktisk egen UI-gjennomkjøring

Manuell her betyr at implementeringsagenten betjente faktisk bygget app i native Chrome gjennom CUA, leste tilgjengelighetstre/originaltekst og observerte respons. Dette er egen agentkontroll, ingen annen person. Ikke alle operasjoner ble utført utelukkende med tastatur, og denne storyen gjentar ikke hele5.2s visuelle kontroll. CUA popupvalg utenfor synlig flate hadde først ingen virkning; synlig navigasjon og faktisk valgt verdi ble kontrollert før bekreftelse. Ett utilsiktet J-feltinnhold `0F` fra verktøyets tasteovergang ga korrekt lokal tallfeil og ble rettet til nøyaktig0 før nullprøven; ingen produktfiks.

| Prøve | Faktisk handling og observert utfall | Spor |
|---|---|---|
| M1 /F1 | Alle fem README-verdier, År2026, egne eksplisitte kilder/forventet leie og **alle seks navngitte kostnadsposter** registrert. D400000/J800000 vises uten dobbelttelling. Manglende J-opphav etter første mislykkede popupvalg ga konkret lokal kildefeil; etter synlig retting ble alle fem bekreftet. | AC1/3, UX-DR5–9 |
| M2 /F1 | Ekte F1 valgt i native filvelger; ingen analyse ved valg. Start→mottatt→kontroll, faktisk PDF2 med tekst «Slitt overflate», enkeltfunnbekreftelse og deretter separat liste. Gå videre med11,875%/1500000/9,375%/700000 og neste befaring. | AC3, UX-DR10/17/19/20/21 |
| M3 /blank | Retur til Tallgrunnlag bevarte alle bekreftelser. Slettet L ga lokal «L: Verdien mangler», Innhent mer informasjon, sperrede rapporttrinn og utdatert historisk resultat. Dette er F3s finansmangel på tidligere F1-økt, ikke påstand om manuell ny F3-PDF. | AC3, UX-DR26/32/38 |
| M4 /null | L rettet, J0, sjette gjeldspost fjernet; fem driftsposter beholdt. Synlig «J:0 må bekreftes». Egen nullkontroll valgt, deretter samlet bekreftelse: J0 eksplisitt bekreftet og rapporttrinn tilgjengelig. | AC3, blank≠null/0 |
| M5 /retur | J800000 og gjeldspost gjenopprettet; L1400000 med endret kilde. Bekreftet endring og åpnet Resultat: Forkast,8,750%/1000000/6,250%/200000 på bevart F1-rapport. Dette er uttrykkelig endret F1-finansvariant, ikke manuelt F2-rapportbevis. | AC3, UX-DR26/38/39 |
| M6 /F4 | L1900000/kilde kontrollert på nytt; ekte F4 valgt og startet under korrekt profil. TG2 original2 bekreftet; TG3 original4 med faktisk trykt2 lest og bekreftet. Separat status Uavklart, deretter listebekreftelse og Vis resultat: Innhent mer informasjon, alvorlig TG3 synlig og alle fire F1-tall merket Delgrunnlag. | AC3/4, UX-DR18/19/20/21 |

## Automatisk støtte fra den faktiske oppskriften

[Kjørbar støtteprøve](story-5-3-oppskrift-kontroll.mjs) følger faktiske UI-handlinger gjennom Playwright mot separat startet **standard** `npm run demo`. Den kontrollerer atferd/resultater og ekte PDF-tekst, ingen README-tekst. Kjørt med riktig nettprofil/env-i og browser-route-sperre; [endelig logg](story-5-3-oppskrift-kontroll.txt), exit0. Ingen kontrolladapter i denne støtteprøven.

- F1/F2/F4 starter hver i ny blank sideøkt og registrerer alle seks README-kostnadsposter, alle kilder/perioder/år og faktisk matchende original-PDF. Originaltekst/funn, enkeltbekreftelser, separat Uavklart for TG3, liste og alle fire eksakte fasittall/tre anbefalinger består.
- F1 uendret retur bevarer bekreftelse. Endret L gir historisk Gå videre før ny kontroll; ny bekreftelse/beregning gir Forkast. Ingen uendret rapportanalyse kreves på nytt.
- F3 med blank L gir lokal mangel og ingen hovedstart. Deretter prøves en uttrykkelig rettet F3-variant med L1900000 og J0/fem driftsposter: egen nullkontroll kreves før bekreftelse. Det er ikke opprinnelig F3-fasit.
- invalid-format gir faktisk status Analysefeil/invalid-format **og separat Dokumentfeil-forklaring**. Ny ekte F3-rapport analyseres/kontrolleres og gir Gå videre på den uttrykkelig rettede varianten. Ingen falsk fullført tomliste.
- To feil i **støtteharnessens** første forventninger ble rettet: første brukte hele funnradens kontrolltekst til å skille TG2/TG3 (teksten nevner begge), andre lette etter Dokumentfeil i statusregionen i stedet for separat forklaring. [Første](story-5-3-oppskrift-forste.txt) og [andre](story-5-3-oppskrift-andre.txt) feilkjøringer er beholdt. Endelig kontroll bruker funnknappens TG og sjekker både statuskode og forklaring; ingen produkt-/fasitendring eller økt timeout.

Full E2E gir i tillegg faktisk automatisert korrigerings-/Avbryt-/Bruk-/Avvis-/liste-/returprøve, korrekt smalt PDF-panel/Esc og dokument-/analysefeil ved eksisterende kontrollerte adaptergrenser. Dette er **automatisk støtte**, ikke nye manuelle observasjoner. Tidligere faktisk manuell korrigerings-/panelflyt finnes i [5.2-bevis](story-5-2-manuell-kontroll.md); den tilskrives ikke denne5.3-runden. Testene har ingen betalt KI-tjeneste.

## AC-checkpoint og begrensninger

AC1 er prøvd gjennom faktisk install/build/loopback-demo og dokumenterte dev-tester. AC2 er prøvd gjennom faktisk browserforberedelse og hele testoppskriften. AC3 dekkes av M1–M6, uavhengig fasit, egen standarddemo-støtte og full E2E. AC4 beskriver standard nøkkelfri demo, installasjonsnett og faktisk uferdig påkrevd live; ingen ferdig v1-/live-/S5-påstand. AC5 dekkes av lenker, kilde-/prosesspor og faktisk egenkjøring. Ingen ny enhetstest som sjekker README-tekst.

Lokale lenker åpnes og valideres i [lenkekontroll](story-5-3-lenker.txt), inklusive faktisk Story5.3-anker. Ekstern eksisterende starterreferanse er ikke nettverifisert i denne runden. Denne dokumentasjonsoppgaven er ingen samlet repo-/historikksikkerhetsaudit (5.5). Ingen ekte hemmeligheter/private originaler inngår i nye eksempler/bevis. Linux, rent nytt OS, annen person/S6 og live er ikke verifisert. Ingen produktfeil ble avdekket; installasjonsnett og støtteharnessens rettinger er konkrete og synlige. Separat BMAD-review avgjør done.

Staged implementeringsdiff mot full baseline er lest inklusive nye bevis og rålogger. Alle oppgaver/AC er sjekket mot faktisk diff; `git diff --cached --check` bestått. Terminalbevis er bare normalisert for trailing whitespace/tomme sluttlinjer, uten å endre utfall/feiltekst.
