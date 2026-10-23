# Story 4.4 — rent checkpoint før live-kjøring

## Siste tilstand 2026-10-23 — live gjennomført, til review med avvik

Tidligere kontoblokkering er avklart med brukerens manuelle kontroll:
USD 2 hard spend limit, USD 0 tidligere prosjektforbruk og USD 5 prepaid.
USD 2 beholdes som strengere operativ ramme innen R1 USD 20.
Minimalt Responses-kall ga HTTP 200 og headere 5000 RPM / 1000000 TPM.
F1–F4 er deretter kjørt sekvensielt med ekte produksjonsadapter, ett kall
per rapport og ingen retry. Total inklusive minimalkall: 3881 inputtokens,
831 outputtokens og beregnet kostnad USD 0.016072. Ingen ukjent belastning.

Uavhengig S2-kontroll: 4/4 TG2 og 1/1 TG3 med riktig fysisk PDF-side,
ingen oppdiktede eller oversette. F4 TG3 er fysisk side 4 / trykt side 2.
F3 er kjørt ved adaptergrensen med L=null og ingen S5-hovedstart.

**Akseptanseforbehold:** F1/F2 gir Innhent mer informasjon fra modellens
generelle limitations; dette avviker fra forventet screening ved tilstrekkelig
rapportgrunnlag. F1s sluttkontroll/resultat er bare fullstendig bevist via
separat lokalt replay av originaluttrekket, uten nytt leverandørkall. AC6 er
derfor delvis. Originaler og fasit er bevart; produktavviket er sporet i
[deferred-work](deferred-work.md). Story 4.4 leveres til review med avvik,
ikke done eller fullt produktgodkjent. Ingen Story 4.5 eller S5-måling.

Videre arbeid skal starte fra [sluttkontroll](story-4-4-sluttkontroll.md),
[live-verifikasjon](story-4-4-verifikasjon.md),
[uavhengig evaluering](story-4-4-uavhengig-evaluering.md) og
[spec/reviewtriage](spec-4-4-gjennomfore-live-og-evaluere-s2.md).
Ikke kjør de fire forsøkene på nytt automatisk; gamle request-/provider-/
outcome-/receiptfiler er originale bevis. Eventuelt nytt budsjettavklart
forsøk må få ny identitet og egen reservasjon. Resten av checkpointet er
historiske preflighttilstander.

## Gjenopptak 2026-10-23 kl. 16:53 CEST — stopp ved kontoverifikasjon

Ny preflight på `dbd3369f4f665fe822d93d98190512d4a087550a` (`main`).
Bestillingen var å fortsette 4.4, kontrollere nøkkel/modell/kontogrenser og
gjenværende USD 20 før F1–F4, evaluere originaluttrekk mot S2, avslutte i
review og committe lokalt uten push. Brukerens stoppregel ved fortsatt
konfigurasjonsfeil gjelder før live-kjøring.

| Kontroll | Faktisk resultat |
|---|---|
| `OPENAI_API_KEY` | Tilgjengelig og ikke tom. Bare boolsk tilstedeværelse skrevet ut. |
| Modelloppslag | `GET /v1/models/gpt-6.1-sol`: HTTP 200, returnert modell-ID samsvarer. Dette verifiserer lesetilgang til modellen, ikke Responses-/betalingskvote. |
| RPM/TPM | Modelloppslaget returnerte ingen `x-ratelimit-*`-headere. Faktiske grenser er fortsatt ukjente. |
| Kostnadsinnsyn | `GET /v1/organization/costs?start_time=1788220800&limit=1`: HTTP 403. Ingen kostnadsdata mottatt eller avstemt. Responsbody ble ikke skrevet ut. |
| Administrasjonsoppsett | `OPENAI_ADMIN_KEY`, `OPENAI_ADMIN_API_KEY`, `OPENAI_PROJECT_ID`, `OPENAI_PROJECT`, `OPENAI_ORG_ID` og `OPENAI_ORGANIZATION` mangler. Bare tilstedeværelse kontrollert. |
| Gjenværende prosjektramme | Ikke verifisert. Tidligere samlet forbruk og uavklarte belastninger er fortsatt ukjente; USD 20 kan ikke regnes som ledig saldo. |

Første modelloppslag i sandbox feilet med `URLError` før HTTP-svar.
Samme lesekontroll med godkjent nettverkstilgang ga HTTP 200. Kostnadskallet
ble også kjørt med godkjent nettverkstilgang; HTTP 403 er derfor et konkret
innsynsproblem, ikke bare sandboxens nettbegrensning. Ingen nøkkelverdi,
Authorization-header eller rå feilbody er skrevet til terminal eller repo.

