---
title: 'Lokalt kildebelagt leiegrunnlag'
type: 'feature'
created: '2026-11-05'
status: 'done'
route: 'dispatch'
baseline_commit: 'eab51511fb961bac03874a5ecd4e15485434e9e3'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens detaljerte implementasjonsoppdrag og fortsett-instruks gir autorisasjon">

## Intent

PAA skal bruke et lite, versjonert lokalt utdrag av offentlig publisert leiestatistikk for å sammenholde dokumenterte boligopplysninger med relevante referanser. Undersøk Utleiemegleren/NTB og Hybel, vis faktiske tall og usikkerhet, behold SSB som selvstendig sammenligning og test Nøstegaten 65 A og Rostockgata 96 uten tilpasning mot ønsket pris.

## Boundaries & Constraints

Alle referanser har kilde, publiseringsdato eller eksplisitt ukjent dato, observasjonsperiode, geografi, boligtype, prisnivå og kontrakts-/annonsegrunnlag. Manglende pris og utvalgsopplysninger forblir ukjente. Vekstprosenter konverteres aldri til kronebeløp. Kildenes faktiske avgrensninger skal følge tallene. Gjennomsnitt for blandede boligtyper brukes ikke som treromspris; rom i kollektiv multipliseres ikke til helboligleie. Ingen udokumenterte standard-, utsikts-, etasje-, lokasjons- eller arealpåslag. Ulike populasjoner/årganger blandes ikke i et konstruert gjennomsnitt.

SSBs eksisterende dokumenterte interpolasjon og høyst 2 m² ytterpunktstilnærming beholdes kun som statistisk sammenligning med synlig formel. Tidligere vilkårlige prosentmarginer fjernes. Sonespenn er geografisk variasjon, ikke individuelt usikkerhetsintervall. Individuell markedsleie skal uttrykkelig være utilgjengelig når individuelle sammenligningsobjekter/justeringsgrunnlag mangler. Statistisk SSB-scenario kan fortsatt brukes ubekreftet i økonomien, med statistikkår og separat fra faktisk leie og manuelt registrert forventning.

Bruk bare lokale filer ved analyse, også for SSB. Ingen scraping, periodisk innhenting, ny integrasjon eller dataplattform. Ingen betalte AI-kall, push eller eksterne skriveoperasjoner. Lokal commit inkluderer aktiv promptlogg; private originaler og hele tredjepartsrapporter distribueres ikke. Historiske prosessnotater og åpne avvik beholdes.

## I/O & Edge-Case Matrix

| Tilstand | Forventet atferd |
|---|---|
| Bergen, 40 m², 2 rom, ukjent bydel | Relevante byreferanser med geografisk forbehold; SSBs to soner separat; ingen gjettet Bergenhus |
| Oslo, Gamle Oslo, 59 m², 3 rom | Relevant publisert treromsreferanse; blandet nykontraktsgjennomsnitt kun kontekst; SSB 59→60 merkes |
| Manglende/motstridende boligopplysninger eller enebolig | Ingen valgt leilighetsreferanse eller individuell markedspris |
| Areal utenfor SSB-grunnlaget | SSB utilgjengelig; publiserte romreferanser kan vises med eksplisitt manglende arealtilpasning |
| Foreldet eller fremtidig kilde | Ingen omdatering/fremskriving; foreldelse vises og fremtidige publikasjoner brukes ikke |
| Nett utilgjengelig, gjentatte analyser og nytt objekt | Samme lokale tall; ingen ekstern forespørsel eller data fra forrige bolig |
| Manuell eller faktisk leie registrert | Automatisk sammenligning overstyrer aldri registreringen eller bekrefter screening |

</frozen-after-approval>

## Code Map

- `src/backend/rent/ssb-rent.ts`: eksisterende JSON-stat-validering, geografier, arealregler og desimalberegning gjenbrukes; nett og cache erstattes med statisk snapshot.
- `tests/fixtures/ssb/09897-*.json`: allerede verifiserte offentlige originalresponser fra 2025, publisert 22.12.2025, flyttes/kopieres uendret til produksjonsdata og krysskontrolleres.
- `src/contracts/rent-estimate.ts`: viderefør kildebundne boligfelt og invariantsjekker; utvid respons med lokale referanser, utvalgsbegrunnelse og eksplisitt markedsstatus.
- `src/frontend/investment/RentEstimatePanel.tsx`: vis publiserte referanser og markedsbegrensning fremtredende, SSB separat, kildelenker og metode tilgjengelig.
- `src/frontend/state/scenario.ts`: bevar ubekreftet økonomi, kildeår, objektidentitet og prioritet for registrert leie; oppdater merking.
- `tests/e2e/rent-real-document.spec.ts`: eksisterende ekte originale PDF-flyter verifiserer felt/sider og økonomi; erstatt levende SSB-fasit med uavhengige lokale råceller.
- Faglærers brief-tilbakemelding 06.10.2026 og sensorveiledningens kildeuttrekk: smalt omfang, sporbare kilder, skille fakta/estimat og beregning i vanlig kode.

