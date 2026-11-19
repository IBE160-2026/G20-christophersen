# PRD, faglæreroppfølging og del 1-kontroll

Dato: 2026-11-19. Bestiller: Mads. Inngang: commit
`684e61d3686f83f05c3f6cb1a3720dfb3f622c68`.
Produktkode er fortsatt den uendrede leveransen fra `6392918`.
[Brukerprompt](../prompts/session-01a1f491-7d2e-7f43-beec-4f31510eb7b7.jsonl)
tilhører denne aktive økten og skal inngå i samme lokale commit.

## Oppdrag, metode og autorisasjon

Oppdraget er å avstemme PRD med alle kommentarer fra Bård Pettersen,
dagens implementasjon og beslutninger, vurdere relevante prinsipper i et
annet produkts teknologioversikt, forberede uavhengig testing og vurdere
gjenværende gap mot A. Ingen produktutvikling, betalte KI-kall eller push.
Bare dokumentasjon/prosessbevis endres. Ingen ny funksjon eller kritisk
kodeendring var nødvendig.

AGENTS.md er lest. Sensorveiledningens sju originale sider er tekstlest med
installert PDF.js; Poppler/pypdf finnes ikke i miljøet. Relevante
faglærertilbakemeldinger, brief/PRD med addenda og beslutnings-/leveransebevis
er kildegrunnlag. Kursveiledningen gir A–B-kjennetegn og faglig skjønn;
ingen bestemte nye tjenester eller antall testpersoner utledes av den.

BMAD PRD Update er brukt i eksisterende mappe. Customization ble lest via
prosjektskriptet med midlertidig uv-cache fordi standardcachen var sperret.
Kravrevisjon, inputavstemming, rubrikkontroll og redaksjonell struktur/språk
er gjennomført; brukerens konkrete selvstendige oppdrag erstatter
innledende ny produktoppdagelse og nye godkjenningsrunder. Arbeidet bruker
eksisterende produktvedtak og bevarer åpne empiriske forhold. Ingen ekstern
handoff er konfigurert. Memlog oppdateres bare gjennom memlog.py.

## Arbeidsdeling og egne begrensninger

Brukeren autoriserte subagenter. Alle er KI-agenter, ingen teller som
uavhengig menneskelig bruker eller fagkyndig.

| Rolle | Instruks og levert bevis |
| --- | --- |
| feedback_sources | Trekk ut alle PRD-kommentarer, brief-/beslutningsarv og faktiske sensorkriterier uten å finne på krav. [Kildeavstemming](../../planning-artifacts/prds/prd-IBE160-2026-10-10/reconcile-feedback-2026-11-19.md). Senere uavhengig [kritisk sluttkontroll](../../planning-artifacts/prds/prd-IBE160-2026-10-10/sluttkontroll-2026-11-19.md). |
| implementation_evidence | Les kode/testasserts og vedtak; trekk ut TG3-regler, analysefrister, budsjettlag, faktisk scope og FR-/NFR-spor. [Implementeringsgrunnlag](../../planning-artifacts/prds/prd-IBE160-2026-10-10/implementation-evidence-2026-11-19.md). Senere [PRD-rubrikk](../../planning-artifacts/prds/prd-IBE160-2026-10-10/review-rubric-2026-11-19.md). |
| evaluation_technology | Vurder technology.md som annet produkt og forbered faktisk gjennomførbar, uutført S6-/tidsprotokoll. [Prinsippvurdering](../../planning-artifacts/architecture/technology-principles-2026-11-19.md) og [testprotokoll](../evaluering/testprotokoll-del1-2026-11-19.md). Senere strukturkontroll; hovedagenten følger med språkpass. |
| Hovedagent | Rediger gjeldende PRD og daterte lesestatusmeldinger, skriv kommentarrespons, oppdater sentral oversikt uten lukking, kontroller bevis, kjør avgrensede offline/stubbede tester og dokumentkontroll, triager review og commit lokalt med aktiv logg. |

