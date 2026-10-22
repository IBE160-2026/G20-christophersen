# Story 3.9 — egenverifikasjon før uavhengig review

Dato: 2026-10-22. Baseline: `e2c2c131c7adeef0c80c2f1d9cab93c4aa069264`.

Autoritet: [Story 3.9 AC1–6](../planning-artifacts/epics.md), [Epic3-kontekst](epic-3-context.md), [storyspec](spec-3-9-oppdatere-resultat-etter-rapportkontroll-og-separat-tg3-endring.md), [SPEC/grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), final UX/arkitektur og [sprintstatus](sprint-status.yaml). Kursveiledningens og faglærerfeedbackens føringer er brukt til konkret sporbarhet, feil-/returtesting og dokumenterte iterasjoner; ingen nye produktkrav er utledet.

## Leveranse

Eksisterende resultatnavigasjon fornyer nå et historisk snapshot etter alle relevante brukte endringer når finansgrunnlaget er gyldig/bekreftet og rapportkontrollen er fullført etter felles kontrollautoritet. Tidligere finansbegrensning fra 3.8 er fjernet. Uendret retur eller ubrukt utkast beholder samme snapshot. Ingen ny skjerm, navigasjon, domaintolkning, kontrakt, analysehandling eller backendendring er innført.

Brukt retting/avvisning krever eksisterende nødvendig ny kontroll. Separate TG3-endringer bevarer finans-/listebekreftelse og bruker eksisterende FR-5-validering. Uavklart kan beholdes og gi nytt gjeldende prioritet-1-resultat. Ugyldig Avklart/ukjent binding og ny rapportfeil behandles ved vurderingsgrensen som utilstrekkelig, mens vanlig resultatnavigasjon bevarer historisk snapshot inntil relevant håndtering er fullført. Ny rapport krever eksplisitt analyse og kontroll; tidligere/sene svar avvises av eksisterende generasjonsvern.

## AC-spor

| AC/testspor | Faktisk bevis |
|---|---|
| AC1 / AT-13/16, RT-11/13: utkast og Avbryt | Ny overgangstest bevarer samme snapshot/binding, bekreftelser og utkast ved visnings-/trinnbytte; Avbryt fjerner bare utkast. Bygget-app-forløp går utkast→trinnretur→Resultat→retur→Avbryt, viser ubrukt F1-TG2-1-utkast uten endret anbefaling/tall og gjenoppretter Korriger-fokus. Eksisterende 2.8-flerfunnstester i berørt regresjon prøver faktisk funnbytte/utkastretur. |
| AC2 / RT-3/11/12: Bruk og avvisning | Overgangs- og bygget-app-prøver viser historisk resultat straks Bruk utføres, ingen fornyelse før både enkeltfunnkontroll og listebekreftelse. Nytt snapshot bruker faktisk korrigering/kilde og samme original; tidligere snapshot er helt uendret. Separat TG3-avvisning beholder originalen inaktiv, krever listebekreftelse og gir deretter Gå videre på F1-økonomi uten å registrere teknisk avklaring. |
| AC3 / AT-7–9/20, RT-14/15, FR5-1/2/3/4/7 | Hver av status/begrunnelse/grunnlag prøves som selvstendig endring etter eksisterende resultat. Nye gyldige tekster følger nytt snapshot. Tom/whitespace tekst, ukjent/manglende status og Uavklart gir prioritet 1 ved vurderingsgrensen; ugyldig registrering beholder historisk snapshot i vanlig navigasjon. Fullført kontroll med Uavklart gir nytt gjeldende Innhent mer informasjon. Uendrede finans-/funn-/listekontroller og uttrekk beholdes uten ny bekreftelse. |
| AC3/6 / FR5-5/6: flere mangler og økonomiavhengighet | Ny bygget-app-test bruker ekte `finding-control/tg3.pdf` og ordinær HTTP-kontrolladapter: to Uavklart→electric Avklart gir nytt prioritet-1-resultat med bare roof som utløser→også roof Avklart gir Gå videre→bekreftet F2-leie gir Forkast. Begge TG3 beholdes, samme rapportkontroll gjenbrukes. Overgangstester med L 1 900 000/1 400 000 gir også Gå videre/Forkast etter gyldig Avklart. Alle sju FR-5-eksempler er i tillegg grønne ved eksisterende rene regelgrenser. |
| AC4: avklaringens forholdsbinding | Nye overgangsprøver bruker whitespace-representasjon, kjent motstridende beskrivelse, ukjent omskriving og endret fysisk side. Samme-ID er ikke bevis på samme forhold; tekstendring alene overfører ingen binding. To bygget-app-forløp bevarer avklaring ved ren representasjonsretting, men beholder historisk resultat og konkret lokal bindingsfeil ved ukjent forhold. Eksisterende statusregistrering Uavklart gjør håndteringen eksplisitt før nytt prioritet-1-resultat. Original, brukt retting og tidligere tekstgrunnlag er tilgjengelige. |
| AC5: ny rapport, sen respons og ny feil/fullføring | Ny overgangstest starter faktisk generasjon 2, erstatter med generasjon 3, injiserer et ellers gyldig gen2-svar og en gammel transportfeil direkte mens gen3 er aktiv. Rapportobjektet forblir identisk. Ny feil gir utilstrekkelig grunnlag og historisk snapshot; nytt fullført/kontrollert gen3-resultat har bare ny rapportbinding/aktive funn, uten gammel TG3. Bygget-app-forløp prøver eksplisitt rapportbytte→invalid-format→ny faktisk PDF→fullført kontroll, og et separat forløp holder en faktisk rapportrespons tilbake mens en annen rapport velges/analyseres/kontrolleres. Sentsvar kan ikke overstyre nytt resultat. |
| AC6: samme nåværende grunnlag, feltfeil/fokus, kallantall | Nye overgangsprøver krever at hele snapshotbindingen tilsvarer aktiv økt, tommer endringssporet, bevarer uendrede finansverdier og original og beviser at forrige snapshot ikke muteres. Bygget app prøver lokal ugyldig side 999, første-feilfokus/aria-invalid, Bruk/Avbryt-fokus, resultatoverskrift og kunngjøring. Gjenbruk av rapport/funn/TG3 gir ett samlet `/api/analysis`-kall; ingen nye HTTP-kall betyr ingen nye requestdrevne adapterkall. Rapportbytte/feil/fullføring gir tre eksplisitte HTTP-forsøk (invalid-format stopper før adapter); sent-svar-forløpet teller to nye analyseforespørsler etter den første baselinen, totalt tre. Ingen kontroller utløser ny KI-/adapteranalyse. |

