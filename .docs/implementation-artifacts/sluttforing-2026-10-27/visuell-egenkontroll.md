# Visuell egenkontroll — 27. oktober 2026

Dette er intern Chromium-egenkontroll av lokal demo, ikke ekstern S6 eller ny S5-måling. De eksisterende førbildene er bevart uendret.

## Endringer og observerbar virkning

- `FinancialInput.tsx`: Feltbeskrivelsen står nå direkte mellom samme etikett og input. Alle ID-er, etikettkoblinger, beskrivelser og kontrollers innbyrdes tastaturrekkefølge er bevart.
- `styles.css`: Tallraden samler verdi/definisjon og periode i to kolonner på desktop, med tilhørende kilder på sekundærflate. Smal visning beholder to kolonner i stepperen; alle fire navn, nummer og statuser er fortsatt tekstlig tilgjengelige.
- Rapportidentitet, analysestatus, TG3-avklaring og separat listebekreftelse har tydeligere grenser og avstand. Resultatets rapportgrunnlag og behovsåpnete sporbarhet er gruppert med lesbare avsnitt. Palett, fokuskontrakt, fire nøkkeltall, anbefaling og historisk tilstand er bevart. PDF-bruddpunkt og 44/56-deling er uendret.

## Faktisk bildeinspeksjon

Alle 15 PNG-er i `before/` og alle 21 PNG-er i `after/` ble åpnet og visuelt inspisert. Felles tilstander er `tall-tom`, `tall-feil`, `rapport-tom`, `rapport-feil`, `tg3-kontroll`, `resultat` og `resultat-utdatert` ved 1440×900 og 390×844, samt `390-pdf-panel`. Etterserien inkluderer også `listebekreftelse`, `resultat-rapport` og `resultat-sporbarhet` i begge størrelser.

Observasjon: Etikett og forklaring kan leses samlet ved finansfeltet. Ved 390 px vises fire trinn i to rader, slik at mer av arbeidsflaten er synlig. TG3 og listebekreftelse fremstår som separate grupper. Rapportnavn/hash ombrytes og PDF-panelet beholder originalside 4 og returhandling. Resultatets anbefaling, fire tall og historiske merking er bevart; rapportdelen har tydelig seksjon og behovsåpnete kildedetaljer.

Skjermbildene er viewport-utsnitt av en rullbar arbeidsflate, ikke fullstendige utskrifter av alt innhold. En høy TG3-gruppe eller feilliste kan derfor strekke seg utenfor bildet og leses ved rulling. `resultat-rapport` og `resultat-sporbarhet` dokumenterer delene nedenfor første resultatutsnitt.

## Verifikasjon og avgrensning

- Node 24.21.0: `node node_modules/typescript/bin/tsc -b` bestått.
- Node 24.21.0: `node node_modules/vite/bin/vite.js build` bestått. Vites eksisterende varsel om bundle over 500 kB består.
- `node tools/finalization/visual-audit.mjs after` bestått med tomt miljø, eksisterende OS-nettsperre og Chromium-cache. Verktøyet oppretter egen tilfeldig loopback-demoport; eksisterende server på port 3000 ble ikke brukt eller stoppet.
- `after/observations.json`: Ingen side- eller workspace-overløp i alle 21 utsnitt, og 0 eksterne forespørsler i begge størrelser.
- `git diff --check` bestått.

Full regresjon og uavhengig review utføres av hovedøkten etter fase 1. Ingen testforventninger er endret. Relevante eksisterende tester er `tests/e2e/app-shell.spec.ts` (typografi/palett og fokus/ombryting ved 1440×900 til 320×160), `report-analysis.spec.ts` (PDF, 44/56-flate, smalt panels headingfokus/fokusfelle/Esc/retur og korte TG3-flater), `financial-input.spec.ts`, `screening-result.spec.ts` og komponenttestene for resultat/nøkkeltall.
