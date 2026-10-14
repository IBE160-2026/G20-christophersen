# Layout-uttrekk — BMAD UX Finalize

Dato: 2026-10-14. De fire nye nøkkelmocks, valgt palett, eksisterende flow-SVG, DESIGN.md, EXPERIENCE.md og beslutningsloggen er lest på nytt. Dette er destillering og referanseplassering, ingen ny review, produktregel eller brukerbeslutning. Hovedagenten utfører faktisk visuell QA og promotering.

**Mockdekning: 4 av 4 IA-flater er mocked; 0 er spine-only.** De separate tilstandene i samme HTML-fil er øyeblikksbilder av samme flate, ikke nye produktflater. Det finnes derfor ingen spine-only-beslutning å stille Mads spørsmål om.

## Felles layout og arvede valg

[Valgt palett](valgt-palett.json) er Grafitt og petrol: hovedflate `#FFFFFF`, sideflate `#F1F5F4`, sekundærflate `#EBF1EF`, grafitt `#253436`, petrol `#22665F`, lesbar sekundærtekst `#526865` og kontrollkant `#738781`. Mockenes lokale CSS-aliaser uttrykker disse samme rollene; statusfarger brukes på navngitt innhold. Lokal systemfont, roller på 24/16/14/12/22 px, kompakte 36 px handlinger, 32 px hovedluft, 24 px gruppeluft og små radier er allerede konkretisert i DESIGN og memlog A1–A5.

Alle fire mocks beholder firetrinns-stepper, gjeldende/fullført/gjenstående/endret tekststatus og synlig demo-/live-opphav. Navngitte handlinger er illustrasjoner av den eksisterende sekvensen. Tilstander, kilde-/bruker-/kodeopphav og krav til ny bekreftelse følger EXPERIENCE. Normal delt funn/PDF fra 1200 CSS px, om lag 44/56, smalt PDF-panel og ombrytning ved zoom er allerede valgt/operasjonalisert i memlog og begge spines.

Illustrert nettleserramme, 900 px eksempelviewport, konstruerte F1/F4-data, statisk PDF-side og interne lenker mellom tilstandseksempler er presentasjon av designreferansen. De skal ikke destilleres til produktfunksjoner, fast innholdshøyde, faktisk PDF-/analyselogikk, flere objekter eller implementert fokusstyring. Alle originale og nyere referanser er underordnet DESIGN.md og EXPERIENCE.md ved konflikt.

## 1. Tallgrunnlag — mocked

Kilde: [key-tallgrunnlag.html](key-tallgrunnlag.html). Viser hovedtilstand med ubekreftet, registrert F1-grunnlag og separat variant med manglende L, lokal feltfeil og Innhent mer informasjon.

| Uttrekk | Kontraktstatus |
|---|---|
| Fem P/L/D/J/Ymin-rader med definisjon, verdi/enhet, periode, anvendt grunnlag og kilde/forutsetning samtidig | Innhold og kontrollkrav finnes allerede i EXPERIENCE `value-field`, `period-control`, `source-note` og `financial-confirmation`. Den konkrete femkolonnekomposisjonen er ny visuell operasjonalisering av disse opplysningene, ingen ny regel. |
| D-poster gruppert under tallradene; J forklart separat | Eksisterende `cost-breakdown`, samme kostnadsinnhold uten dobbelttelling. Fem synlige poster er eksempeldata og ingen låst universell kostnadsliste. |
| Bekreftelsesgruppe under tall/kostnader; feltfeil nær L og kort lokal mangeloppsummering før radene | Allerede kontraktfestet bekreftelse, lokal feil og kodebasert mangelutfall. Den konkrete plasseringen samler eksisterende handling/tilbakemelding. |
| Registreringstabellen ombrytes til mindre grupper og én kolonne ved sterk innsnevring | Konkret visuell detalj innen eksisterende tilgjengelighets-/zoomkontrakt; etiketter/enheter/kilder beholdes. Mockens eksakte CSS-delgrenser er ikke nye brukerbeslutninger. |

**Destillerbar layoutdetalj:** Tallgrunnlaget viser definisjon, registrert verdi, periode, anvendt grunnlag og kilde i sammenheng; kostnadsinnhold og bekreftelse ligger etter verdiene. Ingen ny atferd trenger innarbeiding utover eksisterende kontrakt.

**Promotert mål:** `mockups/key-tallgrunnlag.html`.

**Caption:** «Tallgrunnlag: samlet verdi-, periode-, årsgrunnlags- og kildekontroll, med separat lokal mangeltilstand. Statisk F1-illustrasjon.»

**Lenkeplassering:** DESIGN §Layout & Spacing ved tall-/skjermkomposisjon; EXPERIENCE §Information Architecture ved flate 1 og/eller §State Patterns Tallgrunnlag. Én lenke navngir begge variantene.

