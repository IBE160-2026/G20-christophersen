---
title: 'FINN-1: Én lenke til kontrollert analysegrunnlag'
type: 'feature'
created: '2026-10-28'
status: 'in-progress'
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
- [ ] `src/contracts/listing.ts` — delt runtimekontrakt for felt, opphav, konflikter og korrelasjon.
- [ ] `src/domain/listing.ts` — URL-validering, kontrollert mapping og separate forslag.
- [ ] `src/domain/financing.ts` — egenkapital/låneforslag med Big.js.
- [ ] `src/backend/listing/adapter.ts`, `request.ts`, `response.ts` — én Responses-forespørsel, open_page/kildekontroll, strict schema, frist/størrelsesvern; ingen retry.
- [ ] `src/backend/http/listing-route.ts`, `server.ts` — deaktivert standard, kontrollert adapter i tester, trygg manuell fallback.
- [ ] `src/frontend/state/session.ts`, `result.ts`, `analysis/listing-client.ts` — utkast, generasjonsvern, atomisk bruk og ugyldiggjøring.
- [ ] `src/frontend/screens/ListingImport.tsx`, `FinancialInput.tsx`, `styles.css` — lenke, kildekontroll, retting, slider/tallfelt.
- [ ] `tests/unit/listing.test.ts`, `financing.test.ts`, `listing-session.test.ts`, `tests/integration/listing-http.test.ts`, `tests/e2e/listing-import.spec.ts` — matrisen, fasit og regresjon.
- [ ] `README.md`, `.docs/specs/spec-IBE160/SPEC.md`, `deferred-work.md` — spor, bevis og aktiveringsstatus.

**Acceptance Criteria:**
- FI-1: Gitt deaktivert kanal, når import bestilles, så skjer ingen ekstern transport og manuell reserveflyt vises.
- FI-2: Gitt adaptersvar, når felt rettes, så beholdes original/kilde/mangler/konflikter uten automatisk bekreftelse.
- FI-3: Gitt kjent pris og gjeld, når P foreslås, så er P summen uten omkostninger; FINN-totalpris brukes til kontroll. Ukjent gjeld eller sprik blokkerer forslaget.
- FI-4: Gitt kostnader, når forslag beregnes, så telles inkluderte poster én gang; ukjent deling/inkludering blokkerer full D/J.
- FI-5: Gitt låneforutsetninger, når egenkapital endres, så samsvarer slider/tallfelt. Nullrente/null lån og ugyldig løpetid prøves; ukjent fellesgjeldsbetaling blokkerer full J.
- FI-6: Gitt brukt grunnlag, når objekt/tall endres, så kreves ny relevant kontroll. Navigasjon bevarer utkast; PDF/demo/screening virker uten FINN-nett.

## Implementation Notes

- 2026-10-28: Brukeren godkjente specen og ba om fortsatt implementering i aktiv promptlogg. Ingen spec-endring mellom presentasjon og godkjenning.
- Fasit før kode: pris 3 000 000 + kjent gjeld 200 000 + omkostninger 75 000 gir P 3 200 000, annonsetotal 3 275 000 og kontantbehov 3 075 000. Dokumentavgift 75 000 inkludert i omkostningene legges ikke til igjen. Egenkapital 1 075 000 gir eget lån 2 000 000. Ved 0 % og 240 måneder blir måned 8 333,33 og år 99 999,96 når månedsbetaling øreavrundes først. Ved egenkapital 3 075 000 er eget lån og betaling 0. Ukjent fellesgjeldsbetaling gir ingen full J. Kjent usplittet felleskostnad 5 000/mnd gir ingen komplett D/J; skatt inkludert i posten telles ikke på nytt.
- Baseline: typekontroll bestod; 7 relevante testfiler / 298 tester bestod med Node 24.21.0 før implementering. Historiske arbeidstreendringer og eldre promptlogg er identifiserte FINN-bevis, ikke ukjente filer; de bevares.

## Spec Change Log

## Review Triage Log

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
