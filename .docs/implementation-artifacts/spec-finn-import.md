---
title: 'FINN-1: Én lenke til kontrollert analysegrunnlag'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: 'ff3ea6e4431d5a104307487c7ec577c15980d2aa'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukereid omfang; fryses ved spec-godkjenning">

## Intent

Én FINN-boliglenke gir tilgjengelige økonomifelt med kilder til kontroll og
retting før eksisterende analyse. Manuell PDF og fire trinn beholdes. Bestilt
2026-10-28 som avgrenset unntak fra SPECs non-goals; historiske akseptanser bevares.

## Boundaries & Constraints

Bevar AD-1/2/4/7/8/9/10, P/L/D/J/Ymin og screening. Nye beløp er eksakte
desimalstrenger i NOK. Original import og brukerkorrigering er separate;
null er ukjent, eksplisitt 0 krever kontroll. Ingen betalte kall eller push.
S5-W1, eksisterende stories og frosset S6-bevis endres ikke.

Responses-transport injiseres; produksjonsruten er deaktivert. Dokumentert
`open_page` på 476576649 er teknisk bevis, ikke kildefasit/tilgangstillatelse.
Live krever dokumentert tillatt kanal, kostnadsautorisasjon og kvalitetsprøve.

Ingen overvåking, direkte scraping, automatisk PDF, leie-/oppussingsestimat,
driftsestimat, nye tjenester eller endring av PDF-livekonfigurasjonen.

## I/O & Edge-Case Matrix

| Tilfelle | Resultat |
| --- | --- |
| URL | HTTPS, eksakt FINN-vert, boligbane, én numerisk kode; avvis credentials/porter før adapter |
| Tilgjengelige felt | Pris, totalpris, omkostninger, dokumentavgift, fellesgjeld/-kostnader, skatt, avgifter, øvrig eksplisitt økonomi; kilde, periode/år, hentetid |
| Manglende/motstridende felt | Synlig missing/unavailable/conflict; ingen utfylling med gjetning |
| Feil side/handling/kilde | Avvis; nøyaktig annonseidentitet og completed open_page kreves |
| Ny lenke/sent svar | Generasjonsvern; gamle felt og gammel rapport kan ikke bli nytt objekts grunnlag |

</frozen-after-approval>

## Code Map

`src/contracts/financial-basis.ts` bevares. Gjenbruk `src/domain/validation.ts`
og `financial-basis.ts` for desimaler/kostnadsvern. Økt/resultatbinding eies av
`src/frontend/state/session.ts` og `result.ts`. `src/backend/analysis/backend-config.ts`
gir modell/SDK-referanse; PDF-oppsettet endres ikke.

## Tasks & Acceptance

**Execution:**
- [x] `src/contracts/listing.ts` — delt runtimekontrakt for felt, opphav, konflikter og korrelasjon.
- [x] `src/domain/listing.ts` — URL-validering, kontrollert mapping og separate forslag.
- [x] `src/domain/financing.ts` — egenkapital/låneforslag med Big.js.
- [x] `src/backend/listing/adapter.ts`, `request.ts`, `response.ts` — én Responses-forespørsel, open_page/kildekontroll, strict schema, frist/størrelsesvern; ingen retry.
- [x] `src/backend/http/listing-route.ts`, `server.ts` — deaktivert standard, kontrollert adapter i tester, trygg manuell fallback.
- [x] `src/frontend/state/session.ts`, `result.ts`, `analysis/listing-client.ts` — utkast, generasjonsvern, atomisk bruk og ugyldiggjøring.
- [x] `src/frontend/screens/ListingImport.tsx`, `FinancialInput.tsx`, `styles.css` — lenke, kildekontroll, retting, slider/tallfelt.
- [x] `tests/unit/listing.test.ts`, `financing.test.ts`, `listing-session.test.ts`, `tests/integration/listing-http.test.ts`, `tests/e2e/listing-import.spec.ts` — matrisen, fasit og regresjon.
- [x] `README.md`, `.docs/specs/spec-IBE160/SPEC.md`, `deferred-work.md` — spor, bevis og aktiveringsstatus.

