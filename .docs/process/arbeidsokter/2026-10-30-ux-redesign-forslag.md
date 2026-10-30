# UX-redesign: forslag før godkjenning

Dato: 2026-10-30. Utgangspunkt: `06d8962a5fc5812b4b76c35e8a4798cd1d5f473e`.

## Bestilling og rammer

Mads bestilte full UX-redesign med tre parallelle subagenter: eksisterende
UI/arbeidsflyt, moderne designretning og teknisk bevaring. Salgsoppgave er
hovedinngang; minimal inntasting, tydelig økonomi, justerbar finansiering og
synlige mangler/kilder prioriteres. FINN-felt og eksisterende sperre beholdes.
Ingen implementering før designgodkjenning; ingen betalte API-kall, nye
agentmoduler eller push. [Original bestilling](../prompts/session-01a18c6d-0a58-7063-ac77-b64541b4ec72.jsonl).

AGENTS.md og checkpoint er kontrollert. Eneste opprinnelig uregistrerte fil
var den aktive sesjonens promptlogg; første post samsvarer med bestillingen.
Tidligere logger og sentral deferred-work er ikke endret.

## Arbeid og beslutningsgrunnlag

Brukte bmad-ux til å strukturere et utkast, med dokumenter som uttrykkelig
avventer godkjenning. Brukerens konkrete oppdrag overstyrer skillens generiske
interaktive visjonskartlegging. Ingen ekstra reviewer-agenter eller
finaliseringspåstand; designgodkjenning er brukerens uttrykkelige stoppunkt.

- Agent 1, `/root/ui_audit`: kode-/dokumentbasert audit av hele kjerneflyten,
  doble økonomilag, navigasjonssperrer, terminologi, kilder og kontroll.
- Agent 2, `/root/design_direction`: ny skjermstruktur, visuell retning,
  mikrocopy og tilstander; destillerte senere hovedagentens syntese til
  DESIGN.md/EXPERIENCE.md. Samme agent, ingen fjerde subagent.
- Agent 3, `/root/technical_preservation`: eksisterende kontrakter,
  deterministisk finans, revisjonsbinding, menneskelig kontroll, FINN/live
  og grensen mellom separat økonomiprøve og ordinær UI-import.

Hovedagenten samlet funnene i
[designforslag.md](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/designforslag.md)
med kildebelegg, endringsvalg, tekniske forutsetninger og senere kontrollplan.
[DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/DESIGN.md) og
[EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/EXPERIENCE.md)
er peer-utkast. Tidligere godkjente kontrakter bevares frem til vedtak.

Leste kurs-PDF-en lokalt med eksisterende PDF.js, faglærertilbakemeldingen,
README, PRD, tidligere UX, arkitektur, godkjent salgsoppgaveendring,
code-first-design og checkpointets live-resultat-4. Kurset brukes for
sporbarhet, realistisk omfang og UX/tilgjengelighet; konkrete layoutvalg
er designanbefalinger, ikke nye kurskrav.

## Syntese og viktige grenser

Én opplasting → én eiendomsarbeidsflate med Oversikt, Økonomi, Rapport og
Kilder og mangler. Åpne seksjoner erstatter låst navigasjon. Kildekontroll,
fullstendig drift, økonomibekreftelse, rapport/listekontroll og TG3-avklaring
beholdes. Samordnet økonomibekreftelse og automatisk kodevurdering i oversikt
krever senere tilstandsarbeid og avstemming av gammel sekvens i FR-4.

Eksisterende financingSuggestion gir umiddelbart låne-/betalingsforslag;
ubekreftet yield/kontantstrøm foreslås ikke. Bare gyldig bekreftet delgrunnlag
gir nøkkeltall. Endringer gjør tidligere anbefaling historisk. Nye agent-,
beregnings- eller lånemoduler foreslås ikke.

Checkpointets samlede 11/11 gjelder separat avgrenset økonomiprøve, modell
alene 10/11. Kode bevarte utelatte originalopplysninger. Svake fortolkninger
forblir ubekreftede, full TG-kvalitet er uavklart og PAA-SO2 holdes åpen.
Ordinær opplastings-live og FINN åpnes ikke. Kvartal/termin/mva fra prøve-
kontrakten kobles ikke automatisk til dagens måned/år-finansgrunnlag.

## Kontroller utført i denne økten

- Statiske, nettverksfrie HTML-skisser med kun fiktive opplysninger:
  start, oversikt med manglende rapportgrunnlag og alternativ rapportkontroll
  med fullført lagret demouttrekk. Ingen produktimplementering eller ekte PDF.
