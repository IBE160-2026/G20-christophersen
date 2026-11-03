# Teknisk dokumentanalyse – 2026-11-03

Utgangspunkt: `fcb04e63ceb95a494c4c3d8db2c3769faa66ab21`.
[Spesifikasjon](../../implementation-artifacts/spec-teknisk-dokumentanalyse.md).

Brukeren bestilte fungerende teknisk dokumentanalyse med tre parallelle
agenter, integrasjon, ekte privat kontrollcase, Playwright, uavhengig
BMAD-review og lokal commit med aktiv promptlogg. Ingen betalte API-kall,
push eller private PDF-er i Git. Arbeidstreet var rent bortsett fra den
aktive automatiske promptloggen, hvis innhold matcher bestillingen.

## Forankring og arbeidsdeling

AGENTS.md, checkpoint, PRD FR-7–FR-11/FR-18, godkjent Konsept A,
Code First-design, faglærertilbakemelding og sensorveiledningens eksisterende
kildeuttrekk er lest. Kurskildene underbygger sporbarhet, usikkerhet,
kjørbarhet og meningsfull verifikasjon; de gir ingen universell TG-garanti.

BMAD-build er rendret og fulgt med brukerens uttrykkelige autorisasjon til
implementering og parallelle subagenter. Agent 1 eier rapportidentifisering,
agent 2 eier TG-/avviksuttrekk og agent 3 eier Konsept A. Hovedagent
integrerer, verifiserer og bestiller tre uavhengige reviewlag. Brukerens
arbeidsform overstyrer generisk sekvensiell dispatch; ingen ny godkjenning
kreves for allerede bestilt implementering.

## Kildegrunnlag og avgrensning

Den lokale 135-siders salgsoppgaven har lesbart TG-sammendrag på fysisk
side 40–43 og rapport på fysisk side 63–87 med usikker tekststatus/raster.
Grafiske grader kan ikke gjøres om til eksplisitte tekstgrader. Separat
OCR-diagnostikk er et derivat, ikke `pdf-text` med ordrette PDF.js-offseter.
Ingen OCR-tekst erstatter originalkilder eller oppgraderer dekningsstatus.
Den eldre 146-siders kontrollcasen brukes som negativ rapportkontroll.
Originaler og detaljresultater oppbevares bare i ignorert `private/` eller
systemets tempmappe.

## Verifikasjon

Node 24.21.0 fra lokal runtime og tom `OPENAI_API_KEY` brukes. Første
finans-/screening-/TG3-regresjon: 147/147 tester består. Testservere skal
bruke isolerte porter; eksisterende server på 3000 beholdes.

Den første brede kjøringen i sandbox traff `listen EPERM` og manglende
prosessinnsyn; den regnes ikke som godkjent HTTP-/ressursverifikasjon.
Nykjøring bruker nødvendig lokal loopback-/prosessadgang. Playwright bruker
eksisterende Chromium 1248-cache, ikke nedlasting. En første kjøring pekte
mot feil cache og startet derfor ingen nettleserprøver; den er ikke
funksjonsbevis. Feilene og de etterfølgende gyldige kjøringene er holdt adskilt.

## Gjennomført original- og OCR-kontroll

Hovedagent leste også selve sensor-PDF-en med lokal PDFKit; tidligere
kildeuttrekk stemmer med føringene. Native originalbilder av fysisk side
40, 43, 63 og 73 ble rendret privat, med visuell inspeksjon av sammendrag
og grafiske grader. Kontrollen viser konkret at sammendrag og rapport kan
avvike. Det er derfor en generell synlig begrensning, ingen hardkodet
korreksjon for én eiendom.

Eksisterende lokale Vision CPU-OCR ble kjørt på rapportside 73. Den
returnerte 37 tekstlinjer uten feil, men etablerte ingen sikker kobling
mellom grafiske gradsymboler og bygningsdeler. Resultatet er uttrykkelig
`humanVerified: false`, beholdes privat og brukes ikke som `pdf-text` eller
til å oppgradere teknisk dekning. Ingen AI-transport ble åpnet.

## Review og konkrete rettinger

