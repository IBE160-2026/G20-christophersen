# Story 3.9 — full uavhengig BMAD code-review

Dato: 2026-10-22. **Storyreview bestått.** Ingen reelle funn gjenstår etter individuell triage: **0 decision_needed, 0 patch, 0 defer, 10 avvist**. Ingen produkt-/arkitekturbeslutning er nødvendig.

Reviewed implementering: `e2c2c131c7adeef0c80c2f1d9cab93c4aa069264..7a4e1bb1efe0a93e8b1cfadd91eb9cccf6fcc826`. Diff: 20 filer, 1019 tillegg / 20 slettinger. Kun `src/frontend/state/session.ts` har produksjonsendring. Reviewen endrer verken produktkode, tester, spec eller sprintstatus. Spec er fortsatt `in-review`, story `review`; forelder håndterer status og full sluttregresjon separat. Dette dokumentet godkjenner den avgrensede storyreviewen, ikke ferdig v1, live-kvalitet eller menneskelig S5/S6.

## Oppdrag, autoritet og uavhengighet

Brukerens bestilling er videreført som konkret, autorisert review av angitt range/spec med alle aktive BMAD-lag og **sekvensielle, nye subagenter med arvet modell**. Ingen implementeringsagent har reviewet eget arbeid. Koordinatoren brukte `.agents/skills/bmad-code-review/SKILL.md`; workflow ble løst med `uv run _bmad/scripts/resolve_customization.py --skill .agents/skills/bmad-code-review --project-root . --key workflow`. Ingen prepend/append-steg eller ekstra persistent facts var konfigurert. Full-modus aktiverte Acceptance Auditor. Brukerbestilt sekvens overstyrte parallellstandarden. Brukerens uttrykkelige arbeidsgrense overstyrte skillens automatiske done-/neste-story-steg.

Lest som autoritet: [AC1–6 i epics](../planning-artifacts/epics.md), [storyspec](spec-3-9-oppdatere-resultat-etter-rapportkontroll-og-separat-tg3-endring.md), [Epic 3-kontekst](epic-3-context.md), [SPEC](../specs/spec-IBE160/SPEC.md), [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), final [EXPERIENCE](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) / [DESIGN](../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md), [arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), [sprintplan](sprint-plan.md) og [status](sprint-status.yaml). Fokus var CAP-7 med CAP-2/3/4/6/8, FR-5 og AD-2/4/6/8–10.

Kurs-PDF `.docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf` er lest direkte via macOS PDFKit, sammenholdt med [eksisterende kildeuttrekk](../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) og [faglærerfeedback](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md). Føringene brukes til meningsfulle tester, konkret kvalitetssikring og sporbar prosess; ingen nye produktkrav er utledet. `pdftotext` manglet; første Swift-forsøk traff en eksisterende cachekonflikt, og ny separat modulcache ga hele PDF-teksten. Ingen prosjektfil ble endret av dette.

Reproduserbare reviewinput ble laget med `git diff <range>` og `git log <range>` som `/private/tmp/story39-review-20261022.diff` og `/private/tmp/story39-review-20261022-claims.txt`. Viktige promper: lag 1 fikk skillens ordrette Blind Hunter-prompt med diffsti; lag 2 fikk skillens Edge Case Hunter-prompt med diff- og claimssti; lag 3 fikk Verification Gap-prompt med diffsti; lag 4 fikk Acceptance Auditor-prompt med spec, diff og autoritetslisten ovenfor. Alle fikk eksplisitt read-only, ingen skills eller egne subagenter. De tre første var kontekstfrie. Dette dokumentet bevarer oppdrag, resultat, triage og egne etterprøver. Automatisk usporet `session-01a16350-b555-7111-b4a6-97c91cbf99ba.jsonl` er bevart utenfor reviewcommit.

## Alle aktive lag