## Tester og miljø

Node `v24.21.0`, npm `11.19.0` og eksisterende Chromium-cache. Lokal server/Chromium krevde godkjent sandboxunntak. Offlineprøven sperrer eksterne adresser før oppstart, observerer null eksterne forsøk og bruker ordinær lokal demo/PDF-pipeline. Ingen nøkkel eller betalt API er brukt. Forløpet med to TG3 bruker eksisterende kontrolladapter ved ordinær HTTP-adaptergrense; ingen offentlig testrute er laget.

| Kontroll | Resultat | Bevis |
|---|---|---|
| Nye overgangsprøver før produksjonsendringen | **16 røde, 2 grønne**; manglende fornyelse | [Rød logg](story-3-9-state-rod.txt) |
| Berørte overgangs-/regelprøver | **254/254 bestått**, inkludert **18 nye** | [Grønn logg](story-3-9-state.txt) |
| Første nye bygget-app-kjøring | **6/7 bestått**; én test sammenlignet innerText med textContent, rettet til `useInnerText` uten produktendring | [Første logg](story-3-9-e2e-forste.txt) |
| Berørt bygget-app-regresjon, rapport og resultat | **72/72 bestått**, inkludert **8 nye** Story 3.9-forløp | [Grønn E2E-logg](story-3-9-e2e.txt) |
| `npm run build` | Bestått, inkl. typecheck; eksisterende Vite-størrelsesmerknad | [Bygglogg](story-3-9-build.txt) |
| `npm run typecheck` og `npm run lint` etter endelige tester | Bestått, ingen type-/lintfeil | [Typer](story-3-9-typecheck.txt), [lint](story-3-9-lint.txt) |
| `git diff --check` | Bestått før implementeringscommit | Lokal kontroll |

Konsolloggene har bare fått avsluttende linjemellomrom og tomme sluttlinjer fjernet for ren Git-diff; testinnhold og utfall er bevart.

Eksakte kommandoer fra repositoryroten:

```sh
export PATH="/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="/private/tmp/ibe160-story-3-5-browsers"

# Rød kontroll kjørt før produksjonsendringen.
npm test -- tests/unit/report-result-renewal.test.ts

# Grønn berørt kontroll etter endelig overgangstest.
npm test -- tests/unit/report-result-renewal.test.ts tests/unit/financial-result-renewal.test.ts tests/unit/result-snapshot.test.ts tests/unit/screening-result-navigation.test.ts tests/unit/finding-control.test.ts tests/unit/finding-list-control.test.ts tests/unit/tg3-resolution.test.ts tests/unit/complete-screening.test.ts
npm run build

# Første kjøring hadde sju nye tester; én innerText-testforventning ble rettet.
npx playwright test tests/e2e/screening-result.spec.ts --grep '3.9' --workers=2

# Endelig berørt E2E med ytterligere to-TG3-forløp: 72 tester.
npx playwright test tests/e2e/screening-result.spec.ts tests/e2e/report-analysis.spec.ts --workers=2
npm run typecheck
npm run lint
git diff --check
```

## Agentgjennomført visuell kontroll

Tre faktisk genererte nettleserbilder er åpnet og inspisert: [lokal sidefeil](story-3-9-ui/lokal-sidefeil.png) viser synlig feltfokus/feil, bevart original og gyldig forrige resultat mens rettingen fortsatt er ubrukt. [Fornyet korrigering](story-3-9-ui/fornyet-korrigering.png) viser gjeldende nytt brukt funn og både original/brukerretting med uendrede fire nøkkeltall. [Fornyet Uavklart](story-3-9-ui/fornyet-uavklart.png) viser Gjeldende, prioritet 1, navngitt TG3 med korrekt PDF-side og fire delgrunnlagstall. Automatiserte fokus-/statuspåstander støtter denne kontrollen. Dette er agentgjennomført QA, ingen påstand om menneskelig S5/S6 eller live-kvalitet.

## Checkpoint

Implementeringen er klar for separat uavhengig BMAD-review. Storyspec **in-review**, sprintstory **review**, Epic 3 **in-progress**. Implementeringsagenten har ikke utført review eller satt done. Forelder starter ny reviewer, håndterer funn og kjører full siste regresjon før eventuell Epic 3-done. Ingen ny blocker, produkt-/arkitekturbeslutning, Epic 4-arbeid eller push.