**Acceptance Criteria:**
- FI-1: Gitt deaktivert kanal, når import bestilles, så skjer ingen ekstern transport og manuell reserveflyt vises.
- FI-2: Gitt adaptersvar, når felt rettes, så beholdes original/kilde/mangler/konflikter uten automatisk bekreftelse.
- FI-3: Gitt kjent pris og gjeld, når P foreslås, så er P summen uten omkostninger; FINN-totalpris brukes til kontroll. Ukjent gjeld eller sprik blokkerer forslaget.
- FI-4: Gitt kostnader, når forslag beregnes, så telles inkluderte poster én gang; ukjent deling/inkludering blokkerer full D/J.
- FI-5: Gitt låneforutsetninger, når egenkapital endres, så samsvarer slider/tallfelt. Nullrente/null lån og ugyldig løpetid prøves; ukjent fellesgjeldsbetaling blokkerer full J.
- FI-6: Gitt brukt grunnlag, når objekt/tall endres, så kreves ny relevant kontroll. Navigasjon bevarer utkast; PDF/demo/screening virker uten FINN-nett.

## Implementation Notes

- Sluttført 2026-10-28: alle oppgaver og FI-1–FI-6 verifisert innen godkjent deaktivert scope. 44 filer / 1176 Vitest, 37 komponenter, 200 bygget E2E + 3 dev bestod. Siste kontraktvakt fikk nytt fulløp, bygg/typekontroll, lint og 3 berørte E2E. [Sluttbevis og porter](finn-import-2026-10-28/sluttverifikasjon.md). Ingen betalt transport eller push; sentral FINN-1 er fortsatt åpen for live-aktivering.

- Implementert og kontrollert mot diff: kontrakter, URL/mapping, finansiering, adapter/rute, økttilstand, UI, tester og scope-spor. 56 målrettede tester og 2 nye E2E bestod. Første fullregresjon bestod 44 filer / 1143 tester før siste mindre rettinger; endelig regresjon følger review. Faktisk transport er bare injisert i tester; produksjonsruten gir deaktivert fallback.

- 2026-10-28: Brukeren godkjente specen og ba om fortsatt implementering i aktiv promptlogg. Ingen spec-endring mellom presentasjon og godkjenning.
- Fasit før kode: pris 3 000 000 + kjent gjeld 200 000 + omkostninger 75 000 gir P 3 200 000, annonsetotal 3 275 000 og kontantbehov 3 075 000. Dokumentavgift 75 000 inkludert i omkostningene legges ikke til igjen. Egenkapital 1 075 000 gir eget lån 2 000 000. Ved 0 % og 240 måneder blir måned 8 333,33 og år 99 999,96 når månedsbetaling øreavrundes først. Ved egenkapital 3 075 000 er eget lån og betaling 0. Ukjent fellesgjeldsbetaling gir ingen full J. Kjent usplittet felleskostnad 5 000/mnd gir ingen komplett D/J; skatt inkludert i posten telles ikke på nytt.
- Baseline: typekontroll bestod; 7 relevante testfiler / 298 tester bestod med Node 24.21.0 før implementering. Historiske arbeidstreendringer og eldre promptlogg er identifiserte FINN-bevis, ikke ukjente filer; de bevares.

## Spec Change Log

## Review Triage Log

