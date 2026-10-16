---
title: "Fordypning av epic-forslaget: Problem Decomposition og Assumption Audit"
created: 2026-10-15
status: applied-with-user-clarification
target: .docs/planning-artifacts/epics.md
target_sha256_before_apply: feb6d71e67c33e6bd7057d54ae63107028b3b4e3880b637ee7ba51adb5fed9dd
methods: [32, 64]
source_changes: none
target_changes: applied-with-user-clarification
---

# Fordypning av epic-forslaget

Mads valgte metode 1 og 3 i menyen: **Problem Decomposition** (katalog 32), deretter **Assumption Audit** (64). Målet er [fem-epic-planen](../../planning-artifacts/epics.md), ikke det låste produktgrunnlaget. Analysen nedenfor bevarer det opprinnelige endringsforslaget. Mads har senere godkjent innarbeiding med presiseringen «Live KI-analyse og evaluering»; endringene er nå anvendt i epics.md. Eventuell eldre omtale av «valgfri live» nedenfor er historisk forslagstekst og er erstattet i gjeldende plan. Dette er ikke ferdige stories eller implementation readiness-kontrollen.

## Kilder og faste grenser

- [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md), særlig FR-1–FR-4, FR-9, FR-12–FR-18, NFR-1–NFR-5 og S1–S6; [testfasit og S5-protokoll](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md).
- [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), Information Architecture, Component Patterns og Key Flows: lokale mangler med kodeutfall; fire trinn; Resultat etter nødvendig kontroll; eksplisitt utkast/Bruk/Avbryt; separat TG3.
- [ARCHITECTURE-SPINE](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), AD-1/AD-2/AD-7/AD-8/AD-10 og Deferred: én domain-/contracts-autoritet, finans/presentasjon atskilt, én screening og logikknære testgrenser.
- [SPEC-grensekontrakter](../../specs/spec-IBE160/grensekontrakter.md), Finans og screening, Endring og gyldighet og Dokument- og analysegrense; [verifikasjon og videreførte avklaringer](../../specs/spec-IBE160/verifikasjon-og-avklaringer.md).
- Faglærer-/kursføringer er allerede tatt inn i det bekreftede kravuttaket. Vurderingen her gjelder gjennomføring av den smale, låste kjernen og oppretter ingen ekstra kurskrav.

Alle finansformler, prioriteringer, terskler, UX-handlinger, modulgrenser, kontraktbetydninger og akseptansemål beholdes. En endret plassering i implementeringsrekkefølgen er ikke et forslag til å endre disse beslutningene.

## Metode 32: Problem Decomposition

### Helhet → deler

Den nåværende planen har en god hovedretning: lokal registrering → rapportkontroll i demo → samlet resultat → live → mottakerens verifikasjon. Demoen er uavhengig av leverandør/budsjett. To svakheter fremkommer når epicene deles i leveranser som faktisk kan kontrolleres:

1. **Epic 1 inneholder mer enn brukerutfallet trenger.** Den legger både oppstart, registrering, kilder, kostnadsinnhold, årsnormalisering, bekreftelse, finans, terskler, formatering og full screening før rapportarbeidet. Finans-/screeningdelen går på tvers av mye som først blir synlig i Epic 3. Begrunnelsen er at lokale feil trenger samme regelautoritet; dette begrunner tidlig felles mangellogikk, men ikke i seg selv tidlig ferdigstillelse av alle økonomiske regler.
2. **Epic 2 samler flere store risikoområder under én ferdigmarkering.** Faktiske PDF-bytes/lesbarhet, kontrakt/hash/versjon, demo/HTTP/gamle svar, originalvisning og menneskelig kontroll kan testes ved ulike grenser. En felles epic er forsvarlig fordi flyten henger sammen, men den er ikke dermed én liten implementeringsenhet. Planen trenger en synlig mellomleveranse før all kontrollredigering/TG3 er ferdig.

