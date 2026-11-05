# Stabilisering 2026-11-05 – analyse og datakvalitet

Ansvar: subagent 2, analyse og datakvalitet. Utgangspunkt:
`e0ad095c5a9410886ee94e3897cae3552284a7f0`.

## Kontrollgrunnlag og metode

AGENTS.md, faglærerens produktbrief-tilbakemelding og det godkjente
code-first-designet er lest. Kontrollen viderefører kravene om kildebelegg,
skille mellom fakta/estimat/antakelser og eksplisitt ufullstendig teknisk dekning.
Ingen betalte KI-kall, eksterne kildeoppdateringer eller repoopplasting er utført.

Originalene finnes privat under `private/incoming/nostegaten-65-a.pdf` og
`private/incoming/nordvik-rostockgata-96.pdf`. Fysiske PDF-sider ble gjengitt på
nytt med PDFKit (lokalt, ingen OCR) og visuelt kontrollert. Renderer og avledet
kontrollgrunnlag ligger under Git-ignorert `private/incoming/stabilization-quality/`.
Ingen PDF, private sitater eller bilder kopieres til versjonert dokumentasjon.

Dagens `createCodeFirstImport`, `extractRentalProperty`, `estimateRent` og
`economySuggestions` er kjørt på hele eksisterende PDF-uttrekk som først ble
bundet til originalfilenes SHA-256 på nytt. Dette er separat faglig kontroll av
dagens beregnings-/uttrekksregler, **ikke** en erstatning for hovedagentens nye
opplastinger i nettleser. Det må ikke brukes som bevis på importstabilitet.

## Fysisk kildekontroll

| Kontroll | Nøstegaten | Rostockgata |
|---|---|---|
| Fysiske sider | 152 | 170 |
| Prisantydning | 4 050 000 kr, side 8 | 8 600 000 kr, side 4 |
| Internt areal | 40 m² BRA-i, side 8 | 59 m² BRA-i, side 4 |
| Totalt antall rom | 2, side 8 og 90 | 3, side 4 |
| Soverom | 1, side 8 | 2, side 4 |
| Fellesutgifter | 1 020 kr/mnd, side 8/10 | 3 660 kr/mnd, side 4/26 |
| Fellesgjeld | 0 kr, side 8/11 | 0 kr, eksplisitt dokumentert side 28 |
| Kommunale avgifter | 12 957 kr/år, side 8/10 | Beløp mangler; inkludering omtalt side 26 |

Rostockgata side 26 har trykt nummer 32; side 28 har trykt nummer 34.
Referanser i kontrollen og applikasjonens `pdfPage` bruker fysisk PDF-side.
Fysisk side 22 er også gjengitt for kjøpskostnadskontekst.

Nøstegaten side 10/11 dokumenterer mulig økning i felleskostnader og uvisst
kostnadsomfang. Eiendomsskatt 3 942 kr er inkludert i kommunale avgifter og må
ikke summeres i tillegg. Overlapping mellom kommunale avgifter og
felleskostnader er ikke dokumentert avklart. Det foreløpige scenarioet med
25 197 kr/år (= 1 020 × 12 + 12 957) krever derfor den synlige antakelsen om
at kommunale avgifter kommer i tillegg; det er ikke full drift.

Rostockgata side 26 viser underposter 2 704 + 159 + 797 = 3 660 kr/mnd.
Disse er innhold i samme total, ikke tillegg. Side 27 beholder forbeholdet om
årlig avregning av varme/varmtvann. Foreløpig kostnadsfradrag er 43 920 kr/år;
full drift og kostnadsår er ikke avklart.

## Leie og matematikk

| Kontroll | Nøstegaten | Rostockgata |
|---|---|---|
| Publisert Hybel/Menon Q3 2026 | 13 891 kr/mnd | 20 426 kr/mnd |
| Lokal SSB 2025-referanse | 12 000 kr/mnd | 18 900 kr/mnd |
| BRA-tilpasning i SSB | 40 m²-punkt | Merket ytterpunktstilnærming 59 → 60 m² |
| Individuell markedsleie | Ikke beregnet | Ikke beregnet |
| Bruttoyield ved Hybel-nivå | 4,12 % | 2,85 % |
| Foreløpig netto ved Hybel-nivå | 3,49 % | 2,34 % |

Dagens domeneformler ble kontrollert mot uavhengig regnestykke:
`brutto = månedsleie × 12 / pris × 100`,
`foreløpig netto = (månedsleie × 12 − foreløpig kostnadsfradrag) / pris × 100`.
Full nettoyield og kontantstrøm forblir ukjent ved manglende fullstendig drift.
Publiserte gruppereferanser holdes adskilt, og brukerjustert leie skal være
scenarioforutsetning. Sliderens faktisk synlige binding må godkjennes i
hovedagentens og QA-agentens nye nettleserprøver.

65 kilder fra økonomi, boligdata og lokal risiko ble kontrollert: dokumenthash,
aktuelt visningsnavn, fysisk sidenummer og eksakte tekstoffseter/sitat samsvarer
med det hashbundne grunnlaget. Dagens regler hentet alle kontrollverdier uten
manuelle korrigeringer.

## Risiko og gjenværende dekning

Nøstegaten side 90 og Rostockgata side 40/43 er sett i originalgjengivelse.
Rostockgata har grafiske TG1-merker og egne områder for tekniske opplysninger;
et manglende TG2/TG3-treff er ikke bevis på komplett teknisk gjennomgang.
Dagens resultat beholder `technical.status = blocked`,
`coverage.technical.status = incomplete` og delvis lokal risikodekning.
Mulige tekstfunn fra ufullstendig uttrekk blir ikke dokumenterte TG-funn.
Juridisk søk erstatter ikke grunnbok, kommunens arkiv eller juridisk kontroll.
Dette er dokumentert prototypebegrensning og må forbli synlig i UI.

## Resultat og endringer

Ingen kritisk feil i de eide analyse-/domenefilene ble dokumentert. Derfor er
ingen kode endret her. Kontrollen finner ikke rotårsaken til den rapporterte
20-sekunders importfeilen; det ansvaret ligger hos import-/stabilitetsagenten.
Ingen sak i sentral oversikt er lukket på grunnlag av denne fagkontrollen.

Kjørt 2026-11-05:

```sh
node private/incoming/stabilization-quality/audit.ts
node private/incoming/stabilization-quality/reference-math.ts
npm test -- tests/unit/published-rent-references.test.ts tests/unit/provisional-cost-scenario.test.ts tests/unit/explicit-document-economy.test.tsx
```

Resultat: faglige assertions bestått; 3 testfiler / 49 tester bestått.
Endelig godkjenning avhenger av ny faktisk brukerflyt og uavhengig QA.
