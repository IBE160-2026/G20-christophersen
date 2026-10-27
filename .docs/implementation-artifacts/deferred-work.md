# Deferred work

Dette er prosjektets eneste sentrale oversikt over utsatte feil og forbedringer.
Story-/reviewdokumenter og rålogger er underlag, ikke parallelle oppgavelister.
Opprinnelige beskrivelser nedenfor beholdes som historikk. Nye punkter uten
eksplisitt lukking regnes som åpne. Lukking krever dato, relevant commit og
dokumentert løsning med godkjent relevant test/review; story-status alene
er ikke lukkebevis. Historikk og lukkede punkter skal ikke slettes.

## Status kontrollert 2026-10-27

| Punkt | Status | Grunnlag |
| --- | --- | --- |
| Story 1.3 B8 — ren installasjon | Lukket 2026-10-19 | Bestått isolert installasjon og kontroller; beviscommit `13d111237f3b7609786e054455fd5516ef9218d2`. Se historisk lukking nedenfor. |
| Story 4.3 B3/C2 — første feilårsak ved ny Start | Åpen | Review utsetter uttrykkelig forbedringen; ingen dokumentert godkjent retting funnet. Se status under originalpunktet. |
| Story 4.4 B1 — generelle rapportbegrensninger | Lukket 2026-10-24, avgrenset produktretting | Commit `43c0a693d7517c59835078205bfe72611697dc05`, bestått uavhengig B1-review og full offline-regresjon. Separat B2/live-akseptanse lukkes ikke av dette. |
| Story 4.4 B2 — live-sluttbevis | Lukket 2026-10-27 | Nye originale F1/F2-sluttbevis, godkjent uavhengig sluttreview og regresjon i `5fa438e2047bd9f854e72688da32c7ef8b045c7d`. Historikken nedenfor beholdes. |
| Story 4.5 — ufullstendig manuell S5-referanse og forsøksavvik | Akseptert avvik S5-W1, ikke rettet | Mads har avsluttet S5-testing 2026-10-27. Formell AC-akseptanse er ufullstendig; ingen videre målinger autorisert. Se [waiver](story-4-5-s5-waiver-2026-10-27.md) og beslutningstillegg nedenfor. |

## Deferred from: code review of spec-1-3-registrere-og-bevare-finansverdier-for-ett-objekt (2026-10-17)

- B8 (low, miljø-/bevisavgrensning): Gjenta isolert `npm ci` for gjeldende lockfil og relevante kontroller når npm-nett/SSL fungerer. Offline cache manglet Zod; to nett-forsøk ga `ERR_SSL_CIPHER_OPERATION_FAILED`. Ingen endring av TLS-/installasjonspolicy eller pins er autorisert/utført. Eksisterende installasjons 9 Vitest og 19+2 E2E består; ren installasjon er ikke påstått. Se story-1-3-review.md og råkontroller. Dette er ingen ny produkt-/readiness-port.

### B8 lukket 2026-10-19

Ren `npm ci` fra commit `1c33279deff7e081af906d4140f210ff5d6b82f6`
bestod i isolert kopi uten `node_modules` og med ny npm-cache. Node 24.21.0,
npm 11.19.0 og uendret TLS-/installasjonspolicy ble brukt. 9 Vitest,
lint, typecheck/build, 19 demo-E2E og 2 dev-tester bestod fra denne
installasjonen. Package-/lockfil forble byteidentiske. Ingen tidligere
SSL-feil er reprodusert. Historikken ovenfor beholdes som datert testbevis.
Se [råutdata](story-1-3-ren-installasjon-2026-10-19.txt) og
[gjenopptaksøkten](../process/arbeidsokter/2026-10-19-story-1-4-orkestrering.md).

Etterkontroll 2026-10-27: Lukkingen beholdes. Relevant beviscommit er
`13d111237f3b7609786e054455fd5516ef9218d2` (2026-10-19), med kontroll på
startrevisjon `1c33279deff7e081af906d4140f210ff5d6b82f6`. Råloggen viser
bestått `npm ci`, 9 Vitest, lint, typecheck/build og endelig 19 demo-E2E +
2 dev-tester etter at et første forsøk stoppet på opptatt port. Dette lukker
installasjons-/bevispunktet B8, ikke en påstand om ny produktretting.

