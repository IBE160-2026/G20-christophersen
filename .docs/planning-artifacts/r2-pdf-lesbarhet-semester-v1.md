---
title: "R2 — Deterministisk PDF-behandling i semester-v1"
date: 2026-10-20
decision_status: accepted
gate: R2
gate_status: closed
rule_status: accepted
before_story: '2.3'
---

# R2 — Deterministisk PDF-behandling i semester-v1

**R2 er lukket som beslutningsport 2026-10-20.** Mads har godkjent regelen nedenfor. Den erstatter dagens tidligere forslag om nøytralt tekstfravær og den første avgrensningen om å unngå automatisk avvisning av fotosider. Konservativ avvisning av tekstløse fotosider er nå uttrykkelig akseptert. Lukking er ikke bevis for implementert ekstraktor, blankdetektor eller beståtte PDF-lesbarhetstester. Story 2.3 er fortsatt backlog.

## Endelig semester-v1-regel

| Sidestatus | Betydning | Konsekvens |
|---|---|---|
| `readable` | Brukbart tekstlag med pålitelig fullført uttrekk, uten kjent teksttap. Litt gjenværende tekst alene opphever ikke kjent feil. | Kan inngå i analysegrunnlaget. |
| `blank` | Uten brukbart tekstlag og med deterministisk bevist fravær av sideinnhold som må tolkes. | Gyldig sidestatus; blokkerer ikke alene. Siden beholdes i `pages`. |
| `unreadable` / `unknown` | Uten brukbart tekstlag, men med visuelt/annet innhold som ikke kan tolkes; eller ukjent pålitelighet. Eksempler er skannet tekst, foto og plantegning. | Blokkerer fullført dokumentanalyse. Alle berørte fysiske sider oppgis; innholdet hevdes aldri analysert. |
| `incomplete` | Kjent ufullstendig tekstlesing, også når noe tekst er bevart. Eksisterende status videreføres. | Samme fullføringssperre; ingen delresultater blir fullført analyse. |

Node-backenden bruker lokal `pdfjs-dist` / PDF.js legacy-build med eksisterende pin til side-for-side-ekstraksjon. Det brukes ingen OCR, vision, AI-basert lesing/fallback eller manuell semantisk klassifisering av tekstløse sider. Det senere KI-kallet for TG2/TG3 fra støttet tekstgrunnlag er fortsatt påkrevd i v1. Ingen prosent-/tegngrenseterskel erstatter sidestatusen.

Fysisk PDF-posisjon fra 1 bevares gjennom hele pipelinen: én ordnet post per posisjon `1..pageCount`, også ved blank/feil, uten skjult filtrering, avkorting eller renummerering. Trykt sidetall er bare et merket tillegg. Original-PDF og originalbytes bevares separat og uendret; parseren får en kopi, og SHA-256 beregnes av originalbytes.

## Minste testbare blankregel for Story 2.3

`blank` krever vellykket, fullstendig strukturell inspeksjon og alle disse vilkårene:

1. Ingen uttrekkbar tekst utover whitespace.
2. Ingen sideinnholdsstrøm, en tom liste av slike strømmer, eller strømmer som etter fullstendig dekoding bare inneholder PDF-whitespace (byteverdiene 0, 9, 10, 12, 13 og 32).
3. Ingen annotasjoner, skjemafelt/appearance, XFA eller andre innholdsbærende sideobjekter som må tolkes. Uavklart/ustøttet innhold, parserfeil eller ufullstendig inspeksjon gir aldri blank.

Dette er en konservativ tilstrekkelig regel, ikke en komplett gjenkjenner av visuelt blanke sider. En side med tegningsoperatorer, bilde eller annet innhold godkjennes ikke som blank ved å anta at innholdet er ufarlig, hvitt eller irrelevant. Ved manglende brukbart tekstlag blir den unreadable/unknown. Ingen rendering eller semantisk vurdering kreves. PDF-whitespace er syntaks, ikke en vilkårlig lesbarhetsterskel.

