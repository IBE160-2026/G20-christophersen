# Epic 4 Context: Live KI-analyse og evaluering

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Investoren skal kunne starte én faktisk KI-analyse av en støttet tilstandsrapport og kontrollere uttrekket gjennom samme flyt som demo. Originalt live-uttrekk og faktisk behandlingstid skal senere evalueres separat mot forhåndsdefinert fasit. Live-integrasjon inngår i v1; offline demo sikrer lokal kjørbarhet, men beviser ikke live-kvalitet eller live-tid.

## Stories

- Story 4.1: Konfigurere valgt live-leverandør uten å eksponere nøkkelen
- Story 4.2: Analysere hele det sidemerkede rapportgrunnlaget i ett KI-kall
- Story 4.3: Bruke live-analysen i samme kontroll- og resultatflyt
- Story 4.4: Gjennomføre ekte live-analyse og evaluere opprinnelig uttrekk mot S2
- Story 4.5: Måle live-analyse og menneskelig kontroll etter S5-protokollen

## Requirements & Constraints

- Én tekstbasert PDF-tilstandsrapport på høyst 30 sider. Hele PDF.js-grunnlaget med alle fysiske sideposisjoner, tekst og statuser sendes samlet i ett analysekall. Ingen skjult avkorting, relevansfiltrering, chunking, OCR, vision, ekstra kall eller automatisk retry/fallback.
- Trekk ut alle eksplisitte TG2/TG3 med kort trofast beskrivelse og kontrollerbar kilde. Ikke sett nye grader eller gjett side/kilde. Uklarheter bevares som usikre kandidater med opphav. Rapporten er datagrunnlag; den kan ikke endre oppgave, identitet eller finansverdier.
- KI utfører ingen finansberegning, anbefaling, reparasjonsestimering, markeds-/juridisk analyse eller analyse av andre dokumenttyper. Vanlig kode eier P/L/D/J/Ymin, beregninger og regelutfall; menneskelig kontroll bevares.
- Nøkkelen leses bare fra backendmiljøets `OPENAI_API_KEY`. Den skal aldri forekomme i frontend/build, Git, svar, logger, fixtures eller dokumentasjon. Private dokumenter/uttrekk versjoneres ikke. Demo er standard, oppretter ingen KI-klient og fungerer offline etter installasjon. Ugyldig live-konfigurasjon gir trygg kjent feil.
- Offline adapter-/transporttester og bygget-app-tester bruker kontrollert transport uten betalt API. Faktisk S2 krever uavhengig dokumentfasit før kjøring og originaluttrekk før rettinger: alle TG3 og minst 90 % av TG2 med riktig PDF-side, ingen oppdiktede funn. Alle oversette funn dokumenteres.
- S5 måler analyse til ferdig validert liste faktisk er synlig og menneskelig kontroll separat; medianmålene er henholdsvis ≤300 s og ≤600 s. Modellslutt, feiltid, ufullført kontroll og demo gir ikke bestått live-tid. Manuell referanse må være faktisk gjennomført på samme caser.
- Prosess, prompts, reviewfunn, rettinger og testbevis lagres med spor til krav/stories. Bruk små avgrensede commits og behold godkjent scope; kursveiledningen gir ingen ny dekningsprosent eller ekstra produktfunksjoner.

## Technical Decisions

- R1 er lukket: OpenAI `gpt-6.1-sol`, Responses API, offisiell `openai` JS/TS-SDK, eksplisitt `reasoning: { effort: "low" }` og `service_tier: "default"`. Ingen modellbytting. Kompatibel SDK-versjon velges, dokumenteres og pinnes i pakke/låsfil; prompt og schema versjoneres.
- Structured Outputs bruker Responses `text.format`, `type: "json_schema"`, `strict: true`, objektrot, obligatoriske felt og `additionalProperties: false`. Leverandørskjema er uttrekksformat; felles contracts er fortsatt eneste autoritet for appretur. Backend setter requestId, rapporthash, modus, dokumentidentitet og sideantall. Kontrakt-/uttrekksversjon 2/1 bevares.
- Bare terminalt completed, parset og kontraktvalidert svar kan gi fullføring, inklusive ekte `findings: []`. Avslag, manglende terminalstatus, schemafeil og kjent avkortet/ufullstendig output er trygg analysefeil uten reparasjonskall. Strukturvalidering beviser ikke semantikk eller brukerbekreftelse.
- SDK har `maxRetries: 0` og `timeout: 120000`. Live har én absolutt 120 000 ms-frist fra leverandørforespørsel starter til terminalt validert adapterutfall, kombinert med requestabort. Headere/chunks/parsing nullstiller ikke fristen. Deadline stanser transport/lesing og eide ressurser; sent svar forkastes og gir eksisterende `timeout`-feil. Promise.race alene er utilstrekkelig. Abort lover ikke stopp i leverandørbehandling eller kostnad.
- Lokal dokumentfase beholder 60 s-frist; demo beholder samlet lokal 60 s-frist. Live-fasegrensene kobles til HTTP først i 4.3. R3s PDF ≤50 MiB, metadata ≤1 MiB, in-memory cleanup og aktive request-lås består. Duplikatmarkør for økt/modus/backendberegnet SHA-256 settes før adapterkall og beholdes til serverstopp, også ved avbrudd. Ingen jobb/polling/persistens.
- Hele serialiserte modellinputen, inklusive prompt/schema/sidemerker, vurderes mot 1 050 000 tokens kontekst og 128 000 maksimal output med plass til reasoning. Overskridelse gir trygg feil, aldri stille avkorting eller ny skjult inputgrense.
- Live-testing er sekvensiell på tvers av prosesser innen USD 20 totalt. Før forsøk avstemmes faktisk forbruk, ukjente belastninger, kontogrense, pris og konservativ reservasjon; ingen videre forsøk ved oppbrukt/utilstrekkelig budsjett. Dette er gjennomføringsdokumentasjon, ingen kostnadsfunksjon i appen.

## UX & Interaction Patterns

Behold de fire godkjente trinnene og eksisterende kontrollflate. Vis `Demo · lagret KI-uttrekk` eller `Live analyse` gjennom flyten; bare trygg modusmetadata når frontend. Ingen nøkkelfelt eller ny konfigurasjonsreise. Dokument-/analysefeil vises lokalt med kjent årsak og nødvendig handling; feil blir aldri tomliste eller skjult demo. Original-PDF, korrigering/avvisning, listebekreftelse og separat TG3-avklaring følger samme regler i begge moduser. Uendrede rapportuttrekk gjenbrukes ved finans-/kontroll-/TG3-endringer. Tastatur, fokus og korte statuskunngjøringer bevares.

## Cross-Story Dependencies

Epic 1–3 leverer eksisterende dokument-, kontrakt-, kontroll- og resultatgrunnlag. 4.1 bygger på 1.2/2.4/2.5; 4.2 på 2.1/2.3/4.1; 4.3 integrerer adapteren med HTTP og samlet flyt. 4.4 krever 4.2/4.3 og faktisk nøkkel/konto/budsjett; 4.5 krever live-bevis og faktisk person/miljø for kontroll og manuell referanse. R4-S5 gjelder reelle S5-målinger; R4-S6 gjelder ren kjøring i 5.4. De blokkerer ikke offline 4.1/4.2. Gjeldende mini-sprint omfatter bare 4.1 og 4.2; ikke start 4.3 eller faktiske evalueringskjøringer. Stopp ved behov for ny produkt-/arkitekturbeslutning.
