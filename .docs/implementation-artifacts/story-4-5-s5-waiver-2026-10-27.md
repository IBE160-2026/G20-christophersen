# S5-W1 — aksepterte avvik og avsluttet S5-testing for semester-v1

Dato: 2026-10-27. Beslutningstaker: **Mads, produkteier og prosjektleder**.
Beslutningsgrunnlag: eksplisitt brukerbeslutning i aktiv promptlogg
`../process/prompts/session-01a16b53-323d-7bd1-9e58-2cd1f62a6b4e.jsonl`.

**Prosjektbeslutning: S5-testingen er avsluttet med aksepterte avvik. Ingen
flere S5-målinger skal gjennomføres.** Mads aksepterer det utførte forsøket
som tilstrekkelig dokumentasjon av tidsmåling og arbeidsflyt i semester-v1.
Dette er et formelt leveranseunntak, ikke en endring av låste AC, en ny
måling, full Story 4.5-review eller påstand om bestått S5/tidsbesparelse.

## Bevis som beslutningen gjelder

Ett faktisk forsøk: `S5-2026-10-27-S5-B1-v1-01`, live, HTTP200/completed,
14-siders fryst S5-B1-v1. Originalt forsøks-/menneskebevis er bevart i commit
`e25b357258bce7cb8689b18a4651bcd0d0aff7d7`. Se [observasjonsrapporten](story-4-5-s5-b1-v1-observasjon-2026-10-27.md),
[opptaksreviewen](story-4-5-s5-b1-v1-opptaksreview-2026-10-27.md) og
[original bevismappe](story-4-5/S5-2026-10-27-S5-B1-v1-01/).
Original video, notat, request, provideruttrekk, receipt, observasjonsintervaller,
fasit og hasher skal ikke endres av dette waiveret.

| Observasjon akseptert av Mads | Presentasjon | Opprinnelig dokumentert intervall |
| --- | --- | --- |
| Manuell TG-identifisering | 32:16 | 1935,746667–1936,460000 s |
| KI-analyse til faktisk synlig liste | 0:41 | 40,466667–41,271667 s |
| Menneskelig KI-kontroll til appbekreftelse | 5:18 | 317,811667–318,633333 s |

Minutt-/sekundvisningene er de registrerte observasjonene Mads aksepterer,
ikke nye eksakte stoppeklokkemålinger som erstatter de bevarte intervallene.
Ett planlagt og opptatt forsøk; én teknisk fullført live-analyse, null feilede
analyser, én synlig appbekreftelse, null komplette godkjente manuelle
sammenligningsreferanser. Ingen demo, replay, ekstra forsøk eller skjult feil.
Faktisk tidligere kostnad USD 0,047151; samlet USD 0,070243. Dette waiveret
utløser ingen nye tester eller betalte kall.

## Aksepterte metodiske og formelle avvik

- **Ufullstendig manuell referanse:** ni TG-funn ble identifisert/notert.
  Generell rapportbegrensning og uttrykkelig TG3-status ble ikke vurdert
  i den manuelle delen. Manglende aktiviteter tilføyes ikke i ettertid.
- **Testen var ikke blind:** samme person leste samme rapport manuelt før
  KI-kontrollen. Forkunnskap/læringseffekt og mulig eksponering kan påvirke
  kontrolltiden. Mads opplyste at han ikke hadde lest rapporten før forsøket;
  dette gjør ikke den etterfølgende KI-kontrollen blind.
- **Ulikt arbeidsinnhold:** den manuelle TG-identifiseringen er ikke en
  fullstendig sammenlignbar førstevurdering. **Tidsbesparelse er ikke formelt
  validert.** Ingen gevinstprosent eller generell effektiviseringspåstand.
- **Forsøksavvik:** Safari ble brukt i stedet for planlagt Chrome, og finans
  avvek fra fryst v1-oppsett. Bekreftet appstatus er observert, men eksakt
  finans-/metodekvalifisering er ikke fullstendig dokumentert.
- **Kontrollbevis:** Mads opplyser at originalrapporten ble brukt. Full
  originalkontroll er ikke uavhengig verifisert fra opptaket. Appbekreftelse
  alene dokumenterer ikke alle menneskelige kontrollhandlinger.
- **Begrenset utvalg og kvalitet:** ett fiktivt case, ingen statistisk
  generalisering. Ni usikre kandidater ble håndtert i appen; TG3 forble
  Uavklart og resultatet Innhent mer informasjon. Sikkerhetsvern er ikke
  opphevet. Lave observerte tider alene dokumenterer ikke samlet S1–S5.

Mads aksepterer disse avvikene som leveransebegrensninger i semester-v1 og
beslutter at ytterligere S5-testing ikke skal utføres. Aksepten fjerner ikke
de observerte manglene og utgjør ikke en teknisk retting eller forskjønning
av originalresultatet. Den tidligere anbefalingen om ny måleplan/ny runde
er **trukket som videre arbeid** av denne beslutningen.

## AC-vurdering mot uendrede krav

