---
title: "R1 — Live KI-oppsett og testbudsjett i semester-v1"
date: 2026-10-23
decision_status: accepted
gate: R1
gate_status: closed
before_stories: ['4.1', '4.2', '4.3', '4.4', '4.5']
decision_owner: Mads
implementation_owner: live-integrasjon
---

# R1 — Live KI-oppsett og testbudsjett i semester-v1

**R1 er lukket som beslutningsport 2026-10-23.** Mads har vedtatt det
tekniske oppsettet og deretter USD 20 totalt til live-testing. Beslutningen
fyller Epic 4s gjennomføringsport, Story 4.1 AC1–AC5 og arkitekturens Deferred.
Den endrer ingen låste produktkrav eller story-AC og starter ingen implementering.
Epic 4 og 4.1–4.5 forblir backlog. Samlet readiness er fortsatt CONCERNS
fordi R4-S5/R4-S6 og faktiske evalueringsbevis gjenstår.

## Vedtatt oppsett

| Område | Bindende semester-v1-beslutning |
|---|---|
| Provider/modell | OpenAI, **GPT-6.1 Sol**, API-modell-ID `gpt-6.1-sol`. Ingen automatisk modellbytting eller fallback. |
| API/SDK | **Responses API**, offisiell OpenAI JavaScript/TypeScript-SDK (`openai`). Kompatibel konkret pakkeversjon velges, dokumenteres og pinnes i package.json/låsfil ved Story 4.1; ingen SDK installeres ved portlukking. |
| Reasoning/prisklasse | Eksplisitt `reasoning: { effort: "low" }` som prosjektstandard og Standard-prosessering (`service_tier: "default"`). Ingen automatisk opptrapping av reasoning eller prisklasse. |
| Input | Hele eksisterende side-taggede `DocumentBasis` fra PDF.js, med alle fysiske sideposisjoner, tekst og statuser. Én tekstbasert rapport på høyst 30 sider etter R2/R3. Ingen rå PDF-/bildeinput til modellen, OCR eller vision i semester-v1. |
| Kall og kjøring | Ett live KI-analysekall per ny rapport innen eksisterende økt-/modus-/hashbinding. Live-testkjøringer er **sekvensielle**, også på tvers av testøkter/prosesser; ingen parallelle prosjektforsøk. Uendret rapport og kontroll-/finans-/TG3-endringer gjenbruker uttrekket. |
| Output | **Structured Outputs med strengt JSON Schema**, Responses `text.format` med `type: "json_schema"` og `strict: true`. Leverandørskjemaet beskriver uttrekket; felles contracts eier fortsatt appens terminalutfall og kodebestemte identitet. |
| Live-timeout | **120 sekunder = 120 000 ms**, én absolutt frist fra live-adapteren starter leverandørforespørselen til terminalt validert adapterutfall. SDK `timeout: 120000`, kombinert med requestens abortsignal og håndhevet absolutt frist. Fristen nullstilles ikke ved responsheadere, body-chunks eller parsing. |
| Retry | Ingen automatisk retry i frontend, backend eller SDK; eksplisitt **`maxRetries: 0`**. Ingen reparasjonskall ved ugyldig JSON/schema, modellavslag eller ufullstendig output. |
| Nøkkel/demo | API-nøkkel leses kun i backend fra miljøvariabel **`OPENAI_API_KEY`**. Ingen nøkkel i frontend/build, Git, svar eller logger. Standard demo oppretter ingen KI-klient og fungerer helt offline uten nøkkel etter installasjon. |
| Budsjett/stopp | **USD 20 totalt** for prosjektets live-testing i semester-v1, på tvers av stories, testøkter og eventuelle manuelle gjentakelser. Stopp videre live-testing når samlet prosjektforbruk når USD 20; se kostnadsrutinen nedenfor. |

## Kapasitet og datert prisgrunnlag

