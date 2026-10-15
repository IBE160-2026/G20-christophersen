# Uavhengig arkitekturreview — sømmer mellom moduler

Dato: 2026-10-14. Reviewgrunnlag: `ARCHITECTURE-SPINE.md`, arkitekturens `.memlog.md`, sluttført PRD med addendum og sluttført UX (`EXPERIENCE.md` og relevant tallformat i `DESIGN.md`). Ingen kilde, spine, kode, epic eller story er endret av denne reviewen.

**Verdikt: Betinget bestått. Én middels alvorlig semantisk søm bør gjøres entydig før uavhengig implementering. Ingen øvrige reelle avvik er påvist.** Funnet nedenfor er avgrenset til at en korrigering endrer hvilket faktisk teknisk forhold et uttrekk viser til. Det gjelder ikke en forbedret KI-representasjon av det samme forholdet, og innebærer ikke en ny bekreftelseshandling eller ny produktregel.

## Metode og terskel for funn

Reviewen forsøkte å bygge to moduler ett nivå under spinen som begge følger beslutningene, men får ulike forventninger til samme data eller overgang. En ren variasjon i feltnavn eller DTO-form er ikke et funn: AD-4 og Deferred gir én felles `contracts`-komponent eierskap til slike detaljer. Et moteksempel som krever at en modul bryter en uttrykkelig AD-regel, er heller ikke et funn.

PRD/UX er bindende. Reviewen har ikke omdefinert alvorlig TG3, innført nye inputbegrensninger, ekstra teknisk verifisering, analyseforsøk, gjenopptak, lagring eller nye skjermhandlinger. Den vurderer representasjon og anvendbarhet av allerede godkjent grunnlag.

## Funn S-1 — Middels: Proveniensidentitet og anvendbarhet for TG3-avklaring er ikke skilt ved endret funnreferanse

**Plassering:** AD-2, regel på linje 62; AD-8, regel på linje 112; Consistency Conventions, «Funn og kilde» på linje 132. Kravspor: FR-5, FR-10, FR-11; PRD-addendum RT-11/RT-14 og AT-16 som nærliggende tilfeller. De eksisterende eksemplene dekker endret liste og endret TG3-status, men ikke avklaringens anvendbarhet når korrigeringen bytter teknisk referanse under samme uttrekksidentitet.

**Hva som er entydig:** En brukt korrigering bevarer KI-originalen, opphever enkeltfunnets og listens bekreftelse og gir et nytt resultatgrunnlag. `findingId` skal fortsatt binde original, utkast, gjeldende brukerendring og TG3-avklaring. Gyldig Avklart krever eksplisitt status og to ikke-tomme tekster. Resultatene binder liste- og TG3-revisjoner.

**Hva som mangler:** Et stabilt `findingId` identifiserer uttrekkets opphav også etter at grad, beskrivelse og side er korrigert. Spinen sier ikke om samme id alene betyr at en tidligere TG3-avklaring gjelder det tekniske forholdet i den nye korrigeringen. Den oppgir heller ikke en invariant som skiller dette fra en ufarlig korrigering av representasjonen av samme forhold. En felles DTO hindrer formdrift, men avgjør ikke denne overgangen mellom reduceren og screeningens gyldighetsvurdering.

### Konkret moteksempel med to moduler

1. Rapportuttrekket har `findingId = f7`, TG3 og KI-beskrivelsen «Manglende dokumentasjon for elektrisk anlegg». Brukeren har registrert Avklart med begrunnelse «Elektrikerkontroll avdekket ikke behov for umiddelbar utbedring» og grunnlag «Kontroll av elektrisk anlegg etter rapporten». Økonomien er F1, og øvrig grunnlag er tilstrekkelig.
2. Ved ny kontroll ser brukeren at KI-uttrekket viste til feil forhold. Han bruker korrigering slik at det gjeldende uttrekket viser rapportens TG3 «Alvorlig lekkasje i tak» på korrekt kilde-side. Alle tre redigerbare felt håndteres som eksisterende FR-10-korrigering; ingen ny faglig grad settes.
3. **Modul A, `frontend/state`:** Bevarer originalen og stabil `findingId`, oppdaterer gjeldende korrigering og listerevisjon, opphever enkeltfunn-/listebekreftelse og gjør siste resultat historisk. Den bevarer separat TG3-avklaring under `f7`, fordi AD-2 eksplisitt nevner de to bekreftelsene som oppheves, mens konvensjonen fortsatt knytter avklaringen til samme id. Brukeren kontrollerer og bekrefter den korrigerte listen. Ingen ny KI-analyse eller automatisk bekreftelse utføres.
4. **Modul B, `domain/screening`:** Bruker den gjeldende bekreftede listen og separat TG3-status. For `f7` finnes eksplisitt Avklart og begge ikke-tomme tekster, slik AD-8 angir. Modulen vurderer ikke ekstern informasjon. Med ellers komplett F1-grunnlag returnerer den Gå videre med ny liste-/TG3-basis. Elektrikervurderingen blir dermed anvendt på taklekkasjen, selv om det aldri ble registrert en avklaring for dette forholdet.

Begge modulene kan følge de konkrete overførings- og ugyldiggjøringsreglene uten å kopiere kontrakter eller bruke et gammelt resultatsnapshot. Divergensen ligger i om `findingId` er tilstrekkelig avklaringsidentitet. En implementasjon som lar Avklart følge uttrekksidentiteten, og en som binder den til det avklarte tekniske forholdet, kan få ulik anbefaling etter samme korrigering og listebekreftelse.