OpenAI Docs ble kontrollert samme dato:
[Admin APIs](https://developers.openai.com/api/docs/guides/admin-apis)
krever adminnøkkel for administrasjonsendepunktene;
[prosjektgrenser](https://developers.openai.com/api/reference/go/resources/admin/subresources/organization/subresources/projects/subresources/rate_limits)
leses for en kjent prosjekt-ID. Modell-/prissiden for
[gpt-6.1-sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
og [rate-limit-guiden](https://developers.openai.com/api/docs/guides/rate-limits)
erstatter ikke faktiske kontodata.

**Stoppgrunn:** manglende verifiserbart kontoinnsyn og avstemt restbudsjett.
Før neste gjenopptak må kontoansvarlig dokumentere riktig prosjekt, modellens
faktiske RPM/TPM, betalings-/forbruksgrense, samlet tidligere prosjektkostnad
og eventuelle uavklarte belastninger. Dette kan gjøres med daterte, hemmelighetsfrie
opplysninger fra kontoens Limits/Usage/Costs, eller med nødvendig sikkert
tilgjengelig admininnsyn og prosjektidentitet. Ikke lim inn nøkler i chat/repo.

F1–F4 er ikke kjørt i dette gjenopptaket. S2 er ikke evaluert. Antall
genereringsforsøk: 0; genereringstokens: 0; ny API-genereringskostnad: USD 0.
To HTTP-lesekall nådde leverandøren (modell 200, kostnad 403); ett tidligere
lokalt transportforsøk feilet. Ingen Responses-kall, retry, implementering,
evaluator, code review eller Story 4.5 er startet. Story 4.4 og 4.5 beholder
backlog; review ville vært uriktig uten leveransebevis.

Bare dokumentasjon endres. Produkttester er ikke kjørt på nytt; regresjonen
nedenfor gjelder forrige checkpoint. Ny dokumentkontroll og lokal commit
registreres i arbeidsnotatet. Eksisterende usporede JSONL-økter bevares urørt.
Prosesspor: [gjenopptaksnotat](../process/arbeidsokter/2026-10-23-story-4-4-gjenopptak.md).

---

Resten av dokumentet beskriver det opprinnelige checkpointet før nøkkelen
ble tilgjengelig, og beholdes som historisk bevis.

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

Dette er et dokumentcheckpoint. Root-agentens avsluttende regresjon er
rapportert nedenfor. Arbeidsnotatet er kontrollert med `git diff --check`
før commit.
Kursføringer er brukt via eksisterende
[sensoruttrekk](../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md)
og godkjente planartefakter: auditerbar prosess, smalt scope og ærlig skille
mellom planlagt og faktisk verifisert funksjonalitet. Ingen nye kurskrav.

Bestilling og stoppgrunnlag er bevart i
[arbeidsøkten](../process/arbeidsokter/2026-10-23-story-4-4-checkpoint.md).

## Avsluttende regresjon

Root kjørte eksisterende full regresjon etter checkpointcommiten
`1e3d156b0bb22a2a3aaf57bba0c5b998ab42c7e3`, uten produktendringer.
Node 24.21.0 og npm 11.19.0 ble brukt, med eksisterende Playwright-cache,
`OPENAI_API_KEY` og `ANALYSIS_MODE` fjernet fra testmiljøet og prosjektets
`story-5-3-nettprofil.sb` som tillater lokal loopback og sperrer eksternt nett.

- Typekontroll, lint og produksjonsbuild: bestått.
- Vitest, `npm test -- --maxWorkers=1`: 38 filer, 1059/1059 bestått.
- Bygget-app-E2E: 189/189 bestått.
- Dev/offline-E2E: 3/3 bestått.
- Komponenttester: 37/37 bestått.
- `verify-analysis-build.mjs`: build/demooppstart bestått, 204 frontendfiler
  kontrollert, 0 nøkkellekkasjer.

Alle kommandoer fullførte med exitkode 0. Ingen tester ble rettet, hoppet
over eller kjørt med automatisk retry. Rålogg i arbeidsmiljøet:
`/private/tmp/story44-checkpoint-regression.txt`; resultatene er bevart her
slik at tempfilen ikke er en leveranseavhengighet. Disse kontrollerte
offline-testene endrer ikke statusen for live/S2 eller Story 4.4/4.5.
