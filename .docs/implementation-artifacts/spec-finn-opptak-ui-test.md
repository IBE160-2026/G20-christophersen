---
title: 'FINN-opptak gjennom hele brukerflyten'
type: 'chore'
created: '2026-10-28'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="brukerbestilt offline-verifikasjon">

## Intent

Test én sammenhengende UI-flyt fra FINN-lenke 476576649 til økonomi,
brukerkorrigering, egenkapital/finansiering, separat PDF og eksisterende
analyse/resultat. Bruk lagret open_page-resultat uten live-oppslag, betaling,
retry eller push. Hold produksjonens tilgangsgate stengt og bevar finansregler,
S5/S6 og originalbevis. Rett påviste faktiske feil.

</frozen-after-approval>

## Implementation Notes

- Baseline: `276802c0417106b5d608ab8f9e612a08202f3479`.
- Lite, reversibelt testarbeid uten produktvalg eller eksterne sidevirkninger.
  Aktiv promptlogg og `live-forberedelse.md` er kjente egne endringer fra
  forrige kontroll og bevares i lokal commit.
- Gjenbruk `tests/e2e/listing-import.spec.ts`, ny testhjelper i
  `tests/fixtures/listing/open-page-replay.ts`, eksisterende F1-demo-PDF og
  standard demo-server med stengt gate og tom nøkkel.
- Råopptaket har gammel kontrakt uten ordrette FINN-sitater. Test både trygg
  avvisning av uendret råsvar og eksplisitt testkonvertering for UI-dekning.
  Konverterte kildetekster merkes som modellrapporterte opptaksdata, ikke
  FINN-sitater. Originalfilen endres ikke. Dette er ikke live-kvalitetsbevis.
- Opptaket mangler samlet kjøpsomkostning, år, rentedeler og inkludering.
  Ingen differanse eller 0 gjøres til importfakta. Forvent derfor ukjent
  P/D/J og kontantbehov innledningsvis, mens seks beløp vises i importpanelet.
  Testeren kan deretter supplere eksplisitte testantakelser gjennom UI.
- Given gammel rårespons, when import kjøres med offline-transport, then trygg
  feil og ingen økonomisk utfylling. Given konvertert opptak, when bruker
  kontrollerer og supplerer mangler, then avstemt P og korrekt kontantbehov,
  mens ufullstendig D/J forblir ukjent. Given manuelt komplettert økonomi,
  when separat F1-PDF analyseres i demo og funn kontrolleres, then resultat
  beregnes med eksisterende regler. Nettleseren sperrer eksterne forespørsler.
- Relevant kursgrunnlag: PRD-ens kildeuttrekk fra Sensorveiledningen og
  faglærertilbakemeldingen: kostnadsfri demo, ingen oppdiktede verdier,
  faktiske testbevis og tydelig skille mellom replay og live-kvalitet.

- Sluttført: 10 FINN-UI + 83 økonomi/screening bestod; bygg, ny typekontroll
  og lint bestod. Ingen produktfeil påvist. Originalopptak byteverifisert.
  [Fullt resultat og faktiske begrensninger](finn-replay-2026-10-28/sluttverifikasjon.md).

## Review Triage Log

Uavhengig reviewer `finn_replay_review`, kontekstfri gjennomgang av endret
innhold; 14,603 kB ga N=4. Alle funn vurdert før retting.

| Funn | Vurdering og evidens | Tiltak |
| --- | --- | --- |
| R1: resultatet kan bruke gammel P | medium: bare anbefaling og kontantstrøm fanget ikke feil nevner | Eksakte fire metrics, særlig nettoyield 6,139 %, er nå assertet med korrigert P |
| R2: mangler kontroll av rettingsopphav | medium: bare beløp beviser ikke bevart rettingshistorikk | Kilde-P må inneholde Brukerrettinger og bevaringsnotat; original pris og rettet kontrollfelt verifiseres etter bruk |
| R3: bare nullrente i sammenhengende prøve | low: annuitet allerede regresjonstestet, men dette dekket ikke positiv rente her | 6 %/240 måneder med uavhengig Decimal-fasit for måned og år |
| R4: vilkårlig ikke-tom funnliste | medium: manglende eller feil kildekoblet funn kunne passere | Nøyaktig ett forventet F1-TG2-funn, riktig beskrivelse, PDF-side 2 og tekstlag |

Revieweren leste rettingene og bekreftet alle fire løst. Endelig FINN-testkjøring
bestod etter rettingene. Ingen reelle funn utsatt.
