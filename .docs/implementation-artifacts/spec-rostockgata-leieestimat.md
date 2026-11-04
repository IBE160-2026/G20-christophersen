---
title: 'SSB-arealregel og leieestimat for Rostockgata i Konsept A'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'dispatch'
baseline_commit: '484c825ef28e9f1cd80c863106c95c6dbe48e4a1'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Brukerens bestilling autoriserer implementering, ekte test og lokal commit; ingen ny godkjenning er nødvendig">

## Intent

Ferdigstill et begrunnet, kildebelagt forventet leieestimat for en 3-roms selveierleilighet på 59 m² i Oslo fra ekte Nordvik-salgsoppgave. Bruk faktiske støttede SSB-punkter med generell interpolasjon, og en strengt avgrenset nærmeste-punkt-tilnærming utenfor yttergrensen.

## Boundaries & Constraints

Bruk metadataenes faktiske arealpunkter i samme romgruppe og nyeste gyldige statistikkår. Mellom nabopunkter brukes lineær interpolasjon uten ekstra standard-/adressepåslag. Innenfor høyst 2 m² utenfor gruppens ytterpunkter brukes det nærmeste ytterpunktets verdi uendret og tydelig merket som tilnærming. Større avvik og manglende relevante celler gir ingen leie. For 59 m² brukes 60 m² bare dersom valgt sone har gyldig verdi; det er ikke en direkte SSB-prediksjon for 59 m².

Vis kildeår, faktisk valgt geografisk prissone, dokumentareal og arealreferanse, utregning og et foreløpig, ikke empirisk kalibrert scenariointervall. Dokumenterte og manuelt angitte leieverdier beholder forrang; automatisk estimat forblir ubekreftet og på statistikkårets nivå. Bevar fysiske PDF-kilder, alle 170 sider, økonomifelt og tekniske kontrollporter. Ikke erklær teknisk risikodekning komplett. Ingen betalte AI-kall, push, privat PDF i Git eller skjult årsjustering. Commit lokalt med aktiv promptlogg.

## I/O & Edge-Case Matrix

| Tilfelle | Input | Forventet resultat | Feil |
| --- | --- | --- | --- |
| Punkt/interpolasjon | Eksakt punkt eller mellom to støttede nabopunkter i hver romgruppe | Samme romgruppe, råceller og lineær vekt synlig | Ingen kryssing av romgrupper |
| Begrenset tilnærming | Inntil og med 2 m² under/over ytterpunkt | Uendret nærmeste referanseverdi; tydelig merking og dokument-/referanseareal | Aldri lineær ekstrapolasjon |
| Avvisning | Mer enn 2 m² utenfor, ingen punkter eller nullcelle | Ingen beløp; konkret grunn | Ingen alternativ sone/romgruppe gjettet |
| Forrang | Manuell, dokumentert, ugyldig eller bevisst tømt leie | Eksisterende verdi/validering beholdes | Estimat overstyrer aldri |
| Nordvik | Ekte original lastes opp i Playwright | 59→60, riktig kildeår/sone og forventet leie i ubekreftet økonomi | TG/full drift forblir uavklart der grunnlag mangler |

</frozen-after-approval>

## Code Map

