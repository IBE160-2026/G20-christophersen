---
name: Property Acquisition Agent
description: Felles investeringsflyt for to alternative visuelle konsepter.
status: approved-concept-a
revision: 3
updated: 2026-10-30
paired_with: DESIGN.md
implementation_authorized: true
sources:
  - designforslag.md
  - .memlog.md
  - ../ux-IBE160-2026-10-13/EXPERIENCE.md
  - ../../prds/prd-IBE160-2026-10-10/prd.md
---

> **Vedtak 2026-10-30:** Mads har valgt og godkjent konsept A som endelig designretning og autorisert implementering i eksisterende PAA. Konsept B bevares som alternativhistorikk. Senere omtale av «venter på valg» beskriver forslaget før dette vedtaket. Se [implementeringsspesifikasjonen](../../../implementation-artifacts/spec-konsept-a-produkt.md).


# Opplevelse i A og B — revisjon 3

## Foundation

Responsiv lokal webapp for én investor og én eiendom i midlertidig økt.
[DESIGN.md](DESIGN.md) eier de to visuelle alternativene.
[Samlet forslag](designforslag.md) eier felles eksempel og avgrensning.
Ingen visuell retning er valgt, og produktimplementering er ikke autorisert.

[Konsept A](mockups/konsept-a.html) og [B](mockups/konsept-b.html) åpner på
samme fiktive eiendom etter tenkt opplasting, slik at uttrykkene kan
sammenlignes direkte. PDF-handlingen åpner inngangen. Prototypene leser
bare filnavn, ikke PDF-innhold; ingen analyse eller bekreftelse utføres.

## Information Architecture

| Flate | Innhold |
| --- | --- |
| Sammenligning | Faktiske forhåndsvisninger og lenker til A/B. |
| Eiendom/investering | Bilde, adresse, pris, opplysninger, tre hovedtall, finansiering, graf og kort vurdering/risiko. |
| PDF-inngang | Filvelger som hovedhandling, FINN-felt med eksisterende sperre. |
| Risiko | TG-kandidater, rapportdekning, konkrete mangler, separat TG3-avklaring i tilsiktet produkt. |
| Grunnlag og kilder | Pris/leie/drift, opphav, ukjent/kontrollstatus og illustrert originalkontekst. |
| Grafdata | Lesbar tabell og relevante enheter. |

A/B leverer samme investeringsoppgave. A viser økonomien som en rolig
redaksjonell fortsettelse av eiendommen. B samler finansiering ved grafen.

## Voice and Tone

Korte etiketter, presise beløp og konkrete årsaker. «Bruttoyield»,
«nettoyield» og «kontantstrøm før skatt» brukes konsistent. «Scenario –
ikke bekreftet» skiller prøving fra kontrollert vurdering. «Innhent mer
informasjon» beskriver eksemplets kontrollstatus uten kjøpssignal.

Kontrolltekniske detaljer ligger i fordypning. Ukjent blir ikke null,
ufullstendig blir ikke ferdig, og filvalg blir ikke påstått analyse.

## Component Patterns

- Finansiering: egenkapital 0–kontantbehov, rente 0–100 %, hele år 1–100
  i prototypen. Presisfelt har full range; slider har praktisk delintervall.
  Justering oppdaterer privat lån, betaling, kontantstrøm og graf.
- Yield: følger pris, leie og drift. Finansieringsendring påvirker ikke yield.
- Grafer: akkumulering av uendret årlig kontantstrøm, privat restgjeld,
  eller rentefølsomhet. Følsomhet viser valgt punkt innen 2–12 % og sier
  fra når valgt rente ligger utenfor. Tabell/mus/tastatur er tilgjengelig.
- Risiko/vurdering: synlig informasjonsbehov og kort årsak. Finansiering
  opphever aldri TG3, mangler, ukontrollert økonomi eller rapportdekning.
- Kilder: opphav og kontrollstatus holdes fra hverandre. Fysisk PDF-side
  er primær; trykt side er supplement i tilsiktet produkt.
- PDF/FINN: filnavn vises lokalt; FINN innliming utløser ingenting og Hent
  er deaktivert. Ingen API, lagring eller skjult behandling.

Produksjonsberegningene, bekreftelseskravene, kostnadskontroll, rapport-
listekontroll og særskilt TG3-avklaring beholdes. Ingen ny agentmodul.
Mockupene er ikke en implementering av disse kontrollene.

