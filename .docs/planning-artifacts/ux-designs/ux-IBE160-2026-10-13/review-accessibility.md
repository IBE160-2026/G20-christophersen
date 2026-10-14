# UX-kontroll — tilgjengelighet og forståelig kontrollflyt

Kontrollert 2026-10-13. Linse valgt av Mads gjennom BMAD Reviewer Gate.

## Verdict — adequate

Spine-paret har et gjennomarbeidet grunnlag for enkel desktop-kontroll: synlige etiketter/enheter, tekstlige statuser, tastatur og fokus, lokalt forståelige mangler samt tydelig skille mellom uttrekkskontroll, TG3-avklaring og listebekreftelse. To forhold må konkretiseres før paret er et ferdig UX-grunnlag: den allerede åpne smal-desktop-/PDF-beslutningen og kunngjøring av asynkrone statusendringer uten fokusflytting.

**Funn:** critical 0 · high 0 · medium 2 · low 0. Dette er dokument- og fargekontroll av et UX-utkast, ikke tastaturtest, skjermlesertest eller samsvarsvurdering av en implementert app.

## Funn

### A11Y-1 — medium — Åpen PDF-fallback gjør mindre desktop og zoom uavklart

**Sted:** [DESIGN.md, Layout & Spacing](DESIGN.md#layout--spacing), linje 248; [EXPERIENCE.md, Responsive & Platform](EXPERIENCE.md#responsive--platform), linje 155; `[OPEN UX-C]` i begge spines.

Valgt desktop-flyt krever samtidig funn-/PDF-kontekst, og NFR-2 krever at kilde og kontroll ikke skjules av oppsettet. Utkastet markerer ærlig at relevant vindusbredde, panelandel og mekanisme ved plassmangel ennå ikke er valgt. Dermed er dette en kjent designavhengighet, ikke et påvist feilaktig breakpoint. Det er ennå ikke bestemt hvordan brukeren beholder valgt funn, dokument/PDF-side og kontrollhandlinger når vinduet innsnevres eller teksten forstørres.

**Fix:** Avklar UX-C med Mads før finalisering. Beskriv den valgte atferden og fokus/retur dersom PDF vises i et eget panel; behold riktig side og funnkontekst. Dokumenter representative mindre desktop-/zoomvisninger som viser at etiketter, stegstatus og handlinger fortsatt kan brukes. Kontrollen trenger ingen ny mobilreise eller reparasjon av innholdet i original-PDF-en. [PRD NFR-2](../../prds/prd-IBE160-2026-10-10/prd.md#nfr-2-forståelig-desktop-flyt-og-grunnleggende-tilgjengelighet) og sensorveiledningen s. 4 er kravgrunnlaget; [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) gir praktisk støtte for forstørrelse uten funksjonstap, med særbehandling av nødvendige todimensjonale områder.

### A11Y-2 — medium — Status uten fokusflytting er ikke konkretisert for hjelpemidler

**Sted:** [EXPERIENCE.md, Component Patterns](EXPERIENCE.md#component-patterns), `analysis-status` og `pdf-viewer`, linje 77/83; [State Patterns](EXPERIENCE.md#state-patterns), linje 107/114/127; [Interaction Primitives](EXPERIENCE.md#interaction-primitives), linje 138; [Accessibility Floor](EXPERIENCE.md#accessibility-floor), linje 148–151.

Synlige laste-/feilstatuser er beskrevet, og automatisk PDF-sideskift skal korrekt beholde fokus på valgt funn. Derimot er «kunngjøring» bare nevnt som del av senere kontroll: kontrakten sier ikke hvilke viktige endringer som meddeles uten at brukeren må flytte fokus og lete. Analyse som blir ferdig/feiler, den forespurte PDF-siden som blir tilgjengelig/feiler, og resultat som blir utdatert kan derfor bli ulike opplevelser avhengig av senere tolkning.

**Fix:** Legg en kort atferdsregel i Interaction Primitives/Accessibility Floor: viktige analyse-, PDF- og gyldighetsstatusendringer formidles som korte tekstlige beskjeder som hjelpemidler kan oppfatte uten fokusflytting. PDF-status navngir dokument og aktuell/forespurt PDF-side; fullført analyse kan navngi at funnlisten er klar, også ved gyldig tomliste. Behold det vedtatte fokusforløpet og unngå automatisk opplesning av hele PDF-en/funnlisten eller gjentatte avbrudd. Dette konkretiserer forståelige tilbakemeldinger og eksisterende NFR-2, uten nytt sertifiseringskrav. [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) forklarer hvordan viktige statusendringer kan formidles uten å overta fokus.

## Kontrollert uten avvik

| Område | Dokumentgrunnlag og vurdering |
|---|---|
| Etiketter, enheter og feil | EXPERIENCE `value-field`, `period-control`, `issue-message` og Accessibility Floor knytter feil til berørt grunnlag. Blank, eksplisitt null og ubekreftet verdi skilles; eksisterende input beholdes. |
| Stepper og fokus | Nummer/navn/status, tidligere retur, fremtidig sperre med forklaring og endret-status er beskrevet. A1–A5 gir konkret fokus ved trinnbytte/ugyldig bekreftelse og beholder fokus ved automatisk PDF-navigasjon. Ingen kun-farge-status. |
| Kontrollbegreper | Bekreft/Korriger/Avvis gjelder uttrekk; alvorlig TG3 har separat avklaring og begge tekstgrunnlag; gjeldende liste bekreftes separat. Original/KI og brukerretting kan leses sammen. Uavklart TG3 blokkerer ikke selve menneskekontrollen. |
| Resultat og historikk | Hovedbegrunnelse, utløsere, tall, alvorlige funn og blokkere forstås uten detaljåpning. Åpen/lukket tilstand og skjult innholds fokus er beskrevet. Historisk resultat dempes med hierarki/flate og tydelig status, ikke samlet opasitet; ingen aktiv handling fra gammel konklusjon. |
| Lasting, tomtilstand, feil og offline | Fire flater dekker relevant faktisk venting, lokal feil, blankt grunnlag, gyldig tomliste, ufullført analyse og merket demo/live. Ingen oppdiktet fremdriftsprosent, falsk tomsuksess eller ny tillatelses-/innloggingsreise. |

## Uavhengig kontrastkontroll

Utvalgte lastbærende par ble beregnet på nytt fra de eksakte hexene i [valgt-palett.json](.working/valgt-palett.json) med relativ sRGB-luminans; tersklene vurderes før avrunding. Målingene stemmer med DESIGN.md. De oppfyller de vedtatte praktiske målene 4,5:1 for informasjonstekst og 3:1 for nødvendig kontrollkant/fokus. Dette bygger på [tilgjengelighetsgrunnlaget](.working/tilgjengelighetsgrunnlag.md) og de kontrollerte primærkildene [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) og [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).

| Par | Forhold |
|---|---:|
| Primærtekst `#243537` / hvitt `#FFFFFF` | 12,8094:1 |
| Sekundærtekst `#526865` / historisk/sekundærflate `#EBF1EF` | 5,2061:1 |
| Hvit knappetekst / petrol `#22665F` | 6,7011:1 |
| Positiv tekst / positiv flate | 6,5050:1 |
| Varseltekst / varselflate | 6,1501:1 |
| Feiltekst / feilflate | 6,1489:1 |
| Fokus petrol / sekundærflate | 5,8590:1 |
| Kontrollkant `#738781` / sekundærflate | 3,3314:1 |
| `issue-message.error` / komponentens varselflate | 6,4346:1 |

Petrol mot en petrolfylt primærknapp har ikke et eget kontrastskille; DESIGN løser dette eksplisitt med lys avstand mellom knapp og ring. Den beslutningen må bevares i senere mocks og kontroll. Den statiske fargeprøvens små eksempelfonter og ikke-interaktive handlinger er ingen test av appens tilgjengelighet; spine-paret eier den faktiske kontrakten.
