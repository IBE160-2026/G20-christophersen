---
title: "R3 — HTTP-ressurser og dokumentlivsløp i semester-v1"
date: 2026-10-20
decision_status: accepted
gate: R3
gate_status: closed
before_story: '2.5'
decision_owner: Mads
implementation_owner: Backendansvar
---

# R3 — HTTP-ressurser og dokumentlivsløp i semester-v1

Oppfølging 2026-10-23: [R1 er lukket](r1-live-ki-semester-v1.md) med separat
hard live-frist 120 s etter lokal dokumentfase, uten retry. R3s lokale
PDF-/demo-frist 60 s og øvrige ressurs-/cleanupgrenser bevares. Formuleringer
om uavklart live-timeout nedenfor dokumenterer R3-vedtaket fra 2026-10-20.

**R3 er lukket som beslutningsport 2026-10-20.** Mads har eksplisitt vedtatt
grensene nedenfor før Story 2.5. Dette konkretiserer eksisterende Deferred i
AD-5/AD-9 og Story 2.5; det er ingen implementering eller bestått produkttest.
Story 2.5 forblir backlog. Samlet readiness er fortsatt CONCERNS grunnet
R1/R4 ved deres senere kontrollpunkter.

## Vedtatte grenser

| Område | Bindende semester-v1-beslutning |
|---|---|
| Opplastet PDF | Maks **50 MiB = `50 * 1024 * 1024` = 52 428 800 bytes**, inklusive grenseverdien. Gjelder selve PDF-filens bytes. Én PDF per analyse; ingen flerfilanalyse. |
| Format | Bare faktisk PDF-innhold/signatur sammen med eksisterende PDF-validering godtas. Filendelse og MIME-header er metadata, aldri tilstrekkelig godkjenning. Signatur alene beviser heller ikke gyldig PDF, sideantall eller lesbarhet. Eksisterende høyst 30 fysiske sider og R2 gjelder i tillegg. |
| JSON/metadata | Vanlige JSON-/metadata-requests har maks body på **1 MiB = `1 * 1024 * 1024` = 1 048 576 bytes**, inklusive grenseverdien. PDF overføres som binære filbytes, aldri base64 inne i JSON. JSON-grensen skal ikke feilaktig brukes som global 1 MiB-grense på PDF-overføringen. |
| Minne og lagring | Opplastet PDF behandles bare in-memory i backend. Ingen diskspooling, midlertidig PDF-/tekstfil, database eller annen serverpersistens. Eksisterende versjonerte fiktive demodata er leveranseressurser, ikke persistens av opplastinger. |
| Aktiv request | Kun én aktiv analyse-request per aktiv session/flyt, også ved forskjellig PDF-hash, modus, requestId eller analysegenerasjon. Andre samtidige forsøk avvises kontrollert; ingen kø eller jobb-API. |
| Retry | Ingen automatisk retry av analyse-request eller adapterkall. Bevar også eksisterende duplikatsperre etter AD-5 og Story 2.5 AC2/AC3. |
| Lokal prosessering | Én samlet **hard timeout på 60 sekunder = 60 000 ms** for lokal PDF-/demo-prosessering, fra lokal PDF-behandling starter før signatur-/formatvalidering til demoens terminale resultatbinding er ferdig. Fristen starter ikke på nytt ved hvert dokumentsteg eller adapterkall. |
| Live og S5 | Ingen live-AI-timeout fastsettes her; R1 før Epic 4 velger og avstemmer den. 60-sekundersfristen er ikke en valgt live-/samlet live-HTTP-timeout. S5s medianmål ≤300 s for hovedanalyse og ≤600 s for kontroll er evalueringsmål, ingen HTTP-timeout. Ingen ekstra timeoutverdi for andre HTTP-faser er valgt her. |

Grensene regulerer ressurser, ikke semantisk rapportkvalitet: en PDF innen
begge størrelses-/sidegrenser må fortsatt bestå hele dokumentpipelinen.
Manglende/feilbundet demo-fixture forblir eksplisitt analysefeil uten live-fallback.

## Tidlig avvisning og uendret rapportidentitet

- Kontroller kjent oversize før full buffering der tilgjengelig lengde faktisk
  viser overskridelsen. Tell også faktisk mottatte PDF-bytes under mottak;
  manglende, feil eller upålitelig lengdeheader kan ikke omgå grensen.
- Ved overskridelse stans videre akkumulering og behandling, avvis trygt og
  frigjør allerede mottatte chunks. En for stor eller avbrutt opplasting
  skal ikke fullføres i minnet bare for å hashe den, parses eller nå adapteren.
  Tilsvarende gjelder overskridelse av JSON-/metadata-bodygrensen.