## 2. Tilstandsrapport — mocked

Kilde: [key-tilstandsrapport.html](key-tilstandsrapport.html). Viser klar demo før eksplisitt Start analyse, separat konstruert live-lasting og separat analysefeil.

| Uttrekk | Kontraktstatus |
|---|---|
| Bekreftet tallgrunnlag oppsummert over gjeldende dokument | At tallbekreftelse går foran hovedreisens analyse er eksisterende kontrakt. Den korte synlige oversiktsraden er en konkret kontekstkomposisjon, ikke ekstra bekreftelse. |
| Dokumentnavn/grense/status i én rad, deretter egen analyse-/modusgruppe og Start analyse | `report-input`, `analysis-status`, støttet tekstbasert PDF og eksplisitt analyse er allerede beskrevet. Denne vertikale rekkefølgen konkretiserer trinnets hierarki. |
| Lasting har tekstlig ufullført-status og statisk venteindikator uten prosent | Allerede bestemt faktisk venting og ingen oppdiktet fremdrift. Ingen nytt ytelses- eller animasjonskrav. |
| Analysefeil står separat fra lokal Innhent mer informasjon-oppsummering | Allerede rettet og etterkontrollert lokal utfallsplassering; ingen feiltolkning av tomt uttrekk som suksess. |

**Destillerbar layoutdetalj:** Bekreftet kontekst → gjeldende dokument → analyse-/modusstatus → eksplisitt handling. Feilens konkrete årsak og screeningens mangelutfall er ulike tekstlige opplysninger på samme flate. Ingen ny produktatferd er introdusert.

**Promotert mål:** `mockups/key-tilstandsrapport.html`.

**Caption:** «Tilstandsrapport: valgt dokument og eksplisitt analyse, med separate demo-, laste- og analysefeiltilstander. Statisk illustrasjon; ingen rapport er analysert.»

**Lenkeplassering:** DESIGN §Layout & Spacing ved sekvens; EXPERIENCE §Information Architecture flate 2 og/eller §State Patterns Tilstandsrapport / Key Flow 4.

## 3. Kontroller funn — mocked

Kilde: [key-kontroller-funn.html](key-kontroller-funn.html). Fire navngitte utsnitt: bred kontroll (`desktop-kontroll`), korrigeringsutkast (`korrigeringsutkast`), smal hovedflate (`smal-funnkontroll`) og åpent PDF-panel (`smalt-pdf-panel`).

| Uttrekk | Kontraktstatus |
|---|---|
| Funnliste og valgt detalj i venstre felt, original/PDF-side med egne sidekontroller i høyre felt | Delt flate, automatisk kildeside og 44/56 er allerede kontraktfestet. Listen over detaljen i venstrefeltet er konkret komposisjon innen valgt mekanisme. |
| Egne grupper for uttrekkskontroll, TG3-avklaring og gjeldende listebekreftelse | Allerede eksplisitt tre forskjellige kontrollbegreper. Bekreft/Korriger/Avvis, status og opphav står ved aktuelt funn; ingen ny godkjenning. |
| Original KI, gjeldende versjon og redigert utkast vises samtidig; Bruk korrigering/Avbryt ved utkastfeltene | Mads' endelige korrigeringsbeslutning er allerede innarbeidet. Side-5/side-4-konflikten er et konstruert tilstandseksempel, ingen ny regel eller funnklassifisering. |
| Smal flate har Åpne PDF ved valgt funn; panelkontekst og Tilbake til funnkontroll over siden | Eksisterende endelig UX-C, riktig side, kort TG/beskrivelse/side/status/usikkerhet og bevart retur. Mocks illustrerer plasseringen; fokus/Esc/utkastbevaring kommer fra EXPERIENCE, ikke fra fungerende appkode. |

**Destillerbar layoutdetalj:** Venstrefeltet går fra funnvalg til detalj og tre separate kontrollgrupper. I smalt panel står kompakt valgt-funn-kontekst, retur og sidekontroller foran originalside. Den tegnede avkrysningsboksen i listebekreftelsen er én mulig framstilling av den eksisterende eksplisitte listebekreftelsen; den legger ikke til et nytt bekreftelseskrav.

**Promotert mål:** `mockups/key-kontroller-funn.html`, med eksisterende ankere bevart.

**Caption:** «Kontroller funn: samtidig funn/PDF, separat uttrekkskontroll, TG3-avklaring og listebekreftelse; varianter viser korrigeringsutkast og valgt smalt PDF-panel. Rapportside og funn er konstruerte illustrasjoner.»