- source_spec: `spec-4-3-bruke-live-analysen-i-samme-kontroll-og-resultatflyt.md`
  summary: Bevare nyttig første feilårsak eller forklare duplikatsperren ved manuell Start etter terminal analysefeil.
  evidence: B3-review bekrefter baselineoppførsel i ReportAnalysis canStart (failed tillates) og analysis-route sin varige markør. Et nytt manuelt forsøk kan erstatte første feiltekst med duplicate-analysis. Ingen automatisk retry eller ny flyt innført i 4.3; forbedringen gjelder eksisterende felles demo/live-oppførsel.

### Story 4.3 B3/C2 — åpen, kontrollert 2026-10-27

[Reviewtriagen](spec-4-3-bruke-live-analysen-i-samme-kontroll-og-resultatflyt.md)
fører B3 og C2 som samme utsatte forhold, ikke to feil. Reviewcommit
`91d4c8661a413d4bdded8a59e92ef91a635bb057` godkjenner Story 4.3, men sier
uttrykkelig at dette forholdet ikke er rettet. Kontroll av senere commits,
`ReportAnalysis.tsx` og `src/backend/http/analysis-route.ts` fant ingen
dokumentert retting med godkjent regresjonstest/review som bevarer første
feilårsak eller forklarer duplikatsperren. Punktet forblir åpent; ingen
kodeendring eller ny kjøring er utført i denne sporingsoppryddingen.

- source_spec: `spec-4-4-gjennomfore-live-og-evaluere-s2.md`
  summary: Avklare og rette at generelle leverandørbegrensninger fra fullført live-uttrekk gjør F1/F2s rapportgrunnlag ufullført og overstyrer forventet screening.
  evidence: Uendrede originale F1/F2-provider/outcome og resultatbilder fra Story 4.4 viser limitations om fiktiv rapport/tekstinput. Eksisterende src/domain/finding-control.ts behandler alle limitations som incomplete-report. Tall og S2 er korrekte, men AC6 er delvis. Ved retting må bevart originaluttrekk brukes i offline-regresjon; ekte rapportmangler/usikkerhet skal fortsatt sperre. Ingen automatisk fjerning av limitations, nytt låst krav eller produktretting utført i evalueringsleveransen. Se story-4-4-uavhengig-evaluering.md.

### Story 4.4 B1 — lukket 2026-10-24, etterkontrollert 2026-10-27

Relevant rettings- og beviscommit:
`43c0a693d7517c59835078205bfe72611697dc05` (2026-10-24). Brukerens
[godkjente beslutning og implementering](story-4-4-begrensningsvurdering-2026-10-24.md)
innfører en separat, eksplisitt begrunnet brukervurdering av en generell
rapportbegrensning, bundet til originaltekst, rapport og revisjon. Originalen
bevares; ekte rapportmangler og øvrige kritiske blokkere skal fortsatt sperre.
Den opprinnelige beskrivelsen ovenfor gjelder tilstanden før denne rettingen.

[Uavhengig B1-review](story-4-4-b1-uavhengig-review-2026-10-24.md) består
etter retting av et testhull: 23/23 målrettede unitprøver og 6/6 offline
originalreplay-prøver i demo/live bestod, inkludert ugyldiggjøring ved endret
funn og bevart blokkering. Etterfølgende
[full sluttregresjon](../process/arbeidsokter/2026-10-24-epic-4-avslutningsrunde.md)
og [rålogg](epic-4-avslutningsregresjon-2026-10-24.txt), begge i samme commit,
dokumenterer typecheck/lint/build, 1082 Vitest, 195 E2E, 3 dev/offline,
37 komponentprøver, 13 S2-/sikkerhetsprøver og build-/nøkkelkontroll bestått.

Lukkingen gjelder produktrettingen B1. Offline replay er ikke faktisk nytt
live-sluttbevis, menneskelig S5-måling eller godkjenning av hele Story 4.4.
Det separate B2-gapet nedenfor forblir åpent.

## Story 4.4 B2 — live-sluttbevis, åpent

