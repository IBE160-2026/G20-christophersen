# Forhåndsutfylt økonomi i Konsept A

Dato: 2026-11-06. Utgangspunkt: `01909131f005f768d77a30b2a0533f1ea01e4ea2`.
Bestilling: [aktiv promptlogg](../prompts/session-01a1ae14-46c3-76b0-bb25-906105b99dfa.jsonl).
Spesifikasjon: [forhåndsutfylt økonomiscenario](../../implementation-artifacts/spec-forhandsutfylt-okonomiscenario.md).

## Beslutninger og sporbarhet

Eksisterende Konsept A og kontrollert økonomigrunnlag beholdes. Finans beregnes i kode. Standard privat lån er 80 % av pris inklusive fellesgjeld minus eksisterende fellesgjeld. Egenkapital er kontantbehov minus privat lån, slik at alle kjøpsomkostninger dekkes. Når fellesgjeld alene overstiger 80 %, brukes nærmeste mulige nivå: ingen privat gjeld. Ukjent kjøpsgrunnlag gir ingen oppdiktet egenkapital. Rente og løpetid starter på 6 % og 360 måneder. Brukerjusteringer beholdes innen samme objekt; nullstilling og ny import gjenoppretter standardene.

Drift forhåndsutfylles med dokumentets dedupliserte delsum. Den automatiske delsummen er uttrykkelig foreløpig; ukjent år og manglende drift bekreftes ikke. Brukerens beløp erstatter summen, legges aldri oppå den, og merkes som egen totalforutsetning. Dokumentets delsum og kilder er bevart. Blank/ugyldig brukerdrift stopper netto og kontantstrøm.

| Eiendom | Prisgrunnlag | Omkostninger | Privat lån 80 % | Samlet egenkapital | Dokumentert månedlig drift |
| --- | ---: | ---: | ---: | ---: | ---: |
| Nøstegaten 65 A | 4 050 000 | 102 340 | 3 240 000 | 912 340 | 1 020 |
| Rostockgata 96 | 8 600 000 | 216 090 | 6 880 000 | 1 936 090 | 3 660 |

Nøstegatens kommunale avgifter på 12 957 kr/år holdes utenfor automatisk delsum fordi eventuell inkludering i fellesutgiftene er ukjent. Eiendomsskatt inngår i kommunale avgifter og legges heller ikke til. Tidligere foreløpig antakelse på 25 197 kr/år er erstattet med dokumenterte fellesutgifter på 12 240 kr/år. Rostockgatas inkluderte kommunale avgifter og underposter telles bare én gang.

Forankring: sensorveiledningen PDF side 2–6 og faglærers [tilbakemelding på brief](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md): vanlig kode for finans, uavhengig regnefasit, kildebelegg, enkel flyt, testing og lagrede prompts. Ingen nye kurskrav utledet.

## Uavhengig kodegjennomgang

BMad-build oneshot med separat Blind Hunter. Alle aktive gjennomgangslag kjørt, ingen hoppet over.

| Funn | Vurdering og behandling |
| --- | --- |
| Dokumentert delsum kan ha annet/ukjent år enn leie | Medium, rettet: automatisk netto/kontantstrøm merkes foreløpig, kostnadsår vises og blandede nivåer uten prisjustering forklares i eksisterende fordypning. Full økonomikontroll endres ikke. Revisor har kontrollert behandlingen. |
| Utelatte avgifters år påvirket beholdt delsum | Medium, rettet: årssett beregnes fra postene som faktisk summeres. Regresjonstest med ulike år består. |
| Slider viste 30 år for 18 måneder | Medium, rettet: faktisk månedsverdi representeres som år. |
| Offentlig standarddekning manglet | Rettet: tre enhetstester for standarder, omkostninger, fellesgjeld, høy fellesgjeld og manglende grunnlag; offentlig appregresjon sjekker standarder og at manuelle endringer beholdes. |
| Oppfølgingsfunn: slider med fri oppløsning kunne gi brøkdelsmåneder | Medium, rettet: månedsoppløsning og avrunding til hele måneder; komponenttest sjekker 18 → 19 måneder og minimum 1 måned. |
| Oppfølgingsfunn: nullstilling blanker finansiering | Lav, rettet: nullstilling gjenoppretter nye standarder; komponenttest sjekker 80 %, 6 % og 360 måneder. |