| Rekkefølge | Ny subagent | Resultat |
|---|---|---|
| 1 | `blind_hunter` | 94 642 bytes / 1000 = 94,642 kB; N = min(floor(sqrt(94,642) + 1), 10) = 10. Ti kandidater, alle individuelt vurdert nedenfor. |
| 2 | `edge_case_hunter` | Eksplisitt `[]`: ingen funn. Laget fullførte; dette var et gyldig nullfunnssvar, ikke manglende svar. |
| 3 | `verification_gap` | «No verification gaps found.» |
| 4 | `acceptance_auditor` | Ingen handlingsbare akseptfunn; AC1–6 og fryst spec samsvarer med diffen og felles kontrollautoritet. |

Ett lag var ferdig før neste ble startet. Ingen lag feilet eller manglet svar. Koordinatoren triagerte først etter at alle fire var ferdige, og kontrollerte omkringliggende kode, kallere, tester og autoritative avgrensninger. Ingen funn ble slått sammen eller utelatt.

## Individuell triage: avviste kandidater

Alle ti stammer fra `blind-hunter`. `false` betyr at kandidaten ikke etablerer en reell feil eller et nødvendig verifikasjonshull i denne leveransen. At én navngitt test ikke inneholder alle foreslåtte kombinasjoner, benektes ikke; den konkrete beskyttelsen er undersøkt mot samlet bevis. Ekstra scenarier er ikke automatisk nye AC.

