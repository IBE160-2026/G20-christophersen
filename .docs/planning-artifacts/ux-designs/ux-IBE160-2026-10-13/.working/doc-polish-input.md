# Property Acquisition Agent — Design

## Brand & Style

Et rolig, institusjonelt arbeidsverktøy for førstevurdering av eiendom. Presisjon, kontroll og lesbarhet bærer uttrykket: lys flate, grafitt som struktur, luft mellom informasjonsgrupper og kompakte data der det hjelper arbeidet. KI presenteres som én delprosess. Resultat skal oppleves som et kort investeringsnotat med anbefaling først, uten å overta brukerens investeringsbeslutning.

Spesifikasjonen er destillert fra [.memlog.md](.memlog.md) og [brukeravklaringer](.working/brukeravklaringer.md). Produktkrav arves fra `sources`; opplevelsen spesifiseres i [EXPERIENCE.md](EXPERIENCE.md). Ved konflikt med skisser og prøver gjelder DESIGN.md og EXPERIENCE.md.

Fargealternativ 2, lokale feil/mangler og behovsåpnet detaljsporbarhet er valgt av Mads. Typografi, geometri, fokus, valideringstidspunkt og tallformat er konkretisert av fasilitator innen denne retningen; beslutningsloggen skiller disse detaljvalgene fra brukerens uttrykkelige valg. Smal PDF-fallback er PDF-panel ved behov, valgt av Mads 14. oktober 2026.

## Colors

Valgt **Grafitt og petrol**: [fargeprøve, alternativ 2](.working/color-themes-1.html) viser aksent, anbefaling, proveniens og historisk tilstand. [Valgt palett](.working/valgt-palett.json) bevarer de eksakte hexene; andre alternativer er utforskning, ikke godkjente varianter. Frontmatter bruker flate kebab-case-navn, med `success_bg` fra prøven oversatt til `status-success-surface` og tilsvarende for varsel/feil.

| Roller | Bruk |
|---|---|
| `{colors.surface-page}`, `{colors.surface-main}`, `{colors.surface-subtle}` | Lett bakgrunn, hvit arbeidsflate og sekundære grupper. Historisk resultat bruker den sekundære flaten; lesbar tekst dempes gjennom hierarki, ikke gjennom samlet lav opasitet. |
| `{colors.ink-structure}`, `{colors.text-primary}`, `{colors.text-secondary}` | Overskrifter og tall, løpende innhold, deretter metadata/kilder. Sekundærtekst er fortsatt lesbar informasjon. |
| `{colors.accent-primary}`, `{colors.on-accent}`, `{colors.focus-ring}` | Diskret petrol for primærhandling, gjeldende trinn, valgt funn og synlig fokus. Aksent betyr interaksjon/orientering, ikke investeringskvalitet. |
| `{colors.border-control}`, `{colors.border-decorative}` | Første rolle gjør felt og meningsbærende kontrollgrenser synlige. Andre rolle brukes bare til dekorative skiller. |
| `{colors.status-success}`, `{colors.status-success-surface}` | «Gå videre» og faktisk positiv status, alltid med tekst. Ingen kjøpe- eller godkjenningspåstand. |
| `{colors.status-warning}`, `{colors.status-warning-surface}` | «Innhent mer informasjon», mangel, usikkerhet og Uavklart når relevant. |
| `{colors.status-danger}`, `{colors.status-danger-surface}` | «Forkast», dokument-/analyse-/feltfeil og alvorlig rapportgrad, med konkret etikett. TG-grad og screeningutfall er ulike opplysninger. |

Kontrast konkretiserer PRD NFR-2 med et praktisk designmål: informasjonstekst minst **4,5:1**, nødvendig kontrollgrense og fokus minst **3:1**. Ingen WCAG-sertifisering eller nytt kurskrav påstås. [Kontrastgrunnlag](.working/tilgjengelighetsgrunnlag.md) forklarer anvendelsen; [faktiske kontrastpar](.working/fargekontraster-1.json) dokumenterer prøven.

| Lastbærende kombinasjon, valgt alternativ 2 | Målt forhold |
|---|---:|
| Primærtekst / hvitt | 12,8094:1 |
| Sekundærtekst / sekundærflate, svakeste normale tekstpar | 5,2061:1 |
| Hvit tekst / petrol primærhandling | 6,7011:1 |
| Grønn / positiv flate | 6,5050:1 |
| Varseltekst / varselflate | 6,1501:1 |
| Feiltekst / feilflate | 6,1489:1 |
| Petrol fokus / sekundærflate, svakeste fokuspar | 5,8590:1 |
| Kontrollkant / sekundærflate, svakeste kontrollpar | 3,3314:1 |

Fokus på fylt primærhandling må skilles fra knappens egen aksent gjennom lys avstand til ringen. Dekorative skiller brukes ikke alene til felt, utvalg eller status. Nye fargekombinasjoner må kontrolleres ved senere konkretisering.

## Typography

Et nøkternt sans-serif uttrykk med tydelig hierarki og tall som kan skannes. Frontmatter bruker lokal systemfont og seks roller ut fra den valgte prøven og den ønskede presise, kompakte desktop-flaten. `title` brukes på resultatets anbefaling, `section` på grupper, `body` på begrunnelser, `label` på felt/handlinger, `meta` på kilder/status og `metric` på beregningsverdier. Kilde og usikkerhet må ikke gjøres uleselig for å få plass.

Tall beholder enheter og årsperiode. Normalvisning bruker norske skilletegn, beløp i hele NOK og yield med tre desimaler som i fargeprøven; nødvendig detaljpresisjon utvides ved terskelbrudd eller fasitkontroll. Visningsformatet endrer ingen beregning: uavrundede regler gjelder, og en avrundet visning som skjuler brudd får en konkret forklaring. Tabellariske siffer kan brukes innen systemfonten uten å gi tradingpreg.

## Layout & Spacing

Horisontal firetrinns-stepper øverst på alle flater: **Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat**. Stepperen beholdes synlig når arbeidsinnholdet rulles, uten å dekke fokusert innhold. Funnkontrollen viser funn/funndetaljer og innebygd original-PDF side om side. Resultat organiseres som anbefaling og kort begrunnelse, deretter nøkkeltall, rapportgrunnlag, mangler/usikkerhet og sporbarhet. Informasjon grupperes med typografi, avstand og skiller; bokser skal ha en funksjon.

[Firetrinns-wireframe](wireframes/flow-firetrinn-2026-10-13.excalidraw) og [SVG-oversikt](wireframes/flow-firetrinn-2026-10-13.svg) illustrerer valgte flater, samtidig PDF-kontroll og tilbakehandlinger. Gråtoner, panelgeometri og standard detaljåpning i skissen er illustrative.