- `src/backend/rent/ssb-rent.ts`: leser/validerer JSON-stat, faktiske punkter, samme romgruppe og Big-desimaler, cache/frist/grenser. Dagens nabopunkt-interpolasjon avviser 59<60. Bevar all feil-/nullhåndtering og opphav. Gratis live metadata og 2025-data er kontrollert HTTP200; 3-roms har 60/70/80/90/100. Offentlige fasiter finnes i `tests/fixtures/ssb/` og nye private livefiler `private/incoming/rostockgata-rent-ssb-{metadata,data}.json`.
- `src/domain/rental-property.ts`: kildebelagt bydel, ingen adressegjetning. Fysisk side117 i originalen har «Bydel: 1 Gamle Oslo» i matrikkelblokken; eksisterende regex mister prefikset1. Støtt eksplisitt nummerert bydel generelt, bevar ordrett kilde/offset. Ikke bruk bydeler nevnt i parkeringsomtale på side23.
- `src/contracts/rent-estimate.ts`, `src/frontend/investment/RentEstimatePanel.tsx`: transparent metodekontrakt, råcelletabell, kildeår/URL/formel. Gi tilnærming et strukturert kjennetegn og fremtredende forklaring ved beløpet. Oppdater metodeidentitet konsistent ved behov.
- `src/frontend/state/scenario.ts`: automatisk L bare ved helt urørt leie; beholder statistikkår, avviser inkompatibelt driftsår. Bevar denne forrangen og uavhengige finansporter.
- `tests/unit/ssb-rent.test.ts`, `rental-property.test.ts`, `rent-scenario.test.ts`, `rent-panel.test.tsx`: eksisterende offentlige råceller, kontraktvern og prioritetstester.
- `tests/e2e/rent-real-document.spec.ts`: reell HTTP-import/SSB, kildeåpning, mobil og privat PDFhash; erstatt gammel 59m²-avvisningsforventning med estimering og KonseptA-kontroll. Original `private/incoming/nordvik-rostockgata-96.pdf`, SHA256 `3e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70`. `PAA_TEST_NORDVIK_REQUIRED=1` skal kreve prøve uten skip.
- `.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/EXPERIENCE.md`, sensorveiledningens kildeuttrekk og faglærers brief-tilbakemelding: ekte endeprøve, formler i kode og skille fakta/estimat/usikkerhet. Ingen nye produktkrav fra kursveiledningen.

## Tasks & Acceptance

- [x] `ssb-rent.ts`/kontrakt/panel: generell regel, eksplisitt tilnærming, kildegrunnlag og utregning; behold eksisterende brede scenariointervall og legg til 5 prosentpoeng ved ytterpunktstilnærming som synlig, ukalibrert konservativ antakelse.
- [x] `rental-property.ts`: eksplisitt nummerert bydel med kilder og negative/kollisjonsregresjoner.
- [x] Unit/integrasjon: alle romgrupper, eksakte og ikke-like avstander mellom punkter, begge 2m²-grenser/desimal utenfor, manglende celler, kontrakt/panel og dokumentert/manuell forrang med meningsfulle assertions.
- [x] Ekte Nordvik-Playwright: last opp original, gratis faktisk SSB, se forventet leie i KonseptA; automatisk prisgrunnlag krever kjent fellesgjeld i `src/domain/source-economy.ts`, som fortsatt mangler her. Bevar dette vernet og test bruttoyield etter eksplisitt brukerregistrert ubekreftet P=8600000 med kilde; verifiser pris/fellesutgifter/kilder, prioritet ved manuell og dokumentert leie og fortsatt uavklart teknisk dekning. Vis både desktop/mobil og arkiver private bevis uten å stage dem.
- [x] Oppdater SSB-metodenotat, relevant README og sentral deferred-historikk/prosessbevis; full build/lint/test og uavhengig review; lokal commit med aktiv promptlogg.

Gitt urørt ekte Nordvik-import, når SSB har gyldig celle, så viser UI korrekt verdi fra 3.060 i dokumentert geografisk sone, statistikkår og 59→60-tilnærming med utregning og ukalibrert intervall. Gitt ny leieforutsetning eller dokumentert leie, når økonomiscenarioet beregnes, så brukes denne fremfor automatisk leie, uten å oppgradere TG-/driftsdekning.

## Implementation Notes

Ingen uavklarte brukerintensjoner eller irreversible endringer. Gratis offentlige SSB-kall og lokal commit er autorisert. Aktiv promptlogg er samme session-01a1a651-52fd-7033-b614-e00beb804981.jsonl som checkpointet, kun automatisk append. Brukerens eksplisitte gjennomføringsbestilling gjelder foran generisk ekstra spec-godkjenning.

## Spec Change Log

## Review Triage Log

Tre uavhengige lag leste `/private/tmp/paa-rostockgata-review-20261104.diff`. Individuell vurdering før gruppering; egen reproduksjon i `private/incoming/rostockgata-review-repros.ts` bekreftet B1–B4.

