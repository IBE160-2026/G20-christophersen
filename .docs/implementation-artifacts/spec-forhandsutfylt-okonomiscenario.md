---
title: 'Forhåndsutfylt økonomiscenario'
type: 'feature'
created: '2026-11-06'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Økonomiseksjonen i Konsept A skal åpne med 80 % samlet belåning, 6 % rente og 30 år. Egenkapitalen dekker 20 % av prisgrunnlaget samt kjøpsomkostninger. Fellesgjeld trekkes fra privat lånebehov. Sliderne er tilgjengelige straks kjøpsgrunnlaget finnes, og egenkapital/belåning følger hverandre. Manuelle forutsetninger skal beholdes for gjeldende objekt.

Drift forhåndsutfylles fra dokumenterte, dedupliserte kostnader. Ukjent overlapping skal ikke automatisk summeres. Dokumentets delsum beholdes separat fra brukerens totaljustering; ufullstendig automatisk grunnlag merkes foreløpig. Alle justeringer oppdaterer scenarioet. Ukjent drift blir aldri automatisk null. Behold layout, ingen betalte AI-kall eller push. Verifiser begge ekte PDF-er med Playwright og commit lokalt med aktiv promptlogg.

</frozen-after-approval>

## Implementation Notes

- Utgangspunkt: 01909131f005f768d77a30b2a0533f1ea01e4ea2. Aktiv promptlogg identifisert ved eksakt brukerprompt; ingen øvrige endringer.
- Avgrenset endring i eksisterende scenarioadapter, finansieringskontroller og driftsforutsetning. Ingen irreversible handlinger eller åpne produktvalg. Derfor oneshot.
- Kodekart: App.tsx eier objektbundne overstyringer; InvestmentOverview.tsx velger grunnlag; financing.ts har eksisterende invers belåning; source-economy.ts har deduplisering. Gjenbruk disse, bevar kontrollert økonomi og dokumentkilder.
- Funn: Nøstegaten har 1 020 kr/mnd felleskostnader og 12 957 kr/år kommunale avgifter med ukjent inkludering. Tidligere scenario summerte disse til 25 197. Automatisk grunnlag skal bare bruke 12 240 kr/år og opplyse kort om utelatte avgifter. Rostockgata har deduplisert 43 920 kr/år.
- Kursforankring: sensorveiledningen PDF side 2–6 lest lokalt, samt faglærers tilbakemelding på brief og code-first-design. Finans i kode, uavhengig fasit, sporbarhet og enkel flyt videreføres.

- Implementert i kartlagte filer. Finansieringssliderne bruker direkte beregnet belåning mens bakgrunnsberegningen kjører; ugyldig manuelt felt skjuler ikke slideren. Nullstilling gjenoppretter standardene. Løpetidsslider lagrer hele måneder.
- Verifikasjon og samtlige gjennomgangsfunn med vurdering/retting er dokumentert i [arbeidsøkten](../process/arbeidsokter/2026-11-06-okonomistandarder.md). Ingen funn utsatt.
