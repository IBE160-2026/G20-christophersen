# Automatisk leieestimering fra salgsoppgave

Dato: 4. november 2026. Utgangspunkt:
`ea54c2c3bf44f781bfce179f468c3d74113caf40`.

Bruker bestilte undersøkelse av SSBs åpne API, design og implementering av en
første leieagent for enkeltleiligheter, integrert med eksisterende økonomi og
Konsept A. PDF-/OCR-/TG-arbeidet skulle fryses med dokumenterte begrensninger.
Ingen betalte API-kall eller push; lokal commit med promptlogg var uttrykkelig
bestilt. Aktiv promptlogg er
[session-01a1a610-23b7-7fd3-94be-f3734b1cf806.jsonl](../prompts/session-01a1a610-23b7-7fd3-94be-f3734b1cf806.jsonl).
Automatisk logging er ikke endret, og ingen tidligere promptlogger er rørt.

## Grunnlag og avgrensning

[Implementasjonsspec](../../implementation-artifacts/spec-automatisk-leieestimering.md)
sporer bestillingen til kode, akseptansekriterier og tester.
[Faktiske SSB-kall og metode](../../implementation-artifacts/leieagent-ssb-research.md)
dokumenterer metadata, variablekoder, celler og begrensninger i 09897 og 09895.
Faglærerens vekt på kilder, usikkerhet, kodebasert økonomi og menneskelig
kontroll, sensorveiledningen og godkjent Konsept A er brukt som føringer.
Markedsagent var utenfor historisk v1; denne uttrykkelige bestillingen utvider
produktet uten å endre tidligere akseptanse eller finans-/screeningregler.

To avgrensede subagenter undersøkte SSB og koblingspunktene, og implementerte
henholdsvis klient/matematikk og kontrakt/boliguttrekk. Hovedagent implementerte
HTTP-rute, automatisk oppstart, Konsept A, økonomikobling og integrasjonstester.
Tre uavhengige reviewlag undersøkte mangler, kanttilfeller og testhull. Alle
15 konkrete funn er triagert og rettet; hvert funn har egen rad i specen.

## Leiegrunnlaget og økonomireglene

- SSB 09897 velges fordi den kombinerer rom og areal. 09895 er undersøkt, men
  kvadratmetergjennomsnitt brukes ikke som ubegrunnet reserveformel.
- Bare eksisterende lesbart tekstlag og kildevaliderte eiendomsopplysninger
  brukes. Originalhash, dokumentnavn, fysisk PDF-side, sitat og offset bevares.
  Ingen OCR-/TG-kode er endret. Meglerkontor, hypotetiske planløsninger,
  flerboligobjekter og ukjente/motstridende nøkkelopplysninger håndteres eksplisitt.
- Ni eksplisitt mappede kommuner støttes. Ukjent bydel i Oslo/Bergen/Trondheim
  gir intervall over alle aktuelle bysoner. Andre geografier gir synlig
  begrensning; ingen gjettet tettstedsklasse eller adressepresisjon.
- Areal interpoleres mellom publiserte punkter for samme romgruppe; ingen
  ekstrapolering. Punkt avrundes til hundrekroner, intervall utover. Formler,
  råceller og eksakt SSB-URL vises. Bare offentlige statistikkoder sendes ut.
- Intervallet er konservativt og foreløpig, ikke empirisk kalibrert eller et
  statistisk prediksjonsintervall. Det tar høyde for grov geografi, alternativ
  arealbasis og datalder med synlige regler. Faktisk markedsleie er ikke bevist.
- Automatisk scenario beholder statistikkåret. SSBs henteår omdaterer ikke leie
  og etablerer ikke økonomisk årssamsvar med nyere drift. Eksplisitte manuelle
  forventninger følger eksisterende skjema og årskontroll.
- Registrert leie, konflikt og bevisst tømt manuelt leiegrunnlag overstyres
  aldri. SSB-estimatet fyller ikke kontrollfelter, setter ingen bekreftelse og
  endrer ingen kontrollert anbefaling. Faktisk leie krever gyldig beløp,
  periode, år og kilde før den omtales som registrert.
- SSB-oppslaget er separat fra PDF-import og modell-/budsjettport. Nettfeil
  har synlig status og gratis nytt forsøk. Objektbytte avbryter og skjuler
  gamle resultater før effektrydding. Offentlig cache inneholder ingen objekter.

## Faktisk gratis nettverksverifikasjon

Metadata og data for SSB 09897/09895 svarte HTTP 200 uten nøkkel.
Den ferdige agenten er i tillegg kjørt med en faktisk syntetisk PDF gjennom
lokalt uttrekk og deretter ekte SSB-oppslag: Stavanger, 2 rom, 50 m² BRA-i gir
12 200 kr/mnd, 146 400 kr/år, statistikkår 2025. Produktets intervall ved
verifikasjon i 2026 er 8 500–15 900 kr/mnd. Dette er testbolig, ingen
analyse av privat faktisk leieinntekt. Lokal respons og kjørbart kontrollskript
ligger ignorert i `private/incoming/rent-live-verification.{json,ts}`.

