---
title: 'TG-fortsettelser og avgrenset tolkningsgrunnlag'
type: feature
created: '2026-11-03'
status: done
route: dispatch
baseline_commit: b982e10d7e6fa4b1ca81824a6c02de94301f2edb
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens eksplisitte implementeringsoppdrag fra b982e10">

## Intent

Gjør teknisk rapportanalyse mer pålitelig ved fortsettelser og gjør de
gjenværende usikre områdene konkrete. Bruk lokal tekst, bildegeometri og OCR
før et avgrenset, kildebundet grunnlag for eventuell senere AI-tolkning.

## Boundaries & Constraints

Bevar økonomi, finansregler, risikovurdering, originalkilder og Konsept A.
USD 0,20 gjelder samlet logisk analyse. Ingen betalte kall, push eller private
PDF-er i Git. AI-forberedelse er ingen transporttillatelse og ingen garanti
for pris, tokentall eller fullstendig rapportdekning. Uklar kobling forblir
uavklart; kode skal ikke tildele en manglende grad.

## I/O & Edge-Case Matrix

| Situasjon | Forventet resultat |
|---|---|
| Eksplisitt navngitt avviksfortsettelse på neste fysiske side | Ett funn med ordrette kilder på begge sider, dersom sikre grenser finnes |
| Entydig fortsettelse til neste kolonne | Hele avviket beholdes med originalgeometri; tvetydighet avvises |
| Ny komponent, usikkert rom, ulest avslutning eller dårlig OCR | Ingen gjettet kobling; synlig usikkerhet |
| Uløste TG-områder | Begrenset lokalt tolkningsgrunnlag med side/kilde og utelatelsesoversikt |
| Ingen godkjenning, ukjent pris/tokens/historikk | Ingen transport eller kostnadsreservasjon |
| Ekte rapport med resterende usikkerhet | Ufullstendig dekning selv om flere detaljer kan kobles |

</frozen-after-approval>

## Code Map

- `src/backend/import/technical-risk.ts`: eksplisitte tekstgrader og avvik;
  gjenbruk originale UTF-16-kilder og eksisterende klassifisering.
- `src/backend/import/visual-technical.ts`, `src/contracts/local-visual.ts`:
  lokal OCR-kobling og delt geometrivalidering; manglende avslutning sperrer.
- `src/backend/documents/local-visual-ocr.swift`: eksisterende lokal Vision,
  ingen ekstern bildeanalyse. Bevar faktisk OCR-score.
- `src/backend/documents/visual-import.ts`: valgfritt supplement innen
  eksisterende frist og svarbudsjett.
- `src/contracts/document-import.ts`: endelig kontroll av originalkilder.
- `src/backend/import/budget.ts`, `semantic-request.ts`: eksisterende
  USD 0,20-grense og preflight; skal ikke omgås eller svekkes.
- `src/frontend/investment/`: eksisterende kildeåpning og dekningsvisning.

## Tasks & Acceptance

- [x] Støtt sikre tekstfortsettelser med kilder fra hver side.
- [x] Håndter sikre kolonnefortsettelser; bevar usikre grenseområder.
- [x] Lag og integrer lokalt, begrenset AI-tolkningsgrunnlag uten transport.
- [x] Vis konkrete uavklarte områder og godkjennings-/kostnadsstatus.
- [x] Kjør relevante tester, ekte rapport og kort uavhengig review; rett feil.
- [x] Commit lokalt med aktiv promptlogg og kort, faktisk dekningsrapport.

Gitt et usikkert rapportområde, når lokal analyse er ferdig, skal brukeren
kunne åpne originalområdet og se hvorfor det fortsatt er uavklart.
Gitt manglende sikker grad/komponent/avvik, skal et AI-grunnlag aldri være
et verifisert funn eller gi komplettstatus.

## Implementation Notes

Oppdraget autoriserer implementering og parallelle subagenter allerede.
Ingen ny plan-/implementeringsgodkjenning er nødvendig; betalt transport er
uttrykkelig utenfor denne tillatelsen. Kort prosesspor følger AGENTS.md og
faglærertilbakemeldingens vekt på enkel pipeline og eksplisitt usikkerhet.
Kun aktiv append-only promptlogg var endret ved start.

Levert 2026-11-04. Tekstfortsettelse krever eksplisitt avsender-/mottakeranker,
identisk komponent og sikker avslutning på neste fysiske side. Visuell
kolonnefortsettelse krever gjenkjennelig rapportstruktur, sikker avslutning og
fullstendig kropp i leserekkefølge. Avvikskilder på ulike kolonner får egne
markeringer. Lokal ekstra OCR er avgrenset til ett lite fortsettelsesområde
per side; score beholdes og motstrid lagres som `conflictingReading`.

