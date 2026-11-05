# Frontend og brukeropplevelse – stabilisering 2026-11-05

Utgangspunkt: `e0ad095c5a9410886ee94e3897cae3552284a7f0`. Oppdraget er brukerens stabilisering og endelige funksjonskontroll. Retning: godkjent Konsept A, `ux-IBE160-2026-10-30/EXPERIENCE.md` og `DESIGN.md`; ingen ny analysemodul.

## Dokumenterte årsaker før kodeendringer

- `src/frontend/investment/RentEstimatePanel.tsx` viser publiserte leiereferanser og SSB, men har ingen interaktiv leiekontroll. Komponenten mottar `controls` uten å bruke dem. Det finnes derfor ingen tilgjengelig leieslider eller tilbakestilling å teste.
- `selectScenarioBasis` bruker SSB som automatisk, ubekreftet leiescenario når ingen leie er registrert. Den publiserte romreferansen (Hybel/Menon) er et separat sammenligningsgrunnlag. Denne separasjonen skal bevares: sliderjustering er en egen scenarioforutsetning og må aldri bli en dokumentert faktisk leie eller et markedsestimat.
- `src/frontend/App.tsx` binder scenariojusteringer til dokumenthash alene etter fullført import. En ny import av samme PDF kan derfor gjenbruke forrige analyses justeringer. Importens generasjon må være del av bindingen.
- Eksisterende nettlesertester kontrollerer opplasting, SSB, publiserte referanser og finansiering, men kan ikke oppdage en uteblitt leieslider: de etterspør ingen slik kontroll. Testene alene dokumenterer heller ikke den obligatoriske sekvensen med begge originale PDF-er etter hverandre og nye oppstarter.
- `ImportClient.select` stopper før HTTP for samme dokumenthash med bevart resultat. Native filfelter nullstilles heller ikke etter `change`, slik at gjenvalg av identisk fil kan være en handling uten ny behandling. Konsept A trenger uttrykkelig fersk, gratis dokumentimport per valg samt en synlig handling for ny analyse. Kontrollflatens eksisterende gjenbruk beholdes som standardvalg i klienten.

## Planlagt avgrenset retting

En lokal, objektbundet månedsleie til scenarioet, tilgjengelig som native range-kontroll og presisfelt på mobil/desktop. Før justering beholdes eksisterende SSB/manuelle leiegrunnlag. Tilbakestilling velger uttrykkelig den publiserte romreferansen. Dokumentfakta, registrert faktisk leie, bekreftelser og kontrollert screening endres ikke. Ny dokumentgenerasjon og endringer i registrert leie rydder scenariojusteringen.

## Gjennomførte rettelser

- Native, tastatur-/berøringsstyrt slider, presisfelt og reset i `RentScenarioControls.tsx`. Reset bruker valgt publisert romreferanse; første visning beholder det eksisterende SSB-/registrerte leiegrunnlaget. Begge statistikkilder står fortsatt separat.
- `rent-scenario.ts` gir bare et lokalt visningsscenario. Bruttoyield, årsleie og foreløpig netto oppdateres ved input. Ukjent full drift, finansiering og screening blir ikke gjort komplett av leievalget. Registrert faktisk leie endres ikke.
- Uavhengig QA påpekte at en reset fra SSB 2025 til Hybel/Menon 2026 måtte forklare prisnivå. Rettet før sluttkontroll: kildeperioden og uendret beløp uten prisjustering vises, scenarioåret merkes som brukerforutsetning, og foreldet SSB-årtekst fjernes fra kostnadsforbeholdene.
- Konsept A velger uttrykkelig fersk import per filvalg. Den gamle samme-hash-gjenbruken er fremdeles tilgjengelig som standard i kontrollflatens klientkontrakt; den brukes ikke til godkjenningsmatrisens opplastinger.
- Filfeltet nullstilles etter valg slik at samme fil kan velges igjen. En egen «Start ny analyse» tømmer forrige eiendoms dokumenter, økonomi, kontrollgrunnlag og resultat. Generasjon binder finansiering og leiejustering til den nye analysen; redigering av registrert leie frigir scenariooverstyringen.
- «Prøv dokumentimporten på nytt» er tilgjengelig ved importfeil med valgt fil. Presise meldinger for `processing-failure` og `server-outdated` erstatter den generiske tekstbasert-PDF-forklaringen for disse årsakene. Kontrollflaten oppgir også riktig lokal OCR-støtte.

## Målrettet verifikasjon

Node 24.21.0, ingen betalte kall:

- `npm run typecheck`: bestått etter siste kodeendring.
- `npx oxlint --deny-warnings src/frontend tests/unit/rent-slider.test.ts tests/unit/import-session.test.ts`: bestått, ingen advarsler.
- `npm test -- tests/unit/rent-slider.test.ts tests/unit/rent-scenario.test.ts tests/unit/import-session.test.ts tests/unit/preliminary-net-ui.test.tsx`: 52/52 bestått. Nye målrettede tester kontrollerer uavhengig matematikk (15 000 og 13 891 kr/mnd), at ukjente tall fortsatt mangler, ugyldig leie, reell ny HTTP-forespørsel ved samme fil og full nullstilling.

Disse prøvene er støttebevis. Faktisk synlig mobil/desktop, begge private PDF-er og hele obligatorisk opplastingsmatrise godkjennes først gjennom hovedagentens `tools/finalization/real-prototype.mjs` og den uavhengige QA-agentens kontroll. Ingen sluttgodkjenning hevdes av enhetstester alene.
