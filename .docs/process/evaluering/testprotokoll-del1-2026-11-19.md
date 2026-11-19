# Uavhengig brukertest og tidsstudie: gjennomføringsprotokoll

Dato: 2026-11-19. Eier for organisering og eventuell gjennomføring: Mads.
**Status: forberedt, ikke gjennomført. Ingen deltakere er rekruttert, ingen
nye casepar er produsert/frosset, og ingen resultater er registrert her.**
Dette er en konkret plan, ikke en attestasjon eller ny produktfunksjon.

## Hva finnes allerede, og hva mangler?

[S5-W1](../../implementation-artifacts/story-4-5-s5-waiver-2026-10-27.md)
bevarer ett faktisk forsøk fra 27. oktober: manuell TG-identifisering 32:16,
KI-analyse til synlig liste 0:41 og kontroll til appbekreftelse 5:18.
Tallene er observerte intervallvisninger, ikke tre fullt sammenlignbare
oppgaver. Manuell vurdering manglet generell begrensning/TG3-status; samme
person brukte samme rapport, og finans/browser avvek fra planen. Det finnes
**null komplette godkjente manuelle sammenligningsreferanser** i dette
forsøket. Ingen prosentvis tidsbesparelse kan utledes. Originalobservasjoner,
fasit, hasher og waiver beholdes urørt.

Mads avsluttet den historiske S5-testingen med aksepterte avvik. Oppdraget
19. november autoriserer forberedelse av et nytt opplegg, ikke automatisk
gjenopptak av S5, ny live-prøve eller omskriving av S5-W1. Eventuell senere
gjennomføring er en separat, datert evaluering av valgt leveranseversjon.

[S6-forberedelsen](../../implementation-artifacts/story-5-4-forberedelse-2026-10-27.md)
og [den historiske overleveringen](../../implementation-artifacts/story-5-4-s6-overlevering-2026-10-28.md)
er planer/eksportbevis. [Ren klon 6. november](../leveranse-2026-11-06/ren-klon.md)
er en faktisk KI-assistert teknisk prøve på utviklerens macOS. Ingen av
disse dokumenterer en annen persons førstegangsbruk. Gjeldende åpne forhold
og all senere feiloppfølging hører hjemme i
[deferred-work](../../implementation-artifacts/deferred-work.md), særlig
R4-S6/Story 5.4, S5-W1 og PAA-SO2; denne protokollen er ikke en ny oppgaveliste.

[Sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
vektlegger sporbar styring (30 %), funksjonalitet (20 %), kvalitetssikring
(15 %), UX (10 %) og README/kjørbarhet (10 %), se s. 1–6. Den krever ikke et
bestemt antall testpersoner eller en tidsgevinstprosent. Disse prøvene følger
prosjektets egne S5/S6-mål og styrker bevis der agenttester er utilstrekkelige.

## Felles klargjøring og bevisgrenser

1. Velg og registrer **full commit-SHA**, dato, uendrede package-/lockfiler og
   eventuell dokumentasjonsrevisjon. Frys protokoll og fasit før rekruttering;
   før senere avvik som nye daterte tillegg. Nye produktendringer krever ny
   versjonsbinding og relevant rekontroll, uten å erstatte første forsøk.
2. Bruk en ny lokal klon uten `node_modules`, `dist`, `.env` eller `private/`.
   Følg [README](../../../README.md) for Node 24.21.0/npm 11.19.0,
   `npm ci`, build og Chromium. Nett til installasjon er tillatt. Etterpå
   kjøres `ANALYSIS_MODE=demo OPENAI_API_KEY= npm run demo` på ledig port.
   Ingen betalte hjelpere eller modellkall inngår.
3. Den nye hovedflyten bruker lokal PDF-behandling. De eldre fire lagrede
   F1–F4-svarene er fiktive, hashbundne demosvar og holdes uendret. Caseparenes
   lokale uttrekk og eventuelle lagrede kontrollsvar fryses før måling med
   hash/versjon; de presenteres aldri som ferske live-resultater. Ikke lag
   tilpassede produksjonssvar for å skjule en reell parsermangel.
4. Registrer OS/arkitektur, maskin, browser, skjermstørrelse, nettstatus og
   kommandoer. På samme maskin brukes samme oppsett for begge metoder i
   tidsstudien. Logg eksterne nettforespørsler dersom dette måles; si presist
   om sperren bare gjelder browser eller også backend/OS.
5. Be om frivillig samtykke til observasjon og valgfritt skjermopptak.
   Bruk deltaker-ID-er; publiser bare avidentifiserte oppgaver/tider/feil og
   relevant terminalutdata. Ingen navn, private eiendomsdokumenter, innlogging
   eller nøkler i Git. Kontaktopplysninger/opptak beholdes privat så lenge
   det trengs for kontroll, med avtalt slettedato før oppstart. Deltakeren kan
   avbryte. Ved tilbaketrekking markeres observasjonen trukket/manglende.

## Prøve A: annen persons README-kjøring (S6)

Rekrutter **én person som ikke har utviklet PAA**, med vanlig terminalerfaring
og uten tidligere PAA-bruk. Det gjør en ren installasjon gjennomførbar, men
tester ikke helt datanovise brukere. Bruk helst en egen macOS-maskin; det
reduserer forskjeller fra verifisert miljø. En annen OS kan prøves og skal
oppgis som egen plattformobservasjon, ikke skjules som samme testmiljø.
Reserveperson avtales ved frafall, uten å erstatte et faktisk feilet forsøk.

Sett av 60–90 minutter. Gi kun repo/valgt commit, README og instruksen:

> «Bruk README til å installere og starte appen, demonstrere den fiktive
> eiendommen og kjøre testene. Fortell hva som er uklart. Jeg kan hjelpe ved
> miljøfare eller fastlåsing, men all hjelp registreres.»

Observatøren følger med uten å peke ut knapper eller rette kommandoer.
Ved 5 minutters fastlåsing spørres bare om personen vil fortsette eller ha
hjelp. Hjelp registreres ordrett med tid og årsak; forsøket blir ikke en
uhjulpet suksess. Veiledningens 15–20 minutter er sensors rimelige innsats
for **å få appen i gang**, ikke frist for alle nettlesernedlastinger og tester.
Registrer oppstartstid og installasjons-/nettventing separat.

| Oppgave | Kontrollerbar forventning og akseptanse |
| --- | --- |
| Installer/start med README | Ny kopi og oppgitt runtime, kopierbare kommandoer, faktisk app uten private filer/nøkler. Ingen udokumenterte steg. Logg hvert avvik og all hjelp. |
| Last opp `mixed-12.pdf`, åpne kilde | Samme original og fysisk PDF-side som i [offentlig prøve](../leveranse-2026-11-06/demonstrasjon.md); forklar fysisk 10 vs trykt 6. |
| Registrer leie/drift/år og finansiering | Fiktive verdier og forventede avrundede resultater følger offentlig prøve. Endret rente påvirker kontantstrøm, ikke yield. Egne scenarioer er ikke kildefakta eller kontrollert anbefaling. |
| Gjennomfør tre varianter via «Bak tallene» | Gå videre/Forkast/Innhent mer informasjon med offentlig fasit. Funnlisten bekreftes separat fra TG3. Avklart krever eksplisitt fiktiv begrunnelse og konkret grunnlag. |
| Feil input og gjentakelse | Ugyldig PDF, blank L, manglende rapport og ny import gir forståelig feil/mangel; ingen oppdiktet null, friskmelding eller gammelt resultat for nytt grunnlag. |
| Kjør README-testene sekvensielt | Bevar kommando, exitkode, bestått/feilet/skip og relevante logger. Skip er ikke bestått. Private/native prøver kan legitimt mangle sine forutsetninger; de offentlige prøvene skal kunne kjøres. |

S6 er først dokumentert når de faktiske Story 5.4 AC1–AC5 er vurdert mot
bevis, nødvendige rettinger er testet og review/lukking er registrert i
sentral ledger. Et løst spørsmål, et skjermbilde eller bare vellykket start
lukker ikke hele S6. Første feilforsøk bevares også etter vellykket rekontroll.

Etter oppgavene stilles fire åpne spørsmål uten fasit først: Hva betyr
«Innhent mer informasjon»? Hva beviser «Avklart»? Hva er forskjellen på
statistisk leiereferanse og faktisk leie? Hvilke opplysninger må fortsatt
kontrolleres utenfor appen? Svar kodes korrekt/delvis/feil med anonymt
begrunnende sitat. Dette er forståelsesbevis, ikke formell UX-sertifisering.

## Prøve B: manuell vurdering mot dagens lokale PAA

### Utvalg og casepar før oppstart

Rekrutter **fire personer som ikke har utviklet eller tidligere brukt PAA**,
helst to med erfaring med utleie/eiendomsøkonomi og to med grunnleggende
regneark-/privatøkonomikunnskap. Registrer erfaring før fordeling. Mads og
KI-agenter kan forberede, men telles ikke som uavhengige deltakere. Fire er
et gjennomførbart, utforskende utvalg for ettpersonprosjektet; det gir ikke
befolkningsestimater eller tilstrekkelig statistisk styrke til effektpåstander.
Ved færre enn fire fullførte deltakere rapporteres pilot, ikke ferdig planlagt
utvalg. Personer som har gjort S6/demofasiten, deltar ikke i denne prøven.

Eksisterende F1/F2 er korte og nesten like; salgsoppgavevariantene gjenbruker
mye innhold. De skal derfor **ikke** behandles som uavhengige, likeverdige
casepar. Før gjennomføring må to nye, syntetiske dokumentpakker A/B
utarbeides uten produktkodeendring. De er ikke produsert i denne økten.
Følgende blueprint avgrenser arbeidet til omtrent en dags forberedelse og
kontroll, med eksisterende [fixturemetode](../../../tests/fixtures/sales-prospectus/README.md):

| Egenskap | Case A | Case B |
| --- | --- | --- |
| Format/kompleksitet | 12 sider, 1 800–2 200 ord; økonomi på 1–2, integrert rapport 5–12 | Samme omfang, tabell-/tekstfordeling og lesevanskelighet; andre adresser, beskrivelser og kildeplasseringer |
| Teknisk oppgave | Seks eksplisitte TG2 og ett TG3, ett sammendragsduplikat, to forskjellige rom med lignende ordlyd | Samme antall/struktur, andre forhold og sideposisjoner; ingen kopiert fasitordlyd |
| Mangler | Én synlig generell undersøkelsesbegrensning; TG3 har ikke avklaringsgrunnlag og skal forbli Uavklart | Samme informasjonsnivå og forventet usikkerhet |
| Separate brukerforutsetninger | P 4 000 000, L 360 000, D 100 000, J 120 000, Ymin 6 %, år 2026 | P 5 000 000, L 450 000, D 125 000, J 150 000, Ymin 6 %, år 2026 |
| Uavhengig økonomifasit | Bruttoyield 9 %, NOI 260 000, nettoyield 6,5 %, kontantstrøm 140 000 kr/år | Bruttoyield 9 %, NOI 325 000, nettoyield 6,5 %, kontantstrøm 175 000 kr/år |
| Anbefalingsfasit | Innhent mer informasjon: uavklart TG3; andre faktiske blokkere må også oppgis | Samme regelprioritet, egen kildebundet begrunnelse |

Beløpene er **planlagte, konstruerte oppgaveverdier**, ikke observerte resultater
eller et produsert dokument. P inkluderer eventuell fellesgjeld, uten
kjøpsomkostninger; D/J må være klart skilt og konsistente med hver pakke.
Det er forsvarlig å gi samme anbefalingskategori i begge tidsoppgaver fordi
kritisk kildekontroll og arbeidsmengde da er sammenlignbar. Alle tre anbefalinger
og terskellikhet kontrolleres separat i S6/regresjon; tidsstudien dekker dem ikke.

En person uten tilgang til parserretur leser **hele originalene** og merker
alle forhold, grader, fysiske sider, duplikater, kildeutdrag og begrensninger.
En annen kontrollør sammenligner fasiten med originalene og kontrollregner
økonomien i et selvstendig regneark. Fasit skal ikke utledes av PAA eller
justeres for å passe PAA-resultatet. Hvis bare agentkontroll er mulig, må
dette registreres; det er en svakere fasit enn uavhengig menneskelig kontroll.
Ingen fagkyndig validering påstås uten faktisk slik deltakelse.

Frys pakke/PDF/fasit/oppgaveark med SHA-256, versjon og kontrollsignaturer.
Gjør en teknisk pilot med en **annen** person/case C for arbeidsmengde,
klokke og mulig parserfeil. Pilot teller ikke i utvalget. Fasit og A/B skal
ikke vises til studiedeltakerne på forhånd. Hvis pakker eller metode må endres,
frys ny versjon før studiestart. Ikke fjern vanskelige funn fordi PAA overser dem.
Studien er ikke klar for kjøring før disse forberedelseskravene er oppfylt.

### Oppgaver, rekkefølge og like arbeidskrav

Gi alle en kort, standardisert trening på case C før måling: original-PDF,
fire formler/regler, kildekrav og hvordan PAA åpnes. Ingen A/B-fasit, forslag
til TG3-avklaring eller tips under målingen. Treningen logges og telles ikke
som målt tidsgevinst. Tidsoppgavene gjennomføres stille; etterfølgende intervju
og tenke-høyt-prøve skjer etter begge metodene, slik at prat ikke skjevfordeler tid.

| Sekvens (én deltaker per rad) | Første oppgave | Andre oppgave |
| --- | --- | --- |
| 1 | Manuell A | PAA B |
| 2 | PAA A | Manuell B |
| 3 | Manuell B | PAA A |
| 4 | PAA B | Manuell A |

Fordel deltakere tilfeldig til radene etter registrert erfaring; dokumenter
trekning. Samme person ser aldri samme case i begge metoder. Metode og case
forekommer like ofte først og sist. Ta fem minutters pause, men gi ingen
fasit/tilbakemelding mellom oppgavene. Dette reduserer læring fra samme
rapport; generell læring og forskjeller mellom A/B forsvinner ikke helt.

Identisk oppgavetekst for begge metoder:

> «Gjør en førstevurdering av dette fiktive utleieobjektet med den utdelte
> dokumentpakken og forutsetningene. Lever P/L/D/J/Ymin, de fire nøkkeltallene,
> alle TG2/TG3 med fysisk PDF-side, mangler/begrensninger, TG3-status med
> grunnlag og én anbefaling med begrunnelse/neste handling. Kontroller
> originalen. Ikke finn på manglende opplysninger eller avklar en teknisk
> mangel uten grunnlag. Si tydelig når du er ferdig.»

Manuell metode bruker lokal PDF-leser, tomt regneark/kalkulator og utdelt
formel-/regelark; ingen KI, ferdig utfylt fasit eller automatisert uttrekk.
PAA-metoden bruker samme original/forutsetninger og valgt lokal build;
egen kontroll og den samme resultatmalen inngår. Klikket «bekreftet» er
ikke alene bevis på full kildekontroll. Observatøren registrerer kildeåpninger
og handlinger uten å hjelpe; eksakt menneskelig lesing kan ikke bevises fullt.

### Tid, kvalitetsmål og forhåndsfastsatt vurdering

**Ny primærmåling er ende-til-ende-tid**, fra deltakeren får pakken/oppgavearket
til levert resultat og uttalt ferdig. Start skjer med app/PDF-leser klar,
uten registrerte caseverdier; opplasting, lesing, registrering, lokal venting,
kildekontroll, rettinger, screening og utfylling inngår. Installasjon/trening
inngår ikke. Registrer aktiv tid og maskinventing separat hvis mulig; ikke
trekk bort PAA-venting fra totalen. Samme klokke/opptak brukes per deltaker.

Sett 30 minutter per metode som praktisk øktgrense, med fem minutters pause
og ti minutters etterintervju: omtrent 90 minutter inklusive trening. Ved
grensen lagres delresultat som ufullført og tid som «≥1 800 s», ikke en rask
suksess. Sikkerhetshjelp/teknisk feil registreres; en omstart er et nytt
forsøks-ID med lenke til originalen. Observatørprat/intervju utenfor oppgaven
logges separat, ikke trekkes fra i ettertid uten forhåndsdefinert årsak.

Den historiske S5-målingen er noe annet: `t_liste−t_start` (≤300 s median)
og `t_bekreftet−t_liste` (≤600 s median) etter
[PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md#s5-måleprotokoll-og-tt-1tt-9).
Den utelater blant annet registrering/opplasting før Start. Nye lokale
delmålinger kan logges dersom disse hendelsene faktisk finnes, med egen
modus og versjon; de beviser ikke live-tid eller lukker den gamle S5-runden.

| Mål | Førregistrert definisjon og vurderingsgrense |
| --- | --- |
| Beregninger (S1) | Alle beregnbare beløp innen 1 kr/år og yield innen 0,01 prosentpoeng mot uavhengig fasit. Uavrundede terskler kontrolleres separat. |
| Funn før menneskelig retting (ny lokal kvalitetsmåling, koblet til S2) | Riktig forhold **og grad og fysisk side** teller som treff; feil side er ikke treff. Ett forhold telles én gang, sammendragsduplikat gir ikke nytt fasitfunn. Rapporter TG2/TG3-nevnere, treff, utelatelser og oppdiktede funn per dokument. Lokal kode/OCR omtales ikke som live KI. |
| Fullført menneskelig oppgave | Riktig anbefaling/regler, alle kritiske mangler/TG3-status, alle fasit-TG3, ≥90 % TG2 med riktig side og null oppdiktede funn. Et TG3 avklart uten grunnlag eller feil konklusiv anbefaling er kritisk feil. Med seks TG2 per case betyr 90 %-grensen i praksis seks riktige. |
| Forståelse (S4/UX) | Deltaker forklarer kildefaktum vs scenario og Uavklart vs Avklart i etterintervju. Rapporter korrekt/delvis/feil, ikke bare fornøydhet. |
| Tidsgevinst (ny utforskende evaluering) | For hver kvalitetsgodkjent sammenligning: `Δ_i=T_manuell−T_PAA`, `%_i=100×Δ_i/T_manuell`. Oppgi alle par, median Δ og median av parenes prosentverdier; positivt betyr raskere PAA. Ingen sammenblanding av prosent av medianene med median prosent. |
| Beslutningsregel for tidsutsagn | «Indikasjon på raskere gjennomføring i dette utvalget» krever fire fullførte kvalitetsgodkjente par, positiv median Δ og minst tre positive par; ingen kritisk feil i PAA og ingen dårligere samlet TG3-dekning enn manuelt. Ellers: inkonklusivt eller ingen observert gevinst. Dette er en valgt studieregel, ikke et nytt kurs-/produktkrav eller statistisk signifikans. |

Rapporter også resultatkvalitet for **alle** forsøk og hvor mange som falt
utenfor den kvalitetsgodkjente tidssammenligningen. Hvis manuell metode feiler
og PAA lykkes, er det et kvalitetsfunn, ikke automatisk en prosentvis gevinst.
Hvis et PAA-forsøk feiler, behold tid til feil, hjelp og konsekvens. Ingen
observasjon erstattes med null, slettes som «utligger» eller gjentas til den blir
grønn. Ved null gyldige par finnes ingen tidsgevinstberegning.

## Tomme rådatamaler og senere rapportering

Fylles først under faktisk gjennomføring. «Ikke målt» er status nå for alle
felt; det er ingen skjulte observasjoner i malene.

```text
Studie-ID / protokollversjon / dato:
Full commit / PDF-SHA256 / fasit-SHA256 / lokale svar-SHA256:
Deltaker-ID / forkunnskap / tidligere eksponering / sekvens:
OS / maskin / Node / npm / browser / skjerm / nettgrense:
Forsøks-ID / metode / case / start / stopp / varighet / venting:
Fullført / ufullført / teknisk feil / trukket; begrunnelse:
Hjelp (tid, ordrett innhold, årsak) / avvik fra protokoll:
P L D J Ymin / fire nøkkeltall / kilde- og årsgrunnlag:
TG2 fasit/treff/oversett/feil-side/oppdiktet (før og etter kontroll):
TG3 fasit/treff/oversett/feil-side/oppdiktet (før og etter kontroll):
TG3-status og grunnlag / mangler / anbefaling / utløsende regler:
Forståelsessvar / korrekt-delvis-feil / anonymt sitat:
Kvalitetsgate oppfylt? Kontrollør / kontrolltidspunkt / bevislenke:
Kommando / exitkode / bestått-feilet-skip / rålogg (S6):
Feilreferanse i deferred-work / nødvendig retting / ny faktisk rekontroll:
```

Ved faktisk utføring opprettes en datert bevismappe under `.docs/process/evaluering/`
med protokollkopi, manifest, avidentifiserte rådata/kommandoer og analyse.
Bevar første rådata uendret; rettelser er daterte tillegg. Resultatrapporten
oppgir planlagt/faktisk utvalg, frafall, alle feil og kvalifiserte nevnere,
metode-/case-/rekkefølgefordeling og individuelle tider sammen med medianer.
Kodegjennomgang av rapporten og relevant faktisk rekontroll må foreligge før
eventuell lukking av sentrale punkter. Protokollen alene lukker ingen.

Konklusjoner skal begrenses til syntetiske dokumenter, valgt versjon,
testoppgaver og lite bekvemmelighetsutvalg. Ulik erfaring, observatøreffekt,
restlæring, caseforskjeller, lokal maskin og eventuell svak fasituavhengighet
er konkrete trusler. Ingen lovlighet, faglig teknisk godkjenning, generell
modelltreffsikkerhet eller generell investortidsgevinst er dokumentert av dette.
