---
title: 'R2 — blank sidestatus og fullføringsvern'
type: 'chore'
created: '2026-10-20'
status: 'done'
route: 'oneshot'
baseline_commit: '38bbc529afc47eee680482f39f0911d2b4992c0e'
---

<frozen-after-approval reason="Mads har bestilt og godkjent den avgrensede R2-regelen; ikke Story 2.3">

## Intent

Godkjenn R2s minimale semester-v1-regel: brukbart tekstlag er readable; deterministisk bevist fravær av innhold er blank og blokkerer ikke alene; tekstløse sider med visuelt/annet innhold som ikke kan tolkes er unreadable/unknown og blokkerer fullført dokumentanalyse. Fysisk side bevares og uleste sider identifiseres uten å hevde at de er analysert. Konservativ avvisning av legitime fotosider er akseptert. Ingen vilkårlig tegn-/prosentterskel, OCR, vision eller manuell semantisk klassifisering. Originalbytes beholdes separat og uendret. Selektiv OCR/vision er kun post-v1.

Avstem den utsatte lesbarhetsregelen mot Story 2.3, AD-3/AD-4, SPEC og eksisterende kontrakt med minst nødvendige dokument-/kontraktendringer. Ingen endring av faktisk låst produktkrav; stopp ved slik konflikt. Gitt readable/blank og gyldig adapterutfall skal binding tillate completed. Gitt minst én unreadable/unknown/incomplete skal binding gi dokumentfeil, aldri completed, og alle berørte fysiske sider skal fremgå. Gitt blank med tekst skal kontrakten avvise motstriden. Siderekkefølge og fysisk posisjon beholdes. Oppdater readiness/portregister med R2 closed etter konsistenskontroll, behold Story 2.3 backlog og andre porter uendret, lag lokal commit uten push. Ingen ekstraktor, blankdetektor, adapter, HTTP/UI, senere story eller nye PDF-fixtures implementeres.

</frozen-after-approval>

## Implementation Notes

- Avgrenset readiness-/kontraktarbeid, ingen epic-story eller story_key. Eksisterende arbeidstre inneholder samme R2-dokumentasjon fra forrige bestilling; videreføringen og lokal commit er uttrykkelig autorisert. Ingen nye intensjonsgap eller irreversible handlinger. Build-aktivering har ingen ekstra steg; oneshot valgt.
- Code map: `src/contracts/document-analysis.ts` får blank og strukturelt vern mot blank med tekst/readable uten tekst; `analysis-validation.ts` tillater blank og bevarer blokkerende sidereferanser; `tests/unit/document-analysis.test.ts` etterprøver kontrakt/fullføring. Ingen parserkode endres. Kontraktversjonen økes for endret sidestatusbetydning; ingen lagret adapterretur finnes å migrere.
- Dokumentkart: R2-notat og readiness, epics Story 2.3, arkitektur AD-3/Deferred med appendert memlog, SPEC med appendert memlog og relevante kompanjonger, sprintregister/-plan, Epic 2-kontekst og berørte modul-/fixture-README-er synkroniseres. PRD, UX, finans, screening, eksisterende fasit og PDF-bytes beholdes. Detaljer og testbevis samles i arbeidsloggen fra 2026-10-20.
- Blank betyr et konservativt strukturelt bevis, ingen semantisk vurdering av foto/figurer: intet tekstinnhold, ingen innholdsstrøm eller bare fullstendig dekodet PDF-whitespace, og ingen annotasjoner/skjemafelt/appearance/XFA eller annet innholdsbærende sideinnhold. Enhver tvil eller ufullstendig inspeksjon gir unknown. Denne dokumenterte deteksjonsregelen implementeres først i 2.3.

- Implementert kontraktversjon 2 med blank og strukturell tekst/status-konsistens. Uttrekksformatversjon 1 beholdes. Binding sperrer alle blokkerende sider, oppgir alle fysiske posisjoner og godkjenner ikke en helt blank PDF som støttet tekstbasert rapport. Ingen parser-/HTTP-/adapter-/UI-kode er endret.
- Verifikasjon: 9 nye røde regresjoner før endring, deretter 104/104 kontraktstester og 326/326 samlet Vitest; typecheck/build, lint og offline sprintformatvalidering bestått. Integritet/lenker/status kontrollert. Se r2-kontroller.txt og arbeidsloggen for bevisgrenser; ingen E2E gjentatt for uendret UI/server.