`readable` krever faktisk brukbart uttrekk; ikke-tom tekst er bare en nødvendig observasjon, ingen generell kvalitetsgaranti. Kjent ekstraksjonsfeil/teksttap gir unreadable/incomplete, uavklart pålitelighet gir unknown. Tabeller, kolonner, norske tegn og blandet tekst/bilde kontrolleres mot uavhengig originalfasit etter AC2/AC4. Bilde på en ellers lesbar tekstside er ikke alene en ny støttebegrensning. Ingen semantisk kompletthet utledes bare fra sideantall, JSON eller tekstlengde.

### Deterministisk statusrekkefølge

Statusene er separate verdier, ikke én sammenslått «unreadable/unknown»-verdi. Dokumentkomponenten skal bruke observerbar ekstraksjonsstatus: kjent delvis uttrekk/rapportert teksttap gir incomplete; ufullført strukturell inspeksjon eller ukjent pålitelighet gir unknown; vellykket tekstuttrekk med ikke-whitespace tekst uten kjente feil gir readable for tekstlaget. Ved fullført inspeksjon uten slik tekst gir blankbeviset blank; påvist sideinnhold som ikke oppfyller blankbeviset gir unreadable. En avvist tekstlesing med kjent side og kjent feil gir unreadable, mens manglende grunnlag for å avgjøre hva som ble lest gir unknown. Fysisk side og kjent årsak beholdes i alle grener. PDF.js støtter `stopAtErrors: true` for å avvise enkelte uttrekksfeil; dette skal benyttes i 2.3 fremfor å godkjenne et kjent delvis uttrekk. Det er ingen garanti for at parseren oppdager alle feil.

En side med digital topp-/bunntekst og rasterinnhold skal ikke semantisk klassifiseres som «foto» eller «skannet TG3» av denne regelen. Når tekstlaget er trukket ut uten kjente feil, gjelder readable bare dette tekstlaget; bildeinnholdet er ikke semantisk lest. Det må ikke hevdes at rasterinnholdet er analysert. Kjent teksttap er incomplete; ukjent pålitelighet er unknown. Å automatisk oppdage rasterisert rapporttekst på ellers tekstbaserte sider er ingen ny v1-funksjon eller skjult terskelregel. Den eksisterende kontrollen mot originalfasit for blandet innhold består; kontraktstatus alene er fortsatt ingen semantisk fullstendighetsgaranti. Ingen ny generell avvisning av alle tekstsider med bilder innføres.

## Kontrakt og konsistens med låste krav

- [PRD FR-6.2/FR-9.3–7](prds/prd-IBE160-2026-10-10/prd.md), [RT-2/RT-9](prds/prd-IBE160-2026-10-10/addendum.md) og [UX](ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) beholdes uendret. Manglende/uleselig rapportinnhold gir fortsatt dokumentfeil og ufullstendig grunnlag. En bevist blank side inneholder ikke ulest rapportinnhold. En helt blank PDF oppfyller fortsatt ikke kravet om en tekstbasert tilstandsrapport. Ingen produktfunksjon eller krav om å støtte bildebaserte rapporter innføres.
- [Story 2.3 AC1–AC4](epics.md), [AD-3/AD-4 og Deferred](architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md) og [SPEC med kompanjonger](../specs/spec-IBE160/SPEC.md) presiseres innen den allerede utsatte lesbarhetsavklaringen. Samme krav-/CAP-/AD-/AC-ID-er, 30-sidersgrense og vern mot falsk fullføring beholdes. Ingen faktisk låst produktregel må endres.
- [DocumentPageSchema](../../src/contracts/document-analysis.ts) får `blank`. `blank` med ikke-whitespace tekst og `readable` uten ikke-whitespace tekst avvises som strukturelt motstridende. Skjemaet beviser ikke sidens innhold; dokumentkomponenten må senere gjennomføre inspeksjonen.
- [bindAnalysisOutcome](../../src/contracts/analysis-validation.ts) tillater bare readable/blank gjennom dokumentgrensen og krever minst én readable side for støttet rapport. Unreadable/unknown/incomplete gir failed/document før adapterretur kan bli completed. Feilmålet beholder første blokkerende fysiske side; ved flere oppgis hele den ordnede listen og hver kjent sideårsak i trygg kodegenerert årsakstekst. Ukjent årsak gjettes ikke. Et kontrollerbart adapterfunn som viser til bevist blank side avvises som invalid-response, også i et delresultat. Det innføres ingen ny HTTP-/adapterfunksjon.
- Kontraktversjon økes fra `1` til `2` fordi eldre runtime-skjema ikke forstår blank. Uttrekksformatversjon forblir `1`; ingen tekstserialisering er implementert eller endret. Ingen lagrede adapterutfall finnes å migrere. Gamle kontraktversjoner avvises, og fremtidige demo-fixtures må bruke gjeldende versjoner.