- Finansieringstall i skissen ble beregnet med eksisterende
  `src/domain/financing.ts`: kontantbehov 3 075 000, egenkapital 1 000 000,
  rente 5,5 %, 300 måneder og fellesgjeldsbetaling 12 000/år ga lån 2 075 000,
  privat betaling 12 742,32/måned og samlet J 164 907,84/år. Med fiktiv
  P=3 200 000, L=400 000, D=60 000 blir NOI 340 000, nettoyield 10,625 %
  og kontantstrøm 175 092,16/år. Dette er illustrasjon, ingen nye standardverdier.
- HTML rendret lokalt med installert headless Chromium. Standard forventet
  Playwright-browser manglet; eksisterende cacheversjon ble brukt. macOS
  sandbox blokkerte første start; godkjent verktøyeskalering tillot bare det
  lokale renderingsskriptet. HTTP/HTTPS var blokkert i nettleserkonteksten.
- Skjermbilder i `/private/tmp/paa-ux-*.png` brukes til visuell kontroll.
  Ingen horisontal dokumentoverflow ved 1500 px og 390 px. Dette er mockup-QA,
  ikke full verifikasjon av det foreslåtte responsive appdesignet.
- Produktets testpakke er ikke kjørt fordi produktkoden er uendret.
  Fremtidig regresjons-/tilgjengelighetskontroll står i forslaget.

Kun nye plan-/prosessartefakter og automatisk promptlogg hører til denne
økten. Ingen betalte kall, eksterne analyser, kodeendringer, commit eller push.
Forslaget avventer Mads' godkjenning.

## Revisjon 2: investeringsverktøy før dokumentkontroll

Mads ba deretter om mer investeringsfokus, samme farger/minimalisme,
eiendomsbilde/adresse/pris øverst, tre hovedmål, interaktiv finansiering,
enkel risiko og TG/kilder i fordypning. Dette er videreutvikling av forslaget,
ikke implementeringstillatelse. De samme tre subagentene vurderte UX,
visuell komposisjon og tekniske grenser parallelt. Agent 2 oppdaterte
DESIGN/EXPERIENCE fra hovedagentens samlede valg; ingen ekstra agent ble startet.

Første utkast er bevart under
[.working/revisjon-1](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/revisjon-1).
Arkivene er øyeblikksbilder med opprinnelig lenkekontekst. Aktive dokumenter
og HTML er revisjon 2 og avventer fortsatt godkjenning.

Revisjon 2 erstatter den tidligere avgrensningen «bare lån/betaling kan
forhåndsvises» med et separat økonomisk scenario inklusive kontantstrøm.
Scenarioet bekrefter ingen opplysninger og endrer ikke kontrollert vurdering.
Brutto-/nettoyield følger pris/leie/drift og reagerer ikke på finansiering.
Fremtidig produktstøtte trenger egen scenariokontrakt og presis aritmetisk
gjenbruk, uten midlertidig `confirmed:true` eller omgåelse av FR-13/FR-16.

Hovedsiden viser lokal fiktiv illustrasjon, Eksempelveien 14 og fiktive
eiendomsfelter. Dagens import støtter ikke eiendomsfoto, areal, boligtype
eller rom som dedikerte kildebundne felt; senere lokal kontrakt-/parser-
utvidelse må avklares. Ingen foto eller verdi hevdes å komme fra ekte PDF.
Adresse/pris/eierform har eksisterende importgrunnlag. Ingen ny AI-modul.

HTML-en har lokal navigasjon mellom Start, Investering, Eiendom og risiko
og Dokumentasjon. Interaktiv finansiering, validering, reset og kilde-
dialog er kun prototypelogikk. Filvelgeren viser bare filnavnet; bytes
leses ikke. FINN-feltet beholdes sperret. CSP blokkerer nettverk, skjema-
sending og eksterne ressurser. Ingen vedvarende lagring.

### Faktisk prototypekontroll

Den nye fiktive leien er 252 000/år og drift 48 000/år, hvor 36 000 merkes
som dokumentverdi og 12 000 som egen forutsetning. Øvrige pris-/lånetall er
som før. Basis gir bruttoyield 7,875 %, nettoyield 6,375 %, NOI 204 000 og
kontantstrøm 39 092,16/år. Kravet 6 % er en tydelig fiktiv egen forutsetning.
Scenarioene er sammenlignet med eksisterende `financingSuggestion`.

