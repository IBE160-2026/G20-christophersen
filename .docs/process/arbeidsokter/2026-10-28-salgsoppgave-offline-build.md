# Arbeidsøkt: godkjent offline salgsoppgave

Oppdraget er dispatch fra `bmad-build`: les hele
[den godkjente arbeidsplanen](../../implementation-artifacts/spec-salgsoppgave-offline-build.md)
og begge frontmatter-kontekstfilene, implementer den og rapporter faktisk
verifikasjon og risiko. Aktiv brukerprompt og presiseringer bevares automatisk i
[promptloggen](../prompts/session-01a18445-b28a-71e2-af47-e969cbb8c90f.jsonl).
Tidligere promptlogger er ikke redigert. Ingen commit eller push er utført av
implementeringsagenten; hovedagenten eier uavhengig diff-/AC-review og commit.

## Styring og konkrete rettinger

Godkjent scope er én sammenhengende offline-reise, med 200 sider / 50 MiB,
selektivt kombinert økonomi/TG-grunnlag, ingen OCR/automatisk vedleggsutpakking
og stengt ny live-grense. Detaljkrav/SO-AC1–15 er normative; ingen finans- eller
screeningregel er endret. FINN og legacy 30-siderskontrakt er bevart.

Hovedagentens kontroll under implementeringen førte til konkrete rettinger:

- Et stort dokument med eksplisitt kort rapport og 190 utelatte sider ble lagt
  til med håndskrevet fasit før generator/adapterdata.
- Gjeldsbetaling basert på brukerens finansiering merkes som forutsetning.
  Norske status-/feilmeldinger og dokumentdetaljer erstatter rå enum/feilkoder
  i hovedteksten. FINN er et eksplisitt alternativ bak detaljer.
- Brukerkorrigert TG-kilde kan ikke flyttes til ulest/rasterpåvirket side eller
  utenfor rapportområdet; deknings-/identitetsmangler kan ikke bekreftes bort.
- Kombinert strict request gjenbruker eksisterende TG-regler. Ren lokal
  preflight håndhever 100000 input / 16000 output inkl. reasoning og krever en
  verifisert modelltilpasset lokal teller for hele requesten. Ingen slik teller
  er installert. Live er fortsatt ubetinget stengt; ingen API-telling utføres.
- En digest-test avdekket nøkkelrekkefølge i JSON; kanonisk serialisering binder
  samme request stabilt til prompt/schema/modell/tekst/metadata.
- FINN-objektbytte tømmer importkontekst og avbryter importklienten. Sene
  import-/legacy-hendelser kan ikke flytte gamle kilder eller gates til nytt objekt.
- Ny envelope skiller pålitelig tekstlag fra ubehandlet raster. Rasterlogo kan
  ikke skjule lesbare økonomiposter; raster inne i rapport sperrer fortsatt
  komplett teknisk dekning uten OCR. Begge tilfeller har nye syntetiske tester.

## Verifikasjon og avgrensning

[Samlet bevis og AC-spor](../../implementation-artifacts/salgsoppgave-implementation-2026-10-28/verifikasjon.md)
skiller en grønn full regresjon før siste rettelser fra siste målrettede tester,
UI-prøver og fortsatt uavhengig sluttreview. Første fulle kjøring konkurrerte med
E2E-server på port 3000 og overbelastet testworkers. En egen påfølgende kjøring
var grønn. En virkelig legacy-regresjon i standardrouterens global-lås ble
rettet ved å injisere den delte låsen bare der den faktiske appserveren deler
ny/gammel inngang. Standalone legacy-router bevarer tidligere sesjonsatferd.

Sensorveiledningen og faglærerens tilbakemelding er brukt for sporbarhet,
vanlig kode for finans, uavhengig fasit, lokal kjørbar demo og ærlige testbevis;
ingen ny produktregel er utledet fra kurskildene. Historiske S5/S6 og de
opprinnelige 13 salgsoppgave-fixturene/fasitene er bevart. Nye fem originaler
har egen fasit/generator/hashmanifest og visuell kontroll. Ingen reelle
kundedokumenter, eksternt betalt kall eller endret automatisk promptlogging.

## Hovedagentens sluttføring 2026-10-29

Tre kontekstfrie BMAD-reviewere leverte 14 funn, inkludert overlappet D-år.
Alle ble triagert før gruppering; hovedagentens ekstra PDF-kontroll fant og
fikk rettet én ugyldig fontreferanse i inline-fixturen. Tolv gjenstående rotårsaker
ble rettet innen godkjent scope. De tre fokuserte nykontrollene returnerte `[]`.
Alle endelige råutskrifter, AC-spor og begrensninger finnes i leveringsverifikasjonen.
TS-prosjektet for UI-unit-testen ble korrigert uten å gi backend DOM/JSX-globaler.
RT-12 åpner nå hashens detaljfelt og beholder alle opprinnelige kontroller;
215 fullrunde + 2 beståtte reruns dokumenteres som separate kjøringer.
Aktiv promptlogg, kurskilder, historisk S5/S6, deterministisk finans og FINN
er bevart; commit skjer lokalt, uten betalt kall eller push.
