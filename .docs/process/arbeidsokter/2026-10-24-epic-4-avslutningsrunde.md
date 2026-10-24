# Epic 4 — kontrollert avslutningsrunde 2026-10-24

## Status ved menneskelig checkpoint

Story 4.4 står **review**, Story 4.5 **backlog** med draft og klargjort
menneskelig gjennomføring. Epic 4 står **in-progress**. Ingen done-status
settes uten nødvendige faktiske bevis. Story 5.4/R4-S6 og 5.5 er urørt.
Dette er Epic 4-arbeid og prosessbevis, ikke oppstart av Story 5.5.

Bestillingen og de to produkt-/personavklaringene er bevart i aktiv logg
`../prompts/session-01a16b53-323d-7bd1-9e58-2cd1f62a6b4e.jsonl`.
Tidligere promptlogger er urørt. Sekvensielle subagenter undersøkte 4.4,
forberedte 4.5, reviewet grunnlaget, implementerte den godkjente B1-regelen,
reviewet rettingen og klargjorde Mads' faktiske gjennomføring.

## 4.4, review og S2

Første gjenopptatte review dokumenterte B1s beslutningsgap og B2s manglende
historiske F1-sluttkontroll. Checkpoint med aktiv promptlogg ble lokalt
committet som `34a9ea6cb9b764ed14cf1a0e04912899fa7d7c6b`.

Mads godkjente deretter en avgrenset, eksplisitt brukervurdering av generelle
rapportbegrensninger med begrunnelse, originalbevaring og rapport-/revisjonsbinding.
Denne er implementert. Kjente dokument-/analysefeil, kritiske usikkerheter,
finansmangler og separat TG3 består som uavhengige blokkere. Kode validerer
binding/erklæring; mennesket vurderer fritekstens semantikk. Ingen automatisk
fritekstfiltrering eller generell overstyring er innført.

[B1-beslutning og implementeringsbevis](../../implementation-artifacts/story-4-4-begrensningsvurdering-2026-10-24.md)
og [uavhengig review](../../implementation-artifacts/story-4-4-b1-uavhengig-review-2026-10-24.md)
dokumenterer rettingen. Review fant ett verifisert testhull: UI-prøvene
manglet bevis for tømming av erklæring/usendt utkast ved relevant revisjon.
Det er rettet og verifisert. Produktrettingen består avgrenset B1-review.

B2 består: F1s originale receipt har `uiControlCompleted: false`. Lokalt
replay gir produktbevis, men kan ikke skape de manglende historiske hendelsene.
Et nytt nødvendig F1-liveforsøk kan samle samtidige S5-punkter etter lukket
R4-S5, slik at et ekstra rent automatisk betalt F1-forsøk unngås.

Historisk validert S2 er bevart: **TG2 4/4, TG3 1/1**, ingen oppdiktede eller
oversette funn; F4s TG3 er fysisk PDF-side 4. Originaler/fasit/modellens
prompt/schema er urørt. Originalintegritet er etterprøvd av implementer og
reviewer. Nytt leverandørkall: **0**, ny API-kostnad: **USD 0**. Historisk
samlet dokumentert kostnad inklusive preflight er USD 0.016072; dette er ikke
en ny avstemming av dagens konto.

## 4.5, R4-S5 og menneskelig gjennomføring

Mads er bekreftet faktisk deltaker. Ingen tidligere S5-registreringer skal
gjenbrukes. Faktiske mennesketider, manuell referanse, medianer og tidsgevinst
er fortsatt **ikke verifisert**. Ingen menneskehandling eller tid er simulert.

[Måleskjema og instrukser](../../implementation-artifacts/story-4-5-mads-maaleskjema.md)
inneholder tre forhåndsplanlagte forsøk, F1/F2/F4, med nye ID-er og blanke
tidsfelt. F3 med L=null er utenfor vellykket S5-start. Første F1 planlegges som
ny 4.4-live med samtidige S5-punkter; 4.4-bevis/review kontrolleres før resten
av 4.5. Ingen opprinnelige mapper skal overskrives.

[R4-S5-beslutningsloggen](../../planning-artifacts/r4-s5-mads-gjennomforing-2026-10-24.md)
er lenket fra sprintstatus og har fortsatt open/partial. Faktisk miljø,
tidsmetode/oppløsning, startberedskap, ny original-/kostnadsoppfanging og
konto-/pris-/budsjettavstemming må bekreftes før betalt start.

Neste menneskelige handling er et lokalt, ubetalt prøveopptak og utfylling av
miljø/opptaksmetode i skjemaet. Mads melder «Mads klar» med OS/nettleser og
prøvefil. Han stopper før Start analyse. Root kan kontrollere teknisk bevis,
men kan ikke utføre eller attestere hans menneskelige kontroll.

[Uavhengig review av 4.5-forberedelsen](../../implementation-artifacts/story-4-5-uavhengig-review-2026-10-24.md)
består etter én dokumentpresisering: oppfanging klargjøres før Start analyse;
faktiske svar/kostnader registreres under/etter forsøket. To utilsiktede
tekstprefikser er også rettet. Dette er godkjent klargjøring, ikke fullført
Story 4.5 eller bestått S5.

## Full sluttregresjon

