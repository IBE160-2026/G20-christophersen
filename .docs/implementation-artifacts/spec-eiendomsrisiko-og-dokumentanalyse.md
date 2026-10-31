---
title: Eiendomsrisiko med etterprøvbare dokumentkilder
created: '2026-10-31'
type: feature
status: done
route: dispatch
review_loop_iteration: 0
baseline_commit: e55fd87cb6fe6e27e7e1ecc4a1225d5231b31482
context: []
---

<frozen-after-approval reason="Brukerbestilling 2026-10-31 autoriserer implementering uten unødvendige avklaringer">

## Intent

PAA skal samle juridiske, praktiske og tekniske risikofunn fra opplastet salgsoppgave og separat tilstandsrapport på eiendommens hovedside i Konsept A. Brukeren skal kunne åpne detaljer og original PDF-side, forstå hvilke problemer dokumentet beskriver, hva som krever kontroll, og hva som ikke er undersøkt.

Lokal dokumentanalyse gjenbrukes. Øvre Blekeveien 8 er privat kontrollcase: fysisk side 58 beskriver en utleid leilighet som ikke er godkjent som egen bruksenhet. Dette må vises uten å utlede et absolutt utleieforbud. Integrert rapport har også grafiske grader; graden skal ikke gjettes fra avviksteksten.

## Boundaries & Constraints

**Alltid:** Kilde bindes til dokumenthash, navn, fysisk PDF-side og ordrett tekstområde. Juridisk regelbasert søk gir delvis dekning, aldri juridisk godkjenning. Uavklarte rapportgrenser, grafiske grader, uleste sider og vedlegg bevares som begrensninger. Opplastingsbytte og feil skal ikke vise eldre funn som gjeldende. Eksisterende økonomi, finansregler, screening, kontroll og sikkerhet bevares. Separate rapporter tilgjengeliggjøres fra hovedsidens risikoarbeidsflyt.

**Aldri:** Betalte API-kall, push, private PDF-er eller kopier av private dokumenter i Git, OCR/gradgjetting, ny risikoscore eller automatisk endring av finansberegning/anbefalingsregler. Fravær av treff er ikke bevis for fravær av problemer.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Utleiegodkjenning | Eksplisitt ikke godkjent egen bruksenhet | Dokumentert forhold med kilde og kontrollhandling | Ingen generell påstand om ulovlig utleie |
| Juridisk tvil | Godkjenning ikke dokumentert eller servituttomtale | Mulig problem, originaltekst og kontrollbehov | Generell informasjon blir ikke dokumentert brudd |
| Teknisk grad | Entydig TG2/TG3 knyttet til bygningsdel | Funn med fysisk kilde | Uklare tabeller/legender gir ingen gjettet grad |
| Teknisk avvik | Vurdering av avvik uten tekstlig grad | Dokumentert avvik, grad ukjent | Rapportdekning forblir ufullstendig |
| Manglende undersøkelse | Ulest side, ubehandlet vedlegg eller eksplisitt ikke undersøkt | Synlig manglende undersøkelse | Ingen grønn totalstatus eller vellykket tomliste |
| Dokumentbytte | Ny salgsoppgave/rapport lastes eller feiler | Tidligere funn skjules fra gjeldende oversikt | Hash- og generasjonskontroller beholdes |
| Originalside | Funn fra integrert eller separat PDF | Riktig valgt PDF åpnes på fysisk side | Feil dokumentidentitet sperrer kildeåpning |

</frozen-after-approval>

## Code Map