Tre uavhengige BMAD-lag undersøkte den samme lagrede diffen. Ett lag traff
først leverandørens bruksgrense, men ble gjenopptatt og fullførte. Alle
funn er individuelt triagert i spesifikasjonen. Endringene retter blant
annet første-punkt-trunkering, gradlekkasje til neste komponent, rom-/etasjekonflikter,
tap av sammendrag ved separat rapport og falske rapportomslag fra henvisningsprosa.
Reviewnykontrollen fant også en negasjonsfeil i navnelistefallbacken; den
ble sendt tilbake og rettet med positive og negative prøver.

Alle opprinnelige reviewreproduksjoner er bekreftet rettet av sine
uavhengige reviewere. Blindlagets siste negasjonskontroll bestod 36/36
relevante tester. Fullsuite fant dessuten en gammel enlinje uten punktum
som var blitt for strengt avvist; eksisterende format, ID og kildespenn er
gjenopprettet og regresjonstestet. Ingen konkrete reviewfunn er utsatt.

## Sluttkontroll og leveringsgrense

[1804/1804 tester i 88 filer](teknisk-dokumentanalyse-2026-11-03/vitest.txt),
[build/typecheck](teknisk-dokumentanalyse-2026-11-03/build.txt) og
[lint](teknisk-dokumentanalyse-2026-11-03/lint.txt) består. Build har bare
det eksisterende varselet om stor JavaScript-bundle.

[37/37 aktive nettleserprøver](teknisk-dokumentanalyse-2026-11-03/playwright.txt)
består. Én valgfri prøve av den historiske betalingsjournalen ble hoppet
over fordi egen hashvariabel manglet i denne kjøringen; den ble deretter
kjørt eksplisitt og bestod sammen med begge kilde-/sammendragsprøvene
[3/3](teknisk-dokumentanalyse-2026-11-03/playwright-kilder-og-journal.txt).
Dermed er alle 38 scenarier gjennomført, uten å endre journal eller foreta
nytt betalt forsøk. [3/3 dev-prøver](teknisk-dokumentanalyse-2026-11-03/playwright-dev.txt)
og [ekstra fokus-/mobilkontroll](teknisk-dokumentanalyse-2026-11-03/playwright-fokus.txt)
består. Syntetisk [desktop](teknisk-dokumentanalyse-2026-11-03/desktop.png)
og [mobil](teknisk-dokumentanalyse-2026-11-03/mobile.png) er visuelt kontrollert;
private originalbilder/spor er ikke versjonert.

Fersk PDF.js-import av den ekte 135-siders PDF-en identifiserer fysisk
63–87 som uklart rapportområde. Den gir 23 TG2-opplysninger fra sammendrag
på 40–43, 37 mulige funn fra ufullstendig tekst uten grad og totalt 66
tekniske råfunn. Alle 120 kildebelegg samsvarer med original hash, filnavn,
fysisk side og UTF-16-offset. Dette er råfunn, ikke 66 beviselig ulike
underliggende problemer. Ingen TG3 i sammendraget er ikke bevis for
fravær av TG3 i rapporten. Ingen nye kontrollerbare detaljfunn eller
komplett TG-dekning hevdes for dette usikre tekstlaget.
[Aggregert kontroll](teknisk-dokumentanalyse-2026-11-03/privat-kontroll-statistikk.json).
Den eldre 146-siders negative kontrollen gir ingen identifisert rapport,
ingen TG-funn og fortsatt ufullstendig dekning
([statistikk](teknisk-dokumentanalyse-2026-11-03/negativ-kontroll-statistikk.json)).

Generiske positive/negative tester dekker flere rapporter, separate PDF-er,
flerlinjeavvik, ren komponentliste, ulike rom, negasjon, ukjent struktur,
kapasitetsgrense og uavklart fortsettelse. Ingen adresser, rapportnavn eller
fysiske sider brukes som parserregel. Økonomi, kontrollporter og deterministisk
screening er bevart. PAA-SO2 forblir åpen for generell dokument-/TG-kvalitet.

De isolerte testserverne berørte ikke port 3000. Etter testene ble den gamle
PAA-prosessen kontrollert: samme prosjektserver og ingen aktive forbindelser.
Den ble restartet kontrollert med samme Node 24 og eksisterende `.env`,
uten miljøfilendringer, for å laste den nye kontrakten. Den kjører som demo.
Den samme private originalprøven bestod også mot denne faktiske serveren på
3000 ([1/1, etter omstart](teknisk-dokumentanalyse-2026-11-03/playwright-aktiv-server.txt)).
Ingen betalte API-kall, push eller private PDF-er i Git.
