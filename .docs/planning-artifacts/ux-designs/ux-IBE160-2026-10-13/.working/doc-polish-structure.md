# Redaksjonell strukturkontroll

BMAD Review `lenses=structure`, som siste dokumentstandard i BMAD UX. Dato: 2026-10-14. Grunnlag: [samlet dokumenttekst](doc-polish-input.md), 6109 ord målt med ferdighetens word_metrics.py; YAML er utelatt fra redaksjonell kontroll og kontrolleres mekanisk separat. Leser: mennesker. Stilguide: Microsoft Writing Style Guide.

Dokumentene skal hjelpe menneskelige lesere å utforme og etterprøve den avklarte desktop-opplevelsen for v1. Modell: **Reference/Database**, med navngitte brukerforløp som forklarende støtte.

| Pass | Original Text | Revised Text | Changes |
|---|---|---|---|
| structure | DESIGN §Brand & Style, tredje avsnitt — 44 ord av seksjonens 118 | **CONDENSE:** «Mads har valgt fargealternativ 2, lokale feil/mangler og behovsåpnet detaljsporbarhet, samt PDF-panel ved behov 14. oktober 2026. Beslutningsloggen skiller brukerens valg fra fasilitatorens konkretisering av typografi, geometri, fokus, valideringstidspunkt og tallformat.» | Alle opplysninger beholdes. 44 → 31 ord; sparer 13 ord. |
| structure | EXPERIENCE §Information Architecture, avsnittet som begynner «PRD-ens logiske UJ-1-steg …» — 32 ord av seksjonens 479 | **CONDENSE:** «Skjermtrinnene deler UJ-1-registreringen i tall og rapport, og samler beregninger/anbefaling i Resultat. [IA-notatet](ia-og-navigasjon.md), [firetrinns-wireframen](../wireframes/flow-firetrinn-2026-10-13.excalidraw) og [SVG](../wireframes/flow-firetrinn-2026-10-13.svg) viser koblingen og den delte kontrollflaten.» | Beholder forskjellen mellom produktreise og skjermoppdeling samt alle referansene. 32 → 22 ord; sparer 10 ord. Lenker er relative til rapporten her, og tilbakeføres relative til EXPERIENCE ved anvendelse. |
| structure | EXPERIENCE §Information Architecture: «Ingen IA-flate er bare beskrevet i tabellene.» — 7 ord | **CUT** denne setningen. | Foregående setning lenker allerede alle fire illustrerte flater. Sparer 7 ord. |
| structure | DESIGN §Components — 713 ord; EXPERIENCE §Component Patterns — 997 ord | **PRESERVE** begge tabellene med 26 felles komponenter. | Utseende og atferd er forskjellige oppslag; sammenslåing svekker arbeidsdelingen og bryter dokumentformen. Ordvirkning 0. |
| structure | EXPERIENCE §State Patterns — 968 ord; fire Key Flows — samlet 718 ord | **PRESERVE** tilstandstabellen og forløpene. | Oppslagstabell og navngitte forløp har ulik forståelsesverdi. Ordvirkning 0. |

Tre endringsforslag og to bevaringsanbefalinger. Full aksept reduserer teksten med 30 ord, 0,49 %, til 6079 ord. Ingen lengdemål er gitt. Forslagene bevarer beslutninger, dokumentform, referanser og forklarende støtte. Anvendelsesstatus dokumenteres i sluttkontrollen.
