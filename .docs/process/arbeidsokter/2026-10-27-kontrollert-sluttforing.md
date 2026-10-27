# Kontrollert sluttføring — 27. oktober 2026

## Bestilling og autoritet

Mads bestilte fem sekvensielle faser: UX, uavhengig review, ekstern
S6-forberedelse, leveringsforberedelse og sluttregresjon/checkpoints.
Originalbestillingen er bevart i den aktive
[promptloggen](../prompts/session-01a17efd-94fb-7371-9d49-49c778c25b46.jsonl).
Ingen separat loggmekanisme eller omskriving av tidligere logger brukes.

Startrevisjon: `2dadc800daafa8b1640ccd08bf91a302fbc9cfb0`, branch `main`.
Ved start var bare denne øktens promptlogg uversjonert. Plan og avgrensning:
[sluttføringsspec](../../implementation-artifacts/spec-kontrollert-sluttforing-2026-10-27.md).
BMAD-build ble rendret én gang fra installert skill. Brukerens uttrykkelige
bestilling av alle faser og regelen om avklaring ved vesentlige produktvalg
styrte gjennomføringen. Ingen nytt produktvalg eller endret kontrakt.

Sensorveiledningens s. 1–7 er lest gjennom faktisk PDF.js-tekstuttrekk fra
originalen. `pdftotext` manglet; ingen krav er hentet fra antatt innhold.
Faglærerfeedback, DESIGN/EXPERIENCE, epics og eksisterende status/waiver er
brukt som grunnlag. Det er ikke innført karakter-, deknings- eller
sertifiseringskrav.

Ressursønske: omtrent 70 prosentpoeng av 5H-kvoten, reserve 5–10 %.
Agentmiljøet tilbyr ingen måling av denne kontokvoten; faktisk prosentforbruk
kan derfor ikke dokumenteres eller garanteres. Ferdig verifisert arbeid og
reelle porter prioriteres. Ingen push/pull eller betalte API-kall.

## Fase 1 — faktisk UI-arbeid

En implementeringsagent fikk sluttføringsspecen som kilde og arbeidet med
UI før uavhengige reviewere. Endringer er begrenset til `styles.css` og
gruppering av feltbeskrivelsen i `FinancialInput.tsx`. Alle kontrakter,
beregninger, porter, tilstandsoverganger og testforventninger er bevart.
Se [visuell egenkontroll](../../implementation-artifacts/sluttforing-2026-10-27/visuell-egenkontroll.md)
for faktisk inspeksjon og bildeindeks.

## Fase 2 — review og verifiserte rettinger

Tre kontekstfrie reviewagenter: `review_blind`, `review_edge` og
`review_verification`, etter BMAD-builds uavhengige reviewlag. Alle ble
startet før triage. Implementeringsagenten fikk bare verifiserte patchfunn
tilbake. [Reviewrapport](../../implementation-artifacts/sluttforing-2026-10-27-review.md)
bevarer hvert funn og håndtering. En separat rekontroll av patchene fant
ingen gjenværende verifiserte feil innen avgrensningen.

Eksisterende fokusprøver avdekket fire reelle CSS-regresjoner; rødlogg er
bevart. Smale/korte flater ble rettet uten endrede forventninger, og alle
24 målrettede prøver består. Auditverktøyet beskytter nå tidligere bilder og
avslutter egne ressurser ved launchfeil. Negative guardprøver er gjennomført.

## Testmiljø og begrensninger

Verts-Node er 26.8.1. Etter innledende lesing/build ble videre kontroller
flyttet til eksisterende Node 24.21.0/npm 11.19.0 og lokal Chromium-cache.
Prosessmiljøet er tomt unntatt nødvendige OS-/verktøyvariabler; ingen ekte
API-nøkkel eller arvet live-modus. OS-nettprofilen sperrer eksternt nett og
tillater loopback. Testenes live-navn betyr kontrollerte lokale grenser.

En eksisterende server på port 3000 annonserte live-modus ved den første
sidevisningen. Bare siden og modusmetadata ble lest; ingen analyse ble
sendt til denne serveren, og den ble ikke stoppet. Brukeren ble spurt
asynkront om stopp. Mens svaret var ubesvart, ble en trygg alternativ
testkopi på port 3107 klargjort. Ingen godkjenning er utledet av stillhet.

Første root-Vitest ga 1080/1082: to serveroppstartstester feilet på opptatt
port. De tre servermodustestene består på ledig port. Endelig full
unit-/integrasjonskjøring består 1082/1082 i isolert kopi.
[Portmanifest](../../implementation-artifacts/sluttforing-2026-10-27/isolated-test-copy.json)
og [kildemanifest](../../implementation-artifacts/sluttforing-2026-10-27/tested-source-manifest.json)
viser adressemappingen og 188 kilde-/testfiler uten uventede forskjeller.
Avhengigheter i denne kopien er symlinket; dette er ikke ren installasjon
eller ekstern S6.

Faktisk kjørte kommandoer, exitstatus og rålogger samles i
[regresjonsindeksen](../../implementation-artifacts/sluttforing-2026-10-27/final-regression.json).
Ingen ny S5-måling eller endring av opprinnelige observasjoner inngår.