Første inline Node-kjøring feilet fordi `--input-type=module` ble arvet av
PDF-barnprosessen. Samme kontroll som ordinær skriptfil bestod. Dette var en
verifikasjonsinnpakning, ingen produktendring.

## Verifikasjon

Før review bestod 1 953 unit-/integrasjonstester; 7 eksisterende lokale
vision-tester ble hoppet over fordi `PAA_TEST_LOCAL_VISION` ikke var aktivert.
55 målrettede bolig-/kontrakttester, cachetester, scenario-/UI-tester og
HTTP-test er kjørt etter reviewrettingene. Endelige suite- og nettleserresultater
registreres nedenfor før commit.

Standard Playwright-kjøring fant først port 3000 opptatt og deretter manglende
forventet Chromium-revisjon 1248. Brukerens server ble ikke stoppet. Midlertidig
ignorert `private/incoming/rent-verification.config.ts` bruker ledig port 3107
og allerede installert Chromium 1243. Åtte Konsept A-tester bestod før siste
reviewrettinger. Ingen ny nettlesernedlasting eller endret prosjektkonfigurasjon.

## Videre arbeid

Empirisk kalibrering av individuell leie og bredere geografi-/dokumentdekning
står eksplisitt Åpen som PAA-LEIE1 i
[den sentrale oversikten](../../implementation-artifacts/deferred-work.md).
Ingen tidligere PDF-/OCR-/TG- eller budsjettoppføringer er lukket.

Oppfølgingsreview fant to gjenværende presiseringer: romtallfilteret måtte tillate
«2-roms leilighet med mulighet for hjemmekontor», og estimated-kontrakten måtte
kreve kommune slik produksjonsklienten gjør. Begge er rettet, 55 bolig-/
kontrakttester består, og uavhengig reviewer bekrefter at disse er løst.
Økonomistatus som sa «Ingen nye API-kall» er presisert til «Ingen nye
KI-API-kall», fordi det nye SSB-steget faktisk bruker et gratis offentlig API.

Tidligere lagret privat dokumentuttrekk er også undersøkt uten ny PDF-/OCR-
behandling eller nettverkskall. Nødvendig adresse, areal og boligtype ble ikke
identifisert entydig av den konservative leieparseren. Ingen leie er produsert
for dette dokumentet. Dette er en dokumentert begrensning i førsteversjonens
tekstopplysningsdekning, ikke grunnlag for å be brukeren registrere allerede
kjente opplysninger eller for å påstå at originalen mangler dem. Det private
resultatet ligger i `private/incoming/rent-existing-document-verification.json`.

Visuell kontroll: syntetisk Stavanger-leilighet er inspisert i lagrede
Chromium-bilder ved 390 og 1440 px. Leiebeløp, intervall, kilder, tabell,
begrensninger og manuell overstyring er lesbare uten horisontal sidescrolling.
Skjermbildene er ignorert i
`private/incoming/rent-browser-results/investment-overview-A-auto-a78dd--og-bevarer-manuell-økonomi/`.

Endelig unit-/integrasjonssuite: `npx vitest run` bestod med **1 983 tester**,
98 testfiler bestod. Sju eksisterende native vision-tester i én testfil var
eksplisitt hoppet over uten `PAA_TEST_LOCAL_VISION=1`; alle nye leietester kjørte.
`npm run build`, typecheck, `npm run lint` og `git diff --check` bestod.
Vite gir fortsatt varsel om eksisterende stor klientbundle.

Siste produksjonsbuild er i tillegg kontrollert separat på port 3108: alle fire
nye nettlesertilfeller for automatisk leie, sent objektsvar og nytt forsøk
med/uten manuell leie bestod. Nettlesersvarene er deterministiske offentlige
fixtures; faktisk gratis SSB-nettverksverifikasjon er dokumentert separat over.

Full nettleserregresjon sluttført: **243 bestått, 5 hoppet over** av 248 tilfeller
(8 minutter). Skip gjelder valgfrie private/uavklarte testmiljøtilfeller som
krever eksplisitte `PAA_UNSEEN_PDF`/`PAA_UNCERTAIN_DOCUMENT_SHA256`-variabler,
ikke de nye leietestene. Eksisterende privat original og risiko-/kildekontroll
kjørte og bestod. Alle konkrete reviewfunn er rettet og verifisert.

Ferdigstilt som lokal commit med aktiv promptlogg. Ingen push, betalte API-kall,
endringer i OCR-/TG-algoritmer eller lukking av historiske åpne porter.