Tabellen viser foreslåtte arbeidsgrenser og demonstrasjoner. Radene er oppdelingsgrunnlag, ikke ferdige stories; de fastsetter ingen nye story-ID-er, skjemaer eller produktakseptansekriterier.

| Epic | Avgrensbare deler i nødvendig rekkefølge | Demonstrerbar verdi uten senere epic |
|---|---|---|
| 1 | Starter/importstruktur; faktisk lokal build/start/appskall; manuelle verdier/kilde/kostnadsinnhold; ren validering/årsnormalisering; gjeldende finansbekreftelse; felles kodebasert vurdering av kritiske mangler og lokale meldinger. | Registrere, rette og bekrefte tallgrunnlag med forståelige lokale mangler i kjørbar app. Mappestruktur alene er ikke kjørbarhet. |
| 2 | Felles dokument-/analysekontrakt før bruk; faktiske PDF-fixtures/fasit; format/sidevalidering atskilt fra tekst-/lesbarhetskontroll; rapportbundet demo/HTTP/vern; funnliste/original-PDF; kontroll/utkast/Bruk/Avbryt/avvisning; separat TG3 og listebekreftelse. | Først støttet rapport, merket uttrekk og korrekt originalside; deretter kontrollerbar gjeldende funnliste med bevart opphav og separat avklaring. Ingen økonomisk konklusjon før full Resultat-flyt. |
| 3 | Fire rene finansberegninger/gyldighet per nøkkeltall; eksakte terskler; separat presentasjon; komplett screening med prioritet 1–3/faste begrunnelser; resultatets sporbarhet; endringer og revisjonsbundet historisk/gjeldende snapshot. | Fullført demo-UJ-1 med alle tre korrekte anbefalinger og ny kontroll/resultat etter relevante endringer. |
| 4 | Eksisterende leverandør-/modell-/budsjettavklaring; konkret live-adapter/prompt; kontrollerte adaptertester; separat opprinnelig live-evaluering og tid. | Ekte nytt uttrekk i samme kontroll-/resultatflyt, med dokumentert S2/S5-status. |
| 5 | Samlet regresjon/UX-bevis; faktisk README/oppskrift; annen persons rene offline-demokjøring; sammenstilling av S1–S6/prosessspor. | Mottakeren kan kjøre og etterprøve leveransen. Tidligere testers arbeid er allerede levert med funksjonene. |

### Deler → løsning → sammenstilling

**Foreslått endring:** Flytt de fire finansberegningene, nøkkeltallsvisningen, eksakte økonomiske terskler og ferdigstillelsen av prioritet 2/3 fra Epic 1 til Epic 3. Behold registreringsformat/desimalstrenger, inputvalidering, årsnormalisering og finansbekreftelse i Epic 1. Norsk visning av registrert verdi/årsgrunnlag er fortsatt del av Tallgrunnlag; bare nøkkeltallenes resultatpresentasjon følger finansarbeidet i Epic 3.

Lokalt kodeutfall må fortsatt leveres tidlig. Epic 1 etablerer felles domain-vurdering av kritiske mangler med deterministisk begrunnelse/neste handling. Epic 2 kobler dokument-/analyse-/funn-/TG3-tilstandene til samme vurdering. Epic 3 bruker dette samme grunnlaget i den komplette screeningen før økonomiske terskler vurderes. Ingen UI/Express-/adapterkopi av regelen, hardkodet demoanbefaling eller konkurrerende kontrakt innføres. Dette er én regelautoritet bygget i trinn, uten endring av anbefalingslogikken.

Et viktig kontrollpunkt i storyfasen er at fravær av en finansfeil aldri tolkes som at hele grunnlaget er tilstrekkelig. Eksempel: F2-tall uten gyldig rapportgrunnlag skal fortsatt gi Innhent mer informasjon, ikke Forkast. Etter fullført og bekreftet teknisk grunnlag skal F2 gi Forkast. Formler og utfall er uendret; bare tidspunktet for implementering av økonomidelen flyttes. Ingen ny vei til Resultat eller omgåelse av kontrollsteg foreslås.

**Epic 2 foreslås beholdt som én epic med to demonstrerbare milepæler:**