`technicalInterpretation` er lokal metadata, ikke en modellrequest. Høyst
12 mål/8 sider med kildebundet fortsettelseskontekst; utelatte kandidater
beholdes i `deferred`. Ingen transport, kostnadsreservasjon eller ny kvote.
Originalbelegg prioriteres foran valgfri planmetadata ved trang svargrense.

## Review Triage Log

| Funn | Vurdering og løsning |
|---|---|
| Blind R1: sekundær kontekstregion over arealgrensen kan avvise import | Medium, bekreftet. Samme arealgrense på kontekst; manglende kontekst beholdes eksplisitt. Egen tosiders regression passer. |
| Blind R2: vilkårlige topp-/bunnmarginer kan utelate avvikstekst | High, bekreftet. Alle venstre kroppslinjer til sidekant og høyre fra rapportoverskriftens topp vurderes; bare eksplisitte metadataetiketter filtreres. Regressioner passer. |
| Blind R3: usikkert rapportstrukturanker tillates | Medium, bekreftet. Svakt/motstridende rapportanker avviser kolonneflyt; regression passer. |
| Edge E1: ukjent komponentoverskrift i høyre spalte kobles til venstre TG | High, bekreftet. Generisk navne-/overskriftssperre i begge kroppsdeler. Uavhengig originalreproduksjon med Solcelleanlegg gir nå null funn. |
| Edge E2: mutert senere avvikslabel slipper gjennom sluttkontrakt | Medium, bekreftet. Delt geometri krever første avvikslabel. Uavhengig mutert DocumentImport avvises nå av sluttkontrakten. |
| Verification V1: mangler faktisk native test for kolonneflyt | Medium, rettet med generisk rasterisert PDF gjennom faktisk import, OCR, kobling og fire originalområder. Testen passer. |
| Verification V2: ukjent høyre overskrift | High, samme reelle rotårsak som E1; rettet og testet. |
| Hovedagent: ny kildeknapp åpner side uten områdemarkering | Medium, funnet i Playwright. Kildeformen sendes nå med riktig metode og renderidentitet; ny Playwright-kjøring passer. |
| Hovedagent: ugyldig boundary-indeks kan kaste i kildebygging | Medium, rettet med avvisning før dereferering; safeParse-regression passer. |

Uavhengig tekst-review: ingen ny konkret feil; eksplisitte ankere og begge
originalsider er kontrollert. Uavhengig etterkontroll av E1/E2 gjentok de
opprinnelige reproduksjonene og kjørte 57/57 visuelle tester. Ingen konkret
reviewfeil er utsatt. Generell recall/ustøttede fortsettelser forblir åpne i
[sentral oversikt](deferred-work.md).

## Verification

Målrettede unit-/integrasjonstester, typecheck/build/lint og én berørt
nettleserflyt. Ekte rapport sammenlignes med checkpointets ti TG2-detaljer;
sidetall, kildeområder og fortsatt uavklarte koblinger rapporteres separat.

192/192 relevante unit-/integrasjonstester i åtte filer, 7/7 faktiske native
OCR-tester, build/typecheck/lint og én ekte Playwright-importflyt passer.
Etter siste kilde-/forklaringsrettinger er de 66 direkte berørte unit-testene
kjørt på nytt; native kolonneflyt er også etterprøvd separat. Hele den eldre
testsuiten er ikke kjørt på nytt i denne avgrensede leveransen.

Ekte rapport: 25/25 sider rendret/lest, ti TG2-detaljer med 30 originalregioner,
104 ordrette tekstkilder etterprøvd. Ingen økning i verifiserte detaljfunn fra
baseline, ingen ekte TG3 verifisert. Side 81 har fire motstridende OCR-linjer;
etiketten er gjenfunnet, men ingen ny sikker avvikskobling godkjennes. Tolv
tolkningsmål er valgt blant 70 kandidatområder, 58 beholdes eksplisitt utenfor
utvalget. Dette er områdemengder, ikke antall TG-funn. Alle 25 sider har fortsatt
usikker fullstendighet. Se [økt og konkrete begrensninger](../process/arbeidsokter/2026-11-04-tg-fortsettelser.md)
og [maskinell statistikk](../process/arbeidsokter/tg-fortsettelser-2026-11-04/ekte-rapport-statistikk.json).