- Aksepterte filbytes sendes uendret til `validatePdf`. SHA-256 beregnes av
  den komplette originalen etter Story 2.2 og kontrolleres igjen før
  ekstraksjon; filnavn, klienthash eller konvertert tekst erstatter den ikke.
  Filnavn brukes ikke som serversti. Ikke finn på en rapporthash for en
  ufullstendig eller tidlig avvist body.
- Konkret binær HTTP-innpakning og trygg representasjon av avvisning før
  komplett dokumentkontekst detaljeres i Story 2.5. Denne beslutningen legger
  ingen ny runtime-DTO ved siden av de eksisterende analysekontraktene.

## Ressurseierskap og avslutning

Requestforløpet eier alle backendkopier av opplastingschunks/originalbytes,
PDF-parserens dokument-/loading tasks, workers, sidecacher, tekstgrunnlag,
adapterens requestkopier, timere og lyttere. Normalretur, dokument-/analysefeil,
ugyldig retur, klientavbrudd og timeout går gjennom samme sikre avslutning
med `finally` eller tilsvarende. Delvis initialisering skal også ryddes.

Ved abort/feil/timeout skal videre arbeid stoppes, og sent resultat kan ikke
bli fullført svar. Hard timeout krever faktisk stans/terminering av lokal
prosessering og underliggende parser-/workerressurser; bare å vinne et
`Promise.race` og la arbeidet fortsette er utilstrekkelig. Dokument-/analysefeil
bevarer eksisterende kontraktsemantikk; timeout og avbrudd er aldri completed
tomliste. Et svar kan bare sendes hvis forbindelsen fortsatt er tilgjengelig.

Cleanup skal forsøke frigjøring av alle opprettede ressurser selv om én
destroy-/terminate-operasjon feiler. Fjern timere/lyttere og referanser til
bytes, tekst og parserresultater, også fra closures og request-/adapterobjekter.
Backend skal ikke beholde disse etter requestens avslutning eller i session,
duplikatregister, logger, feilmeldinger eller statiske ressurser. Frigjøring av
eide referanser og terminering er deterministisk; tidspunktet for JavaScripts
garbage collection er ikke en garanti om fysisk nullstilling av minne.

Den aktive session-/flytlåsen skal settes før asynkront analysearbeid og
beholdes til requestens arbeid og cleanup er avsluttet. Den er forskjellig
fra AD-5s prosesslokale duplikatmarkør for økt + lokal modus + backendberegnet
rapporthash. Duplikatmarkøren settes før første adapterkall og beholdes til
serverstopp, også etter feil/timeout/klientavbrudd; ny requestId/generasjon
omgår den ikke. Den beholder bare teknisk identitetsmetadata, ingen PDF,
tekst, uttrekk eller resultatcache. Cleanup må ikke slette denne markøren.

Frontend eier fortsatt original-PDF og aktiv vurdering etter AD-2/AD-3.
Requestslutt i backend fjerner ikke originalen som trengs til brukerens
kontroll. Eventuelle object URLs eller andre visningsressurser frigjøres av
eieren når de erstattes eller ikke lenger brukes, og ved avsluttet visning/
økt; backendressurser frigjøres ved requestslutt. Ingen frontend-/PDF-visning
implementeres her, og ingen serverøkt med varig vurderingslagring innføres.

## Konsistenskontroll og eksisterende kode

| Grunnlag | Kontrollresultat |
|---|---|
| Story 2.5 AC1/AC4/AC5; FR-6/FR-9; AD-3/AD-4/AD-9 | Beslutningen fyller det eksplisitte ressurs-/cleanup-valget. PDF/30 sider, sidemerking, feil/usikkerhet og trygt kildeopphav bevares. 50 MiB er en eksplisitt ressursgrense vedtatt av Mads, ingen skjult side-/lesbarhetsendring. |
| Story 2.5 AC2/AC3; AD-5 | Aktiv request-lås supplerer den eksisterende prosessmarkøren som beholdes til serverstopp. Midlertidige bytes skal frigjøres uten å svekke sperren. Ingen retry, polling eller jobb-ID. |
| Story 2.2/2.3 | `validatePdf` kopierer originalbytes og beregner SHA-256; `extractPdf` kontrollerer hash og beholder alle fysiske sider. Eksisterende destroy/terminate i finally er grunnlag for senere HTTP-avbrudd, men komplett requeststyrt kansellering/hard timeout er ikke levert ennå. |
| Story 2.4; AD-6 | Samme komplette `DocumentBasis` → `AdapterOutcome` → felles resultatbinding brukes. Lokal demo er fortsatt standard uten nøkkel/nett/fallback. Statiske hash-/versjonsbundne demosvar skrives ikke om eller erstattes av serverlagrede opplastinger. |
| AD-2/AD-9; NFR-4 | In-memory requestressurser og frontend-eid midlertidig økt bevares; ingen disk/database eller vurderingspersistens. Ingen privat PDF/tekst i statisk server eller logger. |
| AD-10; NFR-5; S5 | Dokumentkontroll lukker bare beslutningsporten. 60 sekunder er lokal ressursfrist, ikke S5 eller en bestemt live-kapasitet/-timeout. R1 og R4 består. |