Ingen funn utsatt. Eksisterende sentral oversikt over utsatt arbeid er ikke endret eller lukket.

## Verifikasjon

- `npm run build`, `npm run lint` og `git diff --check` består.
- Målrettede enhetstester: 47 består, inkludert eksisterende dokumentøkonomi og overlappkontroll.
- Finansieringskomponenter: 3 Playwright-tester består, inkludert eksakte belåningsendepunkter, fellesgjeld, månedsoppløsning og nullstilling.
- Begge private originaler bestod første faktiske Playwright-runde (2 tester, 2,5 minutter), uten rutestubbing. Standarder, uavhengig annuitetsfasit, manuell drift, leie, rente, løpetid, kontantkjøp, nullrente, ugyldige verdier, mobil, tastatur, kildevisning og gjentatt import/eiendomsbytte er kontrollert.
- Sluttkjøring og resultater føyes til nedenfor.

Første fulle testforsøk i sandboxen fikk lokale serverfeil. Neste forsøk overlappet med kildeendringer og ga `server-outdated` og noen PDF-timeouts. Sluttkontrollen kjører sekvensielt etter at backend-/domenekoden er stabil. Dette er ikke behandlet som produktfeil uten videre undersøkelse.

Miljø: Node 26.8.1 i denne terminalen (README krever 24.21.0). Playwright-pakken forventet en nyere browser-cache enn den installerte; lokale private konfigurasjoner bruker eksisterende Chromium 1243 eksplisitt. Ingen nedlasting eller betalt KI-kall. Demo-serveren har tom API-nøkkel og live avslått. Private originaler og skjermbilder beholdes utenfor Git; kompakte QA-resultater legges ved som prosessbevis.

### Sluttresultater

- Full sekvensiell Vitest: **111 filer / 2 238 tester bestått, 1 fil / 7 tester hoppet over**, 290,96 sekunder. [Kjørelogg](okonomistandarder-2026-11-06/vitest.txt). Tidligere server-/timeoutfeil er borte etter stabil kildekode og sekvensiell kjøring.
- Offentlig appregresjon: ni flyter bestod direkte; én gammel forventning om blank egenkapital ved ny import ble oppdatert til dokumentets nye standard på 715 000 kr. Denne testen bestod i separat omkjøring, 20,9 sekunder. [Logg](okonomistandarder-2026-11-06/offentlig-regresjon.txt).
- Finansieringskomponenter etter siste retting: **3/3 bestått**, 3,9 sekunder.

- Endelig originalrunde etter sliderrettingen: **begge originaler bestått på nytt**, sammen med ni offentlige regresjonsflyter. Samlerunden rapporterte 11 bestått og én gammel blank-forventning; denne er rettet og separat bestått som dokumentert ovenfor. Ingen uløste testfeil. [Samlelogg](okonomistandarder-2026-11-06/playwright.txt), [Nøstegaten QA](okonomistandarder-2026-11-06/nostegaten-qa-summary.json), [Rostockgata QA](okonomistandarder-2026-11-06/rostockgata-qa-summary.json). Hver original lastes tre ganger med gjentakelse og eiendomsbytte; ingen nettleserfeil eller eksterne nettleserkall.
- Skjermbilder av mobiløkonomi (Nøstegaten) og desktopøkonomi (Rostockgata) er visuelt kontrollert. Konsept A og eksisterende plassering av felter er bevart.
- Lokal commit omfatter kode, tester, spesifikasjon, denne arbeidsøkten, kompakte testbevis og aktiv promptlogg. Ingen push eller betalte KI-kall.