| ID | Kandidat og opprinnelig sted | Dom | Konkret etterprøving / refutasjon |
|---|---|---|---|
| 1 | Gammelt svar bør leveres etter gjeldende nytt resultat, `tests/e2e/screening-result.spec.ts:608` | `false` | E2E holder et ekte gammelt HTTP-svar mens rapporten erstattes og kontrollerer F4-resultatet etterpå. Den beviser ikke en bestemt ankomstrekkefølge etter nytt snapshot, og rapporten påstår ikke dette. Ny state-test ved `report-result-renewal.test.ts:166` injiserer gammelt svar direkte under ny aktiv generasjon, uten avhengighet av abort. Egen probe 5 leverte i tillegg gammelt svar og gammel feil **etter** gjeldende nytt snapshot: rapportobjekt, snapshotidentitet og gjeldende status forble uendret. `reportReducer` avviser på aktiv/status/generasjon før responsbruk. Ingen uverifisert beskyttelse gjenstår. |
| 2 | HTTP-telling beviser ikke adaptertelling, E2E `:407` | `false` | Ingen backend-/adapterendring inngår i diffen. Kontrollhandlingene er rene statehandlinger; eneste frontend-fetch er eksplisitt `ReportClient.start`. Uendrede `analyze-document.ts:26` og `pipeline-child.ts:74` har én adapterinvokasjon uten omkjøringsløype. Eksisterende `http-analysis.test.ts:67` verifiserer faktisk HTTP/adaptertillatelse og duplikatsperre; `:186` dekker feil uten retry. Null ekstra HTTP-kall under kontroll kan derfor ikke starte et nytt requestdrevet adapterkall i denne endringen. Intern duplisering er hypotetisk og motsies av den leste kallkjeden. |
| 3 | Ubrukt utkast på annet funn under legitim fornyelse mangler, unit `:38` | `false` | Egen probe 1 lot F4-TG2-1 ha utkast mens F4-TG3-1 ble korrigert/kontrollert og snapshot fornyet. Aktivt utkast og Resultat-opplysning ble beholdt; utkastteksten fantes ikke i snapshotet. `calculateResultSnapshot` nullstiller bare klonede kontrollposters draft/errors, ikke aktiv state. Ingen utkasttap eller bruk som grunnlag. |
| 4 | Rapportkontroll kan skjule ubekreftet finans uten negativ kombinasjonstest, `financial-result-renewal.test.ts:206` | `false` | Egen probe 2 fullførte TG3-/rapporthåndtering samtidig som endret L var ubekreftet. Resultatnavigasjon beholdt historisk samme snapshot til `confirm-financial`, deretter kom nytt gjeldende. Uavhengig guard `isFinancialConfirmed` står uendret i den nye grenen; eksisterende `screening-result-navigation.test.ts:25` prøver historisk navigasjon med ubekreftet finans. Ingen omgåelse. |
| 5 | Ny tom rapport bør testes som erstatning, unit `:166` | `false` | Egen probe 5 erstattet F4 med completed tomliste: gammel snapshotidentitet ble beholdt før eksplisitt listebekreftelse; etter bekreftelse ble resultat gjeldende med tomme TG3/aktive funn og ingen gamle registreringer. Eksisterende E2E `report-analysis.spec.ts:1240` dekker rapportbytte/tomliste/eksplisitt bekreftelse; ny navigasjonsgren er uavhengig av antall funn. Ingen bypass eller gammelt TG3-grunnlag. |
| 6 | Ny feil bruker ugyldig PDF fremfor adapterfeil/delresultat, E2E `:575` | `false` | Testen dekker et reelt nytt analyseforsøk med synlig dokumentfeil; den utgis ikke for å være adapterfeil. Ny unit-test `report-result-renewal.test.ts:166` har separat aktiv generasjon med `analysis-failed` og bevarer historisk snapshot. Eksisterende E2E `report-analysis.spec.ts:111` dekker supported `partial.pdf` gjennom ordinær kontrolladapter og ufullstendighet; `:1332` dekker at feil ikke kan bekreftes. Felles `controlCompleted` er false ved alle slike feil; den nye grenen har ingen feilkodeavhengig snarvei. |
| 7 | Korrigert TG2→TG3 / TG3→TG2 mangler, unit `:135` | `false` | Eksisterende `result-snapshot.test.ts:283` dekker TG3→TG2 på annen side, originalbevaring og ny revisjon. Egen probe 4 brukte ny resultatnavigasjon for TG2→TG3: gammelt snapshot ble beholdt frem til eksplisitt Uavklart; deretter prioritet 1. TG3→TG2 ved revisjon 2 gav prioritet 3 og ingen aktive TG3; forrige snapshot forble prioritet 1. Aktiv grad styrer riktig. |
| 8 | Identiske TG3-verdier mangler no-op-bevis, unit `:92` | `false` | `tg3-resolution.test.ts:109` har allerede idempotens ved identisk grunnlag. Egen probe 3 registrerte identisk status, begrunnelse og grunnlag etter nytt snapshot; hver beholdt TG3-revisjon, snapshotidentitet og gjeldende status. Likhetsvakten i `reportReducer` avviser alle tre før mutasjon når binding er uendret. |
| 9 | Ny retting etter revisjon 1 mangler, unit `:56` | `false` | `result-snapshot.test.ts:283` prøver allerede ny retting etter fornyet snapshot, listRevision 2 og opphevet bekreftelse. `report-analysis.spec.ts:1150` dekker gjentatt retting/listekontroll i UI. Egen probe 4 fullførte revisjon 2 gjennom den endrede navigasjonsgrenen og kontrollerte siste aktive grunnlag og tidligere snapshot. Ingen gjenbruk av revisjon-1-bekreftelse. |
| 10 | Vellykket E2E beholder side 2 og kan overse gammel kildeside etter fornyelse, E2E `:407` | `false` | Ny overgangstest `report-result-renewal.test.ts:56` endrer til fysisk side 3 og krever korrekt korrigert kilde i fornyet snapshot samt urørt gammel snapshot. `ScreeningResult.tsx` leser `finding.source` fra akkurat dette valgte snapshotet i både etikett og kildehandling. Eksisterende E2E `screening-result.spec.ts:119` prøver kildehandlingen fra brukt korrigert snapshot, og `:205` skiller gammel historisk side fra nyere aktiv retting; `report-analysis.spec.ts:566` prøver faktisk endret korrigeringsside. Produksjonsdiffen endrer ingen av disse kildehandlingene. Kandidaten viser et mulig mer sammensatt testoppsett, ingen påvist stale kilde eller nødvendig ny kodegren. |

Ingen `maybe-false`, åpne produktfeil eller påkrevde rettinger gjenstår. Ingen specendring ble brukt til å avvise et funn.

## AC-bevis og kontroll av leveransen