`server.ts` har fortsatt bare appskall og utilgjengelig API; ingen analyse-HTTP,
bodyparser, uploadgrense, request-lås eller timeout er implementert gjennom
denne beslutningen. Ingen konflikt med låst produktkrav eller nytt udekket
produkt-/arkitekturvalg er funnet. Eksisterende schemas og versjoner 2/1
endres ikke av dokumentvedtaket.

## Testgrunnlag ved senere implementering

Dette konkretiserer Story 2.5s eksisterende testkrav, ikke nye AC-ID-er eller
påstand om kjørte HTTP-tester:

| Scenario | Forventet kontroll i Story 2.5 |
|---|---|
| PDF på 52 428 800 bytes og én byte over | Grenselikhet passerer størrelsessteget; resten av PDF-valideringen gjelder fortsatt. Overgrense avvises kontrollert før parser/adapter, med cleanup av mottatte chunks. |
| Kjent overgrenselengde og faktisk overgrense uten pålitelig lengdeheader | Tidlig avvisning der mulig; løpende bytetelling håndhever grensen også uten header. Ingen full oppsamling av overgrensebody. |
| JSON/metadata på 1 048 576 bytes og én byte over | Likhet tillates ved bodygrensen; én byte over avvises. Binær PDF omfattes av sin egen grense; base64-PDF i JSON godtas ikke. |
| Ingen/flere PDF-er, ikke-PDF med .pdf/MIME, PDF-signatur med ugyldig container, gyldig PDF | Bare én faktisk validert PDF går videre; signatur alene og navne-/MIME-påstander gir ingen godkjenning. |
| Normal F1–F4 gjennom HTTP | Samme originalhash, fysiske sider og versjonsbundne demoresultat som Story 2.2–2.4; ett adapterkall og ingen persistens/nøkkel/nett/fallback. |
| Samtidige requests i samme session med lik/ulik hash/modus/requestId/generasjon | Kun én aktiv; andre avvises, uten automatisk kø/retry. Etter avslutning består allerede satt duplikatmarkør for samme nøkkel. |
| Styrt heng i lokale dokumentsteg eller demo, og sen retur etter frist | Én samlet 60 000 ms-frist, ingen reset per steg. Timeout stanser reelt arbeid, frigjør ressurser og hindrer sen completed. Test også at heng ikke kan blokkere håndhevelsen av fristen. |
| Brutt upload, avbrudd under parser/adapter, dokumentfeil, adapterfeil/ugyldig retur | Ingen nye steg etter avslutning; ingen retry. Alle initierte ressurser frigjøres, byte-/tekstreferanser beholdes ikke, satt duplikatmarkør består. |
| Feil i én cleanup-operasjon | Øvrige cleanup-operasjoner forsøkes fortsatt; ingen falsk suksess, rå parser-/fil-/PDF-detaljer eller videre bakgrunnsanalyse. |

Verifiser observerbar ressursavslutning, kallantall og fravær av beholdte
referanser; en tilfeldig måling av heap/GC alene er ikke cleanup-bevis.
Object URL-livsløp verifiseres når det faktisk innføres i senere frontendstory.

## Spor og sluttstatus

[Arbeidsøkt](../process/arbeidsokter/2026-10-20-r3-http-beslutning.md)
bevarer bestilling og dokumentkontroll. Readiness, arkitekturens Deferred,
SPEC/kontraktpekere, Story 2.5s avklaringspunkt og sprintregister viser samme
beslutning. R2/R3 er closed; R1/R4 er åpne. Alle direkte forutsetninger for
2.5 (1.2 og 2.1–2.4) er done. Ingen beslutningsblokkering gjenstår før en
egen bestilling av Story 2.5; storyen er fortsatt backlog og ikke startet.