Alle fire IA-flater har [visuelle nøkkelreferanser](mockups/key-oversikt.html): [Tallgrunnlag](mockups/key-tallgrunnlag.html), [Tilstandsrapport](mockups/key-tilstandsrapport.html), [Kontroller funn](mockups/key-kontroller-funn.html) og [Resultat](mockups/key-resultat.html). Tallgrunnlag samler definisjon, registrert verdi, periode, anvendt årsgrunnlag og kilde i lesbare rader på bred desktop. Tilstandsrapport samler valgt dokument og eksplisitt analysehandling med tallbekreftelsen som kontekst. Resultat viser de fire nøkkeltallene samlet i én rad når plassen tillater det, før tekniske funn og mangler. Smalere flater ombryter grupper uten innholdstap. Mocks viser konstruerte PRD-eksempler og utvalgte tilstander; de utfører ingen produktfunksjon.

Skalaen er 4/8/12/16/24/32/48 px, med 32 px ytre luft, 24 px mellom hovedgrupper og 36 px kontrollhøyde. Fasilitatorens operasjonalisering: fra 1200 CSS px brukes delt kontrollflate med om lag 44/56 funn/PDF. Under grensen beholder funnkontrollen hovedrollen; PDF åpnes som et panel med valgt funn kort oppsummert, korrekt side og tydelig tilbakehandling. Ingen stablet funn/PDF som standard fallback. Ved sterk zoom ombrytes stepperen med alle navn/nummer/status bevart. Representative nøkkelmocks er 1440×900, 1280×800 og smalere panelvisning; dette er desktop-/zoomtilpasning.

Resultat viser fra start anbefaling, kort begrunnelse, utløste regler, alle fire nøkkeltall, alvorlige tekniske funn, mangler/uavklarte forhold og neste handling. Formler, inputkilder/forutsetninger, detaljerte beregningsgrunnlag og opprinnelig KI-/brukerendring åpnes ved behov gjennom tydelig merkede seksjoner. Alle aktive TG2/TG3 er fortsatt tilgjengelige. Feil/mangler og det kodebaserte Innhent mer informasjon-utfallet vises i aktuelt arbeidstrinn når kritisk grunnlag er utilstrekkelig; Resultat samler de faktiske blokkeringene uten full feilmeldingsduplisering.

## Elevation & Depth

Hvite og lett tonede flater, avstand og presise skiller gir hierarki. Ingen KI-glød, dekorative gradienter eller effekter som konkurrerer med dokument og tall. Utgangspunktet har ingen skygge som bærende hierarki; PDF-siden skilles fra omgivelsene med flate/kant. Tilstander må være tydelige uten animasjon.

## Shapes

Små, rolige radier fra frontmatter: `md` på felt og handlinger, `lg` på informasjonsgrupper og `sm` på statusetiketter. `full` er reservert for stepperens nummermarkører. Ingen store dekorative kortflater eller merkevareillustrasjoner er valgt.

## Components

ID-ene er felles med EXPERIENCE.md. Tabellen beskriver utseende; atferd og gyldighet finnes i peer-dokumentet. Størrelser følger frontmatter-tokens. Mads har valgt behovsåpning av detaljer på Resultat; anbefalingen skal forstås uten å åpne dem.

| Komponent | Visuell kontrakt og tilstander |
|---|---|
| `app-header` | Navn i grafitt, modus/opphav i lesbar sekundærtekst. «Demo · lagret KI-uttrekk» er synlig som metadata; ingen KI-logo eller nøkkelfelt. |
| `stepper` | Nummer, eksakt trinnnavn og tekststatus. Petrol markerer gjeldende trinn; Fullført/Gjenstår/Endret må oppdateres leses også uten farge. Fokus synlig på navigerbare trinn; sperret trinn har forklaring. |
| `action-primary` | Petrol fyll, hvit tekst, synlig fokus og lesbar handling. Bare gyldige handlinger får aktiv fremtoning; ingen knapp som tar investeringsbeslutningen. |
| `action-secondary` | Hvit flate, grafitt tekst og kontrollkant. Tilbakehandlinger og funnhandlinger er synlige uten hover; sperre forklares. |
| `value-field` | Synlig etikett, verdi, enhet og tilknyttet kilde/forutsetning. Blank og eksplisitt 0 skilles med innhold/status. Feil bruker konkret tekst og feilkantsignal; fokus bruker petrol. |
| `period-control` | År/måned og anvendt årsgrunnlag nær berørt verdi. Valgt periode er tekstlig synlig. Uavklart periode vises som mangel, uten skjult årsstandard. |
| `source-note` | Nøktern metadataetikett identifiserer rapport, brukerforutsetning, brukerendring eller kode. Dokumentnavn og «PDF-side n» holdes lesbare. |
| `cost-breakdown` | Kostnadsposter og skille mellom D og J leses som strukturert innhold med enheter og skiller; ingen ny kostnadsestimat- eller låneplanflate. |
| `financial-confirmation` | Kontrollgruppe med verdier, enheter, perioder, årsgrunnlag og kilder; ubekreftet/endret status tydelig. Bekreftelseshandling følger action-primary. |
| `report-input` | Gjeldende filnavn og dokumentstatus ved synlig filvalg. Grense «Tekstbasert PDF · maks. 30 sider» tilgjengelig; feil har tekstlig årsak. |
| `analysis-status` | Nøktern statuslinje/gruppe med «Analyserer», fullført eller analysefeil. Delresultat og lagret demo merkes; ingen oppdiktet prosentsats eller skjult feil bak tom liste. |
| `finding-list` | Alle aktive funn med TG og kontrollstatus; valgt funn har petrol utvalgssignal og tekstlig identifikasjon. Usikre/avviste funn forveksles ikke med aktive bekreftede fakta. |
| `finding-detail` | TG, kort KI-beskrivelse, dokument/PDF-side, eventuell usikkerhet, status og handlinger i ett lesbart hierarki. Grad og avklaringsstatus er adskilte etiketter. |
| `finding-actions` | Bekreft/Korriger/Avvis står sammen ved det aktuelle funnet. Ingen avvisningsfarge som antyder teknisk utbedring; fokus og nødvendig sperre vises. |
| `finding-edit` | Redigert utkast i tydelig merket gruppe med Bruk korrigering og Avbryt; originalt KI-funn og gjeldende versjon er tilgjengelige separat. Utkast, brukt korrigering og bekreftelsesstatus skiller seg med tekst. Felt for grad, beskrivelse og PDF-side beholder kildekontekst og feltfeil. |
| `origin-detail` | Tydelige overskrifter «Opprinnelig KI-uttrekk» og «Brukerens korrigering»/«Brukeravvist» med samme lesbarhet. Ingen gjennomstreking som gjør originalen uleselig. På Resultat åpnes detaljene ved behov. |
| `pdf-viewer` | Originalside på hvit flate, dokumentnavn/PDF-side og synlige sidekontroller. PDF ligger ved funnet på bred flate. Smal flate bruker et panel med kort valgt-funn-oppsummering og synlig Tilbake til funnkontroll; samme PDF-side og lesbar kilde beholdes. Lasting/feil berører visningen synlig. |
| `tg3-resolution` | Egen gruppe med Avklart/Uavklart, begrunnelse og konkret avklaringsgrunnlag. Brukeropphav vises. Ugyldig Avklart får konkrete feltfeil; original TG3-grade beholdes. |
| `list-confirmation` | Separat, tekstlig bekreftelsesgruppe for gjeldende liste. Status og handling er skilt fra enkeltfunnets Bekreft og fra TG3-avklaring. |
| `recommendation` | Nøyaktig én gjeldende anbefaling øverst, kort kodebegrunnelse direkte under og anbefalingsbundet neste handling. Dempet semantisk statusfarge med tekst; historisk anbefaling bruker stale-result. |
| `metric-grid` | Fire faste nøkkeltall med navn, verdi og enhet/år. Negative tall beholdes. Ikke beregnbart vises med konkret årsak; «Delgrunnlag» er lesbart når samlet grunnlag mangler. |
| `basis-detail` | Formler/input, aktive funn/kilder, avklaringer og annen sporbarhet i skannbare behovsåpnete grupper. Alvorlige funn, blokkere og utløste regler er synlige fra start, uten å skjule øvrige aktive funn. |
| `detail-disclosure` | Synlig tekstoverskrift, åpen/lukket tilstand og fokus ved behovsåpnete detaljer. Innholdet følger basis-detail/origin-detail; ingen skjult ikon-only-kontroll. |
| `issue-message` | Kort årsak, berørt felt/funn/dokument og nødvendig handling i aktuelt trinn. Tekst formidler feil/tomtilstand/usikkerhet; farge supplerer. Resultat samler faktiske blokkere, ikke hele lokale feilmeldinger. |
| `status-label` | Tekstlige status-/opphavsetiketter i lesbar metadatarolle; grad, kontroll, avklaring og modus navngis hver for seg. Grønt/varsel/rødt bare der innholdet begrunner det. |
| `stale-result` | Tidligere anbefaling og tall etter endret gjeldende økonomi/funnliste/rapport eller TG3-status/begrunnelse/grunnlag på sekundærflate med tydelig «Utdatert / Må bekreftes på nytt», endring og nødvendig ny kontroll. Dempet hierarki, fortsatt lesbar kontrast; ingen aktiv beslutningsklar fremtoning. |