- **Rapport og kilde tilgjengelig:** ekte støttet PDF gjennom felles dokumentpipeline/demo-kontrakt, alle lagrede funn/usikkerheter synlige og originalen på riktig PDF-side. Dokument-/analysefeil er egne tilstander; dette er ikke brukerbekreftet rapportgrunnlag eller et komplett screeningresultat.
- **Rapportgrunnlag kontrollert:** original, brukt retting/avvisning og bekreftelse kan skilles; alvorlig TG3 har separat brukerstatus/grunnlag; gjeldende liste er kontrollert/bekreftet. Uavklart TG3 kan beholdes og er fortsatt en kritisk mangel.

Disse milepælene er kontrollpunkter innen eksisterende flyt, ikke nye skjermer eller krav om ekstra brukerhandlinger. De er heller ikke to store stories: formatvalidering, tekstuttrekk, adapter, HTTP, PDF-visning og kontrolloverganger må fortsatt få egne avgrensede stories der det trengs.

## Metode 64: Assumption Audit

Denne passeringen vurderer både den opprinnelige planen og det hypotetisk forbedrede forslaget fra metode 32. «Holdbarhet» er en kvalitativ vurdering av evidensen for planantakelsen, ikke en målt sannsynlighet. Låste produktbeslutninger granskes ikke som om de var åpne antakelser.

| Planantakelse | Holdbarhet / konsekvens ved feil | Kontroll mot grunnlaget og anbefalt behandling |
|---|---|---|
| Lokale kodebaserte mangler krever at hele finans-/screeningmotoren er ferdig i Epic 1. | Lav / høy. | Lokale mangler følger prioritet 1 og trenger ikke L/P eller økonomiske terskler for å være korrekte. Tidlig felles mangellogikk beholdes; økonomidelen flyttes etter forslaget til Epic 3. AD-1/AD-8 beholdes. |
| Fem epics innebærer et lite og gjennomførbart antall stories. | Lav / høy. | Epic-antall sier lite om antall avgrensbare oppgaver. Epic 2 er særlig omfattende. Behold fem som gruppering, men konkluder først om story-størrelse/avhengigheter etter faktisk oppdeling. Ingen time-/semesterkapasitet er dokumentert her; ingen leveringsgaranti utledes. |
| Hver nåværende epic er bevist fri for senere avhengigheter. | Delvis / høy. | Brukerutfallene kan ordnes fremover; konkrete stories finnes ennå ikke. Formuler dette som designmål, og kontroller den faktiske storygrafen i readiness. En grunnstrukturstory kan være en nødvendig muliggjører; det er hele epicens sluttutfall som skal være nyttig. |
| Ferdige og låste dokumenter betyr at schemas, PDF-lesbarhet og ressursgrenser allerede er avklart. | Lav / høy. | Kildene sier uttrykkelig at detaljene er Deferred. Dette er en videreført avhengighet, ikke en ny kildekonflikt. Contracts detaljeres før første forbruker; lesbarhet før uttrekk regnes gyldig; upload/timeout/opprydding før HTTP-/live-integrasjon. Ingen grenser bestemmes her. |
| Planlagt F1–F4-fasit og lagrede uttrekk betyr at faktiske fixturefiler finnes. | Lav / høy. | Kildene omtaler planlagt dataarbeid, ikke leverte filer. Strukturerte finansfasiter kan brukes i Epic 1/3; PDF-er, dokumentfasit og hash-/versjonsbundne uttrekk må leveres i Epic 2 før bruk. Dette arbeidet må telle med i storyomfanget. |
| Mer korrekt sidemerket tekst eller gyldig JSON beviser riktig uttrekk av alle TG2/TG3. | Lav / høy. | AD-3/AD-4/AD-10 og S2 skiller struktur/lesbarhet fra semantisk treffkvalitet. Behold PDF-/kontrakttester ved Epic 2 og egen original live-evaluering i Epic 4. Ingen demofasit kan attestere live-treff. |
| Flytting av økonomidelen betyr at lokale mangler kan vente til Epic 3. | Lav / høy. | Dette ville bryte final UX og er uttrykkelig utelukket i det forbedrede forslaget. Tidlig delt domain-vurdering og lokale kodebaserte utfall er nødvendig leveranse i Epic 1/2; økonomiflyttingen kan bare godtas med denne bindingen. |
| Valgfri live-bruk gjør live-arbeid/S2/live-S5 valgfritt i planens v1-aksept. | Lav / høy. | Demo trenger ikke live-konfigurasjon. Det gir ikke tillatelse til å utelate den planlagte live-adapteren eller erklære S2/live-tid bestått fra demo. Behold Epic 4 og dens avklaringspunkt; merk manglende bevis som ikke verifisert. |
| En siste verifikasjonsepic gjør det trygt å vente med testing, feil og tilgjengelighet. | Lav / høy. | Den opprinnelige planen sier allerede at dette ikke skal skje. Behold dette: meningsfulle tester og relevante manuelle kontroller følger leveransen av hver logikk/UI-del. Epic 5 samler/regresjonskontrollerer og leverer mottakerens egne bevis. Ingen ny dekningsprosent. |
| Annen person/rent miljø og samme-case manuell referansemåling ordner seg automatisk til slutt. | Uavklart / middels til høy. | S6 og S5 krever disse faktiske aktivitetene. Planlegg ansvar og tidspunkt i evalueringsarbeidet; en utviklingsagents egen kjøring eller brukerens gamle tidsanslag erstatter dem ikke. Ingen annen person kontaktes gjennom denne økten. |