| AC | Bevis og vurdering |
|---|---|
| AC1 | `report-result-renewal.test.ts` tester bevart ubrukt utkast, trinnretur og Avbryt med identisk snapshot. Ny E2E `:407` prøver faktisk retur/Resultat/Avbryt, fokus og null ekstra HTTP; probe 1 prøver utkast ved samtidig legitim fornyelse. Utkast brukes ikke som beslutningsgrunnlag. |
| AC2 | Ny unit `:56` og E2E `:407` beholder historisk snapshot til både funn- og listekontroll er gjennomført. Unit `:81` / E2E `:471` prøver TG3-avvisning, inaktiv original og ny listebekreftelse uten teknisk avklaring. Original og tidligere snapshot bevares. |
| AC3 | Nye unit-varianter `:92`/`:112`/`:125` og E2E `:495` prøver hver tekst/statusendring, ugyldig/ukjent, kontrollport, Uavklart og økonomiavhengig utfall. E2E `report-analysis.spec.ts:953` prøver to TG3: én avklart fjerner bare egen mangel, begge avklart lar økonomien avgjøre. Ingen ny finans-/listebekreftelse for uendret grunnlag. |
| AC4 | Nye unit `:135` og E2E `:543` prøver representasjonslikhet kontra kjent/ukjent forhold og fysisk side. `validateTg3Resolution` / `sameTg3Basis` er fortsatt eneste anvendbarhetsautoritet. Ingen overføring bare på findingId; ukjent binding holdes lokalt til relevant håndtering. |
| AC5 | Nye unit `:166`, E2E `:575`/`:608`, eksisterende navigasjonsprøver og probe 5 dekker nullstilling, ny eksplisitt analyse/kontroll, synlig ny feil og direkte gammelt/sent svar både under ny analyse og etter nytt gjeldende snapshot. Ingen falsk fullføring eller gjenopplivet TG3. |
| AC6 | `expectRenewed` krever `resultBinding(state)` for hele nye snapshotet, nullstilt endringsspor, uendret finans og immutabelt tidligere snapshot. E2E prøver konkrete tall, aktive funn, original, gjeldende/historisk tekst, lokale feil/fokus og kalltall. Felles kontrollport tillater håndtert Uavklart med nytt gjeldende prioritet-1-resultat; ugyldig Avklart vurderes som prioritet 1 ved domain-grensen, men bevarer historisk resultat i normal navigasjon frem til relevant håndtering, som fryst spec krever. |

De tre versjonerte UI-bildene er åpnet og visuelt inspisert: lokal sidefeil viser feil/fokus og bevart original; fornyet korrigering viser brukt versjon og KI-original med uendrede tall; fornyet Uavklart viser Gjeldende, navngitt TG3, prioritet 1 og delgrunnlag. Dette er agentgjennomført visuell QA. Ingen ny UX, regelautoritet, offentlig testrute, retry, persistens eller Epic 4-arbeid ble introdusert.

## Uavhengig kjørte kontroller

Miljø: Node `v24.21.0`, npm `11.19.0`; `PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH`; `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers`.

| Kontroll | Faktisk resultat |
|---|---|
| Åtte berørte unit-/regelsuiter nedenfor | **254/254 bestått**, 8 filer |
| `npm run build` | **Bestått**, inkludert typecheck; eksisterende Vite-merknad om chunk >500 kB |
| Alle åtte nye Story 3.9 bygget-app-E2E | **8/8 bestått**, 11,5 s |
| Fem ekstra uavhengige reducer-prober | **5/5 bestått**; oppsett og eksakt kilde nedenfor |
| `git diff --check` for reviewrapport | Bestått før reviewcommit |

Eksakte kommandoer:

```sh
export PATH="/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="/private/tmp/ibe160-story-3-5-browsers"
npm test -- tests/unit/report-result-renewal.test.ts tests/unit/financial-result-renewal.test.ts tests/unit/result-snapshot.test.ts tests/unit/screening-result-navigation.test.ts tests/unit/finding-control.test.ts tests/unit/finding-list-control.test.ts tests/unit/tg3-resolution.test.ts tests/unit/complete-screening.test.ts
npm run build
npx playwright test tests/e2e/screening-result.spec.ts tests/e2e/report-analysis.spec.ts --grep '3.9' --workers=2
node /private/tmp/story39-review-probes.mjs
git diff --check
```