**25 prototypekontroller bestod**, dokumentert i
[kontrollkvitteringen](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/prototype-check-result.json)
og [lokalt kontrollskript](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/check-prototype.mjs):

- Sju scenarier mot eksisterende finansfunksjon: basis, mer egenkapital,
  høyere rente, kortere tid, 0 % rente, fullt privat kontantbehov dekket
  og negativ kontantstrøm. Lånebetaling/årlig J/kontantstrøm stemte i skissen.
- Uendret yield og vurderingens informasjonsbehov under finansjustering;
  synkronisering slider/tallfelt; seks ugyldige/tomme inputtilfeller.
- Manglende leie, ukjent fellesgjeldsbetaling og manglende eiendomsdata.
- Scenariohandlingen utfører ingen bekreftelse; kildedialogens fokus,
  Esc og retur; filvalg viser bare filnavn.
- Alle fire visninger ved 320, 390, 768, 1024 og 1440 CSS px uten
  horisontal dokumentoverflow. Lokale skjermbilder ble visuelt kontrollert.
- Ingen JavaScript-sidefeil og ingen HTTP-/HTTPS-forespørsler observert.

Første QA-forsøk stoppet fordi skriptet valgte en skjult navigasjonsknapp
etter Start. Testselektoren ble rettet til synlig knapp, og alle sjekkene
bestod. En etterfølgende layoutretting holdt kildeknapper på egen linje
og beløp samlet; kontrollene ble kjørt igjen med samme beståtte resultat.
Dette er mockup-QA, ikke produktets testpakke eller dokumentanalysebevis.

Kontrollskriptet kjøres fra reporoten med Node og installert Playwright:

```sh
node .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/check-prototype.mjs
```

Valgfri `PAA_UX_CHROMIUM_PATH` velger en allerede installert Chromium;
i økten ble eksisterende headless-cache brukt. macOS krevde samme godkjente
verktøyeskalering for lokal rendering som i revisjon 1. Skjermbilder ligger
i `/private/tmp/paa-r2-*.png`. Skriptet skriver kun lokal kontrollkvittering
og bilder; HTTP/HTTPS er sperret.

Alle 17 fargetokens er identiske med revisjon 1. Aktive dokumentlenker
er kontrollert. Git viser ingen endring i sporede produktfiler. Kun tidligere
kjente plan-/prosessartefakter og aktiv automatisk promptlogg er berørt.
Ingen betalte API-kall, commit eller push. Avventer designgodkjenning.

## Revisjon 3: to selvstendige visuelle retninger

Mads ønsket et tydeligere premiumuttrykk og to sammenlignbare konsepter før
valg: lys eiendomsplattform og kontraststerk investeringsflate. Dette
overstyrer revisjon 2 sin begrensning om uendret palett, systemfont og
kompakt bilde. Ingen produktimplementering, betalte API-kall eller push
ble autorisert. «Fortsett der du slapp» videreførte samme arbeid.

Inspirasjonsbildene nevnt i bestillingen var ikke synlige i mottatt
melding. Bruker ble orientert og invitert til å legge dem ved på nytt;
arbeidet fortsatte fra den konkrete beskrivelsen av A og B. Ingen
påstand om å ha analysert utilgjengelige vedlegg er gjort.

De samme tre agentene arbeidet parallelt, med klart atskilte oppgaver:

- `/root/design_direction`: utviklet og skrev bare `konsept-a.html`.
  Lys redaksjonell komposisjon, stort bilde, Georgia, uboksede økonomitall,
  finansiering til venstre og bred graf til høyre.
- `/root/ui_audit`: utviklet og skrev bare `konsept-b.html`. Mørk
  investeringsflate, presise datakolonner, graf og finansiering samlet,
  kompakt risiko/vurdering før økonomien.
- `/root/technical_preservation`: kontrollerte beregningssemantikk,
  grafetiketter, kontrollgrenser og lokale fasittall. Ingen filer endret.

Hovedagenten laget felles lokal scenariofil, valgte og lastet ned ett
interiørbilde fra gratis Unsplash-kilde, samlet forslag/spines og utførte
nettleserkontroll og visuell polering. Bildet av Spacejoy er tydelig
illustrasjon, ikke en faktisk eksempeladresse. Samme fil og samme
økonomiske grunnlag brukes i A/B; opphav er dokumentert i
[BILDEKILDE.md](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/mockups/assets/BILDEKILDE.md).
Nedlastingen var vanlig gratis filhenting uten nøkkel eller betalt API.
Sandbox-DNS krevde godkjent verktøyeskalering for denne filhentingen.