Svakeste antakelse med størst påvirkning er begrunnelsen for å ferdigstille all økonomi i Epic 1. Den kan avlastes uten produktendring. Den viktigste motkontrollen er at denne flyttingen ikke svekker lokale prioritet-1-utfall, felles validering, typed kontrakt eller senere komplett screening. Den nest største gjennomføringsusikkerheten er reelt storyomfang, særlig dokument-/kontrollarbeidet; flere epic-overskrifter alene løser ikke den.

## Konkret forslag til innarbeiding

**Anbefaling: behold fem epics og innarbeid følgende samlet.** Dette er en revidert fordeling av eksisterende arbeid; den er ennå ikke godkjent.

| Epic etter forslaget | Primært funksjonsansvar | Lokale/integrerte deler |
|---|---|---|
| 1. Etablere et kontrollert økonomigrunnlag i en kjørbar lokal app | FR-1–FR-4. | Felles prioritet-1-vurdering og fast lokal mangelbegrunnelse/neste handling etter FR-16/FR-17. Desimalinput og årsnormalisering leveres her; nøkkeltallsfinans er ikke et krav for epicens ferdigmarkering. |
| 2. Kontrollere én tilstandsrapport med originalkilde i lokal demo | FR-5–FR-11 for felles pipeline/demo/kontroll. | To demonstrerbare milepæler innen epicen; dokument-/kontroll-/TG3-mangler bruker den tidlige domain-vurderingen. Ekte live-uttrekk fortsatt Epic 4. |
| 3. Beregne, forstå og oppdatere ett samlet screeningresultat | FR-12–FR-18. | Finans, per-nøkkeltall-gyldighet, eksakte terskler og presentasjon er separate arbeidsenheter før komplett screening/resultat/endring. Gjenbruker prioritet-1-grunnlaget fra Epic 1/2. |
| 4. Analysere en ny rapport med valgfri live KI | Live-delene av FR-6/FR-7/FR-9. | Samme kontrakt/UX/regler; modell/budsjett før adapterimplementering/betalte tester; separat S2/S5. |
| 5. Gjennomføre og etterprøve v1 som sensor fra README | Samlet verifikasjon, NFR-/S-/kursbevis. | Tidligere storytester er allerede kjørt; README/UX/offline-S6 kan gjennomføres etter Epic 3, mens live-sammenstilling trenger Epic 4. |

Ved Apply oppdateres disse konkrete delene av epics.md:

1. **Epic 1s FR-dekning, arbeidsgrenser og verifikasjon:** flytt finans-/nøkkeltalls-/økonomiterskel-/fullscreeningdelen til Epic 3. Behold faktisk appstart, input/kilder/kostnader, validering/år, bekreftelse og felles lokale mangelutfall. Ingen falsk fullført screening.
2. **Epic 2s arbeidsgrenser og demonstrerbare verdi:** legg inn de to milepælene og eksplisitte eksisterende forutsetninger om faktiske fixtures, kontrakt, lesbarhet og ressursgrenser. Behold all original-/utkast-/TG3-/bekreftelsesatferd.
3. **Epic 3s tittel, ansvar, arbeidsgrenser og tester:** la FR-12–FR-18 ha samlet primæransvar her, med separate finans-, terskel-, screening-, resultat- og snapshot-deler; full BT-/AT-/S1-kontroll følger berørt logikk. Ingen stor «bygg hele resultatet»-story.
4. **FR-/NFR-/CAP-/AD-/UX-matrisene:** flytt finans-/økonomiterskelansvar og nøkkeltallspresentasjon i tråd med punkt 1/3. FR-13s beregnbarhet per nøkkeltall flyttes til Epic 3, mens inputgyldighet fortsatt er Epic 1. CAP-5 legges primært i Epic 3; CAP-6 bygges med tidlig mangeldel og komplett screening i Epic 3. Ingen krav-ID eller fulltekst endres.
5. **Rekkefølge og verifikasjonsstatus:** behold hovedrekkefølgen 1 → 2 → 3 → 4 → 5 og unntaket for offline-verifikasjon etter 3. Beskriv fravær av fremtidige storyavhengigheter som et mål som skal kontrolleres når storygrafen finnes. Gjennomførbarhet får ingen garantert tids-/storyantall før oppdelingen er vurdert. Testing/tilgjengelighet følger hver funksjonsleveranse.

Dette endrer ingen godkjent økonomiformel, terskel, anbefalingsprioritet, krav om alle utløsere, UX-skjerm/bekreftelse, grensekontrakt eller arkitekturbeslutning. De videreførte Deferred beholder eiere og avklaringspunkt. Dersom senere detaljering faktisk krever en slik endring, skal Mads fortsatt spørres før den besluttes.

## Avgjørelse og videre workflow

Mads svarte «Apply, med én presisering før epic-strukturen låses» og godkjente avlastning av Epic 1, flytting av finans/økonomiske terskler/komplett screening til Epic 3, to demonstrerbare milepæler i Epic 2 og senere kontroll av storyavhengigheter/gjennomførbarhet.

Presiseringen er bindende for innarbeidingen: Epic 4 heter **Live KI-analyse og evaluering** og leverer integrasjon av valgt modell/leverandør gjennom den låste adapteren, faktisk KI-analyse av støttet rapport og evaluering mot kontrollerte caser. Demo er en alternativ kjøreform for sensor/testing uten API-nøkkel og erstatter ikke v1s faktiske KI-analyse. Leverandør/modell/kostnadsramme og konkrete live-timeouter avklares før integrasjonen implementeres; tidligere avklaringspunkter for dokument/HTTP beholdes.

Godkjente endringer er innarbeidet i epic-beskrivelser, FR-/NFR-/CAP-/AD-/UX-dekning, rekkefølge og kontrollstatus. Dette er en klargjøring av eksisterende v1-leveranse og en godkjent omfordeling av implementeringsarbeid, ikke endring av låste kildefiler, grensekontrakter eller anbefalingsregler.

Brukeren instruerte uttrykkelig retur til BMAD-kontrollpunktet før stories. Elicitation er avsluttet med dette Apply og returstyringen; det stilles ikke et ekstra spørsmål om videre metodevalg. Hovedworkflowen stopper ved steg 2s C-meny. Stories, readiness og implementering er ikke startet. Full readiness-kontroll skal fortsatt kjøres etter ferdige epics og stories, som bestilt.