## Do's and Don'ts

| Gjør | Unngå |
|---|---|
| Behold lys, profesjonell arbeidsflate og tydelig informasjonshierarki | Mørkt trading-/krypto-/gaminguttrykk, neon, gradienter, KI-glød og store illustrasjoner |
| Bruk én diskret aksent til handling og orientering | Gjør KI til produktets visuelle hovedperson eller bruk statusfarger dekorativt |
| Vis status, grad, opphav og gyldighet med tekst | Formidle usikkerhet eller anbefaling bare med farge; demp historisk tekst til uleselighet |
| La dokument, tall og begrunnelse bære designet | Overflødige kort, fri dashboard-navigasjon, chatbot eller v2-funksjoner i v1-skisser |
| Bruk valgte tokens og behovsåpning konsekvent | Gjør en uvalgt palett eller historisk skisse til gjeldende design |

# Property Acquisition Agent — Experience

## Foundation

Desktop-web for én aktuell førstevurdering om gangen. [DESIGN.md](DESIGN.md) er referansen for visuell identitet; dette dokumentet eier atferd, kontroll, gyldighet og tilstander. Ingen UI-system eller teknologistakk er valgt. Kilder arves gjennom `sources`; den ferdigstilte PRD-en beholder finansregler, anbefalingsprioritet og v1-scope. Krav kopieres ikke til en ny produktspesifikasjon her.

Brukerbeslutninger er bevart i [.memlog.md](.memlog.md) og [brukeravklaringer](.working/brukeravklaringer.md). Mads har valgt lokale feil/mangler, behovsåpnet detaljsporbarhet, PDF-panel ved behov og eksplisitt bruk/avbryt av korrigeringsutkast. Detaljvalgene A1–A5 er triagert i beslutningsloggen og konkretiserer den valgte retningen uten å endre produktregler. Innlogging, varig vurderingslagring, saks-/porteføljehistorikk og lagring av investeringsbeslutning innføres ikke.

Opphav holdes atskilt gjennom hele flyten: **KI-uttrekk fra rapport**, **brukerforutsetning**, **brukerkorrigert / brukeravvist**, **brukerbekreftet kontroll**, **brukerbekreftet avklaring for førstevurdering** og **kodebasert resultat**. Rapportgrad gjengis; systemet gir ingen ny teknisk klassifisering eller ekstern verifisering.

## Information Architecture

| Flate | Inngang og formål | Ferdigmarkering / retur | Kravspor |
|---|---|---|---|
| 1. Tallgrunnlag | Start / tidligere fullført trinn / Endre tallgrunnlag. Registrere og kontrollere fem finansverdier, kilder, kostnadsinnhold og årsgrunnlag. | Gjeldende tall kontrolleres og bekreftes. Retur uten dataendring bevarer gyldige bekreftelser. | UJ-1 steg 1; FR-1–FR-4, FR-15 |
| 2. Tilstandsrapport | Etter tallkontroll / tidligere trinn. Velge én gjeldende støttet rapport og eksplisitt starte analyse. | Analyse fullført og ferdig funnliste synlig; live og lagret demo skilles. Ny rapport krever ny analyse. | UJ-1 steg 1–2; FR-6–FR-9 |
| 3. Kontroller funn | Ferdig funnliste / tidligere trinn / Gå tilbake til rapportfunn. Funn og original-PDF samtidig; kontrollere, korrigere/avvise, håndtere TG3 og bekrefte listen. | Gjeldende liste bekreftet etter kontroll. Uavklart TG3 kan beholdes; listebekreftelse er ingen TG3-avklaring. | UJ-1 steg 2; FR-5, FR-8–FR-11 |
| 4. Resultat | Etter nødvendig kontroll i hovedreisen. Kodeberegninger og én begrunnet kodeanbefaling med tilgjengelig kontrollgrunnlag. | Endre tallgrunnlag / Gå tilbake til rapportfunn. Historisk resultat markeres utdatert ved berørt endring. | UJ-1 steg 3–4; FR-12–FR-18 |

PRD-ens logiske UJ-1-steg og skjermtrinn er ulike oppdelinger: Mads skiller tall og rapport i UI, og samler beregninger/anbefaling i Resultat. [IA-notatet](.working/ia-og-navigasjon.md) og [firetrinns-wireframen](wireframes/flow-firetrinn-2026-10-13.excalidraw) viser denne koblingen; [SVG](wireframes/flow-firetrinn-2026-10-13.svg) viser oversikten og delt kontrollflate.

Alle fire flater er illustrert i [mockoversikten](mockups/key-oversikt.html): [Tallgrunnlag med lokal mangel](mockups/key-tallgrunnlag.html), [Tilstandsrapport før analyse og ved lasting/feil](mockups/key-tilstandsrapport.html), [Kontroller funn med utkast og smalt PDF-panel](mockups/key-kontroller-funn.html) og [Resultat med detaljspor og historisk variant](mockups/key-resultat.html). Ingen IA-flate er bare beskrevet i tabellene. HTML-kontrollene illustrerer atferden; de er ingen implementert analyse-, bekreftelses- eller fokusmekanisme.