Subagentenes oppgaver og roller er oppsummert her; dette er ikke en full
ordrett transkripsjon av alle meldinger/verktøyutdata. Automatisk promptlogg
lagrer brukerens instrukser, ikke hele samtalen. Tidligere logger er urørt.

## Endringer og bevaring

[Oppfølgingsrapporten](../../planning-artifacts/prds/prd-IBE160-2026-10-10/oppfolging-prd-2026-11-19.md)
går gjennom samtlige kommentarer, positive føringer, mekaniske funn,
faseblockere og refleksjonsspørsmål. PRD-en har oppdatert frontmatter,
stabile ID-er, kravstatus per ID, kildepresedens og datert scopehistorikk.
Prioritet 1 er samlet i FR-16. Finansformler, uavrundede grenser og K1–K3
er bevart. TG3 er eksplisitt alle aktive TG3, ikke en oppdiktet
alvorlighetsklassifikator. Analyseveier/frister og prosjekt-/analyserammer
er skilt; ingen gammel fullmakt gjenbrukes.

Original PRD ved inngang hadde SHA-256
`e4c5fdbaa5b0989c44eee3c663af32483a30d20d9ea29a4209bc35ab61388126`.
Git-førversjonen og addendumets opprinnelige tabeller bevarer gammel ordlyd.
Ingen gamle AC, fasit, opptak, rålogger, tilbakemeldinger eller
technology.md endres. Brief, arkitektur og gammelt sporbarhetskart har
korte daterte henvisninger til gjeldende krav; de gjøres ikke om til
påstått samtidige nye planer. README lenker oppfølging/protokoll.

Sentral deferred-work har bare datert oppfølging av eksisterende S6,
S5-W1, dokumentdekning, leie og ukjent belastning. Ingen post er lukket.
Nye testopplegg har ingen data; A/B-pakker må fortsatt produseres/fryses
og personer rekrutteres. Historisk S5-testing forblir avsluttet.

## Kritisk kontroll og triage

Rubrikkagenten fant ingen critical/high og tre medium dokumentpresiseringer:
samlet 50 MiB for beholdte originaler, annuitetens øreavrunding og
forskjellen mellom absolutt terminalvalideringsfrist i gammel adapter og
SDK-timeout/abortsignal i økonomihjelperen. Alle tre er rettet i PRD;
siste punkt også presisert i implementeringsuttrekket. Ingen kodeendring
var nødvendig. Daterte reviewrapporter bevares med funn og etterkontroll.

Struktur/språk og siste faglige kontroll dokumenteres i de lenkede
reviewrapportene. Behandling av eventuelle ytterligere funn føres som
datert tillegg nedenfor; opprinnelige reviewfunn overskrives ikke.
Kontrollen må skille reelle dokumentfeil fra korrekt erkjente produkt-
og bevisgrenser. En PRD som er beslutningsklar er ikke en A-karakter.

## Faktisk kontrollkjøring 19. november

Kjøringsmiljø: macOS arm64, **Node 26.8.1**, npm 11.19.0, eksisterende
node_modules/låsfil. Dette avviker fra README sin låste Node 24.21.0.
Kjøringen er supplerende målrettet regresjon, ingen ny ren installasjon,
plattformgodkjenning, full regresjon, E2E- eller menneskelig S6-prøve.

620 tester i 20 filer ble valgt fordi de etterprøver PRD-ens viktigste
presiseringer: TG3/binding, prioritet/mangler, finans/terskler, opphav/
bekreftelser/snapshot, scenario/annuitet, budsjett/stubbet live-transport,
dokumentprofil og HTTP-/serverporter. Eksakt kommando står i råloggene;
`OPENAI_API_KEY`, `ANALYSIS_MODE` og `PAA_TEST_LOCAL_VISION` ble fjernet
fra miljøet med env -u. Live-kodeprøvene bruker fiktiv nøkkel og injisert
transport; de er ikke leverandørkjøringer.

