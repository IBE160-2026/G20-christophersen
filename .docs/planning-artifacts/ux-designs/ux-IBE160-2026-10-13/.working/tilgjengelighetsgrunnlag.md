# Praktisk tilgjengelighetsgrunnlag for UX

Kontrollert 2026-10-13, supplert med statusbeskjeder 2026-10-14. PRD NFR-2 og sensorveiledningen s. 4 fastsetter grunnleggende tilgjengelighet. De fastsetter ingen WCAG-versjon eller sertifisering. Følgende er faglig grunnlag for å konkretisere designet, ikke nye kurs- eller produktkrav.

## Kontrollerte primærkilder

- [W3C: Contrast (Minimum), 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): vanlig tekst har 4,5:1 kontrast; stor tekst kan ha 3:1. For fargeprøvene brukes praktisk mål 4,5:1 også for større tekst. Kontrast beregnes fra sRGB med W3Cs luminansformel; terskler vurderes før avrunding.
- [W3C: Non-text Contrast, 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): meningsbærende kontroll- og tilstandsindikatorer har 3:1 mot tilstøtende flate. Det betyr ikke at alle dekorative skillelinjer må ha denne kontrasten. Inndatafeltets nødvendige grense og synlig fokus kontrolleres særskilt.
- [W3C: Focus Visible, 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html): tastaturfokus skal være synlig og ikke tidsbegrenset. Dette støtter PRD-kravet om synlig fokus i kjerneflyten.
- [W3C: Reflow, 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): tekst og kontroller skal kunne ombrytes ved forstørrelse uten tap av funksjon; nødvendige todimensjonale områder behandles særskilt. Dette brukes til å vurdere zoom og smalere desktop-vinduer, uten å innføre mobilapp eller en ny mobilreise.
- [W3C: Status Messages, 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), kontrollert 2026-10-14: viktige statusendringer som ikke flytter fokus kan gjøres oppfattbare for hjelpemidler uten å avbryte arbeidskonteksten. Dette støtter korte analyse-, PDF- og gyldighetsbeskjeder; hele rapporten/funnlisten skal ikke leses opp som en statusmelding. Grunnlaget konkretiserer eksisterende tilbakemeldinger og NFR-2, uten nytt sertifiseringskrav.

## Anvendelse i pågående Discovery

- Fargeprøvene skal oppgi faktiske kontrastpar for tekst, primærhandling, status, feltgrense og fokus.
- Historiske resultater skal dempes med flate/hierarki og status, samtidig som lesbar tekstkontrast beholdes; redusert opasitet på hele resultatet må ikke gjøre teksten vanskelig å lese.
- Stepperstatus, TG-grad, kontrollstatus, usikkerhet og anbefaling kommuniseres med tekst, ikke bare farge.
- Senere spesifikasjon må dekke tastatursti, synlige feltetiketter/enheter, feil koblet til felt, fokus ved trinnbytte, PDF-kontroll og detaljåpning. Dette er ikke testbevis for en implementert app.