Stepper med nummer, eksakt navn og Gjeldende/Fullført/Gjenstår/Endret — må oppdateres er synlig på alle fire flater, også Resultat, og beholdes synlig når arbeidsinnholdet rulles. Fokusert innhold må ikke dekkes av stepperen. Tidligere fullførte trinn er tilgjengelige for retur. Fremtidige trinn i hovedreisen kan ikke hoppes til uten nødvendig grunnlag, og forklaringen navngir det som gjenstår. Navigasjon alene endrer ingen data eller bekreftelse. Dette gjelder den aktuelle vurderingen, ikke gjenopptak etter lukking.

Mangler og analysefeil vises direkte i aktuelt arbeidstrinn: tall i Tallgrunnlag, dokument/analyse i Tilstandsrapport eller Kontroller funn der problemet oppstår. Mads skal ikke til Resultat for å forstå ufullstendighet. Når kritisk grunnlag mangler eller analysen feiler, vises det kodebaserte utfallet «Innhent mer informasjon» i aktuelt trinn sammen med berørte blokkere og neste handling; normal videregang kan fortsatt være sperret. Hvis Resultat likevel vises med Innhent mer informasjon, samles alle faktiske blokkere med berørt felt/funn og nødvendig handling; lokale feilmeldinger gjentas ikke i fulltekst. Gyldige økonomiske delberegninger kan vises uten at de blir konklusiv screening.

Resultat bruker progressive disclosure. Fra start er én anbefaling, kort begrunnelse, utløste regler, fire nøkkeltall, alvorlige tekniske funn, mangler/uavklarte forhold og neste handling synlige. Fullstendige formler, inputkilder/forutsetninger, detaljerte beregningsgrunnlag, opprinnelig KI-uttrekk, brukerkorrigert versjon og øvrig sporbarhet åpnes ved behov i merkede seksjoner. Alle aktive TG2/TG3 forblir tilgjengelige; dette er et informasjonshierarki, ingen relevansfiltrering.

## Voice and Tone

Norsk, presist og nøkternt. Forklar tilstand, hva den gjelder og hva Mads kan gjøre. Merkevareuttrykk står i DESIGN.md; mikrotekstene nedenfor viser hvordan eksisterende produktregler formidles.

| Situasjon | Mikrotekst og mening |
|---|---|
| Opphav | «KI-uttrekk fra rapport», «Brukerens korrigering», «Beregnet i kode». Ingen «verifisert av KI». |
| Dokumentgrense | «Tekstbasert PDF · maks. 30 sider». Ved feil navngis den faktiske grensen/årsaken som ikke er oppfylt. |
| Null / mangel | «Verdien mangler» og «0 må bekreftes» er ulike tilstander. Ingen oppdiktede tall for å komme videre. |
| TG3 | «Avklart for førstevurdering» med brukerens begrunnelse/grunnlag. Forklar at dette ikke nødvendigvis betyr utbedret eller teknisk godkjent. |
| Tom analyse | «Analyse fullført — ingen TG2/TG3 funnet» bare etter fullført analyse uten slike feil; listen krever fortsatt kontroll/bekreftelse. |
| Analysefeil | «Analysen ble ikke fullført» med kjent årsak og ufullstendig teknisk grunnlag. Ingen vellykket tomliste eller gjettet årsak. |
| Endret resultat | «Utdatert — tallgrunnlaget må bekreftes på nytt» eller tilsvarende for funnlisten; navngi berørt grunnlag. |
| Anbefaling | De tre eksakte utfallene fra PRD, med kodebestemt grunn, utløsere og neste handling. Gå videre betyr grundigere vurdering/befaring, ikke kjøp. |
| Demo / live | «Demo · lagret KI-uttrekk» vs «Live analyse». Ingen påstand om live-ytelse eller live-funn fra lagret demo. |

## Component Patterns

Visuelle regler og tokenverdier står i DESIGN.md.Components. Detaljkomponentene på Resultat åpnes ved behov; beslutningsgrunnlaget på hovednivå er alltid synlig.

