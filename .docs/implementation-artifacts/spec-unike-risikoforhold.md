---
title: Unike risikoforhold med utvidbare originalkilder
created: '2026-10-31'
type: feature
status: done
route: dispatch
baseline_commit: ce16e49b9fc68db894591f6daaf2071ad4ed9452
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens konkrete videreutvikling, tidligere autorisasjon til selvstendig implementering gjelder">

## Intent

Risikooversikten i Konsept A skal vise underliggende forhold fremfor gjentatte teksttreff. Ett samlet funn beholder alle kilder og opprinnelige beskrivelser. Brukeren åpner hvert funn for detaljer, utdrag og fysisk originalside. Konkrete eiendomsforhold skilles fra generell juridisk standardtekst. Viktige unike problemer kommer først.

## Boundaries & Constraints

Bevar originale API-uttrekk, kilder, fysisk sidenummer, tekstoffseter, rapportdekning, finans, avvisning/retting, TG3-kontroll og øvrige sikkerhetsregler. Gruppering er en ren visningsoperasjon. Ingen fuzzy tekstlikhet eller sammenslåing utelukkende etter kategori/tittel. Ukjent eller motstridende sammenheng beholdes adskilt. Gruppering oppgraderer aldri usikkert tekstgrunnlag eller brukerrettinger. Ingen betalte API-kall, push eller private dokumenter/utdrag i Git.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Gjentatt utleieforhold | Side 28 konkret kjellerutleiedel; side 58 singular utleid leilighet | Ett godkjenningsforhold med begge originale belegg | Alias tillates bare ved én identifisert utleieenhet i dokumentets aktuelle risikobelegg |
| Flere enheter | To ulike utleieenheter eller kjeller/loft | Separate funn | Uklar singular referanse tilordnes ingen av dem |
| Tekniske forskjeller | To like bad eller råte og lekkasje i samme tak | Separate funn | Lignende tekst beviser ingen felles tilstand |
| Generell lovtekst | Lovforklaring uten konkret eiendomsavvik | Egen bakgrunnsdel, ikke risikoteller | Eiendomsspesifikt avvik med lovhenvisning forblir risiko |
| Usikker kilde | partial-text, ukjent grad, brukerretting | Status/kvalitet/grade og alle kilder bevares | Ingen sammenslåing over kontroll- eller sikkerhetsgrenser |
| Utvidelse | Åpne ett funn med tastatur eller mus | Detaljer og alle originalkilder vises for akkurat funnet | Fokus/side/hash/navn bevares |
| Manglende dekning | Uleste sider eller vedlegg | Dekningsmangler synlige separat fra antall risikoforhold | Metadata telles ikke som selvstendige risikoer |

</frozen-after-approval>

## Code Map

- `src/frontend/investment/property-risk.ts`: gjeldende kandidater, kontroller, identitet, dekningsmangler; integrer gruppering etter disse sperrene.
- Ny `src/frontend/investment/risk-grouping.ts`: ren konservativ gruppering med dokumentkontekst; bruk eksisterende hash/navn/side/offset.
- `RiskOverview.tsx`: hovedside og RiskDetails-dialog; gjenbruk native details/summary per funn og PdfViewer-kallback.
- `concept-a.css`, `InvestmentOverview.tsx`: eksisterende uttrykk og kildeåpning; send eksisterende onSource også til hovedsidens funn.
- `src/backend/import/legal-risk.ts`, `technical-risk.ts`, dokumentkontrakten: lesekilder, endres ikke av denne visningsforbedringen.
- `tests/unit/property-risk.test.ts`, ny `risk-grouping.test.ts`, `tests/e2e/property-risk.spec.ts`, `investment-overview.spec.ts`: berørte tester.
- Planforankring: godkjent UX 2026-10-30, opprinnelig eiendomsrisiko-spec og faglærerens krav om etterprøvbarhet og eksplisitt usikkerhet.

## Tasks & Acceptance

- [x] `risk-grouping.ts` og selector: samle bare samme problemtype og konkret subjekt i samme dokument. Kildekontekst før sitatet brukes til å skille kjeller, loft og takterrasse. Ukjent subjekt grupperes ikke; eksakt kildeoverlapp kan avstemmes. Kontrollerte tekniske funn fra ulike findingId holdes separate.
- [x] `risk-grouping.ts`: ukjent singular utleiereferanse kan knyttes til én eksplisitt kjellerutleieenhet bare uten konkurrerende identifiserte enheter. Aldri bruk sidetall/adresse som hardkodet regel. Ulike statuser, grader, kildekvaliteter og brukerrettinger grupperes ikke. Alle opprinnelige medlemmer og kildebelegg bevares.
- [x] `RiskOverview.tsx`, CSS og InvestmentOverview: per-funn-utvidelse både på hovedside og i full liste; kompakt tittel/kilder, detaljer lukket fra start. Unike grupper telles; dekningsmangler og standardtekster vises separat utenfor risikotelleren. Prioriter TG3, konkret utleiegodkjenning og andre konsekvensfulle eiendomsforhold.
- [x] Tester: matrisen over, dokumentbytte, kildeunion uten avkorting, stabil gruppering uavhengig av rekkefølge, ingen mutasjon av originaluttrekk, privat case med originalside 28 og 58 samt desktop/mobil/tastatur.
- [x] `.docs/process/`: dokumenter designvalg, målrettede kontroller og review; behold automatisk promptlogg og sentral restoversikt.