Revisjon 2 er bevart under `.working/revisjon-2/` før endring.
Tidligere `mockups/designforslag.html` er nå en sammenligningsside med
faktiske lokale forhåndsvisninger og lenker til begge nye HTML-prototyper.
DESIGN, EXPERIENCE og samlet forslag er merket revisjon 3,
`proposal-awaiting-selection`, uten implementeringsautorisasjon.

### Beregnings- og kontrollbevaring

Samme eksempel som revisjon 2: prisgrunnlag 3,2 mill., kontantbehov
3,075 mill., leie 252 000, drift 48 000 (36 000 fra fiktivt dokument,
12 000 egen forutsetning) og fellesgjeldsbetaling 12 000/år.
Finansiering gir basis CF 39 092,16/år; brutto/nettoyield er uendret
7,875/6,375 % når finansiering justeres.

En delt Number-basert prototypefil beregner begge visningene. Produktets
Big.js, bekreftelser, revisjoner og kontrollporter er ikke endret.
Grafer viser konstant akkumulering av dagens årlige CF, privat restgjeld
og rentefølsomhet, med tabellalternativ. Ingen graf kalles totalavkastning,
prognose eller tilbakebetalingstid. Initial egenkapital, salg, skatt og
verdiendring er utelatt og forklart. Presis betalingsplan/sluttermin og
ny separat scenariokontrakt må spesifiseres før senere implementering.

Uavklart TG3, ufullstendig rapport og ubekreftede økonomiforutsetninger
beholder «Innhent mer informasjon» under alle finansieringsvalg. Rapport-
funn, kilder og opphav er tilgjengelige i dialoger. Ingen automatisk
bekreftelse eller ny risikoscore. Filvelger viser bare filnavn, FINN er
redigerbar men Hent er sperret, og CSP blokkerer tilkoblinger.

### Faktisk prototypekontroll

**59 lokale kontroller bestod**, se
[kontrollskript](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/check-concepts.mjs)
og [kvittering](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/concept-check-result.json).

- Ti finansieringsscenarier per konsept mot eksisterende
  `src/domain/financing.ts`: basis, mer egenkapital, renteøkning,
  kortere tid, 0 % rente, fullt egenkapitalfinansiert privat kontantbehov,
  negativ CF, 1/100 år og 100 % rente. Samme måneds-/årsbetaling og CF.
- Seks ugyldige/tomme inputtilfeller per konsept, gyldige yields beholdt,
  ingen foreldede beregningsgrafer. Slider-/feltkobling kontrollert.
- Tre grafdatasett, endepunkter, valgt rente også utenom 0,5-trinn,
  eksplisitt utenforintervall og ukjent leie med uavhengig restgjeld i A.
- Tastaturinspeksjon, dialog-Esc og fokusretur, bare filnavn ved PDF-valg,
  redigerbar FINN med sperret Hent.
- Begge hovedflater og alle fire hoveddialoger ved 320/390/768/1024/1440
  CSS px uten horisontal overflow. Ingen JS-/ressursfeil og ingen
  HTTP-/HTTPS-forespørsler fra prototypene.

Kontrollskriptets første forsøk måtte justeres for tekst i lukket details,
norsk Unicode-minustegn og SVG-tekstlesing. Dette var QA-skriptfeil;
kontrollene bestod etter retting. HTML ble deretter polert og kjørt igjen.
Skjermbilder ble visuelt kontrollert på desktop og mobil. Rene
forhåndsvisninger er lagret lokalt i `mockups/assets/preview-a.jpg` og
`preview-b.jpg`; midlertidige fullbilder finnes i `/private/tmp/paa-r3-*`.
Sammenligningssiden fikk i tillegg egen kontroll av bilder, to lenker,
fem skjermbredder og fravær av nettleserfeil.

Kjør det repolagrede kontrollskriptet fra roten med installert Chromium:

```sh
PAA_UX_CHROMIUM_PATH=/Users/madschristophersen/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell node .docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/check-concepts.mjs
```

macOS krevde godkjent eskalering for lokal headless-rendering som tidligere.
Aktive dokumentlenker og `git diff --check` bestod. Produktets testpakke er
ikke kjørt fordi produktkode er uendret; dette er ikke produktakseptanse
eller full tilgjengelighetsgodkjenning. Git viser bare de samme kjente
plan-/prosessartefaktene og aktive promptloggen. Ingen sporet produktfil,
sentral deferred-work, tidligere promptlogg, commit eller push er endret.
Avventer Mads sitt valg av designretning.