Autoritet: [Story 4.5 AC1–AC6](../planning-artifacts/epics.md#story-45-måle-live-analyse-og-menneskelig-kontroll-etter-s5-protokollen)
og [S5/TT-1–TT-9](../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md#s5-måleprotokoll-og-tt-1tt-9).
Vurderingen bruker bare eksisterende bevis; ingen ny test eller full uavhengig
Story 4.5-akseptansereview er utført ved beslutningsregistreringen.

| AC | Status | Grunnlag og gjenværende avvik |
| --- | --- | --- |
| AC1 — gyldig forhåndsutvalg/start og hendelser | **Delvis oppfylt** | Forhåndsdefinert PDF/fasit og samme videoklokke, faktisk Start/liste/bekreftelse er bevart. Finans avvek fra plan; full kvalifisering av finans/startgrunnlag og menneskelig originalkontroll gjenstår som akseptert bevisbegrensning. |
| AC2 — avgrensning/beregning av varigheter | **Oppfylt for registrerte observasjoner** | Differanser bruker faktiske videohendelser. Førregistrering/opplasting og senere beregning er utelatt; modellslutt erstatter ikke synlig liste. Dette godkjenner beregningsmåten, ikke kontrollens fullstendighet. |
| AC3 — reell originalkontroll/TG3/S1–S4 | **Delvis oppfylt** | Menneskelige rettinger/listebekreftelse er observert; Uavklart TG3 og usikkerhet består. Full originalkontroll og samtidig samlet S1–S4 for dette avvikende forsøket er ikke uavhengig dokumentert. |
| AC4 — komplett, ærlig forsøksregistrering | **Oppfylt** | Det ene forsøket, originaler, versjoner, modus, tider/intervaller, utfall, kostnad og mangler er bevart og skilt fra demo/historisk S2. Manglende fullstendighet fremstilles ikke som nulltid eller teknisk feilet analyse. |
| AC5 — separate kvalifiserte medianer/akseptansestatus | **Ikke oppfylt som full akseptanse** | Observerte intervaller ligger under 300/600 s, men full kvalifisering av kontroll/gyldig utvalg mangler. Ingen ubetinget godkjent kontrollmedian eller samlet bestått S5 kan utledes. Med ett kvalifisert datapunkt ville medianen vært datapunktet selv; størrelsen på utvalget er ikke i seg selv et nytt krav. |
| AC6 — samme-case manuell førstevurdering/sammenligning | **Delvis oppfylt** | Faktisk samme-PDF manuell TG-referanse, aktiviteter, resultater og avgrensninger er dokumentert uten bruk av anslag/demo. Fullstendig sammenlignbar manuell førstevurdering mangler; formell tidsbesparelse er ikke validert. |

Ingen AC omskrives eller markeres oppfylt alene fordi produkteier aksepterer
avviket. Særlig består Story 4.5-testkravet om at åpne S5-/kvalitetsavvik ikke
kan omtales som bestått i Epic 5. Uavhengig opptaksreview var avgrenset til
bevisregistreringen og erstatter ikke full Story 4.5-akseptanse.

## Formell status og prosjektavslutning

[Sprintstatus](sprint-status.yaml) definerer bare backlog/ready-for-dev/
in-progress/review/done for stories og backlog/in-progress/done for epics.
`done with accepted deviations` er ingen definert maskinstatus. Epic-done
krever at alle stories er fullført. Den eksisterende 4.5-specen krever også
samtlige AC bestått før done; det foreligger ikke slik dokumentasjon eller
full sluttreview. BMADs generiske markering av ferdig spec er ikke bevis på
akseptanse av de låste Story-AC-ene og gir ingen egen waiver-status.

**Korrekt anbefalt og registrert avslutning:**

- Prosjektbeslutning for 4.5/S5: **avsluttet med aksepterte avvik**, waiver
  **S5-W1**. Ingen flere målinger er bestilt eller autorisert. Ingen oppgave
  om ny S5-runde skal velges automatisk fra historiske dokumenter.
- Formell maskinstatus for 4.5: **in-progress**, med separat avslutningsmetadata
  og waiver-lenke. Dette er en uttrykkelig statusbegrensning i dagens
  vokabular, ikke pågående eller planlagt videre S5-testing. Ikke bruk review
  som om full akseptanse er klar, eller done som om alle AC er bestått.
- Epic 4: **in-progress formelt**; 4.1–4.4 done,4.5 avvik akseptert og målearbeid
  avsluttet. Waiveret er synlig på Epic 4, uten falsk komplett AC-godkjenning.
- Ingen endring av statusregler/låste krav er vedtatt her. Et eventuelt senere
  nytt statusvokabular må skille prosjektaksept fra kravoppfyllelse; dette
  er ingen oppgave eller forutsetning for flere målinger nå.

Originale S2-bevis, F1–F4 og alle sju fryste S5-B1-v1-filer bevares. 4.4 done
står fast. 5.4/R4-S6 forblir urørt og eksternt blokkert; 5.5 startes ikke.
Ingen nye tester, regresjon, live-kall eller menneskemålinger er utført.
Beslutning og aktiv promptlogg følger samme lokale commit; ingen push.