Første E2E-oppstart ble stoppet fordi sandboxen ikke tillot loopback-serveren. Samme kommando med godkjent sandboxunntak kjørte åtte tester grønt. Dette var en miljøsperre, ingen feilet produkttest. Ingen betalt API eller nøkkel ble brukt. Full sluttregresjon er ikke kjørt av reviewer; den gjenstår hos forelder etter denne rapportcommiten. Implementeringsagentens tidligere 72/72 E2E og øvrige logger er sekundær evidens i [egenverifikasjonen](story-3-9-verifikasjon.md), ikke fremstilt som reviewerens kjøringer.

## Reproduserbare ekstra prober

Dette er avgrensede reviewetterprøver, ingen ny permanent testsuite. Kopier JavaScript-blokken til `/private/tmp/story39-review-probes.mjs` og kjør kommandoen ovenfor fra repoet med pinnet Node. Den bruker faktiske session-/report-reducere, F1/F4-fasiten fra eksisterende helper og eksplisitte forventninger. Forventet konsollutfall er `5/5 independent review probes passed`; hver assertion må bestå. Snapshotidentitet og status kontrolleres uavhengig av navne-/testbeskrivelser. Den siste tomlisten er et syntetisk completed-kontraktutfall ved state-grensen, ikke en påstand om ny PDF-/adapter-E2E.