| Komponent | Atferd og gyldighet |
|---|---|
| `app-header` | Navngir produkt og aktuell modus. Demo har synlig lagret opphav; lokal live-nøkkel vises ikke. Ingen ny administrasjons- eller innloggingsflate. |
| `stepper` | Vis nummer/navn/status, tilby retur til tidligere trinn og forklar sperrede fremtidige trinn. Uendret gyldig kontroll beholdes ved retur; endring flagger berørte trinn. Feil forstås i aktuelt trinn uten omvei til Resultat. |
| `action-primary` | Utfører den navngitte lokale flythandlingen når dens grunnlag er gyldig. Registrering, KI-fullføring og navigasjon erstatter ikke bekreftelse. Det finnes ingen kjøps-/buds-/investeringsbeslutningshandling. |
| `action-secondary` | Tilbake-/kontrollhandlinger er tastaturtilgjengelige. Endre tallgrunnlag og Gå tilbake til rapportfunn bevarer kontekst i gjeldende vurdering. |
| `value-field` | Registrer P/L/D/J/Ymin manuelt med etikett, enhet og kilde/forutsetning. Blank, ugyldig og ubekreftet 0 behandles etter PRD; null bekreftes eksplisitt. Endring trenger ny kontroll før bruk. |
| `period-control` | År/måned gjøres tydelig for L/D/J sammen med samme årsgrunnlag, faktor og årsverdi. Ukjent/annen periode eller ulike år brukes ikke som gyldig sammenlignbart grunnlag. |
| `source-note` | Gjør kilde/forutsetning kontrollerbar. Konflikt mellom kritiske kildeverdier er synlig, ingen automatisk kildevelging. PDF-side er filposisjon fra 1; trykt sidetall kun tydelig tillegg. |
| `cost-breakdown` | Gjør inkluderte D-poster og eventuell gjeldsbetjening i J forståelige uten dobbelttelling. Ingen automatisk kostnadsestimering, ekstra fratrekk eller låneplan. Felt-/radmekanismen er ikke ytterligere produktkrav. |
| `financial-confirmation` | Tilby kontroll av registrert/årlig verdi, periode, enhet og kilde før eksplisitt bekreftelse. Vis hvilke endrede verdier som trenger ny kontroll. Tallbekreftelse gjelder aktuelt grunnlag. |
| `report-input` | Velg én tekstbasert PDF ≤30 sider. Vis gjeldende dokument og dokumentstatus. Ny rapport ugyldiggjør tidligere rapports uttrekk, bekreftelser og TG3-avklaringer; ingen sammenstilling av rapporter. |
| `analysis-status` | Start analyse er eksplisitt og følger bekreftet gyldig tallgrunnlag i hovedreisen. Ett live-kall per ny rapport, ingen automatisk omkjøringssløyfe. Uendret rapport gjenbruker uttrekk; demo bruker lagret uttrekk. Fullført betyr at ferdig liste er synlig, ikke bare at KI-kallet er avsluttet. |
| `finding-list` | Gjør alle eksplisitte TG2/TG3 tilgjengelige uten KI-relevansfiltrering. Velg funn for detalj/PDF-kontekst. Aktive, usikre og brukeravviste opplysninger skilles; avviste originaler beholdes tilgjengelige. Ingen ny score eller klassifisering. |
| `finding-detail` | Vis grad, kort KI-beskrivelse, dokument/PDF-side, kjent usikkerhet og kontrollstatus. Velg funnet for automatisk korrekt PDF-side; tilgjengelig kilde erstatter ikke brukerens kontroll. |
| `finding-actions` | Bekreft gjelder uttrekk kontrollert mot original, Korriger gjelder KI-feil mot rapport og Avvis gjelder feilaktig KI-uttrekk. Bekreft avklarer ikke TG3. Avvis beholder original og brukeropphav og innebærer ingen teknisk utbedring. |
| `finding-edit` | Rediger grad, beskrivelse og PDF-side som et tydelig utkast mot rapporten. Utkastet påvirker ikke gjeldende liste eller beregning. Bruk korrigering gjør versjonen gjeldende og markerer funn/liste ubekreftet; nødvendig kontroll/listebekreftelse følger PRD. Avbryt fjerner utkastet og beholder forrige gjeldende versjon. Original KI bevares. Funnvalg/trinnretur bevarer et uferdig utkast i aktuell vurdering, uten automatisk bruk. Resultat opplyser om et ubrukt utkast dersom det finnes. Ingen ny KI-analyse. |
| `origin-detail` | Gjør opprinnelig KI-grad/beskrivelse/kilde og gjeldende brukerretting/avvisning tilgjengelige samtidig ved kontroll. Skill Opprinnelig KI-uttrekk, Redigert utkast, Gjeldende korrigert funn og bekreftet kontrollstatus. Opphav overskrives ikke. På Resultat kan dette åpnes ved behov etter FR-18. |
| `pdf-viewer` | Original i appen ved valgt funn. Automatisk PDF-side ved funnvalg, hel side og nabosider leses uten å forlate kontrollflaten. Ingen standard separat fane. Tekstfremheving er ønskelig hvis enkelt, ikke v1-krav ved vesentlig kompleksitet. Ukjent/ugyldig side gir synlig mangel, ikke gjettet navigasjon. På smal flate åpnes panelet fra valgt funn direkte på funnets kilde-side; panelet viser kort funnoppsummering og Tilbake til funnkontroll. Lukking bevarer valgt funn, arbeidskontekst og uferdig utkast. |
| `tg3-resolution` | Separat per alvorlig TG3: Avklart krever eksplisitt status og begge ikke-tomme tekstgrunnlag etter FR-5. Uavklart/ukjent/ugyldig status behandles som uavklart. Tekst er brukeroppgitt og verifiseres ikke eksternt; grad/funn beholdes. Ingen ekstra dokumentopplasting. Ved endring av registrert status, begrunnelse eller grunnlag er tidligere anbefaling umiddelbart historisk; ny brukerregistrering/kontroll følger FR-5, og kode evaluerer gjeldende avklaring. Uavklart/ugyldig Avklart gir Innhent mer informasjon med funnet navngitt. Uendrede tall og uendret liste behøver ikke ny bekreftelse bare av denne grunnen, og rapportuttrekk gjenbrukes. |
| `list-confirmation` | Separat bekreftelse av den gjeldende kontrollerte listen med rettinger/avvisninger. Enkeltfunnets Bekreft og avsluttet KI-kall er ikke automatisk bekreftet liste. Uavklart TG3 kan bestå etter fullført kontroll. Uløst kritisk usikkerhet/dokument-/analysefeil blir ikke fullført analyse gjennom bekreftelseshandlingen. |
| `recommendation` | Når screening gir resultat, vis én kodeanbefaling med alle utløsere på avgjørende prioritet, kodebegrunnelse og anbefalingsbundet neste handling. Ingen KI-generering/omskriving eller skjult undersøkelsesplan. Regelprioritet fra FR-16 beholdes, også ved svake delresultater og uavklart TG3. |
| `metric-grid` | Fire låste kodeberegninger synlig fra start. Vis bare tall med eget gyldig bekreftet input; ellers konkret årsak. Negative resultater beholdes. Delgrunnlag er ingen konklusiv screening. Formler/input/årsgrunnlag åpnes ved behov via basis-detail. |
| `basis-detail` | Tilgang til formler, anvendte verdier/perioder/kilder, aktive funn med PDF-side, originaler/brukerendringer, separat TG3-avklaring og alle kjente mangler på avgjørende nivå. Detaljer er fra samme aktuelle grunnlag som resultatet. |
| `detail-disclosure` | Åpne/lukk merkede seksjoner for fullformler, input-/kildedetaljer og opprinnelig KI-/brukerendring med tastatur. Tilstanden kommuniseres til hjelpemidler; skjult innhold er ikke i fokusrekkefølgen. Anbefaling, kort grunn, utløste regler, fire tall, alvorlige funn, blokkere og neste handling er forståelige uten åpning. Ingen aktive TG2/TG3 fjernes. |
| `issue-message` | Navngi problemets felt/funn/dokument, kjent årsak og nødvendig retting/bekreftelse/avklaring i aktuelt trinn. Ikke gjett ukjent informasjon. Resultat viser alle faktiske blokkere som samlet kort oppsummering, uten full lokal feilmeldingsduplisering; feil forsvinner ikke bak økonomitall eller tomliste. |
| `status-label` | Kommuniser gjeldende kontroll, grad, avklaring, usikkerhet, modus og gyldighet som separate tekstlige opplysninger. Farge og et eventuelt ikon supplerer teksten. |
| `stale-result` | Behold forrige anbefaling/tall historisk og tydelig utdatert etter endret gjeldende tallgrunnlag, brukt funnkorrigering/listeendring, ny rapport eller registrert TG3-status/begrunnelse/grunnlag. Navngi berørt endring og nødvendig kontroll; utkast alene erstatter ikke gjeldende liste. Tidligere konklusjon er aldri aktiv for nye verdier; ny gyldig beregning erstatter utdatert status. Gjelder siste resultat i gjeldende vurdering, ingen varig historikkfunksjon. |

## State Patterns

Alle flater bruker `{colors.focus-ring}` for synlig fokus. Tilstand er tekstlig, uavhengig av farge. Cold-load gjelder bare faktisk lasting; lokale ferdige data får ingen kunstig venting. Bekreftelser og kritiske mangler er del av gyldigheten, ikke pynt på normaltilstanden.

