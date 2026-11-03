# Grafisk TG-analyse – 2026-11-03

Utgangspunkt: `f4f50e9fe0210ec7ae2ba844db603b65adca0781`.
[Spesifikasjon og full reviewtriage](../../implementation-artifacts/spec-grafisk-tg-analyse.md).

Brukeren bestilte fungerende lokal analyse av grafiske TG2/TG3, kobling til
bygningsdel og avvik, kontroll av dobbelttelling, originale kilder og tydelig
sidevis dekning. Ingen betalte API-kall, private PDF-er i Git eller push.
Den aktive automatiske promptloggen tilhører samme økt og følger committen.

## Forankring og metode

AGENTS.md, forrige checkpoint, Code First-design, relevante PRD-krav
FR-7–FR-11/FR-18, faglærertilbakemelding og sensorveiledningens eksisterende
kildeuttrekk er lest. Den nye bestillingen utvider tidligere tekstbegrensning
med lokal OCR. Ingen finansregel, økonomikilde eller rapportbekreftelsesport
endres. BMAD-build er rendret én gang. Brukerens autorisasjon til implementering
og subagenter brukes innen samme konkrete oppdrag, uten en ny godkjenningsrunde.

Tre implementeringsagenter arbeidet med native bildeanalyse, kilde-/geometrisk
kobling og Konsept A. Hovedagent integrerte i faktisk importbarn, tid-/svarbudsjett,
ekte dokumentkontroll, tester og dokumentasjon. Tre nye uavhengige BMAD-lag
(blind, kanttilfeller og verifikasjonsgap) gjennomgikk lagret samlet diff.
Alle tre ble først avbrutt av leverandørens bruksgrense; brukeren ba deretter
om videreføring. Ingen avbrutt review regnes som godkjenning. Lagene ble
gjenopptatt og alle leverte konkrete reproduksjoner og etterprøving.

PDF.js går først. En forhåndskompilert lokal Swift-bildeleser bruker PDFKit
og Vision på samme originalbyte, via stdin. Grader krever samme eksplisitte
TG-token i helside og separat utsnitt. Farge brukes til kandidatsegmentering,
men eksplisitt TG-tokengeometri støtter også svart-hvitt og mørke farger.
Vision kan slå sammen TG og komponent; faktiske tegnbokser gir separate
områder. Lav faktisk OCR-score beholdes. Avviks-/komponenttekst krever lesbar
original PDF.js-tekst eller samsvarende separat linje-OCR. PDFKit-tekst brukes
bare til å prioritere unødvendige utsnitt, aldri som kilde eller godkjenning.

Avledede kilder har egen metode, originalhash, filnavn, fysisk side, region,
renderdigest og versjon. De får ingen oppdiktede PDF-tekstoffseter. Hele
avviksbåndet må være støttet; innrykk, brede linjer, usikre navne-/romlinjer,
manglende slutt og tvetydige grader blir eksplisitt usikkert. Samme geometri
kontrolleres i parser og sluttkontrakt. Visuell behandling kan nedgradere,
men aldri oppgradere teknisk komplettstatus.

## Ekte dokumentkontroll

Den eksisterende 135-siders private salgsoppgaven gir rapportutvalg på fysisk
63–87. Sluttkjøringen brukte 14,6 sekunder i bildeleddet: 25/25 sider ble
rendret og OCR-lest. Ti TG2-detaljer kobles på fysisk 71, 72, 73 (to), 75 (to),
76, 77, 79 og 82. Hovedagent sammenlignet disse originale sidene visuelt med
komponent, grafisk grad og hele uttrekkets avviksbeskrivelse. Originalbilder
og utdrag oppbevares utelukkende privat eller i systemets tempmappe.

De ti detaljene har 30 visuelle kildebelegg, alle kontrollert mot hash,
filnavn, fysisk side, renderdigest, metode og positive regioner innen siden.
104 eksisterende PDF-tekstbelegg kontrolleres ordrett mot opprinnelige
UTF-16-offseter. 23 TG2-opplysninger fra sammendrag og 30 usikre tekstkandidater
beholdes. Det er 69 tekniske råposter; dette er aldri et antall beviselig
ulike problemer. Én entydig sammendrag/detalj-kobling samles i visningen.
Alle 23 originale sammendragsbelegg er bevart: ett i detaljgruppen og 22
som medlemmer av 20 separate sammendragsrader. Sammendragene har egne tall
utenfor detalj-/problemtelleren og skal ikke summeres med detaljene.

Ingen TG3 er verifisert i den ekte rapporten. Dette dokumenterer ikke at TG3
mangler. Alle 25 sider har fortsatt usikker samlet dekning. Detaljer som går
over side-/kolonneskift, uklare symboler, ukjent rom eller svak avviksavgrensning
støtter ingen ny sikker kobling. Render/OCR av en side er ikke full sidekontroll
eller brukerbekreftelse. Den gamle ekte 146-siders kontroll-PDF-en gir ingen
rapportavgrensning eller tekniske funn, og blir ikke automatisk OCR-lest som
et helt uidentifisert prospekt.