Kjørt på den ferdige produktrettingen etter uavhengig B1-review med Node
24.21.0/npm 11.19.0 og eksisterende Playwright-cache. Rent prosessmiljø uten
API-nøkkel/ANALYSIS_MODE; OS-nettsperre tillot bare lokal loopback. Ingen
automatisk retry, hoppede tester eller nye betalte kall. Rålogg:
[avslutningsregresjon](../../implementation-artifacts/epic-4-avslutningsregresjon-2026-10-24.txt).

| Kontroll | Resultat |
|---|---|
| Typekontroll, lint, produksjonsbuild | bestått |
| Vitest `npm test -- --maxWorkers=1` | 39 filer, 1082/1082 |
| Bygget app, Playwright | 195/195 |
| Dev/offline | 3/3 |
| Komponenttester | 37/37 |
| `verify-analysis-build.mjs` | build/demo bestått, 204 frontendfiler, 0 nøkkellekkasjer |
| S2-evaluator og kjøringssikkerhet | 13/13 |

Alle ni kommandoer fullførte med exit 0. Eksisterende Vite-varsel om stor
chunk er uendret. Fullregresjonen er offline produktbevis og erstatter ikke
S2-originaler, B2-live-sluttbevis eller Mads' S5-måling.

Kursgrunnlaget er fulgt via sensoruttrekk/faglærertilbakemelding og de
godkjente planartefaktene: sporbar faktisk evaluering og ærlige bevisgrenser.
Ingen låste krav eller fasit er tilpasset for å få bestått. Endelig arbeid og
aktiv promptlogg samles i en lokal commit; ingen push.

## Senere forenkling og faktisk F1-preflight samme dag

Mads ba deretter om å slippe detaljskjemaet. Det er beholdt internt og fylt
med tekniske opplysninger fra repo/maskin. Den korte operative instruksen er
[egen F1-instruks](../../implementation-artifacts/story-4-5-f1-instruks.md).
Mads bekreftet USD 2 og intet annet forbruk/ukjente belastninger etter USD
0.016072. OpenAI Docs-pris er åpnet på nytt; modellens lesende oppslag ga
HTTP 200. Ingen Responses-kall. Konservativ ny reservasjon er USD 1.53.

Person/miljø/metode/konto er nå dokumentert, og R4-S5 er closed. Det er ikke
påstand om faktisk menneskelig gjennomføring. Den tidligere open-statusen
over beskriver det opprinnelige checkpointet, før denne nye brukerbestillingen.
Separat helper er implementert og uavhengig reviewet; 8 offlineprøver består.
Ett lifecyclefunn ble rettet: rene dokument-/beviscommits tillates etter
codecommit, mens eksakt kilde-/buildfingeravtrykk fortsatt kreves.

Ny kanonisk F1-plan er forberedt, uarmet lokal server er kontrollert med
bare GET, og root har deretter eksplisitt armert lokal server for Mads sitt
senere klikk. Sluttkontroll av GET viste HTTP 200/live og fravær av faktisk
analyse-/dispatch-/usagefiler og paidlock. Ingen analyse-POST, leverandørkall,
menneskehandling eller mennesketid er utført av agenten. Faktiske tider står
blanke. Originaler og produktkode er urørt. Eksakt plan/approval/GET-bevis
finnes under `story-4-5/S5-2026-10-24-F1-01/` i implementation-artifacts.
Ingen teststart, retry eller Story 5.5. 4.4 review, 4.5 backlog og Epic 4
in-progress består; neste handling er Mads sin filmede gjennomføring.

## Eksplisitt stopp og dokumentkontroll etter manuell F1-inspeksjon

Mads så ett TG2 og ingen TG3 i F1 og ba om stopp og kontroll før måling.
Armed-serveren ble identifisert som vår egen manuelle helper og stoppet med
SIGTERM. R4-S5 ble satt open/suspended, og endringen av gatebeviset
ugyldiggjør den tidligere armingens hashbinding. Lokal validateApproval-prøve
bekrefter avvisning. Ingen analyse-attempt/dispatch var registrert.

Ny lesende sporing fra dagens PDF-bytes gjennom ny PDF.js-ekstraksjon,
historisk basis og faktisk providerrequest bekrefter eksakt samme input.
Aktuell fil er identisk med opprinnelig Git-blob; actual/normalized request-
hasher stemmer med original dispatch/plan. Alle fire sider er også rendret
og visuelt inspisert på nytt. F1 har ett TG2 på side 2 og ingen TG3.
S2s 4/4 TG2 og 1/1 TG3 er samlede F1–F4-tall; TG3 er kun i F4.
Dette er en kommunikasjons-/aggregeringspresisering, ingen fixtureendring.

F1 er en minimal syntetisk PDF og gir bare begrenset menneskelig tidsbevis
for en trivial kontrolloppgave. S5 forblir stoppet før caseegnethet/utvalg er
avklart. Ingen representativitet eller generell tidsgevinst påstås.
Rapport og maskinbevis finnes i story-4-5-f1-dokumentsporing-2026-10-24.md og
story-4-5-f1-sporingskontroll-2026-10-24.json under implementation-artifacts.
Ingen produktkode, fixture, fasit, historisk provider/request/receipt eller
S2-score er endret. Nye betalte kall/kostnader: 0 / USD 0. Aktiv promptlogg
følger den lokale stopp-/sporingscommiten. Ingen push, 5.4/5.5 urørt.
