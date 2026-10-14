---
name: Property Acquisition Agent
description: Opplevelse og atferd for den låste desktop-webflyten i v1.
status: final
updated: 2026-10-14
paired_with: DESIGN.md
sources:
  - ../../prds/prd-IBE160-2026-10-10/prd.md
  - ../../prds/prd-IBE160-2026-10-10/addendum.md
  - ../../prds/prd-IBE160-2026-10-10/sluttkontroll.md
  - ../../briefs/brief-IBE160-2026-09-15/brief.md
  - ../../briefs/brief-IBE160-2026-09-15/addendum.md
  - ../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md
  - ../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md
  - ../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf
---

# Property Acquisition Agent — Experience

## Foundation

Desktop-web for én aktuell førstevurdering om gangen. [DESIGN.md](DESIGN.md) er referansen for visuell identitet; dette dokumentet eier atferd, kontroll, gyldighet og tilstander. UI-system og teknologistakk er ikke valgt. Kilder arves gjennom `sources`; den ferdigstilte PRD-en beholder finansregler, anbefalingsprioritet og v1-scope. Krav kopieres ikke til en ny produktspesifikasjon her.

Brukerbeslutninger er bevart i [.memlog.md](.memlog.md) og [brukeravklaringer](.working/brukeravklaringer.md). Mads har valgt lokale feil/mangler, behovsåpnet detaljsporbarhet, PDF-panel ved behov og eksplisitt bruk/avbryt av korrigeringsutkast. Detaljvalgene A1–A5 er triagert i beslutningsloggen og konkretiserer den valgte retningen uten å endre produktregler. Innlogging, varig vurderingslagring, saks-/porteføljehistorikk og lagring av investeringsbeslutning innføres ikke.

Opphav holdes atskilt gjennom hele flyten: **KI-uttrekk fra rapport**, **brukerforutsetning**, **brukerkorrigert / brukeravvist**, **brukerbekreftet kontroll**, **brukerbekreftet avklaring for førstevurdering** og **kodebasert resultat**. Rapportgrad gjengis; systemet gir ingen ny teknisk klassifisering eller ekstern verifisering.

## Information Architecture

| Flate | Inngang og formål | Ferdigmarkering / retur | Kravspor |
|---|---|---|---|
| 1. Tallgrunnlag | Start / tidligere fullført trinn / Endre tallgrunnlag. Registrere og kontrollere fem finansverdier, kilder, kostnadsinnhold og årsgrunnlag. | Gjeldende tall kontrolleres og bekreftes. Retur uten dataendring bevarer gyldige bekreftelser. | UJ-1 steg 1; FR-1–FR-4, FR-15 |
| 2. Tilstandsrapport | Etter tallkontroll / tidligere trinn. Velge én gjeldende støttet rapport og eksplisitt starte analyse. | Analyse fullført og ferdig funnliste synlig; live og lagret demo skilles. Ny rapport krever ny analyse. | UJ-1 steg 1–2; FR-6–FR-9 |
| 3. Kontroller funn | Ferdig funnliste / tidligere trinn / Gå tilbake til rapportfunn. Funn og original-PDF samtidig; kontrollere, korrigere/avvise, håndtere TG3 og bekrefte listen. | Gjeldende liste bekreftet etter kontroll. Uavklart TG3 kan beholdes; listebekreftelse er ingen TG3-avklaring. | UJ-1 steg 2; FR-5, FR-8–FR-11 |
| 4. Resultat | Etter nødvendig kontroll i hovedreisen. Kodeberegninger og én begrunnet kodeanbefaling med tilgjengelig kontrollgrunnlag. | Endre tallgrunnlag / Gå tilbake til rapportfunn. Historisk resultat markeres utdatert ved berørt endring. | UJ-1 steg 3–4; FR-12–FR-18 |

Skjermtrinnene deler UJ-1-registreringen i tall og rapport, og samler beregninger/anbefaling i Resultat. [IA-notatet](.working/ia-og-navigasjon.md), [firetrinns-wireframen](wireframes/flow-firetrinn-2026-10-13.excalidraw) og [SVG](wireframes/flow-firetrinn-2026-10-13.svg) viser koblingen og den delte kontrollflaten.

Alle fire flater er illustrert i [mockoversikten](mockups/key-oversikt.html): [Tallgrunnlag med lokal mangel](mockups/key-tallgrunnlag.html), [Tilstandsrapport før analyse og ved lasting/feil](mockups/key-tilstandsrapport.html), [Kontroller funn med utkast og smalt PDF-panel](mockups/key-kontroller-funn.html) og [Resultat med detaljspor og historisk variant](mockups/key-resultat.html). HTML-kontrollene illustrerer atferden; de er ingen implementert analyse-, bekreftelses- eller fokusmekanisme.

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
| Tallgrunnlag | Lasting / cold-load | Vis faktisk venting dersom arbeidsflaten lastes, uten å fremstille ukjente input som tidligere lagrede verdier. Ikke noe løfte om gjenoppretting etter omstart. |
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
- **Funnvalg:** velg et funn og vis originalens korrekte PDF-side automatisk. Mads kan lese hel side og nabosider i samme kontrollflate. Bekreftelse av uttrekk, TG3-avklaring og listebekreftelse forblir tre ulike handlinger/begreper.
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

Panelet har tydelig tilbake-/lukkehandling, tastaturbetjening og Esc. Mens panelet er åpent ligger tastaturfokus i panelets kontroller; åpning fokuserer overskriften, og lukking flytter fokus tilbake til åpneren og gjenoppretter valgt funn, posisjon og arbeidskontekst. Uferdig korrigeringsutkast beholdes i aktuell vurdering. Automatisk åpning/navngivning er ikke ny rapportanalyse. Grensen og panelandelen er fasilitatorens operasjonalisering av Mads' valgte mekanisme og prøves i nøkkelmocks.

## Inspiration & Anti-patterns

Fra Linear og Stripe Dashboard hentes Mads' ønskede prinsipper: tydelig struktur, luft, presis typografi, lav støy og nyttig tetthet. Referansene bestemmer ikke komponentbibliotek, teknologistakk, konkrete tastatursnarveier eller ekstra produktflater. [Valgt fargeprøve 2](.working/color-themes-1.html) viser valgt grafitt/petrol-retning og et konstruert PRD F4-resultat; den er ingen faktisk appanalyse.

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
2. Når han faktisk endrer finansverdier, bruker en korrigering/endrer bekreftet funnliste eller endrer registrert TG3-status/begrunnelse/grunnlag, markeres berørt trinn Endret — må oppdateres. Forrige anbefaling/tall vises som historiske og merkes Utdatert, med nødvendig ny kontroll/bekreftelse forklart.
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
