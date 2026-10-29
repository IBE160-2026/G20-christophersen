# Arbeidsøkt: godkjent code-first salgsoppgave

Mads godkjente [arbeidsplan og AC](../../implementation-artifacts/spec-salgsoppgave-code-first.md)
2026-10-29, inklusive GPT-6.1 Sol og USD 0,20 for samlet analyse med separat
rapport. Implementering, offline-tester og uavhengig BMAD-review er autorisert.
Betalte kall og push er ikke autorisert; første live-test krever egen godkjenning.
[Aktiv promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl)
har både opprinnelig bestilling, godkjenning og brukerens beskjed om å fortsette.
Tidligere promptinnhold er bevart, og automatisk logging er uendret.

`bmad-build` er videreført fra designcheckpointet uten ny rendering. Arbeidsplanen
ble lest fra disk før godkjenningen ble registrert og implementering delegert
til en kontekstfri agent, etter workflowens step-03. Hovedagenten eier
diff-/AC-kontroll, uavhengig review og lokal commit. Baseline i planen er
`15402fc307726e0528c1ae0a068b36ab3dee5845`; designcheckpointet er
`ab3981ea3403f26eda8aaa0ee32f89c669b2b3b4`.

Under byggingen påpekte hovedagenten at lokal eksplisitt behandling og semantisk
økonomi måtte være med, ikke bare TG-resttekst. Implementeringen ble utvidet med
lokale felt-/funnregler, støttede økonomiske relasjoner, kildebelagte forslag og
referanser som bevarer tekstfortsettelser. Ingen finans-/screeningregel er
endret som følge av dette. En bruksgrense avbrøt implementeringsagenten før
overlevering; arbeidet ble beholdt på disk og videreført etter brukerens
«fortsett der du slapp». Ingen testresultater fra før avbruddet regnes som
sluttakseptanse uten kontroll av faktiske bevis.

Første hovedagentkjøring: 36 nye import-/budsjettprøver bestod under pinned
Node 24.21.0/npm 11.19.0 med tom nøkkel og demo. Råbevis:
[initial-targeted.txt](../../implementation-artifacts/salgsoppgave-code-first-2026-10-29/initial-targeted.txt).
Videre sluttresultater og faktisk review føres i
[leveringsverifikasjonen](../../implementation-artifacts/salgsoppgave-code-first-2026-10-29/verifikasjon.md).

Kursveiledning og faglærerfeedback fra designet videreføres for sporbarhet,
uavhengig fasit, enkel pipeline og vanlig kode for finans. De gir ingen ny
modell-/budsjett-/screeningregel. Ingen reelle kundedokumenter skal versjoneres,
og offline-stubber dokumenterer ikke modellens faktiske semantiske TG-recall.

## Uavhengig review og sluttkontroll

Tre kontekstfrie BMAD-reviewlag ble startet samtidig. Hovedagenten innhentet
alle resultater før triage og registrerte hvert funn før gruppering.
17 funn, ett ekstra hovedagentfunn og to nyfunn ble rettet innen godkjent
intensjon. De to nyfunnene gjaldt tak/Tak og over 1000 restposter i en faktisk
200-siders original innen 1 MiB tekst. Se
[review, triage og kildebundet nykontroll](../../implementation-artifacts/salgsoppgave-code-first-2026-10-29/review.md).
Alle tre siste nykontroller er uten restfunn. Ingen funn er utsatt.

Hovedagenten kontrollerte også forståelige kostnads-/token-/stoppmeldinger i
UI og la til en prøve som viser USD 0,20-stopp, merkede testtokens og fysisk
rest uten rå blokk-ID-er i hovedteksten. Første fulle unit/integrasjon var
1356 bestått, neste etter første rettingsrunde 1379, og siste etter alle
rettinger **1384**. Rå bevis holdes separat; tidligere kjøringer er ikke
omdøpt til sluttakseptanse. Første nettleserregresjon hadde 218 bygget + 3 dev,
og alle 37 komponentprøver bestod. Endelig nettleserrunde kjøres på den siste
rettede/reviewede versjonen før commit.

Sluttbygget fanget en for snever TypeScript-inferens (`never[]`) i
teststubbens tomme limitations-array. Hovedagenten ga de tomme testlistene
eksplisitt `string[]`-type, uten kjøretidsendring eller endring av testforventning.
Det første byggforsøket bevares i final-acceptance-e2e.txt; ny full
nettleserkjøring og typekontroll dokumenteres separat.

78 låste finans-/screening-/historiske bevisfiler er byteidentiske med
baseline. Opprinnelig sentral oversikt og tidligere aktiv prompt er bevart
som prefix. Sentral PAA-SO2 er fortsatt åpen for reell live/kvalitet; denne
leveransen autoriserer ingen betalt eller første live-test.

Sluttkontroll: 218 bygget + 3 dev består etter parser-/adapterrettingene.
Siste, uavhengig kontrollerte presentasjonsretting har 11 berørte E2E og
58 runtime-/UI-prøver bestått, samt nytt grønt bygg/typekontroll og lint.
UI-bildet er visuelt kontrollert. Modus angir nå lokalt offline-uttrekk,
og hovedteksten samler identiske forklaringer uten å fjerne fysisk rest.
Alle 20 registrerte reviewfunn er rettet; ingen nye sentrale issue-systemer
eller endrede finans-/screeningregler er innført. Lokal commit med aktiv
promptlogg ferdigstiller offline-bestillingen. Første live-test er ikke startet.

Faktisk lokal løsningscommit: `16125bf0b617136c3c0c5507bc8ffdb0edfd13dd`.
Arbeidstreet var rent etter commit. Dette etterfølgende dokumentcheckpointet
registrerer den kanoniske identifikatoren uten produkt-/testendring.