| ID | Dom | Bevis og rute |
| --- | --- | --- |
| BH1 | high | Korrigert ugyldig tilleggspost blir null og filtreres ut før summering; komplett D/kontantbehov kan bli for lavt. Patch: behold aktive ugyldige rader og blokker berørt forslag. |
| BH2 | high | Reprodusert ugyldig foreldrepost: D=null, fellesbetaling=12000. Null annualJ forkaster ikke J. Patch: valider kjent deling/inkludering også uten komplett-drift-valg. |
| BH3 | medium | ownsD/ownsJ sammenligner bare beløp/kilde; manuell periode/år kan erstattes. Patch: sammenlign hele registrerte verdi-/periodegrunnlaget. |
| BH4 | medium | Native range godtar ikke norsk komma/gruppering som finansparseren godtar. Patch: bind kanonisk desimal, forklar/deaktiver ugyldig intervall. |
| BH5 | medium | UI bruker financing.J direkte, reduceren bruker ekstra årsvilkår. Patch: samme eksisterende årsvurdering i forhåndsvisning og bruk. |
| BH6 | medium | listing-response oppretter nytt draft og kaster tidligere rettinger. Patch: bevar rettinger ved samme objekt, krev ny kildekontroll. |
| BH7 | medium | draft beholdes ved lasting/feil og apply kontrollerer bare P. Patch: sperr bruk før ny vellykket fullføring; behold bevis uten falsk gjeldende status. |
| BH8 | high | sharedDebt=0 tvinger betaling=0 før motstrid mot kjent positiv betaling kontrolleres; mulig også med avstemt ny totalpris. Patch: konflikt blokkerer J. |
| BH9 | medium | Gyldig ekstrafelt note-price kolliderer med note-input for price. Patch: egne DOM-prefikser for beløp og kontrollmetadata. |
| BH10 | false | Egen reproduksjon med år abc gir D=null fordi financialPeriodContext avviser året; numerisk D anvendes ikke. Dette avkrefter konkret påstand om numerisk D/ugyldig anvendt D-år. J-forhåndsvisning og null annualJ behandles i BH2/BH5. |
| EH1 | high | Samme null annualJ-vakt som BH2; verifisert i kjørbar reproduksjon. Patch, grupperes med BH2. |
| EH2 | high | Konfliktpost med null beløp filtreres bort før engangs-/driftskontroll. Patch, grupperes med BH1. |
| EH3 | medium | Samme eierskapssammenligning som BH3; periode/år inngår ikke. Patch, grupperes med BH3. |
| EH4 | medium | Samme draft-erstatning som BH6; createListingDraft mister korrigeringer. Patch, grupperes med BH6. |
| EH5 | medium | Samme komma/range-feil som BH4; rawValue sendes direkte til range. Patch, grupperes med BH4. |
| VG1 | medium | Forhåndsverifisert gap: ingen test bruker komplette D/J-forslag i reduceren. Patch: kontroller 48000 / 111999.96, år/periode/kilde/ubekreftet, årsvakt og ny bruk. |
| R1 | medium | Bred E2E: 193 bestod, 6 feilet på gamle kontrollantall (13/14 og 29/31). Patch testenes avgrensning og legg til FINN-fokusprøve; bevar kontroll av eksisterende finansfelt. |
| R3 | medium | Egen reproduksjon: ekstrafelt toString passerer kontrakten og krasjer utkast med TypeError via Object-prototypen. Patch: reserverte ID-er avvises; åtte nye prøver og full 1176-regresjon bestod. |
| R2 | medium | UI lover utkast selv om medfølgende server alltid er deaktivert, og viser rå engelske tilstander/perioder. Patch: ærlig deaktivert tekst, norske etiketter og eksisterende knappestil. |

Alle reelle funn er avgrensede rettinger i eksisterende implementeringsflater,
uten nye produktvalg eller eksterne grensesnitt. Ingen punkter utsettes eller
lukkes i sentral deferred-work. FINN-1s aktiveringsport står fortsatt åpen.

Etterkontroll: uavhengig edge-reviewer bekreftet øvrige rettinger, men fant
fortsatt avrunding av 1075000.555 i slideren med øresteg (BH4/EH5).
Rettet ved å bevare eksakt tallfelt og vise slider bare for ørepresisjon;
forklaring og E2E-prøve følger. Ingen finansformel eller desimalparser endres.

## Design Notes

Kontantbehov = kjøpesum + valgte engangskostnader; eget lån = kontantbehov −
egenkapital, uten ny finansiering av fellesgjeld. Rente/løpetid starter blankt.
Annuitet: m=B·r/(1−(1+r)^−n), r=årsrente/12; nullrente m=B/n, null lån m=0.
Årlig egen gjeldsbetjening = 12·m med eksplisitt øreavrunding. Separat
brukerforutsatt forslag; full J krever kjent fellesgjeldsbetjening.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run test:components`,
`npm run test:e2e` skal bestå uten betalt transport. Fasit før kode; uavhengig BMAD-kodereview,
funnretting og berørt ny verifikasjon før ferdigstatus.

Syntetiske testresultater beviser ingen live-kildekvalitet. FINN-1 forblir åpen
til dokumentert lukking; ny funksjonalitet trenger eget senere S6-grunnlag.
