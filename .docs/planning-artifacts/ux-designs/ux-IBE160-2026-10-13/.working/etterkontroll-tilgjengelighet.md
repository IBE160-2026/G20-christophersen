# Målrettet etterkontroll — tilgjengelighet

Dato: 2026-10-14. Omfang: bare A11Y-1/A11Y-2 fra [originalkontrollen 13. oktober](../review-accessibility.md), og dokumentfølger av de innarbeidede rettingene. Ingen ny full kontrollrunde, redigering av originalrapporten eller test av implementert app.

**Status:** Begge opprinnelige funn er **lukket på dokumentnivå**. Ingen nye dokumentavvik identifisert i de undersøkte rettingene. Åpne funn i denne linsen: critical 0 · high 0 · medium 0 · low 0. Originalkontrollens to medium-forekomster og opprinnelige verdict beholdes som historisk kontrollbilde.

## A11Y-1 — lukket på dokumentnivå

Den tidligere åpne PDF-/zoom-mekanismen er nå valgt av Mads og konkretisert i begge spines. [Brukersvaret](brukeravklaringer.md#endelig-pdf-fallback--14-oktober-2026), linje 312–342, velger PDF-panel ved behov, kompakt valgt-funn-kontekst, riktig kilde-side og eksplisitt retur som bevarer arbeidskonteksten. Vanlig desktop beholder delt visning; stablet visning er ikke standard fallback.

| Kontrollpunkt | Konkret dokumentbevis |
|---|---|
| Delt desktop og operativ grense | [DESIGN, Layout & Spacing](../DESIGN.md#layout--spacing), linje 248, og [EXPERIENCE, Responsive & Platform](../EXPERIENCE.md#responsive--platform), linje 158–166: fra 1200 CSS px, om lag 44/56 og 24 px mellomrom. Grense/panelandel er uttrykkelig fasilitatorens operasjonalisering, ikke påstått ordrett brukervalg. |
| Smal kildekontroll | EXPERIENCE linje 163: TG, kort beskrivelse, PDF-side, status og eventuell usikkerhet beholdes som kompakt valgt-funn-kontekst. Åpne PDF fra funnet gir korrekt kilde-side og Tilbake til funnkontroll. `pdf-viewer`, linje 83, beholder original i appen, hel side og nabosider samt synlig kildefeil uten gjettet navigasjon. |
| Fokus og trygg retur | EXPERIENCE Accessibility Floor, linje 153, og Responsive & Platform, linje 166: fokus flyttes til paneloverskriften ved eksplisitt åpning, holdes i panelets kontroller og returnerer til åpneren ved lukking/Esc. Valgt funn, posisjon, arbeidskontekst og uferdig korrigeringsutkast beholdes. |
| Forstørrelse og trinnorientering | EXPERIENCE linje 164 og DESIGN linje 248: tekst/kontroller ombrytes og alle fire trinnnummer, navn og statuser beholdes i samme leserekkefølge. Nødvendig todimensjonal PDF-lesing håndteres særskilt i panelet uten skjult kilde eller kontrollhandling. |

Dette lukker den opprinnelige atferds- og designavhengigheten. Representative nøkkelmocks og visuell kontroll inngår fortsatt i BMAD Finalize; denne etterkontrollen hevder ikke å ha vist at en faktisk PDF-komponent fungerer ved de angitte vinduene eller ved zoom.

## A11Y-2 — lukket på dokumentnivå

[EXPERIENCE, Interaction Primitives](../EXPERIENCE.md#interaction-primitives), linje 141, har nå en eksplisitt regel for statusbeskjeder uten fokusflytting:

- Analyse fullført/feilet, PDF-side tilgjengelig/feilet og resultatets gyldighetsskifte formidles kort og tekstlig til hjelpemidler.
- PDF-beskjeden navngir dokument og forespurt/aktuell filside; analysefullføring meddeler klar funnliste, også ved gyldig tomliste.
- Viktige overganger kunngjøres én gang, uten opplesning av hele rapporten/listen eller gjentatte avbrudd.

Regelen gjør den tidligere generelle kontrolloppgaven til en konkret atferdskontrakt. Det eksisterende fokusforløpet i linje 140 beholdes: automatisk PDF-sideskift ved funnvalg stjeler ikke fokus. Den eksplisitte åpningen av smalt PDF-panel har separat, tilsiktet fokusflytting etter linje 153/166. Dette er kompatible situasjoner, ikke motstridende fokusregler.

## Dokumentfølger kontrollert

- Panelretur har både synlig handling og tastatur/Esc; den lukkes med gjenopprettet fokus og kontekst. Ingen ny navigasjonssperre uten vei tilbake er beskrevet.
- PDF-panel og stepper-reflow bevarer tekstlige statuser, fullstendige trinnnavn og kildehenvisning. Eksisterende feltetiketter/enheter, synlig fokus og kontrastregler er ikke svekket av rettingene.
- Korrigeringsmekanismen er nå valgt og innarbeidet i `finding-edit`/`origin-detail` og redigeringsutkast-tilstanden, EXPERIENCE linje 81–82/118. Utkast, gjeldende korrigering, original KI og bekreftelsesstatus skilles med tekst; panelretur bevarer utkastet. Den tidligere åpne beslutningen er derfor ingen gjenværende avhengighet for denne etterkontrollen. Annen linses kontroll av korrigeringsgyldighet er ikke gjentatt her.
- Dokumentene beskriver fortsatt grunnleggende tilgjengelighet og senere manuell kontroll, uten WCAG-sertifisering, ny mobilreise, OCR eller krav om å reparere original-PDF-en.

Originalrapportens SHA-256 ved etterkontrollen: `ba641c5dcd66bb661174b6e2c465257d22a92ffb4f6d6b362602f06e49d35c50`. Rapporten er beholdt uendret; statusendringen ligger i dette notatet. Syntesens gjeldende triage oppdateres separat av fasilitator.