## State Patterns

| Tilstand | Resultat |
| --- | --- |
| Gyldig finansiering | Oppdater lokale scenarioverdier og grafer. |
| Ugyldig/tom finansiering | Vis feil og fjern berørte betalings-/kontantstrømtall og graf; gyldige uavhengige yields beholdes. |
| Negativ kontantstrøm | Vis fortegn og tydelig negativ økonomi, med nullakse og tekst. |
| Ukjent leie, eksplisitt demotilstand i A | Leieavhengige tall/grafer utilgjengelige. Privat lån/betaling/restgjeld beholder eget gyldig grunnlag. |
| Byggeår ukjent | Oppgi Ukjent uten gjetning. |
| Ufullstendig rapport / uavklart TG3 | Innhent mer informasjon uansett scenario. |
| PDF valgt | Bare filnavn og forklaring om ingen behandling. |
| Dialog lukket / nullstill | Tilbake med fokus bevart / gjenopprett eksempelverdier. |

Eksemplets dokumentfakta er fiktive. Alle kilder er konstruerte og kan ikke
brukes som bevis for en faktisk eiendom. B viser samme ukjent/fakta/egen-
forutsetning-skille i opplysninger og fordypning selv uten As ekstra testknapp.

## Interaction Primitives

Synlige etiketter og tallfelt supplerer slidere. Alle handlinger er knapper
eller lenker, og fokus er synlig. Dialoger bruker native modal, Esc og retur
til åpneren. B har tastaturnavigasjon mellom graffaner og en grafinspektør;
A har fokuserbare grafpunkter. Begge har datatabell.

Bruk `{spacing.control-height}` som normal kontrollhøyde i senere produkt.
A bruker `{colors.a-accent}` og B `{colors.b-accent}` for synlig fokus.
Eksklusiv presentasjon begrunner ikke skjulte eller utilgjengelige handlinger.

## Accessibility Floor

Opplysninger gir enhet/periode og tekstlig betydning uavhengig av farge.
Grafens data kan leses uten hover. Dekorative ikoner har tekstalternativ
via handlingsetikett. Foto er merket illustrasjon og har alternativtekst.
Dialog-/skjermbredder og grunnleggende tastatur er kontrollert lokalt;
full kontrast-/skjermleser-/zoomakseptanse må gjøres ved implementering.

## Responsive & Platform

Desktop viser graf og finansiering sammen. Mobil stabler flater uten
horisontal sidescroll og bruker `{spacing.mobile-gutter}` som utgangspunkt.
Full datatabell kan ha egen avgrenset leseflate. Ingen eksterne fonter,
grafbibliotek, fotoressurser eller nettjenester er nødvendige for skissene.

## Inspiration & Anti-patterns

A: premium eiendomsplattform, foto og redaksjonell ro. B: profesjonelt
analyseverktøy med grafisk dybde og presise tall. Inspirasjonsbildene omtalt
av bruker var ikke tilgjengelige; beskrivelsene er grunnlaget inntil videre.

Unngå administrasjonspreg, mange like bokser, lange forklaringer foran
økonomien, trading-lignende oppdiktede bevegelser, risikoscore og ukritisk
kjøpssignal. Funksjonalitet skjules ikke bak det visuelle uttrykket.

## Key Flows

### Mads sammenligner designretning

1. Mads åpner sammenligningssiden og ser A og B med identiske grunntall.
2. Han åpner begge, undersøker eiendommen og finner avkastning og risiko.
3. Han prøver de samme finansieringsvalgene og undersøker grafene.
4. **Klimaks:** Han kan velge hvilket uttrykk som best støtter hans
   investeringsarbeid uten at ulik økonomi påvirker sammenligningen.

### Mads undersøker en eiendom

1. Den foreslåtte produktreisen starter fra PDF uten manuell registrering
   av importerte opplysninger. FINN beholder eksisterende sperre.
2. Eiendommen og tilgjengelig investeringsgrunnlag vises; mangler er synlige.
3. Mads prøver finansiering og går til kilde-/TG-fordypning etter behov.
4. **Klimaks:** Han forstår potensial og usikkerhet samtidig. Reell kontroll,
   økonomibekreftelse og vurdering følger eksisterende regler i produktet.

Ny separat scenariokontrakt, bildestøtte og presise amortiserings-/grafregler
avklares først etter valg av retning. Ingen implementering er startet.