| ID | Vurdering, bevis og håndtering |
| --- | --- |
| B1 | medium / patch: `weight=bad/NaN/tom` kaster Big-feil fra safeParse. Guard og negative kontraktregresjoner. |
| B2 | medium / patch: «99 Gamle Oslo» velges som presis bydel uten issue. Begrens nummernormalisering til verifisert kommune/nummer/navn og bevar uavklart informasjon synlig. Ingen ny prissone utledes. |
| B3 | low / avvist: manipulert JSON kan merke 69→70 som ytterpunkt. Backend kan ikke produsere denne tilstanden: metadataenes findLast/find omslutter69 og alle romgrupper/intervaller er testet. Kontrakten har ingen autoritativ metadataoversikt; en ny duplisert modell/range i klientkontrakten tilfører kompleksitet for en ikke påvist produksjonsfeil. Aksept i en håndforfalsket respons er bekreftet, ikke en feil i aktuell arealregel. |
| B4 | low / avvist: skjemavalidering beviser ikke beløpet på nytt fra råcellene. Samme begrensning fantes før endringen (skjemaet kontrollerte bare positive beløp, intervallrekkefølge og årsleie). Backendens faktiske beregning er testet uavhengig med offentlige celler; reimplementering av hele leiemodellen i responskontrakten avvises som unødvendig kompleksitet uten påvist feil i produsert beløp. |
| B5 | medium / patch: hardkodet2025/18900/35% i faktisk sisteårs-oppslag feiler etter ny publisering/årsskifte. Uavhengig gratis metadata-/cellekontroll bestemmer liveforventning; faste2025-fasiter beholdes i unit. |
| B6 | medium / patch allerede utført av hovedagent før reviewresultatet: sentral historikk hadde bare gammel59<60-avvisning i reviewdiffen. Ny append i deferred-work bevarer gammelt bevis og åpen kalibrering/TG, og lenker ny endeprøve. Ingen historikk omskrives/lukkes. |
| B7 | medium / patch: nulltest dekket én presis sone, ikke ukjent bydel med én manglende sone. Tilføy negativ test for at hele estimatet avvises. Koden bruker allerede alle soner uten filtrering av nuller. |
| B8 | medium / patch: undefined-indeks tester ugyldig datastruktur, ikke en konsistent respons med manglende relevant punkt. Tilføy reindeksert, gyldig JSON-stat med kolonnen fjernet. |
| B9 | medium / patch: øktens brede testkommando peker til privat config. Dokumenter hele ikke-sensitive configen/valg slik at prøven kan gjentas med originalen. README har også portabel kommando med versjonert standardconfig. |
| E1 | medium / patch: samme reproduserte weight-krasj som B1, behandles med samme guard/test. |
| E2 | medium / patch: samme årsskifte/publiseringsfeil som B5; ingen nye produktregler. |
| V1 | medium / patch: separat kontroll av faktisk HTTP-rute/klokke bekrefter B5; dynamisk livefasit, faste historiske unitverdier. |


## Verification

Node24.21: `npm run build`, `npm run lint`, `npm test`. Playwright med `PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1`, demo backend, tom OpenAI-nøkkel, faktisk SSB-nett. Bruk installert Chromium ved behov. Registrer faktiske beløp, kildeår, sone, beregning, begrensninger og testutfall i eksisterende `.docs/process/arbeidsokter/`.

Sluttverifikasjon: build/lint bestått, 2 077 unit-/integrasjonstester bestått og 7 eksisterende skip. Etter review bestod alle tre faktiske dokument-/SSB-Playwright-prøver uten skip, inkludert Nordvik22,6 s med uavhengig fersk råcellefasit. Alle25 ulike nettleserprøver har bestått, med første graftidsavbrudd og isolert grønn omkjøring bevart i prosessbeviset. 170 sider, eksakte kilder, 01.02/3.060/2025, 18 900/måned, 226 800/år, 12 200–25 600-intervall og manuell/faktisk leieforrang er kontrollert. Ingen teknisk eller full økonomisk komplettstatus hevdes. Se [sluttbevis](../process/arbeidsokter/2026-11-04-rostockgata-leieestimat.md#sluttverifikasjon-etter-reviewrettinger).