Kontrollert 2026-10-23 mot [OpenAIs modellside](https://developers.openai.com/api/docs/models/gpt-6.1-sol):
modellen støtter Responses, Structured Outputs og reasoning low, med
**1 050 000 tokens kontekstvindu** og **128 000 tokens maksimal output**.
Dette er modellgrenser, ikke en dokumentert kontokvote eller målt fullføringstid.

Forventet kapasitet er tilstrekkelig for prosjektets én-kall-per-rapport-bruk
med høyst 30 sider og sekvensielle forsøk. Faktisk modelltilgang, kontoens
RPM/TPM-/forbruksgrenser og eventuell betalingsaktivering **verifiseres før
første live-test**. Ingen kontotilgang eller betalt prøve er utført her.

Story 4.2 kontrollerer hele serialiserte inputgrunnlaget inklusive prompt,
schema og alle sidemerker mot modellens kontekst, med plass til output og
reasoning. Outputbudsjettet må romme alle funn og usikkerheter; konkret
requestinnstilling dokumenteres med prompt-/SDK-versjonen i implementeringen.
Ingen stille avkorting, automatisk sidefiltrering, chunking eller ekstra
modellkall er tillatt. Overskredet kapasitet eller avkortet/ufullstendig output
gir trygg analysefeil, aldri completed tomliste. Modellgrensene innfører
ingen ny skjult tegn-/sidegrense eller endring av støttet produktscope.

**Gjeldende Standard-prisgrunnlag er USD 2 per million inputtokens og USD 10
per million outputtokens**, kontrollert samme dato på
[modellens prisside](https://developers.openai.com/api/docs/models/gpt-6.1-sol).
Disse satsene gjelder opptil 272 000 inputtokens. Over dette prises hele
forespørselen med USD 4/M input og USD 15/M output. Ingen cache-rabatt
forutsettes i estimatene; faktiske cache-/andre belastninger avstemmes mot
forbruket. Dette er et datert prisgrunnlag, ingen garanti om fremtidig pris.

[Reasoning-dokumentasjonen](https://developers.openai.com/api/docs/guides/reasoning?api-mode=chat)
presiserer at outputbudsjett og kostnad omfatter reasoningtokens, også når
synlig uttrekk mangler. Estimert ordinær Standard-kostnad per rapport er
`(2 * inputtokens + 10 * outputtokens) / 1_000_000` USD, med de høyere
satsene ved lang kontekst. Bruk hele forespørselen, ikke bare rapportteksten.

| Arbeidsestimat, ikke målt forbruk eller ny inputgrense | Kostnad |
|---|---|
| Én rapport, 30 000 input / 10 000 output inkl. reasoning | USD 0,16 |
| Fire opprinnelige S2-forsøk, ett for hver F1–F4-rapport | USD 0,64 |
| Samme fire + tre separate S5-forsøk for F1/F2/F4 hvis gyldige tidsdata ikke kan gjenbrukes | USD 1,12 |
| Konservativt eksempel per rapport: 100 000 input og hele modellens 128 000 outputtokens | USD 1,48; sju slike forsøk USD 10,36 |

Dette underbygger forventet rom innen USD 20, men lover ikke et bestemt
antall vellykkede forsøk eller oppnådd S2/S5. F3 har bare S2-arbeid ved
adaptergrensen så lenge finansgrunnlaget mangler; S5-protokollen endres ikke.
Endelig forsøksutvalg/-antall og faktisk token-/kostnadsestimat registreres
før kjøring i Story 4.4/4.5. Ingen gjentakelse skjer automatisk.

## Kostnadsrutine før og mellom live-forsøk

Mads/live-evalueringsansvarlig fører prosjektets kumulative forbruk i
evalueringsbevisene, inklusive tidligere forsøk, feil, timeout og manuelle
gjentakelser. Serverstopp eller ny testøkt nullstiller ikke budsjettet.

1. Før hvert eksplisitte forsøk: avstem prosjektforbruk og eventuelle
   uavklarte belastninger; kontroller pris, kontogrense og at en konservativ
   reservasjon for hele neste forespørsel passer i gjenværende USD 20.
2. Kjør kun ett forsøk om gangen. Registrer modell-/prompt-/kodeversjon,
   rapporthash, utfall, tokenforbruk og kostnad uten nøkkel/private data.
3. Ved ukjent kostnad etter avbrudd/timeout: behold reservasjonen og avstem
   mot leverandørens forbruk før neste forsøk; ukjent betyr ikke gratis.
4. **Ved samlet prosjektforbruk ≥ USD 20: ingen flere live-tester.** Stopp
   også før et forsøk som ikke kan dekkes av restbudsjettet. Videre testing
   krever ny uttrykkelig budsjettbeslutning fra Mads.

Dette er gjennomføringskontroll etter Epic 4s eksisterende port, ingen ny
appfunksjon for betaling, kostnadsdashboard eller budsjetthåndheving.

## Avstemming mot R2/R3, kontrakt og S5

- R2s deterministiske lesbarhet gjelder før adapterkallet. Blokkerende sider
  når ikke modellen; ingen OCR/vision-fallback.
- R3s PDF ≤50 MiB, metadata ≤1 MiB, in-memory cleanup, aktive request-lås
  og duplikatmarkør til serverstopp bevares. JSON-grensen for mottak er
  ingen ny grense for serverens modellinput.
- Demo beholder samlet lokal 60 s-frist. I live gjelder lokal 60 s-frist
  dokumentstegene frem til komplett validert `DocumentBasis`; deretter
  gjelder egen 120 s-frist for live-adapteren. Lokal frist skal ikke kutte
  live-kallet etter 60 s; live-fristen starter ikke på nytt per delsteg.
  Dette avgjør R3s uttrykkelig utsatte live-avstemming og endrer ikke demo.
- Story 4.3 integrerer disse fasene i samme ventende HTTP-request med
  cleanup ved normalretur/feil/abort/timeout. Eksisterende demo-pipeline er
  ikke allerede live-klar; dens supervisor må håndtere fasegrensene ved
  implementeringen. Ingen bakgrunnsjobb, polling eller retry innføres.
- Ved live-deadline avbrytes transport/lesing og eide lokale ressurser
  avsluttes/ryddes. Bare `Promise.race` med videre arbeid er utilstrekkelig.
  Sene svar forkastes. Abort garanterer ikke at OpenAIs behandling eller
  belastning stanser. Timeout er `failed`/analysis med eksisterende kode
  `timeout`; duplikatmarkøren beholdes.
- **S5 ≤5 minutter er evalueringsmål**, ikke API-/HTTP-timeout. Måling til
  synlig validert liste og separat menneskelig kontroll beholdes uendret.

Structured Outputs bruker et objekt som rot, obligatoriske felt og
`additionalProperties: false` på objekter etter
[OpenAIs schemaregler](https://developers.openai.com/api/docs/guides/structured-outputs).
Ukjent grad/side/kilde representeres eksplisitt som usikkerhet/kandidat
etter eksisterende kontrakt. Backend setter requestId, reportHash, modus,
dokumentidentitet og sideantall; modellen får ingen identitetsmyndighet.
Avslag, ikke-terminalt/ufullstendig svar, schemafeil og kjent avkorting er
analysefeil uten reparasjonskall. Bare terminalt completed, parsede og
kontraktvaliderte data kan gi fullføring, inklusive ekte `findings: []`.
Schema beviser ikke semantisk kvalitet, menneskelig kontroll eller S2.
Kontrakt-/uttrekksversjon 2/1 og runtime-schemas endres ikke ved portlukking.

## Testgrunnlag ved senere implementering

Dette konkretiserer eksisterende AC/testkrav, uten nye krav-ID-er eller
påstand om kjørte produkttester. Offisielle
[SDK-innstillinger](https://developers.openai.com/api/reference/typescript)
krever eksplisitt retry-/timeoutoppsett; standardene brukes ikke som prosjektregel.

| Story / testgrense | Forventet kontroll uten betalt API |
|---|---|
| 4.1 AC1/AC3/AC4 | Valgt modell/API/low/Standard er eksplisitt konfigurasjon; kontrollert klientoppsett har `maxRetries: 0`, 120 000 ms og backendmiljønøkkel. Ingen nøkkel i build/svar/logg. Pakkeversjonen er pinnet og sporbar; analyseprompt/schema leveres først i 4.2. |
| 4.1 AC2/AC5; 4.3 AC6 | Demo uten nøkkel/nett gir null KI-klienter/kall; ugyldig live-konfigurasjon gir trygg feil uten fallback. |
| 4.2 AC1–AC3/AC6 | Responses-requesten bruker `gpt-6.1-sol`, low, Standard og `strict: true`. Hele faktiske sidemerkede fixturegrunnlaget, inklusive 30 sider, når ett transportforsøk. Ukjent kilde/grad/side bevares, identitet og finans kan ikke overskrives. |
| 4.2 AC4/AC5 | Gyldig tomliste kontra avslag, ufullstendig/avkortet output og schemafeil. 408/409/429/5xx, nettfeil og timeout gir høyst ett faktisk transportforsøk; intet reparasjons-/retrykall. |
| 4.1 AC4; 4.3 AC1/AC3/AC5 | Kontrollert klokke/transport: live som varer over 60 s, men fullfører og valideres før 120 s, rammes ikke av demofristen; ved ≥120 s avbrytes forsøket og sent svar gir ingen fullføring. Lokal dokumentfase beholder sin 60 s-grense. Cleanup og duplikatsperre består også ved abort. |
| 4.4/4.5 gjennomføring | Verifiser faktisk kontogrense før live-test, sekvensielle forsøk, samlet kostnadslogg, reservasjon og stopp ved USD 20. S2 måles på originalt live-uttrekk; S5 krever R4-S5 og faktisk menneske/målepunkter. |

Ingen gjenstående beslutningsblocker før Story 4.1 er funnet. Dens direkte
forutsetninger 1.2/2.4/2.5 er done. R4-S6 gjelder 5.4 og R4-S5 gjelder
faktiske S5-målinger; ingen av dem blokkerer 4.1. Faktisk konto/nøkkel,
gjenværende budsjett og kontogrenser kontrolleres før betalte tester.
Egen bestilling av implementering gjenstår; portlukking er ingen slik start.
