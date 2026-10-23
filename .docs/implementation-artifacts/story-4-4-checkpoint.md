# Story 4.4 — rent checkpoint før live-kjøring

Dato: 2026-10-23. Status: stoppet før implementering og betalt forsøk.
Baseline: `91d4c8661a413d4bdded8a59e92ef91a635bb057` på `main`.

## Verifisert preflight

Første sekvensielle subagent leste Story 4.4 AC1–AC6, vedtatt
[R1](../planning-artifacts/r1-live-ki-semester-v1.md), Epic 4-kontekst,
done-specen for Story 4.3, fixturegrunnlaget og backendens konfigurasjonsgrense.
Backend leser `OPENAI_API_KEY` fra prosessmiljøet, uten automatisk `.env`-lasting.
En kontroll av bare tilstedeværelse viste at variabelen manglet eller var tom
i agentens arvede prosessmiljø. Ingen `.env*`-filer ble funnet i reporoten.
Ingen nøkkelverdi er lest ut, skrevet eller forsøkt hentet fra andre apper.

Ingen faktisk kontogrense, betalings-/modelltilgang, avstemt kumulativt
prosjektforbruk eller uavklarte belastninger er dokumentert for denne kjøringen.
Ingen kontokontroll eller betalt forespørsel er utført. R1s godkjente USD 20
er en ramme, ikke bevis på tilgjengelig kontokvote eller gjenstående saldo.

Brukerens uttrykkelige stoppregel utløses av den manglende miljønøkkelen.
Ingen Story 4.4-kode eller spec er opprettet, ingen fasit eller låste krav er
endret. Story 4.4 og 4.5 beholder backlog i sprintstatus. Planleggingens
BMAD build stoppet under tidlig kontekst/preflight før step-02.

## Live-resultater og kostnad

- F1–F4: ikke kjørt. Ingen originale live-uttrekk eller terminalutfall finnes
  fra denne arbeidsøkten.
- S2: ikke evaluert; nødvendig live-bevis mangler. Ingen beståttpåstand.
- Faktiske API-forsøk i denne arbeidsøkten: 0. Registrert API-tokenforbruk: 0.
  Kostnad for denne arbeidsøkten: USD 0. Prosjektets tidligere kumulative
  forbruk er ikke avstemt; det settes ikke lik null.
- Ingen uavhengig live-evaluering eller BMAD code review er startet, siden
  brukerens stoppregel gjelder før slike lag. Ingen reviewfunn eller rettinger.
- Ingen Story 4.5, S5-måling eller automatisk retry er startet.

Eksisterende [F1–F4-fasit](../../tests/fixtures/property-cases/expected.json)
og [fixturebeskrivelse](../../tests/fixtures/property-cases/README.md) beholdes.
Fasitens fire TG2 og ett TG3, inklusive fysisk PDF-side 4 for F4s TG3,
skal evalueres på originale modelluttrekk før brukerrettinger. F3s manglende
L bevares; rapporten evalueres ved adaptergrensen etter AC6.

## Nødvendig før gjenopptak

1. Gjør en gyldig `OPENAI_API_KEY` tilgjengelig i miljøet som starter
   Codex/backend. Ikke lim nøkkelen inn i chat, kommandoargumenter, logger eller
   repo. Bruk lokal hemmelighetshåndtering eller skjult terminalinput, og start
   en ny agentøkt som arver miljøet. En eksport i en separat terminal endrer
   ikke miljøet til en allerede kjørende Codex-prosess. Prosjektet laster ikke
   automatisk en `.env`-fil.
2. Verifiser i leverandørkontoen at prosjekt/nøkkel har betalingsaktivering,
   tilgang til vedtatt `gpt-6.1-sol`, tilstrekkelige RPM/TPM-grenser og
   forbruksgrense. Registrer dato, prosjektidentitet uten hemmeligheter og
   faktiske grenser under `.docs/implementation-artifacts/`.
3. Registrer prosjektets samlede tidligere live-forbruk i USD, eventuelle
   uavklarte belastninger og gjenstående del av USD 20 i samme bevisgrunnlag.
   Avstem timeout/avbrudd hos leverandøren. Hvis ingen tidligere forsøk finnes,
   dokumenter dette eksplisitt med avstemmingsgrunnlag. Ingen uavklart
   belastning kan regnes som gratis.
4. Gjenoppta Story 4.4 fra dette checkpointet. Dokumenter før forsøk: uendret
   fasit, rapporthash, kode-/kontrakt-/prompt-/schema-/modellversjon, planlagte
   eksplisitte sekvensielle forsøk, kontrollert prisgrunnlag og konservativ
   reservasjon for hele neste request. Produksjonsoppstarten er
   `ANALYSIS_MODE=live npm run demo` etter build og sikkert satt backendmiljø.
   Ikke kjør nå bare for å prøve nøkkelen; slike forsøk inngår også i regnskapet.

Gjenopptatt kjøring følger eksisterende AC/R1: F1/F2/F4 gjennom hovedflyten,
F3 ved adaptergrensen, originalbevis før retting, ny uavhengig evaluator og
deretter ny BMAD code review-agent. Ingen 4.5 eller endring av låste krav.

## Kontroll og prosesspor

Dette er et dokumentcheckpoint. Root-agenten kjører og rapporterer eksisterende
relevante tester/full regresjon separat; dette notatet påstår ingen bestått
testkjøring. Arbeidsnotatet er kontrollert med `git diff --check` før commit.
Kursføringer er brukt via eksisterende
[sensoruttrekk](../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md)
og godkjente planartefakter: auditerbar prosess, smalt scope og ærlig skille
mellom planlagt og faktisk verifisert funksjonalitet. Ingen nye kurskrav.

Bestilling og stoppgrunnlag er bevart i
[arbeidsøkten](../process/arbeidsokter/2026-10-23-story-4-4-checkpoint.md).
