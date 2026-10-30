---
title: 'Kompakt økonomirespons med kodeeide kilder'
status: 'done'
route: 'dispatch'
baseline_commit: '9c5e6efc5b3cad4a9ebf5fcdb7aa58c3001e8198'
review_loop_iteration: 0
---

## Godkjent oppgave

Brukeren ba om kompakt response etter outputavbrudd, økonomiverdier/kilde-IDer/
korte begrunnelser, deterministiske kildeposisjoner/metadata, 6000 output dersom
USD 0,20 fortsatt overholdes, uendrede sikkerhets-/fullstendighetskontroller,
målrettede tester og review. Ingen betalte kall eller push. Ingen ny omfattende
planleggingsrunde. Dette dokumentet registrerer gjennomføringen av bestillingen.

## Implementering og aksept

- Hele valgte originalteksten blir kodeeide segmenter med stabile ID-er og
  eksakte UTF-16-posisjoner. Ingen relevant tekst filtreres bort. AI ser teksten
  én gang, velger ID-er og returnerer korte begrunnelser/verdi-/usikkerhetsfelt.
- Modellen får ikke returnere sitat, originalText, dokumenthash, sideposisjon,
  printedPage eller kodeeide feltmetadata. Ukjente ID-er eller manglende/duplisert
  segmentregnskap avvises. Koden henter kilder fra uendret original, setter
  printedPage fra egen kildekontrakt og sender hydrert kandidat gjennom tidligere
  økonomi-/kilde-/periode-/konflikt-/kvartal-/MVA-kontroll.
- Segmentregnskap dokumenterer det sendte tekstgrunnlaget og modellens oppgitte
  behandling; det beviser ikke semantisk korrekthet eller uavhengig menneskelig
  aksept. Kandidaten forblir ubekreftet med påkrevd fasitsammenligning. TG er
  fortsatt uavklart og ingen finans-/screeningregler endres.
- `economy-local-budget.ts` bruker hele faktiske SDK-bodyens konservative lokale
  bytegrense. 6000 output inklusive reasoning og maksimalt 36000 inputbudsjett
  gir høyst USD 0,15 ved cache-write-/outputmaksimum. Reservasjon USD 0,15 og
  minst USD 0,05 margin beholdes; oversize stopper før nettverk. Ingen count,
  verktøy, automatisk retry, reservefrigivelse eller ny kvote.
- Godkjent privat fasit og historiske testpakker/journaler bevares. Ny kompakt
  request får egne bindende digester, og ingen gammel betalt godkjenning arves.

## Verifikasjon

Målrettet schema-, hydrerings-, kilde-/fullstendighets- og budsjettregresjon,
eksisterende økonomiprøve-/representativ-oracle-tester der delt logikk berøres,
typecheck/lint. Privat original kontrolleres lokalt mot samme fasit og valgt
tekst, ny wire og kostnadsport klargjøres uten nettverk eller journalinit.
Tre uavhengige BMAD-reviewlag, triage/retting og kun nødvendige nykontroller.
Ingen full suite uten konkret behov fra funn.

## Review Triage Log

| Funn | Vurdering og bevis | Tiltak |
| --- | --- | --- |
| B1: delvis lokalt belegg mister kjent måned/år | Medium: nye små segmenter kunne velges bare for beløpet, og kjent lokal periode/år kunne forsvinne. Bevaring av lokalt belegg kreves av oppgaven. | Krev hele lokale kildebelegget og kjente kvalifikasjoner, eller faktisk kildebelagt motstrid; multiline-regresjoner. |
| B2: kompakt kildeantall overskrider hydrert format | Medium: 201 tilstøtende MVA-segmenter ble til 201 observasjoner, og 13 limitation-kilder traff 12-kildegrensen. | Samle kun tilstøtende valgte spenn til kodeeide sitater opptil 2000 UTF-16-enheter; behold opprinnelige caps og ingen bro over uvalgte gap. |
| E1: samme 201-observasjonstilfelle | Medium: uavhengig bekreftet samme årsak som B2. | Samme retting som B2, egen opprinnelig reviewrad bevart. |
| V1: fullført 6000/6001 usage-grense uprøvd | Medium: tidligere fullført stubb hadde bare 200 output; gammel 4000-grense kunne gjeninnføres uten testfeil. | Fullført kandidat med 6000 skal lykkes; 6001 skal avvises og beholde reservasjon uten retry. |
| B2r1: spredte limitation-kilder og aggregert observasjonsantall | Medium: første sammenslåing rettet tilstøtende kilder, men 13 spredte kilder og flere kompatible observasjoner kunne fortsatt overskride hydrert format. | Del limitation-belegg i 12-kildegrupper; valider hvert beløp før deduplisering og sammenslåing per type; bevar alle tolkninger og opprinnelige samlegrenser. |

Alle opprinnelige funn og nykontrollfunnet er rettet; uavhengige nykontroller dokumenteres
i leveransens verifikasjon, ingen modellkvalitet forhåndsattesteres.

Blind nykontroll av B2 fant også 13 spredte limitation-kilder og aggregert
observasjonsantall. Samme medium/patch-årsak: kode deler limitation-belegg i
grupper på høyst 12 og validerer hvert observasjonsbeløp før deduplisering og
sammenslåing per type. Ingen usiterte gap krysses, og opprinnelige samlegrenser
for 200 observasjoner/100 begrensninger gir fortsatt sikker stopp der resultatet
ikke kan representeres. Regresjoner for spredte kilder, forskjellige typer og
ugyldige beløp før deduplisering består. Siste blind nykontroll: ingen restfunn.
Edge- og verifikasjonsnykontroll: ingen restfunn. Sluttstatus gjelder kun offline
leveranse; ny betalt test er ikke godkjent eller utført.
