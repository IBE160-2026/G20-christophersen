# R1 — live-beslutning og portlukking, 2026-10-23

## Bestilling og tidligere stopp

Mads ba først om å lukke R1 med OpenAI GPT-6.1 Sol, Responses API,
offisiell JS/TS-SDK, strengt Structured Outputs-schema, reasoning low,
ett kall per rapport med eksisterende side-tagget PDF.js-tekst, ingen
OCR/vision, 120 s live-timeout, ingen retry, backendmiljønøkkel og helt
offline demo. S5 ≤5 minutter skulle fortsatt være et evalueringsmål.
Kun nødvendige plan-/kontraktendringer var bestilt; ingen Epic 4-kode.
Ved reell konflikt eller manglende beslutning skulle arbeidet stoppe.

Første kontroll stoppet uten dokument-/kodeendringer eller commit fordi
godkjent prosjektbudsjett manglet i Epic 4-porten/readiness. Dette var et
eksisterende gjennomføringskrav, ikke et nytt produktkrav.

Oppfølgingsprompten:

> Fullfør og lukk R1.
>
> Godkjent live-testbudsjett for semester-v1 er USD 20 totalt.
>
> Bruk allerede avklart teknisk R1-beslutning:
> OpenAI GPT-6.1 Sol, Responses API, offisiell JS/TS-SDK, Structured Outputs, reasoning low, ett kall per rapport, 120 s timeout, ingen retry, backend-only API-nøkkel og offline demo.
>
> Dokumenter også:
> - gjeldende Standard-prisgrunnlag: $2/M inputtokens og $10/M outputtokens
> - live-kjøringer skal være sekvensielle
> - forventet kapasitet er tilstrekkelig for prosjektets én-kall-per-rapport-bruk, mens faktisk kontogrense verifiseres før live-test
> - stopp videre live-testing hvis samlet prosjektforbruk når USD 20
>
> Oppdater nødvendige R1/readiness/sprintdokumenter og kontrakter.
> Ikke implementer Epic 4 ennå.
>
> Hvis alt er konsistent:
> - lukk R1
> - lag lokal commit
> - ikke push
>
> Rapporter kort status, commit og eventuelle blockers før 4.1.

## Grunnlag og avstemming

Lest Epic 4-porten og Story 4.1–4.5, readiness, sprintplan/-status, final
arkitektur, SPEC med grensekontrakter/verifikasjon/sporbarhet og R2/R3-føringer.
Kursføringer er brukt via eksisterende
[kildeuttrekk fra sensorveiledningen](../../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md)
og faglærerfeedback/revisjonskontroll under briefen: smalt scope, synlig
kostnadsramme og auditerbart spor fra beslutning til senere implementering.
Ingen nye krav er utledet fra kursveiledningen.

OpenAI Docs-skillen er brukt til kontroll av offisielle sider. Datert
modell-/pris-/SDK-/Structured Outputs-grunnlag og kildelenker står i
[R1-beslutningen](../../planning-artifacts/r1-live-ki-semester-v1.md).
Modell-ID, low-støtte, kontekst/output og Standard-pris er kontrollert;
langkontekstprisen over 272 000 inputtokens er synliggjort. Ingen konto,
nøkkel eller betalt API er brukt. Kapasitet og kostnad er forventninger/
regneeksempler, ikke målinger eller bestått live-evaluering.

Avstemmingen presiserer følgende innen eksisterende Deferred:

- R3s lokale dokumentfase 60 s etterfølges av separat absolutt 120 s-livefrist.
  Demo beholder sin samlede 60 s-frist; S5-måling endres ikke.
- Strengt leverandørschema mappes til felles kontrakt med backendstyrt
  identitet og eksplisitte feil/usikkerheter. Ingen runtime-schema/versjon endres.
- USD 20 følges på tvers av testøkter med sekvensielle forsøk, konservativ
  reservasjon, kostnadsavstemming og stopp; ingen ny betalingsfunksjon.
- SDK-pakkeversjon, konkret schema/prompt og faktisk transport-/faseverifikasjon
  hører til de eksisterende 4.1–4.3-leveransene. Faktisk kontogrense sjekkes
  før live-test i 4.4/4.5. Ingen utsatt produktbeslutning kamufleres som implementert.

R1 er closed med dato/eier/beslutningslenke i sprintregisteret og med samme
status i readiness/sprintplan. SPEC, arkitektur, grensekontrakter og
verifikasjon/sporbarhet adopterer beslutningen; Epic 4 har en datert portnote.
Godkjente story-AC, produktregler, UX og runtime-kode er bevart.

## Verifikasjon og sluttstatus

Dokumentkontrollen består: YAML er parset med Rubys standardbibliotek;
R1 er closed med eksisterende beslutningsfil, alle `development_status`-
verdier og øvrige portobjekter er identiske med baseline. Alle 37 fullstendige
storytekster og deres AC er byte-identiske med baseline; bare Epic 4s
portnote er lagt til. Alle 19 nye lokale dokumentlenker peker til eksisterende
filer. Kostnadsregningen 0,16/0,64/1,12 og 1,48/10,36 USD er kontrollert
uavhengig med Python Decimal. `git diff --check` er grønn, og src/tests/
package.json/låsfil er uendret. Ingen produkttester er nødvendige for denne
rene dokumentendringen; ingen app-/SDK-installasjon, live-kjøring eller push
er utført.

Direkte forutsetninger for 4.1 er done (1.2/2.4/2.5), og ingen
beslutningsblocker gjenstår før 4.1. R4-S6/5.4 og R4-S5/faktisk S5-måling
står fortsatt åpne og blokkerer ikke 4.1. Epic 4/4.1–4.5 forblir backlog;
implementering krever senere bestilling. Samlet readiness er CONCERNS.

Den løpende råloggen `session-01a16820-0eeb-71b0-9ec3-4f9e616c1d87.jsonl`
var utrackert ved start og bevares urørt utenfor dokumentcommiten. Denne
arbeidsøkten lagrer den stabile bestillingen, beslutningen og kontrollsporet.