```js
import assert from 'node:assert/strict'
import { screeningState } from '/Users/madschristophersen/IBE160/G20-christophersen/tests/helpers/screening-state.ts'
import { sessionReducer as reduce } from '/Users/madschristophersen/IBE160/G20-christophersen/src/frontend/state/session.ts'
import { selectResult, resultBinding } from '/Users/madschristophersen/IBE160/G20-christophersen/src/frontend/state/result.ts'
import { findingListAssessment } from '/Users/madschristophersen/IBE160/G20-christophersen/src/frontend/state/report.ts'
const nav = s => reduce(s, {type:'navigate', step:'resultat'})
const find = (s,type,id) => reduce(s,{type,generation:s.report.generation,findingId:id})
const draft = (s,id,field,value) => reduce(find(s,'report-finding-edit',id),{type:'report-finding-draft',generation:s.report.generation,findingId:id,field,value})
const list = s => reduce(s,{type:'report-list-confirm',generation:s.report.generation,reportHash:s.report.selected.hash,documentName:s.report.selected.file.name,listRevision:s.report.listRevision})
const reg = (s,field,value) => reduce(s,{type:'report-tg3-register',generation:s.report.generation,findingId:'F4-TG3-1',field,value})
const tg3 = () => screeningState({report:'tg3',beforeCalculation:s => reg(s,'status','unresolved')})
let checks=0
// A pending draft on finding A survives legitimate renewal of finding B.
{
const before=tg3(), snapshot=before.resultSnapshot
let s=draft(before,'F4-TG2-1','description','UNUSED DRAFT')
s=find(draft(s,'F4-TG3-1','description','Alvorlig  lekkasje i tak'),'report-finding-apply','F4-TG3-1')
s=nav(list(find(s,'report-finding-confirm','F4-TG3-1')))
assert.equal(selectResult(s).status,'current'); assert.notEqual(s.resultSnapshot,snapshot)
assert.deepEqual(selectResult(s).unusedDraftFindingIds,['F4-TG2-1'])
assert.equal(s.report.findingControls.find(c=>c.findingId==='F4-TG2-1').draft.description,'UNUSED DRAFT')
assert.equal(JSON.stringify(s.resultSnapshot).includes('UNUSED DRAFT'),false); checks++
}
// Completed report handling does not bypass an unconfirmed financial change.
{
let s=tg3(), snapshot=s.resultSnapshot
s=reduce(s,{type:'register-value',field:'L',rawValue:'1400000'})
s=reg(s,'basis','Changed external basis')
assert.equal(findingListAssessment(s.report).controlCompleted,true)
s=nav(s); assert.equal(s.resultSnapshot,snapshot); assert.equal(selectResult(s).status,'historical')
s=nav(reduce(s,{type:'confirm-financial'})); assert.equal(selectResult(s).status,'current'); checks++
}
// Actual no-op TG3 registrations preserve the original snapshot identity.
{
let s=tg3(); s=reg(reg(s,'reason','Reason'),'basis','Basis'); s=nav(s)
const snapshot=s.resultSnapshot, revision=s.report.tg3Revision
for(const [field,value] of [['status','unresolved'],['reason','Reason'],['basis','Basis']]){
s=nav(reg(s,field,value)); assert.equal(s.resultSnapshot,snapshot); assert.equal(s.report.tg3Revision,revision)
assert.equal(selectResult(s).status,'current')
} checks++
}
// Grade changes use the current active grade and existing TG3 control gate.
{
let s=screeningState(), snapshot=s.resultSnapshot
s=find(draft(s,'F1-TG2-1','grade','TG3'),'report-finding-apply','F1-TG2-1')
s=list(find(s,'report-finding-confirm','F1-TG2-1')); assert.equal(nav(s).resultSnapshot,snapshot)
s=reduce(s,{type:'report-tg3-register',generation:1,findingId:'F1-TG2-1',field:'status',value:'unresolved'})
s=nav(s); assert.equal(selectResult(s).status,'current'); assert.equal(s.resultSnapshot.assessment.priority,1)
snapshot=s.resultSnapshot
s=find(draft(s,'F1-TG2-1','grade','TG2'),'report-finding-apply','F1-TG2-1')
s=nav(list(find(s,'report-finding-confirm','F1-TG2-1')))
assert.equal(s.report.listRevision,2); assert.equal(s.resultSnapshot.assessment.priority,3)
assert.deepEqual(s.resultSnapshot.assessment.basis.reportBasis.tg3Findings,[])
assert.equal(snapshot.assessment.priority,1); checks++
}
// Empty replacement still requires explicit list confirmation; late response
// and old error delivered after renewal cannot modify a current new snapshot.
{
const before=tg3(), replacement=screeningState(), corr={sessionId:'review',requestId:'empty-new',generation:2}
const outcome={...replacement.report.outcome,requestId:corr.requestId,findings:[],uncertainCandidates:[]}
let s=reduce(before,{type:'report-selecting',generation:2})
s=reduce(s,{type:'report-selected',generation:2,selected:replacement.report.selected})
s=reduce(s,{type:'report-start',correlation:corr})
s=reduce(s,{type:'report-response',correlation:corr,ok:true,body:{kind:'analysis',correlation:corr,outcome}})
assert.equal(nav(s).resultSnapshot,before.resultSnapshot)
s=nav(list(s)); assert.equal(selectResult(s).status,'current')
assert.deepEqual(s.report.tg3Resolutions,[]); assert.deepEqual(s.resultSnapshot.assessment.basis.reportBasis.tg3Findings,[])
assert.equal(s.resultSnapshot.assessment.priority,3); assert.deepEqual(s.resultSnapshot.binding,resultBinding(s))
const current=s.resultSnapshot, report=s.report, stale={...corr,generation:1,requestId:'old'}
s=reduce(s,{type:'report-response',correlation:stale,ok:true,body:{kind:'analysis',correlation:stale,outcome:before.report.outcome}})
s=reduce(s,{type:'report-error',generation:1,code:'transport-failure'})
assert.equal(s.report,report); assert.equal(s.resultSnapshot,current); assert.equal(selectResult(s).status,'current'); checks++
}
console.log(`${checks}/5 independent review probes passed`)
```

## Overlevering

**✅ Clean review — all layers passed.** Story 3.9 kan godkjennes etter forelderens bestilte fullstendige sluttregresjon og korrekte statussynkronisering. Reviewfasen har bare skrevet denne rapporten. Ingen push eller neste story er startet.