| Flate | Tilstand | Observerbar behandling |
|---|---|---|
| Tallgrunnlag | Tom | Felter er blanke med etiketter/enheter; ingen skjulte finansstandarder eller 0-verdier. Kontroll er ubekreftet. |
| Tallgrunnlag | Lasting / cold-load | Vis faktisk venting dersom arbeidsflaten lastes, uten å fremstille ukjente input som tidligere lagrede verdier. Ingen løfte om gjenoppretting etter omstart. |
| Tallgrunnlag | Feltfeil / ugyldig | Navngi manglende/ugyldig verdi, kildekonflikt, periodeproblem eller ubekreftet null i denne flaten. Bevar registrert input; bare gyldige bekreftede verdier kan brukes. Ingen omvei til Resultat kreves for å forstå feilen. |
| Tallgrunnlag | Fokus | Etikett, enhet og kilde kan nås med tastatur; feltfeil er knyttet til berørt felt. Fokusoverganger følger Interaction Primitives. |
| Tallgrunnlag | Offline | Demoens registrering/kontroll er lokal; fravær av nett/nøkkel blokkerer ikke denne delen eller kodeberegningene. |
| Tallgrunnlag | Ubekreftet / endret | Endrede verdier markeres for ny kontroll. Navigasjon uten endring bevarer gyldighet. Forrige berørte resultat får stale-result. |
| Tilstandsrapport | Tom | Vis at rapport mangler og den støttede dokumentgrensen. Ingen tom funnliste som indikerer teknisk fravær. |
| Tilstandsrapport | Validerer / analyserer | Vis faktisk dokument-/analysestatus og modus. Analyse er ufullført fram til ferdig liste er synlig. Ingen oppdiktet fremdriftsprosent eller live-suksess fra demo. |
| Tilstandsrapport | Dokumentfeil | Manglende/uleselig tekst, ustøttet format, OCR-behov eller >30 sider forklares med kjent årsak. Teknisk grunnlag er ufullstendig; ingen støttet analyse av feil dokument. |
| Tilstandsrapport | Analysefeil / delanalyse | Avbrutt/feilet analyse navngis i aktuell flate. Eventuelle delresultater merkes. Tomt uttrekk er ingen vellykket analyse. Ingen omvei til Resultat kreves; ingen automatisk omkjøring innføres. |
| Tilstandsrapport | Fokus | Filvalg og eksplisitt Start analyse er tastaturtilgjengelige. Sperre forklarer nødvendig tallbekreftelse/dokumentgrunnlag. |
| Tilstandsrapport | Offline / manglende live-konfigurasjon | Lagret, tydelig merket demo fungerer uten nett/nøkkel. Live kan ikke fullføres uten sitt grunnlag; vis kjent årsak uten å vise nøkkelen eller late som analyse er utført. Ingen ny konfigurasjonsreise. |
| Tilstandsrapport | Ny rapport / tidligere grunnlag utdatert | Vis hvilken rapport som nå gjelder og behov for ny analyse. Gammelt uttrekk/bekreftelse/TG3-avklaring er ikke gyldig for den nye rapporten. |
| Kontroller funn | Fullført, ingen TG2/TG3 | Skill vellykket tomliste fra manglende/ufullført uttrekk. Originalrapport og dokumentstatus er tilgjengelige; tom gjeldende liste kontrolleres/bekreftes før tilstrekkelig grunnlag. |
| Kontroller funn | Funn-/PDF-lasting | Vis aktuell visningslasting; ikke endre analytisk fullført-status til ny KI-analyse når originalside lastes. Bevar valgt funn og kilde. Ufullført analyse gir merkede delresultater, ikke komplett liste. |
| Kontroller funn | Usikkert / kildefeil / feltfeil | Kjent årsak ved aktuelt funn/side. Ugyldig side, manglende kilde eller motstrid behandles som mangel. Korrigering/avvisning kan ikke gjøre en dokument-/analysefeil fullført. |
| Kontroller funn | Fokus | Valg og Bekreft/Korriger/Avvis, PDF-sidekontroller, avklaring og listebekreftelse kan nås i forståelig rekkefølge. Automatisk PDF-sideskift beholder fokus på funnet. |
| Kontroller funn | Offline | Demoens lagrede funn og lokal originalrapport kan kontrolleres uten nett/nøkkel. Live-feil fremstilles ikke som komplett liste; allerede tilgjengelig uendret uttrekk trenger ikke ny KI-kjøring. |
| Kontroller funn | Redigeringsutkast | Ubrukt utkast merkes og holdes utenfor gjeldende screeninggrunnlag. Bruk korrigering gjør versjonen gjeldende/ubekreftet; Avbryt bevarer tidligere gjeldende versjon. Uferdig redigering beholdes ved trinn-/funnretur i aktuell vurdering. |
| Kontroller funn | Ubekreftet / korrigert / avvist | Opphav og gjeldende kontrollstatus synlig. Endret liste trenger ny listebekreftelse. Avvist original er tilgjengelig, men ikke aktivt rapportfunn. |
| Kontroller funn | TG3 Uavklart / ugyldig Avklart | Bruker kan beholde Uavklart og fullføre menneskelig kontroll. Avklart med tom nødvendig tekst får feltfeil og behandles som uavklart. Ingen obligatorisk teknisk godkjenning. |
| Kontroller funn | TG3-avklaring endret etter Resultat | Navngi endret status/begrunnelse/grunnlag og vis forrige anbefaling historisk. Gjeldende registrering etter FR-5 reevalueres i kode; uavklart/ugyldig grunnlag gir Innhent mer informasjon. Bevar uendrede tall, listebekreftelse og uttrekk; ingen ny KI-analyse. |
| Kontroller funn | Rapport byttet / stale | Tidligere rapportkontroll og avklaringer er ikke gjeldende for ny rapport. Vis nødvendig ny analyse/kontroll; forrige resultat er historisk. |
| Resultat | Ikke beregnet / tom | Ingen gjeldende anbefaling eller tall før resultat finnes; forklar nødvendig kontroll. Mangler/feil forstås også direkte i berørt arbeidstrinn. Blank vises ikke som 0. |
| Resultat | Beregner / faktisk cold-load | Kodeberegning/regelevaluering vises som egen status hvis den faktisk venter; ingen ny KI-analyse for uendret rapport. Tidligere resultat kan ikke være gyldig for endret grunnlag. |
| Resultat | Utilstrekkelig / ikke beregnbart | Når resultatet vises, Innhent mer informasjon med samlet oppsummering av alle faktiske avgjørende blokkere og gyldige tall som delgrunnlag. Berørte ikke-beregnbare tall viser konkret årsak; ingen full duplisering av lokale feilmeldinger. |
| Resultat | Dokument-/analysefeil | Feilen beholdes separat fra anbefalingen og tallene. Ingen økonomisk forkastelse/gå-videre på falskt komplett teknisk grunnlag. |
| Resultat | Fokus | Tilbakehandlinger og behovsåpnete kilde-/beregningsdetaljer kan nås med tastatur. Åpen/lukket tilstand for seksjoner oppfattes også av hjelpemidler. |
| Resultat | Offline | Kodeberegning og regelresultat fra tilgjengelig grunnlag fungerer lokalt i demo. Lagret uttrekk merkes fortsatt. Manglende live-analyse gir ingen påstått live-suksess. |
| Resultat | Utdatert / Må bekreftes på nytt | Tidligere anbefaling og tall er dempet historisk; navngi endret grunnlag og nødvendig ny tall-/listebekreftelse. Ingen aktiv handling fra gammel konklusjon. |
| Resultat | Gjeldende etter ny bekreftelse | Ny kodeberegning/anbefaling bruker samme aktuelle grunnlag som tall/funn. Utdatert status erstattes. Endret Ymin endrer regelvurderingen, ikke de fire nøkkeltallene. |

Ingen innloggings-/rolletillatelse er en v1-tilstand. Hvis et dokument ikke kan leses på grunn av faktisk tilgangsfeil, vis kjent dokument-/visningsfeil i relevant flate; ingen ny tillatelsesadministrasjon eller hemmelighetsvisning innføres.

