# Story 4.4 — eksplisitt engangsevaluering

Hjelperne ligger utenfor `npm test` og Playwrights testoppdagelse. `run.mjs run`
bruker produksjonsadapteren og et ekte betalt leverandørkall; kommandoen skal
aldri brukes som en rutinetest. De fire godkjente originalcasene er allerede
fullført og skal ikke gjentas. Bevis skrives eksklusivt, og en delt lås hindrer
samtidige forsøk mellom prosesser.

Opprinnelige kommandoer ble kjørt sekvensielt med Node 24.21.0, sikkert arvet
backendmiljøvariabel `OPENAI_API_KEY` og `PLAYWRIGHT_BROWSERS_PATH` satt til den
eksisterende nettlesercachen:

```sh
node tools/story-4-4/run.mjs prepare F1
node tools/story-4-4/run.mjs run F1
# Først etter avstemming av faktisk usage: F2, deretter F3 og F4 på samme måte.
```

`prepare` gjør ekte PDF.js-uttrekk og registrerer hash, versjoner, pris,
requeststørrelse, tidligere kumulativ kostnad og USD 1.48 reservasjon. `run`
kontrollerer planen, tar låsen og sender én ekte forespørsel gjennom uendret
produksjons-SDK. Observatøren kontrollerer den planlagte forespørselen ved å
normalisere bare kodegenerert request-ID, registrerer eksakt dispatch-hash før
fetch og bevarer leverandørbody og tillatte headere før prosessopprydding.
Authorization lagres aldri. Feil eller ukjent kostnad beholder låsen og hele
reservasjonen.

`reconcile F1` ble brukt én gang til avstemming av kjent usage etter en lokal
runnerstopp. Eksakt opprinnelig stoppsted mangler feillogg. `replay-control F1`
besvarer nettleserens HTTP-forespørsel lokalt med bevart originalutfall og bare
ny korrelasjons-ID. Dette gir **null leverandørkall** og separate UI-bevis, ikke
et nytt ekte live-forsøk. Første replay stoppet på harde mellomrom i formaterte
tall; andre replay fullførte etter normalisering av mellomrom. Originalbevisene
er bevart.

Etter review avvises `replay-control F3` før backendarbeid. Nye låser inneholder
fixture-ID og unik forsøks-ID. Avstemming krever samme identitet i startbevis
og lås før en kvittering merkes med kjent kostnad eller låsen frigis. Historiske
låser uten eier må beholdes for manuell avstemming; de blir aldri overtatt
stilltiende. Tokenverdier, cachetotaler og alle kjente kostnader må valideres
før reservasjonen frigis. Bind-feil fanges og beholder feilbevis og eid
lås/reservasjon.

S2-telleren krever et separat, komplett fasitsett med forventede ID-er og grader,
og nøyaktig dekning i vurderingsradene. Manglende rader avvises, også oversett
TG2 eller et hvilket som helst TG3. Immutabilitetsprøven kontrollerer uendrede
inputdata; hjelperen tar ikke et rettingsargument og beviser ikke isolasjon fra
brukerrettinger i produktet. Semantisk vurdering krever fortsatt original-PDF
og leverandøruttrekk. Prøvene gir ingen påstand om betalt modellkvalitet eller
S5-tid. Produktkode og fixtures er ikke endret.

Avgrenset offline-verifikasjon:

```sh
node --test tools/story-4-4/evaluate-s2.test.mjs tools/story-4-4/run-safety.test.mjs
```

Fremtidige `prepare` registrerer SHA-256 for hjelpernes kilde- og testfiler.
Sluttmanifestet `story-4-4/helper-manifest-post-review.json` registrerer bare
versjonene **etter review**. Tidligere hjelpersnapshots/hash ble ikke bevart
mens hjelperen ble endret under originalkjøringene; sluttmanifestet kan ikke
rekonstruere dem. Opprinnelige dispatch-/request-hash dekker bevart prompt- og
schemainnhold; planene identifiserer også produktkodens commit. Ingen historisk
plan, leverandørbody eller kvittering er omskrevet for å antyde historiske
hjelperhash.
