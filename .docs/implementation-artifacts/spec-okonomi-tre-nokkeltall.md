---
title: 'Tre presise økonomitall i Konsept A'
type: 'bugfix'
created: '2026-11-19'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukeren har autorisert undersøkelse, retting, tester og lokal commit">

## Intent

Rydd økonomiseksjonen til bruttoyield, avkastning etter driftskostnader og månedlig kontantstrøm. Fjern den overflødige prosentboksen. Skill dokumentert kostnadsdelsum fra egen samlet driftsforutsetning; ingen ufullstendig beregning skal betegnes full nettoavkastning. Behold Konsept A, kontroller Nøstegaten og Rostockgata inklusive justert drift/finansiering og ugyldig input. Ingen betalte KI-kall eller push. Commit lokalt med aktiv promptlogg.

</frozen-after-approval>

## Implementation Notes

Undersøkelse: `InvestmentOverview.tsx` setter D til dokumentets foreløpige delsum i automatisk scenario. Dermed er preliminaryNetYield og netYield identiske før brukerjustering. Ved egen drift beregnes netYield med brukerens total, mens preliminaryNetYield fortsatt bruker dokumentdelsummen. Begge bruker (L−kostnader)/P×100, før finansiering/skatt. Finansiering påvirker kun kontantstrøm: (L−D−J)/12; J inkluderer renter, avdrag og kjent fellesgjeldbetaling. En ekstra historisk prosent gir lite beslutningsverdi; dokumentdelsummen og kildeutregning beholdes i fordypning.

Lite og reversibelt fotavtrykk: visning/tekst i InvestmentOverview, trekolonners CSS, eksisterende UI- og endeprøver. Ingen nye domenegrensesnitt, endret beregningsmotor eller irreversible operasjoner. Ingen intensjonsgap. Ugyldig egen drift skal fortsatt sperre beregning uten fallback. Bruk aktiv D i synlig formel og merk automatisk dokumentdelsum tydelig som foreløpig både ved prosent og kontantstrøm.

Sporbarhet: godkjent EXPERIENCE for Konsept A, faglærerens brief-/PRD-feedback og Sensorveiledning IBE160 del 1 side 2–5: formler i kode, fasitbasert testing, eksplisitt usikkerhet, responsivt design og dokumentert KI-prosess. Aktiv session-01a1f4b7-1ca9-7ea0-806c-04eb9306d1e3.jsonl bekreftet gjennom brukerprompten. Starttreet hadde kun denne loggen; main og siste dokumentcommits er relevante.

Visning, trekolonners CSS, README og relevante tester oppdatert. Aktiv formel viser valgt D; kildeformelen er merket dokumentreferanse. Eldre ekte leieprøvers fjernede KPI-selektor og utdaterte forventning om sperret kontantstrøm er avstemt med dagens automatiske scenario; Nøstegaten-fasiten bruker 12 240 kr kjent delsum, ikke uavklart sum 25 197 kr. Import-/inkluderingsreglene er uendret.

## Review Triage Log

- Lav / rettet: kontantstrøm manglet opphav for egen totalforutsetning; samme tre opphav som prosentboksen vises nå, med før-skatt-grense.
- Lav / rettet: registrert D-gren manglet test; test med kilde og samsvarende år tilføyd. Samtidig dokumentdelsum er ikke nåbar ved manuell D i selector.
- Lav / rettet: eksplisitt null drift manglet grensetest; viser samme avkastning som brutto uten fallback.
- Lav / rettet: mobilplasseringen manglet direkte verifikasjon; egne geometri-/overløpsassertions ved 320/390 px.
- Lav / rettet, egen kontroll: eldre ekte leieprøver refererte den fjernede prosentboksen; de bruker nå den gjenværende og krever eksplisitt delsummerking.

Ingen funn utsatt. Se prosessbevis for matematikk, kjøringer og miljøbegrensning.


## Verification

Bygg og lint bestått. Hele Vitest-pakken med én worker: 2 245 bestått / sju eksisterende skip. Bred Playwright: 36 bestått / fem valgfrie private dokumentprøver skip; begge obligatoriske investeringsprøver bestått med ekte PDF. Etter siste tekst-/testrettinger: 10/10 Playwright, inkludert ekte Nordvik og Nøstegaten og Konsept A-geometri ved 320–1440 px. Ingen betalte kall eller push. Node 26.8.1 / lokal Chromium 1243; deklarert Node-versjon 24.21.0 ikke tilgjengelig i terminalen. Første sandbox-/belastningsfeil og grønne sluttkjøringer er dokumentert i [prosessbevis](../process/arbeidsokter/2026-11-19-okonomi-tre-nokkeltall.md).