- `src/backend/import/local-plan.ts`: lokal økonomi, identitet, TG-kandidater og tapsfritt manifest. Gjenbruk offsetbelegg og behold residualsperrer.
- `src/backend/import/semantic-adapter.ts`: generisk lokal import og sperret semantisk rest; ingen produksjonsklient opprettes.
- `src/backend/import/offline-adapter.ts`: bevar syntetisk demoregister og dets fasit.
- `src/contracts/document-import.ts`: runtimekontrakt og sourceValid; utvid bakoverkompatibelt med optional propertyRisk og full kildekontroll.
- `src/frontend/investment/InvestmentOverview.tsx`: Konsept A, native dialog og PdfViewer; økonomidelene beholdes.
- `src/frontend/state/prospectus.ts`, `report.ts`, `import-session.ts`: gjeldende dokumenter, rapportkontroller og ugyldiggjøring; gjenbruk fremfor konkurrerende økttilstand.
- Planforankring: salgsoppgave-code-first-design-2026-10-29, godkjent UX 2026-10-30, arkitektur AD-1–AD-7 og faglærerens krav om kilder, eksplisitt usikkerhet og vanlig kode for finans.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/pdf-source.ts`, `property-risk.ts`, `document-import.ts`: delt risikokontrakt og validerte originalkilder uten importsirkel.
- [x] `src/backend/import/legal-risk.ts`, `tests/unit/legal-risk.test.ts`: lokale juridiske regler, negasjoner og syntetiske regresjonsprøver; privat kontroll av Blekeveien side 58.
- [x] `src/backend/import/technical-risk.ts`, `local-plan.ts`, `tests/unit/technical-risk.test.ts`: eksplisitte grader og tekniske avviksblokker; bevar ukjent grad og ufullstendig dekning.
- [x] `src/backend/import/semantic-adapter.ts`, `offline-adapter.ts`: integrer risiko uten nye nettverkskall eller endring av økonomi.
- [x] `src/frontend/investment/RiskOverview.tsx`, risikoselektor og `InvestmentOverview.tsx`: prioritert oversikt, detaljer, riktige PDF-er og separat rapportopplasting; responsivt Konsept A.
- [x] `tests/unit/`, `tests/e2e/investment-overview.spec.ts`: kontroller matrisens feiltilfeller, dokumentbytte, kildevalidering og nettleserflyt.
- [x] `.docs/process/`: dokumenter undersøkelser, tester, uavhengig BMAD-review og lokale rettinger; nødvendig README og sentral restoversikt oppdateres.

**Acceptance Criteria:**
- Given en aktuell salgsoppgave, when lokal import fullføres, then juridiske og tekniske risikofunn vises med originalkilder og tydelig dekningsbegrensning.
- Given dokumenterte, mulige og ikke undersøkte forhold, when oversikt eller detaljer åpnes, then brukeren kan skille dem uten å tolke farge alene.
- Given eksisterende økonomi og sikkerhetskontroller, when risikomodulen brukes, then tidligere fasittester og sperrer forblir gyldige uten API-kostnad.

## Implementation Notes

Brukeren autoriserte tre parallelle implementeringsagenter og integrering hos hovedagent. Dette overstyrer skillens generelle sekvensielle dispatch og ekstra godkjenningspause. Ingen uavklarte produktvalg eller irreversible eksterne handlinger er nødvendige. Aktiv promptlogg er identifisert ved sesjons-ID og den konkrete brukerbestillingen. Arbeidstreet var ellers rent på main.

## Spec Change Log

## Review Triage Log

| ID | Dom | Verifikasjon og retting |
| --- | --- | --- |
| B1 | medium · patch | Reprodusert benektet ulovlighet/utleieforbud. Påstandsbasert negasjonskontroll og regresjon består. |
| B2 | medium · patch | Historisk ikke-godkjenning med eksplisitt senere godkjenning reprodusert; gjeldende status feiltolkes ikke lenger. |
| B3 | medium · patch | Motsatt ordstilling «ferdigattest mangler» reprodusert; kontrollbehov fanges og testes. |
| B4 | medium · patch | «Mulig» i annet ledd nedgraderte sikker opplysning. Klassifisering skjer nå per ledd. |
| B5 | medium · patch | Benektet servitutt skjulte separat veirett; leddvis søk og originalkontekst bevares. |
| B6 | medium · patch | Benektet lekkasje ble dokumentert. Felles avviksklassifisering brukes også ved eksplisitt TG-uttrekk. |
| B7 | medium · patch | Uundersøkt avviksblokk ble vist dobbelt; klassifiseres én gang som ikke undersøkt. |
| B8 | medium · patch | Benektet registrering oppgraderte mulig skade. Negerte utsagn fjernes før sikkerhetsgruppe fastsettes. |
| B9 | medium · patch | Overlapp skjulte resten av avviket. Visningen samler full beskrivelse og alle kildebelegg, og bevarer retting/avvisning. |
| B10 | medium · patch | Lik hash, ulike filnavn valgte feil PDF. Kildevalg krever både hash og navn; egen nettleserregresjon. |
| V1 | medium · patch | Test med tittel om rettinger satte correction null. Aktiv retting kontrolleres nå i både mulig/dokumentert gruppe. |
| V2 | medium · patch | Integrert identitetskonflikt ble ikke oppdaget i risikovisningen. Samme identitetskontroll som økttilstanden og konfliktfixture. |
| E1 | medium · patch | TG-fallback gjeninnførte benektet avvik. Felles filter og uavklart manifestkandidat bevarer sikkerhetsporten. |
| E2 | medium · patch | Samme rotårsak som B7, men separat rapportert hulltakingstilfelle. Testet uten dobbeltvisning. |
| E3 | medium · patch | «Kan ikke utelukkes» ble sikkert avvik. Klassifiseres og testes som mulig forhold. |
| E4 | medium · patch | Samme rotårsak som B3, separat reviewfunn. Begge dokumenttypene og ordstillingen testes. |
| E5 | medium · patch | Juridiske funn i separat rapport ble utelatt av selektor. Samles nå med korrekt rapportkilde. |

Alle 17 funn ble vurdert individuelt mot kode og konkrete reproduksjoner. Ingen krever produktvalg eller endring av finanskontrakt. Tre uavhengige BMAD-reviewlag har kontrollert rettingene på nytt; alle opprinnelige spor er rettet, 46 målrettede tester og selectorens 8 tester bestod. B10s nettleserbevis kjøres av hovedagent. Egne rettinger: blanke sider regnes ikke som uleste, og en uferdig separat rapport viser ikke gammel vurdering som gjeldende.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, relevante Playwright-tester og privat lokal PDF-regresjon. BMAD-review utføres etter integrering. Ingen nøkler eller betalt transport brukes i testene. Privat visuell dokumentkontroll lagres utenfor Git; versjonert bevis beskriver utfall og fysiske sider.

### Tillegg etter undersøkelse

Eksisterende sikker dokumentinspeksjon markerer flere sider med bevart tekst som unknown/incomplete. Risikomodulen kan bevare slike tekniske tekstbelegg bare som mulige forhold med sourceQuality partial-text og grade null. Egen kontraktkontroll krever eksakt originaltekst/hash/offset, riktig fagområde og at siden fortsatt er oppført som ulest. Dette gir aldri kontrollerbare TG-funn, full rapportdekning eller finansgrunnlag. Juridiske dokumenterte funn krever fortsatt readable tekst. Privat PDF og utdrag holdes i ignorert private/ eller systemets tempmappe.

### Sluttverifikasjon

84 filer / 1693 unit-/integrasjonstester bestod. Bred nettleserkjøring: 225 bestod, 5 valgfrie eldre miljøprøver ble skippet og 12 feilet. Samtlige 12 bestod etter isolert nykontroll (3 utdaterte port-/API-404-forventninger rettet, 9 tidsavbrudd uten produktendring). Samlet 237 kjørte ordinære nettleserprøver pluss 3 dev-prøver bestått; ingen påstand om én feilfri bred kjøring. Alle nye risikoflyter og privat originalside 58 samt en teknisk kandidats originalside er verifisert. Build/typecheck/lint/diffkontroll består. Se [arbeidsøkt og råbevis](../process/arbeidsokter/2026-10-31-eiendomsrisiko.md). Ingen betalt transport eller push.