## Interaction Primitives

- **Sekvens og retur:** eksplisitte bekreftelser og Start analyse. Tidligere trinn kan åpnes uten å starte hele vurderingen på nytt. Endrede data, ikke navigasjonen selv, utløser behov for ny kontroll.
- **Funnvalg:** velg et funn og vis originalens korrekte PDF-side automatisk. Mads kan lese hel side og nabosider i samme kontrollflate. Bekreft av uttrekk, TG3-avklaring og listebekreftelse forblir tre ulike handlinger/begreper.
- **Tastatur:** Tab følger forståelig lese-/arbeidsrekkefølge; standard knapper og felt aktiveres med forventede tastaturhandlinger. Ingen skjulte hoverhandlinger eller nye spesialhurtigtaster er valgt.
- **Valideringstidspunkt:** vis identifiserte feltfeil ved eksplisitt bekreftelses-/analyseforsøk og behold feil ved berørt felt til grunnlaget rettes; ikke avbryt løpende inntasting med modaler. Bekreftelse skjer først når grunnlaget er gyldig; ugyldig forsøk viser hvilke felt som må rettes.
- **Fokusforløp:** flytt fokus til trinnets overskrift ved navigasjon og på første berørte felt etter ugyldig bekreftelsesforsøk. Ved funnvalg forblir fokus på funnet mens korrekt PDF-side vises; automatisk sideskift stjeler ikke tastaturkontrollen. Leserekkefølge og kunngjøring inngår i den planlagte tilgjengelighetskontrollen.
- **Statusbeskjeder uten fokusflytting:** analyse fullført/feilet, PDF-side tilgjengelig/feilet og resultatets gyldighetsskifte formidles kort og tekstlig til hjelpemidler. PDF-beskjeden navngir dokument og forespurt/aktuell filside; analysefullføring sier at funnlisten er klar, også ved gyldig tomliste. Kunngjør viktige overganger én gang, uten opplesning av hele rapporten/listen eller gjentatte avbrudd.
- **Oppdatering:** endret finansgrunnlag krever kontroll/bekreftelse før ny beregning; endret funnliste krever ny listebekreftelse. Begge gjenbruker uendret rapportuttrekk uten KI-kall. Ny rapport krever ny analyse og rapportkontroll. Endret registrert TG3-status, begrunnelse eller grunnlag gjør også tidligere anbefaling historisk; ny registrering etter FR-5 reevaluerer anbefalingen uten å kreve ny bekreftelse av uendrede tall/liste.
- **Gjeldende resultat:** én kodeanbefaling og alle avgjørende utløsere fra PRD. Brukeren tar neste investeringshandling utenfor appen. Dette dokumentet velger ingen generert undersøkelsesplan, eksport, samarbeid eller ekstern kommunikasjon.

## Accessibility Floor

PRD NFR-2 og kursføringer gir grunnleggende tilgjengelighet; dette er en designkontrakt og planlagt kontroll, ikke testbevis for en implementert app. Visuell kontrast og lesbare historiske tilstander står i DESIGN.md.

- Synlige etiketter, enheter og perioder; kilde-/kostnadsinnhold og feltfeil er tilknyttet det aktuelle feltet. Null, manglende verdi og ubekreftet verdi kommuniseres med tekst.
- Hele kjerneflyten kan utføres med tastatur og synlig fokus. Innebygd PDF har tilgjengelige kontroller for hel side/nabosider; funnkilde kan leses uten å stole på tekstfremheving.
- Stepperens gjeldende/sperrede/endret-status, valgt funn, opphav, anbefaling og feil må kunne oppfattes uten fargesyn. Semantiske kontrollnavn og tilstander, inklusive åpen/lukket detaljseksjon, kan leses av hjelpemidler.
- Eventuelle meningsbærende ikoner eller grafikk har tekstalternativ. Dekorative elementer tilfører ingen redundant opplesning; statusenes synlige tekst bærer allerede meningen.
- Laste-/feilstatus er forståelig uten animasjon. Forstørrelse skal ikke skjule tall, kilder eller kontrollhandlinger. Smal PDF-visning følger Responsive & Platform; åpning flytter fokus til paneloverskriften og lukking/Esc tilbake til åpneren. Valgt funn og arbeidskontekst beholdes.
- Senere manuell kontroll dekker tastaturflyt, feltetiketter, fokus, kontrast, feil/tomtilstander, usikre funn, PDF-kontroll og forståelse av de tre anbefalingene. [Tilgjengelighetsgrunnlaget](.working/tilgjengelighetsgrunnlag.md) forklarer den praktiske konkretiseringen uten sertifiseringspåstand.

## Responsive & Platform

Desktop er hovedformfaktor. Vanlig desktop beholder funn og PDF side om side; når plassen ikke gir lesbar samtidig visning, er funnkontrollen hovedflaten og PDF åpnes i et eget panel ved behov. Stablet funn/PDF er ikke standard fallback.

| Visning | Atferd |
|---|---|
| Fra 1200 CSS px | Delt arbeidsflate, om lag 44/56 for funn/PDF og 24 px mellomrom. Representative referanser: 1440×900 og 1280×800. |
| Under 1200 CSS px / tilsvarende zoom | Valgt funn beholder TG, kort beskrivelse, PDF-side, status og eventuell usikkerhet. Åpne PDF fra funnet viser korrekt kilde-side i panelet, med denne korte konteksten og Tilbake til funnkontroll. |
| Sterk forstørrelse / svært smal flate | Stepper ombrytes ved behov i samme leserekkefølge med alle fire nummer/navn/status. Tekst og kontroller ombrytes; nødvendig todimensjonal PDF-lesing håndteres i panelet. Ingen innholdstap eller ny mobilreise. |

Panelet har tydelig tilbake-/lukkehandling, tastaturbetjening og Esc. Mens panelet er åpent ligger tastaturfokus i panelets kontroller; åpning fokuserer overskriften, og lukking gjenoppretter åpneren, valgt funn, posisjon og arbeidskontekst. Uferdig korrigeringsutkast beholdes i aktuell vurdering. Automatisk åpning/navngivning er ikke ny rapportanalyse. Grensen og panelandelen er fasilitatorens operasjonalisering av Mads' valgte mekanisme og prøves i nøkkelmocks.

## Inspiration & Anti-patterns

Fra Linear og Stripe Dashboard hentes Mads' ønskede prinsipper: tydelig struktur, luft, presis typografi, lav støy og nyttig tetthet. Referansene bestemmer ingen komponentbibliotek, stack, konkrete tastatursnarveier eller ekstra produktsurface. [Valgt fargeprøve 2](.working/color-themes-1.html) viser valgt grafitt/petrol-retning og et konstruert PRD F4-resultat; den er ingen faktisk appanalyse.

Avvist uttrykk: chatbot, KI som hovedperson, glød/magi, neon, gradienter, store illustrasjoner, overflødige kort, mørkt dashboard og krypto-/trading-/gamingpreg. Langsiktig produktutvikling skal kunne tåles av det rolige uttrykket uten å vise fremtidige funksjoner i v1. Ingen fri dashboard-navigasjon, investeringsscore eller «Kjøp»-handling introduseres.