## Konkret review og rettinger

Alle individuelle funn er triagert i spesifikasjonen. Rettelsene omfatter
bevaring av tre offsetløse OCR-regioner i kontrollvisningen, visuelt opphav,
reell relativ regionplassering ved zoom/mobil, positiv identitet ved samling,
hele avviks-/navnebånd og felles geometrivalidering ved kontraktgrensen.
Blind nykontroll fant også restfeil for Altan uten sted og navnefortsettelse
uten Beskrivelse-etikett; begge er rettet og godkjent etter nye reproduksjoner.

OCR får bare importens gjenværende tidsbudsjett med 2,5 sekunders sluttmargin,
høyst 35 sekunder og 40 sider. Hele fullførte sideposter beholdes ved avbrudd.
Native prosess har 512 MiB RSS-vakt, foreldrevakt og begrensede utdata; disse
er best effort, ikke hard OS-isolasjon. OCR-responsen tilpasses samlet
8 MiB-grense etter at økonomitillegg er lagt til. Bare hele visuelle sider
utelates med synlig begrunnelse. Hvis ingen metadata får plass, beholdes det
opprinnelige tekstgrunnlaget med alle kilder og dekningsbegrunnelser.

## Verifikasjonsløp og gyldighet

Node 24.21.0, tom API-nøkkel og eksisterende Chromium brukes. Alle faktiske
native-prøver krever lokal Apple Vision-/prosessadgang. Sandbox-feil som
Foundation._GenericObjCError eller /bin/ps EPERM regnes ikke som bestått
funksjonsprøve; etterfølgende godkjent lokal kjøring er beviset.

Første regresjon under samtidige kontraktendringer hadde to konstruksjonsfeil
i nye tester; senere full kjøring bestod 1852/1852 før reviewrettingene.
Etter review hadde én full kjøring bare en gammel 5-sekunders testfrist som
feil: ukjent PDF med faktisk OCR trenger importens eksisterende 60-sekunders
budsjett. Denne prøven har nå samme endelige importfrist. Første Playwright-
runde hadde to 30-sekunders prøvefrister og en gammel forventning om separat
sammendragsrad. De tre ble rettet for lokal OCR og sammenslått kildebelegg;
alle tre bestod separat før samlet sluttkjøring. Ingen produktkrav eller
kildekontroll ble svekket for å få testene til å bestå.

Endelig [fullsuite](grafisk-tg-analyse-2026-11-03/vitest.txt): **1883/1883 tester i 93 filer**, med seks faktiske native-integrasjonstester aktivert. [Native-nykontroll](grafisk-tg-analyse-2026-11-03/native-ocr.txt) dokumenterer seks av seks, inklusive vektor, raster i farge/svart-hvitt, inline TG/navn og mørkerød TG3. [Build/typecheck](grafisk-tg-analyse-2026-11-03/build.txt) og [lint](grafisk-tg-analyse-2026-11-03/lint.txt) består; bare eksisterende Vite-bundlevarsel gjenstår.

[Nettleser-hovedkjøringen](grafisk-tg-analyse-2026-11-03/playwright-hovedkjoring.txt) gjennomførte alle 39 scenarioer: 38 bestod, mens én prøve fikk ENOENT under browserContext.close fordi hovedagent samtidig startet prøven mot port 3000 med samme standard resultatmappe. Dette er en feil i kjøringsoppsettet og regnes ikke som bestått prøve. Den ene prøven ble kjørt på nytt med separat outputmappe og [bestod 1/1](grafisk-tg-analyse-2026-11-03/playwright-isolert-nykjoring.txt). Dermed er samtlige 39 funksjonsscenarioer verifisert med gyldig bestått kjøring; ingen produktendring ble gjort for filkollisjonen.

[Dev](grafisk-tg-analyse-2026-11-03/playwright-dev.txt) består 3/3. [Målt regionplassering](grafisk-tg-analyse-2026-11-03/playwright-regioner.txt) består 1/1, med faktisk relativ x/y/bredde/høyde på desktop, mobil og ved zoom samt Escape-fokusretur. [Aktiv server](grafisk-tg-analyse-2026-11-03/playwright-aktiv-server.txt) består 1/1 med den ekte private PDF-en, OCR-regioner og originaler. Den gamle PAA-prosessen hadde ingen aktive forbindelser og ble kontrollert restartet på port 3000 med samme Node 24 og uendret .env. Den oppdaterte demoen er tilgjengelig der.

[Aggregert ekte kontroll](grafisk-tg-analyse-2026-11-03/ekte-rapport-statistikk.json), [visning og samling](grafisk-tg-analyse-2026-11-03/visning-statistikk.json) og [andre ekte negative PDF](grafisk-tg-analyse-2026-11-03/negativ-kontroll-statistikk.json) inneholder ingen private tekstutdrag.
PAA-SO2 forblir åpen for generell dokument-/TG-kvalitet. Ingen betalte API-kall,
push eller private originaler/utdrag i Git.