## Forhåndsdefinert PDF-fixturefasit for Story 2.3

Dette er forventede utfall ved senere implementering, ikke opprettede PDF-er eller beståtte ekstraksjonstester. Fasiten fastsettes fra originalen før kjøring. Kontraktens status-/fullføringsvern er testet separat med konstruert dokumentgrunnlag.

| Originalfasit | Forventet utfall |
|---|---|
| F1–F4 og kort, lesbar tekstside | Readable med bevart tekst/kontekst og fysisk side; ingen vilkårlig minstelengde. F4s TG3 er på fysisk side 4, selv om trykt side er 2. |
| Strukturelt tom side uten annotasjoner eller annet sideinnhold | Blank, tom/whitespace-only tekst bevart uten normaliseringskrav, bevart fysisk posisjon; blokkerer ikke sammen med lesbare rapportsider. |
| Tom/whitespace-only innholdsstrøm uten annet sideinnhold | Blank etter fullstendig dekoding; samme fullføringsregel. |
| Tekstløs vektorfigur (`without-text-layer.pdf`), foto, plantegning eller skannet TG3-side etter fullført inspeksjon | Unreadable, aldri blank. Dokumentanalyse blokkeres, fysiske sider oppgis, ingen påstand om analysert innhold. |
| Tekstløs side med påvist annotasjon/form/appearance etter fullført inspeksjon | Unreadable, ikke blank; sperret fullføring. |
| Uavklart sideinnhold eller ufullstendig inspeksjon | Unknown, aldri blank; sperret fullføring. |
| Digital topp-/bunntekst med rasterinnhold, og blandet brukbar tekst/foto | Vellykket uttrekk uten kjente feil gir readable for tekstlaget; rasterinnholdet er ikke semantisk analysert eller klassifisert som foto/skannet tekst. Kjent teksttap gir incomplete; kjent/usikker lesing blir ikke skjult godkjent av resten av teksten. |
| Tabell, to kolonner og æ/ø/å | Fasit kontrollerer tekst, fysisk side og sammenheng grad/beskrivelse. Kjent tap/krysskobling er incomplete; uavklart pålitelighet unknown. |
| Blank side fulgt av én/flere uleste sider | Blank beholdes uten renummerering. Alle blokkerende fysiske sider oppgis og ingen completed tillates. |
| Bare blanke sider | Ingen støttet tekstbasert tilstandsrapport; dokumentfeil, aldri vellykket tomliste. |

## Mulig post-v1-forbedring

PDF.js kan fortsatt lese alle tekstbaserte sider. Bare sider som ikke kan leses deterministisk, kan ved en senere produktbeslutning eventuelt renderes og behandles med selektiv vision/OCR. Slike sider må ha egen provenance for metode og fysisk side, og flettes tilbake inn i samme side-taggete dokumentgrunnlag før samlet analyse. Dette er en fremtidig mulighet uten leveranseforpliktelse, implementering eller fallback i semester-v1.

## Historikk og videre arbeid

Første beslutning 2026-10-20 registrerte PDF.js uten fallback, men lot R2 stå åpen etter Mads' valg «Behold R2 åpen med regelforslag». Oppfølgingsbestillingen godkjenner nå skillet mellom bevist blank og ulest innhold, inkludert konservativ avvisning av legitime fotosider. [Arbeidsloggen](../process/arbeidsokter/2026-10-20-r2-pdf-beslutning.md) bevarer prosess og kontroller.

R2 er closed; samlet readiness er fortsatt CONCERNS fordi R1/R3/R4 gjenstår ved sine kontrollpunkter. Ingen gjenstående beslutningsblokkering er identifisert før Story 2.3: 2.1/2.2 er done. Neste steg ved egen bestilling er å klargjøre Story 2.3 med denne regelen og fixturefasiten. Selve tekstuttrekket, blankdetektoren og faktiske lesbarhetstester er Story 2.3-arbeid og er ikke startet her. Ingen senere story eller push inngår.