| Kontroll | Faktisk resultat og bevis |
| --- | --- |
| Første målrettede kjøring i sandkasse | Exit 1: 598 bestått / 22 feilet, fem ubehandlede feil. Localhost-listen og /bin/ps ble sperret med EPERM; RSS-test fikk timeout. [Uendret første rålogg](../evaluering/prd-kontroll-2026-11-19/relevante-tester.txt). Dette skjules ikke som bestått. |
| Samme utvalg uten sandkassens localhost-/prosessbegrensning | Exit 0: **20/20 filer, 620/620 tester bestått**, ingen skip eller ubehandlede feil. [Rekontroll](../evaluering/prd-kontroll-2026-11-19/relevante-tester-rekontroll.txt). Samme kode/pakker, ingen betalt transport. Det støtter at de observerte feilene var miljøavhengige. |
| Historiske bevis | Full historisk regresjon, Node 24-ren klon og native OCR står i leveransebevisene fra 6. november, ikke ommerket som kjørt nå. |
| Dokumentkontroll | Lenker/ankere, stabile ID-er, historiske tabeller, ordtelling og finansfasit kontrolleres mekanisk; detaljert resultat i [kontrollmanifest](../evaluering/prd-kontroll-2026-11-19/dokumentkontroll.json). |

Testene validerer kodeatferd med kontrollert input. De dokumenterer ikke
representativ PDF-kvalitet, sannhet i brukerens TG3-grunnlag, dagens
leverandørpris/saldo, uavhengig menneskelig forståelse eller tidsbesparelse.

## Lokal levering

Kun eksplisitte dokument-/prosessfiler og denne øktens aktive promptlogg
skal stages. Ingen tidligere promptlogg flyttes, omskrives eller slettes.
Arbeidstreet og staged diff kontrolleres før commit. Commitidentiteten
kan etterprøves med Git-historikken for denne filen; ingen selvrefererende
commit-hash oppfinnes i dokumentet. Ingen GitHub-push utføres.

## Sluttføring og etterkontroll 19. november

Den separate kritiske sluttkontrollen fant ett kildeanker til F1–F4 som
manglet «minst-». Dette er rettet og rekontrollert. Ingen kjent
blokkerende dokumentmotsetning gjenstår i kontrollens omfang. De to
språkforslagene er innarbeidet, og begge struktur-MOVE-forslag er fulgt;
opprinnelige testtabeller er uendret bortsett fra overskriftsnivå.

Siste mekaniske kontroll viser **7 496 → 4 579 ord (38,9 % reduksjon)** i
hoved-PRD, 348 lokale lenker og 11 Markdown-fragmenter uten feil, stabile
ID-er, uendrede historiske addendumtabeller og bevart memlog-historikk.
Dette er whitespace-ordtelling inklusive Markdown/lenker. Ingen kilde-/test-/
pakke-/låsfil er endret. Git diff --check består for dokumenttekst/JSON.
Råloggen fra første Vitest-kjøring har en opprinnelig tom sluttlinje som
staged whitespace-kontroll varsler om; den bevares byteidentisk som råbevis.
Eksterne URL-er og
leverandørpriser er ikke nyverifisert; de refereres som daterte kilder.

Kontrollmanifestet er generert med Python-standardbiblioteket: lokale
lenkemål og GitHub-lignende overskriftsankere, eksplisitte FR-/NFR-ID-sett,
historisk addendumsuffiks fra inngangscommiten normalisert bare for
overskriftsnivå, original-PRD SHA-256, JSONL-skjema/økt-ID og uavhengig
Decimal-kontroll av F1/F2 og de foreslåtte A/B-beløpene. Testoppgavene A/B
er konstruerte planverdier, ikke empiriske observasjoner. Antall kontrollerte
lenker gjelder det endelige endrede/nye Markdown-settet, ikke hele repoet.

Vurderingen mot A er begrunnet i oppfølgingsrapporten. Generell dokument-/
TG-dekning, annen persons README-/UX-prøve og validert tidsbesparelse
kan ikke produseres ved dokumentredigering. De er fortsatt synlige i
sentral oversikt. Ingen sak er lukket med denne revisjonen.