- Presisering av eksisterende scope til frozen Intent: «readable/blank ... permits completed» gjelder en støttet tekstbasert rapport med minst én readable side, jf. Intentens vern om låst produktkrav og FR-6. En helt blank PDF er ikke slik input. Ingen frozen Intent er redigert. Blank tekst kan være tom eller whitespace-only og bevares; blankbeviset utføres først av 2.3.


## Review Triage Log

Blind Hunter gjennomførte uavhengig kun-lesende kontroll. Finding floor var 9 fra 79,342 kB; alle ni konkrete bidrag er vurdert individuelt mot kode og kilder. Ingen andre reviewlag var konfigurert for oneshot.

| Funn | Vurdering og behandling |
|---|---|
| 1 — senere sideårsaker falt bort | Medium, patch. Reprodusert med første unknown/null og senere incomplete med kjent årsak. Binding bevarer nå alle kjente sideårsaker; ny regresjon. |
| 2 — checkable TG3 på blank side | High, patch. Reprodusert gyldig adapterfunn på fysisk blank side. Kjent kildemotstrid gir nå analysis/invalid-response med funnmål; test for både completed og failed/partial retur. Ingen ny offentlig feiltype. |
| 3 — operativ statusmetode lite presis | Low, dokumentpresisering innen bestilt R2-avklaring. Observerbare tekst-/inspeksjonsfeil og statusrekkefølge er beskrevet. PDF.js stopAtErrors finnes i installert API. Ekstraktor og generell semantisk garanti er fortsatt utenfor denne endringen. |
| 4 — digital topptekst med rasterinnhold | Low, dokumentpresisering. Ingen tillatt deterministisk semantisk foto-/skanneskille finnes fra tekstfravær alene. For tekstbaserte sider er readable eksplisitt tekstlagets status; rasterinnhold hevdes ikke analysert, kjent tap er incomplete og ukjent pålitelighet unknown. Ingen ny generell bildeklassifikator eller støtteinnskrenkning innføres. |
| 5 — unreadable/unknown som alternativ fasit | Low, patch i dokumentasjon. Fullført inspeksjon med påvist tekstløst sideinnhold er unreadable; ufullført inspeksjon/ukjent pålitelighet er unknown. Tekstløse fixturegrupper har nå separat konkret forventning. |
| 6 — all-blank-forutsetning i buildspec | Low, presisert uten å endre frozen Intent. Completed-forløpet gjelder støttet tekstbasert rapport med minst én readable side; denne eksisterende FR-6-forutsetningen er eksplisitt i Implementation Notes, R2-notat og tester. |
| 7 — tom kontra whitespace-only blanktekst | Low, patch i dokumentasjon. Kontrakten bevarer tom/whitespace-only tekst uten normaliseringskrav; fixtureforventningen er avstemt. |
| 8 — R2 manglet i sporbarhetskompanjong | Low, patch i avledet sporbarhet etter appendert SPEC-beslutning. R2 kobles til CAP-2, FR-6/FR-9, AD-3/AD-4, Story 2.3 og kontraktregresjoner; arkitekturdato er oppdatert. |
| 9 — foreldet last_updated | Low, patch. Registerdato oppdatert til faktisk oppfølgingsøkt 08:55 Europe/Oslo, etter godkjenningsprompten. Ingen story-/andre portstatuser er endret. |

Ingen funn er forkastet eller utsatt. Ingen ny produktbeslutning, scope-utvidelse eller start av Story 2.3 følger av rettingene.

Sluttkontroll: 329/329 Vitest, typecheck/build og lint bestått etter reviewrettingene. Uavhengig etterkontroll kjørte 107/107 kontraktstester og bekreftet de to konkrete kodefunnene lukket uten ytterligere regresjon. Ingen funn utsatt; ingen story_key, så ingen storystatus flyttes. Lokal commit er bestilt; ingen push.