**Acceptance:** Given Øvre Blekeveien 8, when risiko åpnes, then ikke-godkjent utleiedel vises én gang med side 28 og 58 under samme utvidbare funn. Given to bygningsdeler/enheter med lik tekst, when oversikten grupperes, then de forblir separate og originalbelegg bevares. Given generelle lovforklaringer eller dekningsmetadata, when antall risikoer vises, then de teller ikke som konkrete risikoforhold.

## Implementation Notes

Ingen produktavklaringer eller irreversible handlinger trengs. Aktiv promptlogg tilhører samme sesjon og inneholder brukerens siste bestilling; dette er eneste opprinnelige endring. Spec og lokal commit inngår i tidligere autorisert arbeidsflyt. Spesialistundersøkelse bekreftet at side 52 har separate godkjenningsforhold for kjeller, loft og takterrasse; kategori-/tekstbasert kollaps ville skjult vesentlige forskjeller.

## Spec Change Log

## Review Triage Log

| ID | Dom | Konkret spor og retting |
| --- | --- | --- |
| B1 | medium · patch | Etasjenøkkel slo sammen kjellerenheter øst/vest. Bevar identifiserende retning/enhet eller avstå. |
| B2 | medium · patch | Kildekontekst hoppet over Garasje/Tilbygg og lånte gammel kjeller. Nye subjekter/overskrifter skal avgrense kontekst. |
| B3 | medium · patch | Singular under Anneks fikk kjelleralias. Skille mellom fravær av kontekst og flertydig/ukjent kontekst. |
| B4 | medium · patch | Konkrete leiligheten/rommet/seksjonen kunne flyttes til bakgrunn ved lovhenvisning. Konkrete begrensninger bevares som risiko. |
| B5 | medium · patch | Generell lovregel med «av boligen som hovedregel» ble konkret. Krev sikker standardtekstklassifisering uten konkret eiendomspåstand. |
| B6 | medium · patch | Kombinert mangel på ferdigattest og brukstillatelse manglet problemsignatur. Begge kilder skal kunne samles ved sikkert subjekt. |
| B7 | medium · patch | «Mangler dokumentasjon på godkjenning» fikk ikke signatur for bruksendring. Legg positiv samme-subjekt-prøve i tillegg til negative skilleprøver. |
| B8 | medium · patch | Lukkede rader på samme side hadde identiske kategorititler. Vis konkret subjekt eller kort forskjellig beskrivelse før åpning. |
| E1 | medium · patch | Bokstavenheter a/b ble ikke gjenkjent. Enhets-ID håndteres også med små bokstaver uten å tolke preposisjonen i som enhet. |
| E2 | medium · patch | Motstridende kjeller/loft-kontekst kunne overstyres av singularalias. Flertydig kontekst sperrer alias. |
| E3 | medium · patch | Leilighet A forsvant ved normalisering i standardtekstkontroll. Konkrete enhets-ID-er må bevares også i bakgrunnsskillet. |
| V1 | medium · patch | Konteksttesten passerte mutant uten all kontekstbehandling. Krev positiv samling fra samme verifiserte kontekst og negativ feil-offset-prøve. |

Alle 12 funn er vurdert individuelt; overlappende rotårsaker B1/E1 og B3/E2 håndteres samlet uten å miste testeksempler. Funnene gjelder gjennomføring av allerede spesifiserte grenser, ikke nye produktvalg. Implementeringsagenten er gjenengasjert for retting, og etterkontroll registreres ved sluttverifikasjon.

## Verification

Målrettet Vitest for gruppering, selector og lokale risiko-/kontraktprøver; typecheck/lint/build; Playwright for risiko, dokumentbytte og kilder på egen port med tom nøkkel. Visuell kontroll desktop og mobil. BMAD-review av diff. Originaler og private skjermbilder beholdes utenfor Git.

### Endelig verifikasjon

Alle tolv individuelle reviewfunn er rettet og kontrollert av sine reviewlag. Ekstra enhets-ID-varianter og felleshenvisning er rettet med egne regresjonsprøver og nykontroll. 100 målrettede tester i seks filer, 9/9 berørte Playwright-prøver og 3/3 siste risikoprøver består. Build/typecheck/lint/diffkontroll består. Original dekning, backend, finans- og screeningregler er urørt. Desktop/mobil inspisert. Eksisterende PAA på port 3000 serverer nytt bygg med én prosess. [Detaljer og råbevis](../process/arbeidsokter/2026-10-31-unike-risikoforhold.md). Ingen betalte API-kall, private originaler i Git eller push.