## Tasks & Acceptance

- [x] `src/backend/rent/data/` og `.docs/implementation-artifacts/leieagent-lokale-referanser.md`: lite manuelt kontrollert utdrag, datoer, metode, kildeforbehold og vedlikehold.
- [x] `src/contracts/rent-reference.ts`, `src/backend/rent/published-references.ts`: valider statiske data, velg mest geografisk spesifikke romreferanse fra samme kildeårgang; behold andre relevante referanser separat.
- [x] `src/backend/rent/ssb-rent.ts`, `src/contracts/rent-estimate.ts`: lokal SSB, ingen netttransport; tydelig statistisk resultat og manglende individuell markedsleie; fjern prosentmarginer.
- [x] `src/frontend/investment/RentEstimatePanel.tsx`, `src/frontend/state/scenario.ts`: lesbar fremstilling og ubekreftet scenario med korrekte år og prioritetsregler.
- [x] `tests/unit/`, `tests/integration/rent-http.test.ts`, `tests/e2e/rent-real-document.spec.ts`: kjør relevante modell-, kontrakt-, HTTP- og ekte PDF-prøver, inkludert nettforbud og mobilvisning.
- [x] `README.md`, `.docs/process/arbeidsokter/2026-11-05-lokalt-leiegrunnlag.md`, `deferred-work.md`: oppdater någjeldende atferd, faktiske resultater og verifikasjon uten å lukke kalibreringsavvik på implementasjonspåstand.

Given dokumenterte boligfelt, when lokal modell kjøres, then er hver vist referanse sporbar til en offentlig publisert celle og kjent populasjon eller eksplisitt ukjent avgrensning.

Given manglende individuelt prisgrunnlag, when resultatet vises, then hevdes ingen individuell markedsleie, heller ikke når statistiske referanser og økonomiscenario har beløp.

Given de to private originalene, when endeprøven kjøres, then bekreftes faktiske felt, riktige referanser, beholdt usikkerhet og ingen betalte/eksterne leieoppslag.

## Implementation Notes

Delegert kodeundersøkelse feilet med tjenestens bruksgrense. Ingen fungerende underagent er tilgjengelig; hovedagenten gjennomfører kodearbeid og review selv etter workflowets fallback. Brukerens «fortsett» viderefører det konkrete autoriserte oppdraget; ingen ny spesifikasjonsgodkjenning kreves.

Egenkontroll fullført mot samlet diff og kjørte tester. Kildekontrakt, datoer,
boligmatching, manglende markedsgrunnlag, offline-kjøring og skjermvisning er
verifisert. Uavhengig agentreview var utilgjengelig og hevdes ikke. Ingen
produktavvik er lukket; PAA-LEIE1 beholdes åpen. Se [faktiske testbevis og
resultater](../process/arbeidsokter/2026-11-05-lokalt-leiegrunnlag.md).

## Spec Change Log

## Review Triage Log

| Funn fra egenkontroll | Vurdering og løsning |
|---|---|
| Blandet nykontraktsgjennomsnitt feilmerket som romreferanse i konstruert respons | Medium: schema krever nå leilighet/rom og samsvar med dokumentet; negativ test bestått. |
| Ugyldig kilde-URL kunne kaste i refinement | Medium: avvises uten parserunntak; negativ test bestått. |
| SSB-mangel omtalt som manglende markedsestimat | Low: statusoverskriften er presisert; panel og ekte PDF-prøver bestått. |
| Utvalgstype utenfor mobilens første tabellutsnitt | Medium: utvalg i første kildekolonne; egen mobilprøve bestått og bilde visuelt kontrollert. |

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, målrettet Playwright med begge obligatoriske private originaler. Ingen betalt modelltransport. Testbevis og faktisk resultat føres i arbeidsøkten.