## Key Flows

### 1. UJ-1: Mads førstevurderer ett boligutleieobjekt

Kildenavnet er ordrett fra PRD. Skjermtrinnene følger Mads' senere UX-valg. Kravspor: FR-1–FR-18, støttet av NFR-1–NFR-5 og S1–S6; dette er samme ene brukerreise, ikke nye produktfunksjoner.

1. Mads har et konkret allerede funnet objekt, tallgrunnlag og tilstandsrapport. I Tallgrunnlag registrerer han verdier, perioder, kilder/forutsetninger og kontrollerbart kostnadsinnhold. Han kontrollerer/bekrefter aktuelle verdier; blank og eksplisitt null behandles forskjellig.
2. I Tilstandsrapport velger han den støttede rapporten og trykker Start analyse. Han ser om uttrekket er live eller lagret demo og om analysen er ufullført. Ferdig funnliste over alle eksplisitte TG2/TG3 må være synlig før kontrollen starter.
3. I Kontroller funn velger han et TG2/TG3-funn. Original-PDF viser korrekt PDF-side ved siden av. Han leser hel side/nabosider, bekrefter uttrekk, korrigerer/avviser KI-feil ved behov og ser original og brukerendring. Alvorlig TG3 får separat brukerstatus/begrunnelse/grunnlag. Han bekrefter til slutt gjeldende liste.
4. **Klimaks:** Resultat gir Mads én kodebasert anbefaling med kort grunn og neste handling. Han kan etterprøve tall, rapportfunn, kilde og avgjørende regler og forstå om objektet skal forkastes, krever informasjon eller fortjener grundigere vurdering. Appen tar ingen investeringsbeslutning.

Feilforløp: utilstrekkelige tall, dokument-/analysefeil, ubekreftet liste, kildekonflikt eller uløst kritisk usikkerhet synliggjøres konkret i berørt trinn og kan ikke gi konklusiv økonomisk screening. Hvis Resultat vises, samler det de faktiske blokkeringene uten full feilmeldingsduplisering. En gyldig tomliste uten TG2/TG3 krever fortsatt fullført analyse og kontroll/bekreftelse; feilet analyse er en annen tilstand. Uavklart alvorlig TG3 kan beholdes etter fullført kontroll og gir Innhent mer informasjon.

### 2. Mads retter et funn og skiller uttrekkskontroll fra TG3-avklaring

Kravspor: FR-5, FR-8–FR-11, FR-16–FR-18; S2/S3/S4.

1. Mads velger et usikkert KI-funn og ser riktig rapportside, grad, beskrivelse og opphav.
2. Dersom rapporten sier TG2 på en annen side enn KI-uttrekket, redigerer han et utkast til grad/beskrivelse/side mot originalen og velger Bruk korrigering. Avbryt beholder tidligere gjeldende versjon. Dersom funnet ikke finnes i rapporten, avviser han det feilaktige KI-uttrekket. Original KI-informasjon og hans endring forblir tilgjengelige.
3. Et faktisk alvorlig TG3-funn får sin egen Avklart/Uavklart-status. Gyldig Avklart krever brukerens begrunnelse og konkret grunnlag; bare kjennskap til funnet er ingen gyldig avklaring. Han bekrefter gjeldende liste etter kontrollen.
4. **Klimaks:** Mads kan se hva rapporten sa, hva KI feilet på, hva han rettet og hva han eventuelt avklarte. Ny screening bruker den nye bekreftede listen uten nytt KI-kall; TG3-grad/funn er beholdt når avklaringen gjelder et reelt funn.

Feilforløp: kilde/side uten kontrollerbar støtte eller tom nødvendig Avklart-tekst gir konkret feil og utilstrekkelig grunnlag. Listebekreftelse opphever ikke dokument-/analysefeil eller uavklart TG3.

### 3. Mads endrer grunnlag etter Resultat

Kravspor: FR-5, FR-6, FR-11, FR-15–FR-18; NFR-1; S1/S3/S4.

1. Fra Resultat velger Mads Endre tallgrunnlag eller Gå tilbake til rapportfunn; gjeldende input og fortsatt gyldige bekreftelser beholdes.
2. Når han faktisk endrer finansverdier, bruker en korrigering/endrer bekreftet funnliste eller endrer registrert TG3-status/begrunnelse/grunnlag, markeres berørt trinn Endret — må oppdateres. Forrige anbefaling/tall blir historisk Utdatert med nødvendig ny kontroll/bekreftelse forklart.
3. Han bekrefter det endrede tallgrunnlaget eller gjeldende funnlisten. Endret separat TG3-avklaring registreres/kontrolleres etter FR-5; uendrede tall og liste beholder bekreftelsen. Uendret rapport gjenbrukes. Endret Ymin påvirker anbefalingen, ikke nøkkeltallene. Velger han en ny rapport, kreves ny analyse og ny rapportkontroll.
4. **Klimaks:** Ny kodeberegning og anbefaling gjelder det han nettopp har bekreftet. Utdatert status erstattes, og Mads kan se at tall, funn og begrunnelse hører sammen.

Feilforløp: ved manglende ny bekreftelse er tidligere resultat fortsatt historisk, aldri aktivt. Blanke nødvendige TG3-avklaringsfelt eller ny rapport med analysefeil forklares i aktuelt trinn og gir utilstrekkelig grunnlag etter PRD. Ingen varig historikk eller automatisk ny KI-analyse av økonomiendringer innføres.

### 4. Mads møter en rapportfeil eller bruker lagret demo

Kravspor: FR-3/FR-6/FR-9/FR-13/FR-16–FR-18, NFR-3/NFR-4; S3/S6. S5-målingene arves fra PRD/addendum, ingen timerfunksjon innføres.

1. Mads har kontrollert tallgrunnlaget og går til Tilstandsrapport. I demo ser han lagret opphav; lokal rapport og uttrekk er tilgjengelige uten nett/nøkkel.
2. Et ustøttet/uleselig dokument eller et feilet live-kall gir synlig dokument-/analysefeil. Eventuelle funn er bare delresultater. Appen viser kjent årsak, ufullstendig grunnlag og det kodebaserte utfallet Innhent mer informasjon direkte i problemtrinnet.
3. Mads forstår mangelen direkte i problemtrinnet, uten nødvendig omvei til Resultat. Hvis et Resultat med delgrunnlag vises, ser han samlet de faktiske blokkeringene og bare gyldige økonomiske delberegninger; hovedgrunnlaget forstås uten å åpne detaljene.
4. **Klimaks:** Mads vet at grunnlaget krever informasjon, framfor å feiltolke tomt uttrekk som fravær av TG2/TG3. Den lokale, merkede demoflyten kan fortsatt gjennomføres og viser samme kode-/anbefalingsregler uten live-avhengighet.

Feilforløp: ingen nøkkel/nett gjør ikke live-kallet vellykket, og korrigering/avvisning/listebekreftelse gjør ikke feil til fullført analyse. Tomliste ved faktisk vellykket analyse får sitt separate kontrollforløp i flow 1.