### Minimal handling og avgrensning

Gjør det entydig i AD-2/AD-8 at proveniensidentiteten ikke alene kan overføre en avklaring til et annet teknisk forhold. TG3-avklaring som brukes i screening må gjelde det samme faktiske rapportforholdet som gjeldende brukerbekreftede funn. Den felles kontraktkoden kan eie den konkrete representasjonen av denne bindingen; reduceren og screening må følge samme anvendbarhetsregel.

Dette skal **ikke** tolkes som at enhver korrigering opphever TG3-avklaring. En bedre beskrivelse eller rettet PDF-side for samme avklarte forhold kan bevare avklaringen. Bevar også tidligere tekst og opphav ved en reell referanseendring; ikke omskriv historikken eller hev at systemet har verifisert teksten eksternt.

FR-5 binder avklaringen «per alvorlig TG3-funn», og FR-11 sier at listebekreftelse ikke automatisk avklarer TG3. Det støtter en minimal regel om riktig anvendbarhet. Kildene beskriver imidlertid ikke en egen brukerhandling for tvetydig endring av teknisk referanse. Dersom tiltaket krever en ny bekreftelsesknapp, obligatorisk ny tekstregistrering ved alle korrigeringer eller en strengere generell screeningregel, er det et produktvalg uten uttrykkelig kildegrunnlag. Reviewen anbefaler ikke å innføre noe av dette gjennom arkitekturen.

## Øvrige angrep og vurderinger

| Søm | Forsøkt inkompatibilitet | Vurdering |
| --- | --- | --- |
| Delte former og enheter | Én modul sender kroner/prosent som flyttall, en annen forventer desimalstreng eller annen skala. | Avvist av AD-1/AD-4/AD-7 og NOK/prosent-konvensjonen. Eksakte felter og ratioform kan utsettes til samme contracts-eier; ikke et spinefunn. |
| Finans og terskler | Finans/presentasjon dividerer og avrunder, mens thresholds sammenligner uavrundet. | Eksplisitt avklart: thresholds bruker `100 * NOI >= P * Ymin`, kontantstrøm `>= 0`; visningsavrunding er kun presentasjon. Likhet og negative resultater er bindende. En modul som screener på visningen bryter AD-7. |
| Formatering | To visningsmoduler velger ulik avrundingsmodus eller detaljpresisjon. | Normalformat og nødvendig forklaring ved skjult brudd er bundet av UX. Presentasjon har ett ansvar; detaljert avrundingskonfigurasjon er lokal implementering, ikke en uavhengig modulkontrakt som mangler på dette nivået. |
| Eierskap og mutasjon | Backend bekrefter input, beregner anbefaling eller gjør korrigeringsutkast gjeldende. | Forbudt av AD-1/AD-2 og tilstandskonvensjonen. Én reducer eier brukergrunnlag; API-/domeneresultater er data. Ingen reell dobbelt eier. |
| Request-/rapportidentitet | Ny requestId eller generasjon omgår duplikatsperren; sent svar brukes etter rapportbytte. | AD-4/AD-5 låser backendberegnet SHA-256, aktiv økt/modus/hash som sperrenøkkel, generasjonskontroll og avvisning av sene svar. Nøyaktig skjemafelting hos contracts er tilstrekkelig utsatt. |
| Duplikater og avbrudd | En tapt klientforbindelse frigjør sperren slik at samme aktive økt kan kalle adapteren på nytt. | Ikke tillatt: markøren beholdes til serverstopp, også etter klientavbrudd. Dette er metadata, ikke persistent jobbtilstand. Manglende gjenopptak etter mistet svar er en uttrykkelig Q-7-konsekvens; reviewen krever ikke replay, polling eller retry. |
| Feil, tomliste og fullføring | HTTP 200 eller validert JSON behandles som tilstrekkelig rapportgrunnlag. | Avvist av AD-4/AD-5/AD-8. `completed` og `failed` skilles, tomliste har eget fullføringsgrunnlag, brukerens kontroll er separat, og S5 stopper når listen faktisk er synlig. |
| KI-original og korrigering | Brukerendring overskriver original, forbedrer live-kvalitetsmåling eller opphever dokument-/analysefeil. | Alle tre er forbudt av AD-2/AD-4/AD-10 og FR-9/FR-10. Kandidat-/usikkerhetsfeltene kan detaljere håndtering i felles kontrakt uten å opprette egne modulformer. |
| Resultatsnapshot og basis | Ny økonomi, brukt korrigering, TG3-endring eller ny rapport bruker forrige anbefaling som gjeldende. | AD-2 og UX gjør dette historisk og binder de aktuelle revisjonene. Ingen påvist ytterligere drift som følger alle AD-er. Et snapshot som viser aktuelle kilde-/inputdetaljer som grunnlag for gamle tall ville bryte den bindende UX-kontrakten. |
| Demo/live | Demomodul hopper over dokumentvalidering, velger live-fallback eller gir egne regler. | Alle variantene bryter AD-6/AD-9. Hash-/versjonsbinding og samme adaptergrense er tilstrekkelig bestemt. |

Det er ikke produsert produktbevis eller kjørt app-/KI-tester. Denne reviewen er et selvstendig dokumentbevis for arkitekturens modulgrenser, med ett avgrenset funn om TG3-avklaringens anvendbarhet.