**Lenkeplassering:** DESIGN §Layout & Spacing og `pdf-viewer`/`finding-edit`; EXPERIENCE §Component Patterns eller Key Flow 2 for kontroll/utkast. §Responsive & Platform kan lenke direkte til `mockups/key-kontroller-funn.html#smal-funnkontroll` og `mockups/key-kontroller-funn.html#smalt-pdf-panel`.

## 4. Resultat — mocked

Kilde: [key-resultat.html](key-resultat.html). Viser gjeldende F4-utfall med F1-økonomi og separat utdatert tilstand (`utdatert-resultat`) etter endring av L.

| Uttrekk | Kontraktstatus |
|---|---|
| Anbefaling og kort kodebegrunnelse først, avgjørende regel rett under | Mads' valgte investeringsnotat-hierarki og eksisterende `recommendation`. Ingen KI-generert argumentasjon. |
| Fire nøkkeltall på én rad, deretter alvorlige funn og mangler i to sidestilte grupper | De fire tallene og åpne hovedopplysningene er allerede låst. Én tallrad og to informasjonskolonner er konkret layout, ikke nye beregninger eller rapportfiltrering. |
| Neste handling og retur til rapportfunn/tallgrunnlag før detaljseksjonene | Eksisterende anbefalingsbundet handling og retur. Hovedinnholdet ligger utenfor sammenfoldede detaljer; siden kan rulle. |
| Fire behovsåpnete grupper for formler, inputkilder, aktive funn og KI-/brukerendringer | Progressive disclosure og tilgjengelighet for alle aktive TG2/TG3 er allerede valgt. Navn/gruppering er konkret organisering av samme kontrollgrunnlag, ikke en ny funksjon eller et krav om nøyaktig fire accordions. |
| Endringsmelding og gjeldende rettehandling er atskilt fra dempet historisk anbefaling/tall | Allerede kontraktfestet stale-result, endret stepperstatus, fortsatt lesbar kontrast og ingen aktiv gammel konklusjon. Beløpendringen er eksempeldata, ikke ny finansregel. |

**Destillerbar layoutdetalj:** Anbefaling/regel → fire nøkkeltall → tekniske funn og blokkere → neste handling → behovsåpnet etterprøving. Utdatert variant skiller aktiv rettehandling fra historisk grunnlag visuelt og tekstlig. Ingen ny brukerbeslutning er nødvendig.

**Promotert mål:** `mockups/key-resultat.html`; alternativet kan lenkes direkte med `#utdatert-resultat`.

**Caption:** «Resultat: kort kodebasert førstevurdering med anbefaling, utløst regel, fire nøkkeltall, blokkere og neste handling; detaljer åpnes ved behov. Separat variant viser historisk utdatert resultat. Konstruert F4-referanse, ingen utført beregning.»

**Lenkeplassering:** DESIGN §Layout & Spacing / `recommendation`/`metric-grid`/`stale-result`; EXPERIENCE §Information Architecture flate 4 og/eller Key Flow 3 ved historisk resultat. Behovsåpningen kan refereres fra `detail-disclosure`.

## Flow-referansen ved promotering

[Eksisterende flow-SVG](flow-firetrinn-2026-10-13.svg) beskriver alle fire trinn, delt kontrollflate, enkeltfunnets handlinger, separat TG3/listekontroll og tilbake-/endringsflyt. Filen har viewBox `3690 × 1720`; denne er tegningsformat, ikke appens skjermkrav. Gråtoner, geometri og tidlig illustrert detaljtetthet bestemmer ingen ny standard foran Mads' senere A/B-/UX-C-valg.

Promoterte mål: `wireframes/flow-firetrinn-2026-10-13.excalidraw` og `wireframes/flow-firetrinn-2026-10-13.svg`.

Caption: «Firetrinnsflyt: navigasjon, kontroll mot originalrapport og retur etter grunnlagsendring. Tidlig gråtoneskisse; konkrete komponenter, detaljåpning og smalt PDF-panel følger gjeldende spines og nøkkelmocks.»

Lenkeplassering: behold den eksisterende referansen ved DESIGN §Layout & Spacing og EXPERIENCE §Information Architecture, med oppdaterte promoterte filstier. SVG gir lesbar oversikt; Excalidraw bevarer redigerbar skisse. Valgt palett og kontrastgrunnlag forblir navngitt ved DESIGN §Colors.

## Handoff til hovedagenten

Alle fire IA-flater har visuell referanse. Ingen nye atferds-, produkt- eller merkevarevalg er hentet fra mockene; de nye konkrete komposisjonsdetaljene over er operasjonalisering innen allerede besluttede kontrakter. Hovedagenten kan løfte korte anvendelsesbeskrivelser inn i relevante spine-seksjoner, gjennomføre faktisk visuell QA og deretter promotere keepers/linkene. Dette notatet endrer ingen spine, memlog, kildedokument eller finans-/anbefalingsregel.