- source_spec: `spec-4-4-gjennomfore-live-og-evaluere-s2.md`
  summary: Fullføre og få godkjent separat faktisk live-sluttbevis for AC6 uten å omskrive historiske originalforsøk.
  evidence: Gjenopptatt AC6-review beskriver F1s historiske uiControlCompleted=false; uavhengig B1-review fastslår at replay ikke lukker dette gapet.

Ført samlet her 2026-10-27 fra eksisterende
[AC6-review](story-4-4-gjenopptatt-review-2026-10-24.md) og
[uavhengig B1-review](story-4-4-b1-uavhengig-review-2026-10-24.md), bevart i
henholdsvis commit `34a9ea6` og `43c0a693d7517c59835078205bfe72611697dc05`.
Ny lokal B2-dokumentasjon fra 2026-10-27 beskriver F1/F2-kjøringer og tester,
men angir fortsatt at endelig uavhengig rekontroll gjenstår. Den er ikke
grunnlag for lukking i denne oppryddingen og tas ikke med i denne commiten.
Lukking krever godkjent relevant sluttreview og verifikasjon med sporbar
commit for det nye beviset. Historiske receipts og offline replay beholdes.

### B2 lukket 2026-10-27 — etter oppryddingscheckpointet

Den tidligere åpne statusen ovenfor beskrev tidspunktet før sluttreview.
Commit `5fa438e2047bd9f854e72688da32c7ef8b045c7d` bevarer nye originale
F1/F2-kall, korrekt faktisk Gå videre/Forkast, kostnadsavstemming og
[godkjent uavhengig sluttreview](story-4-4-b2-uavhengig-sluttreview-2026-10-27.md).
[Sluttkontrollen](story-4-4-b2-sluttkontroll-2026-10-27.md) dokumenterer full
regresjon og etterfølgende målrettede prøver. Historiske S2-originaler og
replay er bevart; replay brukes ikke til å lukke B2. Oversikten korrigeres
nå mot dette konkrete lukkebeviset. Dette godkjenner ikke Story4.5/S5.

## Story 4.5 — åpen etter første S5-B1-v1-opptak, 2026-10-27

Mads gjennomførte ett faktisk live-forsøk og leverte originalvideo/notat.
Han bekrefter at den manuelle delen bare identifiserte ni TG-funn, uten
generell begrensningsvurdering eller uttrykkelig TG3-status. Finans og
nettleser avviker fra fryst forsøksoppsett; full originalkontroll er ikke
uavhengig videoverifisert. Ingen komplett sammenligningsreferanse eller
bestått S5/tidsgevinst kan utledes. Manglende aktiviteter kompletteres ikke
i ettertid i den opprinnelige tiden. Se [faktisk observasjon og neste
checkpoint](story-4-5-s5-b1-v1-observasjon-2026-10-27.md). Bevar første forsøk;
avklar korrekt videre måleplan/læringseffekt før eventuell ny gjennomføring.
Ingen automatisk retry, endret fasit eller ny KI-analyse bestilles her.

### Story4.5 S5-W1 — avvik akseptert og målearbeid avsluttet 2026-10-27

Mads har eksplisitt besluttet at det utførte S5-forsøket er tilstrekkelig
arbeidsflyt-/tidsdokumentasjon for semester-v1 og at ingen flere S5-målinger
skal gjennomføres. [Formelt waiver og AC-vurdering](story-4-5-s5-waiver-2026-10-27.md)
er gjeldende beslutning; anbefalingen ovenfor om videre måleplan er historisk
og skal ikke automatisk gjenopptas. Opprinnelige observasjoner/notat/hasher
bevares. Den ufullstendige manuelle referansen, ikke-blind test, finans-/
kontrollavvik og ikke formelt validert tidsbesparelse er aksepterte avvik,
ikke rettede feil eller bestått S5. Formell4.5/Epic4-status er fortsatt
in-progress med separat avslutningsmetadata. Ingen videre S5-målearbeid er
bestilt; ingen ny test/reviewgodkjenning fabrikeres for å lukke avviket.
Beslutningsrecord og aktiv promptlogg versjoneres i samme lokale commit.
