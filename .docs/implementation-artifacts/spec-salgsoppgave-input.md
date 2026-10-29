---
title: 'PAA-SO1: Salgsoppgave som hovedinngang'
created: '2026-10-28'
status: 'approved-offline'
baseline_commit: 'b259207'
change_proposal: '../planning-artifacts/sprint-change-proposal-2026-10-28.md'
---

# Implementeringsspec: salgsoppgave

**Godkjent 2026-10-28:** Mads godkjente D1–D3 og alle SO-AC1–15, med
selektivt kombinert grunnlag og økonomi uavhengig av manglende rapport.
[Arbeidsplan](spec-salgsoppgave-offline-build.md) og
[ny verifikasjon](salgsoppgave-implementation-2026-10-28/verifikasjon.md) viser
gjennomføringen. Avventende formuleringer nedenfor dokumenterer tilstanden
før godkjenningen; kravene og AC-fasiten er bevart. Godkjenningen omfatter
offline implementering, ingen betalte kall eller live-aktivering.

Produktretningen er besluttet av Mads 2026-10-28. Denne specen konkretiserer
bestillingen. **Produktkode er ikke implementert: D1–D3 i endringsforslaget
må avklares først.** Grensene nedenfor er anbefalte verdier, ikke aktive
konfigurasjonsverdier eller en påstand om produksjonskapasitet.

## Mål og avgrensning

Last opp én salgsoppgave → automatisk dokument-/økonomiuttrekk → kontroller
verdier og finansiering → kontroller TG2/TG3 fra integrert/vedlagt rapport,
eller last opp separat rapport → eksisterende finans og screening → vurdering.
Teknisk uttrekk kan forberedes i samme kall som økonomi; brukerens kontroll
av det vises etter tallkontrollen. Dette sparer ny lesing av samme dokument.

FINN beholdes som fremtidig alternativ. Ingen FINN-utvikling, gateåpning,
betalt API, push, OCR/vision, leie-/oppussings-/driftsestimat eller detaljert
UX-redesign inngår. L og Ymin forblir brukerens nødvendige grunnlag; eksplisitt
oppgitt leie kan vises med faktisk/estimert opphav, men brukes ikke automatisk
som L i denne leveransen. Ukjent verdi/periode/år/inkludering er ukjent.

## Kontrakt og eierskap

Gjenbruk `ListingField`-semantikk, desimalparser, kostnadsvalidering,
finansieringsforslag, PDF.js, TG-kandidatbinding og kontrollhandlinger.
FINN-URL/listingCode kan ikke representere PDF-opphav: ingen oppdiktet FINN-URL.
Faktoriser kildeuavhengig felt-/summeringslogikk under eksisterende tester;
behold FINN-kontrakt/rute og gammelt rapport-API kompatibelt.

Ny versjonert dokumentimportkontrakt eier:

- `documents`: originalhash, visningsnavn, fysisk sideantall, rolle,
  parent-hash/vedleggsidentitet der relevant. Separate filers sider blandes ikke.
- `propertyIdentity`: kildebundne kandidater for adresse og eventuelle
  eksplisitte kommune-/gårds-/bruks-/seksjons-/andelsnumre; bevar originaltekst
  og fysisk kilde. Ingen adresse eller matrikkelopplysning gjettes fra filnavn.
  Entydig samsvar kan foreslås, kjent motstrid blokkerer, og ukjent identitet
  krever eksplisitt kontroll av tilhørighet mot begge originalene. Ren likhet
  i filnavn eller rapportdato er ikke identitetsbevis.
- `pages`: én post per fysisk posisjon i hvert dokument; samme fem
  lesbarhetsstatuser som nå. Ingen omnummerering etter utvalg eller blankside.
- `sections`: foreslått rapportområde med fysiske start/sluttsider, grunnlag,
  sikker/uklar status og dokumentidentitet. Innholdsfortegnelse er bare kandidat.
- `coverage`: økonomi- og rapportdekning separat, alle ubehandlede sider/vedlegg,
  årsaker og `missing / ambiguous / unreadable / incomplete / complete`.
- `economy`: faste økonomifelt og begrensede ekstra eksplisitte pengeposter;
  originalbeløp/tekst, NOK, desimalstreng/null, periode/år, status,
  inkludering/gjeldsdel, fakta/oppgitt estimat og kildebelegg.
- `source`: originalhash, dokumentnavn, **fysisk** `pdfPage`, ordrett utdrag,
  tekstposisjon(er) i bevart sidegrunnlag og uttrekksmetode `pdf-text`.
  Trykt side er separat valgfritt tillegg. Konflikter beholder alle belegg.
- `technical`: eksisterende TG-kandidater, usikkerheter og begrensninger,
  supplert med kildeutdrag og bygningsdel/forholdsidentitet for duplikatkontroll.
- Korrelasjon, modus, kontrakt-/prompt-/uttrekksversjon og separate terminalutfall.

Behold legacy analysekontrakt 2/1 og dens 30-sidersbetydning. Ny import bruker
egen envelope/version og deler de versjonsuavhengige validatorene; ikke send
200-sidersobjekter som kontrakt 2 eller kast kildebelegg i en UI-konvertering.
Ny envelope må integreres med felles rapportgyldighet før screening, uten
endring av finans- eller prioriteringsreglene. Ukjent rapportdekning kan
aldri bli et gyldig tomt `completed` bare ved å projisere funn til gammel type.

## Anbefalt arkitektur etter D1–D3

1. Frontend holder originalfiler og aktiv økt. Ny import korreleres med
   objekt-/dokumentgenerasjon. Ny salgsoppgave ugyldiggjør tidligere import,
   rapportkontroll, TG3-avklaring og resultat. En annen salgsoppgavehash
   starter en ny vurdering: tøm tidligere finansverdier/kilder/kostnadsposter,
   alle finansbekreftelser, finansieringsforutsetninger og manuelle rettinger.
   Bevar ingen objektavhengige antakelser fra forrige vurdering. Samme hash
   i samme gyldige analysekontekst bevarer gjeldende vurdering; filnavn alene
   avgjør ikke bytte. Separat rapportbytte bevarer
   salgsoppgavens økonomi, men ugyldiggjør teknisk grunnlag og resultat.
2. Backend bruker eksisterende mottak/isolert prosess/worker/cleanup. Ny
   salgsoppgave-policy tillater foreslått 200 sider; gammel rapportrute har 30.
   PDF.js trekker tekst én gang per originalhash i aktivt forløp.
3. Samle sidestatuser og vedleggsmetadata. Første leveranse gjenkjenner
   integrert rapport og **oppdager** PDF-vedlegg. Faktisk innebygd fil behandles
   via separat opplasting i første leveranse; ingen automatisk rekursiv
   vedleggsutpakking. Vis vedleggsnavnet og nødvendig handling. Det reduserer
   risiko for skjult dekomprimering og feil sideidentitet. Automatisk
   vedleggsutpakking krever senere bounded-read-løsning og eget vedtak.
4. Én foreslått strukturert uttrekksoperasjon per ny dokumenthash returnerer
   økonomifelt, rapportkandidater og TG-kandidater på samme sidegrunnlag.
   Gjenbruk eksisterende TG-promptregler/validering, ingen ny analysemotor.
   Nytt strict schema og promptversjon er nødvendig fordi gammelt TG-schema
   uttrykkelig utelukker økonomi. Ikke kall FINN eller søkeverktøy.
5. Deterministisk etterkontroll binder hver kilde til mottatt dokument og
   eksakt tekstutdrag på oppgitt fysisk side. Ingen fuzzy reparasjon av
   kildebelegg. Strukturelt korrekt belegg beviser ikke at AI tolket tallet
   riktig; brukerens kontroll og senere separat live-evaluering består.
6. En entydig, lesbar rapportdel kan foreslås automatisk. Før komplett
   teknisk grunnlag kreves kontroll av rapportens identitet og fullstendige
   område. Uklar grense, flere rapporter, påvist gap eller utenforliggende
   uavklart TG-kilde krever avklaring/separat rapport. Brukervalgt område kan
   ikke overstyre uleselig innhold i rapporten eller gjøre feil til fullføring.
7. Frontend viser importerte verdier straks som ubekreftede, beskytter
   manuelle rettinger og beholder originalen. Eksisterende finansiering,
   funnkontroll, TG3, ny bekreftelse og resultatrevisjoner gjenbrukes.
8. Demo slår opp nye syntetiske svar ved originalhash og versjon; ingen nøkkel,
   klient, nett eller fallback. Backend holder ingen dokument-/tekstcache
   mellom requests. Gjenbruk etter fullføring skjer i aktiv frontendøkt.

Råtekstgjenbruk bindes til originalhash, uttrekksversjon og lesbarhetsprofil.
AI-originalens gjenbruksnøkkel binder aktiv økt, originalhash, inputdigest,
dokumentrolle/oppgave, modus, modell og prompt-/schema-/uttrekksversjoner.
Ingen gjenbruk på tvers av demo/live eller økter. Lokalt bundet kontrollgrunnlag
binder i tillegg rapportområde/dekningsrevisjon; områdeendring krever ny lokal
kilde-/dekningskontroll av bevart originaluttrekk, uten automatisk nytt AI-kall.
Uforenlig AI-original gir eksplisitt utilgjengelig/nytt analysebehov; ingen
duplikatsperre omgås i håp om å fornye den automatisk.

Hvis separat rapport behøves, er den et nytt dokument med egen hash og
fysiske sider. Bare den nye rapporten analyseres; salgsoppgaven analyseres
ikke på nytt. Den bruker **den nye versjonerte importgrensen med rapportrolle**
og samme 200-sidersprofil, ikke legacy `/api/analysis` med 30-sidersschema.
Legacy-ruten blir fortsatt tilgjengelig for sin tidligere rapportflyt.
Rapportens eiendomsidentitet sammenlignes med salgsoppgaven;
ukjent/motstridende tilhørighet blokkerer bruk til den er kontrollert.

## Ressurs-, personvern- og kostnadsgrenser

Foreslått første støtteprofil etter D1: maks 200 fysiske sider per fil,
fortsatt maks 50 MiB per fil og maks 50 MiB samlet for beholdt salgsoppgave
og separat rapport i én vurdering. Tidligere original frigjøres ved bytte.
Ingen automatisk splitting, diskspooling eller stille avkorting. Behold
1 MiB requestmetadata og én aktiv behandling per økt; foreslått også én
aktiv PDF-prosess totalt for den lokale enkeltbrukerappen.

Behold samlet hard lokalfrist 60 s og hard live-frist 120 s. Innfør begrenset
tekstoppsamling: foreslått 128 KiB per side og 1 MiB samlet UTF-8-tekst,
8 MiB mottatt leverandørsvar. Overgrense gir synlig ufullstendighet/feil
før videre behandling; ikke bare avkortet tekst med `completed`.
Foreslått foreldreovervåket RSS-stopp ved 512 MiB i PDF-barnet og en
V8-heapgrense i barnet. RSS-overvåking er best effort, ingen hard OS-garanti
mot en kort allokeringsspiss eller native minne. Sidetall/bytes/frist/tekst
gir supplerende vern. Eksakt heapverdi og måleatferd skal verifiseres i 6.1.

AI-input må telles med modelltilpasset lokalt tokenizergrunnlag før live:
foreslått maks 100 000 inputtokens inklusive prompt/schema/metadata og
16 000 outputtokens inklusive reasoning. Mangel på pålitelig teller, ukjent
modell/pris, overskredet budsjett eller ukomplett svar blokkerer live;
ingen `characters/4`, automatisk chunking, retry eller modellbytte.
Disse tokenverdiene er forslag, ikke garanti for at enhver 200-siders PDF
kan analyseres. Lang tekst kan avvises selv om PDF-grensen er oppfylt.

Datert kostnadsgrunnlag og formel står i endringsforslaget. **Ingen betalte
API-kall er autorisert nå**, heller ikke token-count-endepunkt. Ny live-gate
er stengt som standard selv om eksisterende rapportmodus er live. Senere
aktivering krever ny kostnadsautorisasjon, leverandørens databehandling og
faktisk prosjektkapasitet. `store:false` alene er ingen nullagringsgaranti.

PDF-tekst er ubetrodd data, aldri instrukser. Ingen URL-/fil-/verktøyhandlinger
fra dokumentet. Nøkler og dokumenter blir i backendgrensen; ikke logg bytes,
tekst, filnavn med persondata, rå parserfeil eller leverandørsvar. Bare
innholdsløse måledata ved behov. Syntetiske originaler kan versjoneres;
reelle kundedokumenter skal verken lagres eller committes. Frigjør kopier,
timere, lyttere og parser/worker i backend ved alle terminalgrener, også
suksess. Frontend beholder nødvendige originaler, tekstbelegg og gjeldende
uttrekk under aktiv kontroll; visningsressurser frigjøres når visningen
avsluttes, og selve vurderingsgrunnlaget ved filbytte/ny vurdering/øktslutt.
Backend-cleanup skal ikke fjerne brukerens aktive kildegrunnlag i frontend.

## Akseptansekriterier og verifikasjon

Alle SO-AC nedenfor er **planlagte og ikke bestått** i denne økten.

| ID | Gitt / når | Krav til observerbart utfall |
| --- | --- | --- |
| SO-AC1 | Ny salgsoppgave lastes opp før finansregistrering | Dokumentlesing starter ved eksplisitt opplasting/importhandling uten krav om komplette P/L/D/J/Ymin. Import setter ingen bekreftelser. |
| SO-AC2 | 30/31/50/100/150/200/201 sider; 50 MiB og +1 byte | Ny profil tillater innen grensen, avviser overgrense før AI. Separat rapport på 31/200/201 prøves ved den nye grensen. Legacy 30/31 oppfører seg uendret. Samlet filbudsjett prøves også ved separat rapport/bytte. |
| SO-AC3 | Foto, rasterrapport, digital bunntekst over raster, blankside, parserfeil | Lesbarhet per fysisk side beholdes. Ulest økonomi gir deluttrekk; uleselig rapport gir sperret teknisk grunnlag. Rastertekst hevdes aldri lest. Ingen OCR. |
| SO-AC4 | Integrert, vedlagt, manglende, flere eller delvis rapport | Rapportdekning er eksplisitt. PDF-vedlegg oppdages og bes lastet opp separat i første leveranse. Vedleggsmetadata/tom TG-liste er aldri bevis for analysert vedlegg. Uklarhet/gap blokkerer komplett rapport. |
| SO-AC5 | Fysisk side 10 / trykt side 6; separat fil side 3 / trykt 1 | Opphav og originalvisning går til riktig **fil og fysisk side**. Feil hash, område eller ikke-eksisterende utdrag avvises/usikkerhetsmerkes. Ingen global sideforskyvning. |
| SO-AC6 | Samme takfunn i sammendrag og rapport; to ulike bad med lik beskrivelse | Ett forhold har ett aktivt funn med flere belegg. To ulike forhold beholdes. Uavklart sammenslåing/motstrid gir usikkerhet, ikke automatisk sletting eller dobbelregistrering. |
| SO-AC7 | Pris 3 000 000, gjeld 200 000, omkostninger 75 000, total 3 275 000 | P-forslag er 3 200 000, kontantbehov 3 075 000. Prisantydning merkes som dokumentets prisgrunnlag, ikke faktisk avtalt kjøpesum. Uavstemt total eller ukjent gjeld gir ikke komplett P-forslag. |
| SO-AC8 | Dokumentavgift 75 000 inngår i omkostninger; ukjent avgift/eierform | Ingen ekstra påslag av samme avgift. Ingen automatisk avgiftsberegning fra eierform/prosentsats. Eierform påvirker etikett/relevans og konfliktkontroll; fravær blir ikke 0. Prøv eierseksjon, borettslag og ukjent. |
| SO-AC9 | Felleskostnad 5 000/mnd, herav gjeld 1 000/mnd; to separate 6 000/år i 2026 | Kjent driftssubtotal er 60 000/år; fellesbetaling 12 000/år. Full D forblir ukjent uten komplett bekreftet innhold. Gjeld teller bare i J. Ukjent inkludering, gjeldsdel, periode eller år hindrer full D/J. |
| SO-AC10 | Blank/motstridende/estimert verdi; opprinnelig tekst/kilde | Felt er ukjent/konflikt med alle belegg; ingen leie-/drifts-/oppussingsestimat. Oppgitte estimater skilles fra fakta og brukes ikke automatisk som faktiske verdier. Ingen automatisk lov-/avgiftstolkning. |
| SO-AC11 | Entydige importfelt; bruker retter og endrer finansiering | Importverdier vises automatisk ubekreftet. Bare nødvendige mangler etterspørres. Egenkapital-slider/tallfelt, rente og nedbetalingstid beholdes; manuell retting overskrives ikke. Nye verdier trenger relevant kontroll. |
| SO-AC12 | Ny fil, sen retur, samme hash, modus/versjon, finans-/funn-/TG3-endring | Generasjons-/hashvern og duplikatsperre hindrer gamle svar og ekstra AI. Gjenbruk krever gyldig full kontekst. Ny salgsoppgavehash tømmer gammel økonomi/finansiering/rettinger/bekreftelser. Separat rapportbytte bevarer økonomi, men feil/ukjent eiendomsidentitet blokkerer teknisk bruk. Ingen stille overføring av TG3-avklaring. |
| SO-AC13 | Timeout, minne-/tekst-/token-/responsgrense og klientavbrudd | Faktisk stans/cleanup, ingen sen suksess, ingen retry; aktiv lås beholdes til cleanup. Ingen private dokumenter eller rå feil i logg/statisk server. |
| SO-AC14 | Nett og nøkkel fjernet; live-modus feilkonfigurert | Ny syntetisk demo gir alle tre eksisterende anbefalinger gjennom faktisk kontrollflyt uten klient/nett. Ny salgsoppgave-live-gate kan ikke omgås via gammel ANALYSIS_MODE. |
| SO-AC15 | Komplett eller mangelfullt grunnlag etter kontroll | Eksisterende finans/terskler/screening og regelprioritet brukes uendret. Fasit for alle tre utfall og mangler består. Historiske S5/S6-bevis endres ikke og brukes ikke som bevis for denne utvidelsen. |

Fasitregning for SO-AC9: 12 × (5 000 − 1 000) + 6 000 + 6 000 = 60 000.
Dette er dokumenterte delposter, **ikke** et estimat eller påstand om full D.
L/Ymin, renteforutsetninger og manglende full drift må fortsatt komme fra brukeren.

## Foreslått gjennomføring og kravspor

| Ny story | Leveranse | Forutsetning / AC / eksisterende krav |
| --- | --- | --- |
| 6.1 | Versjonert dokumentimport, ressursprofil, kilde-/dekningstyper | D1–D3 godkjent; SO-AC2–5/13; FR-6/8/9, AD-3–6/9 |
| 6.2 | Kildebundet økonomi, gjenbrukt mapping og deterministisk normalisering | 6.1; SO-AC7–10; FR-1–3, AD-7 |
| 6.3 | Rapportområder, delt TG-uttrekk, kildebelegg og duplikatvern | 6.1; SO-AC3–6/12; FR-5–11, AD-2–6/8 |
| 6.4 | Minimal opplastingsflyt, automatisk utfylling, finansiering og demo | 6.2/6.3; SO-AC1/11/12/14; FR-4/15/18, NFR-2–4 |
| 6.5 | Uavhengig review, samlet regresjon og ny leveringsdokumentasjon | 6.4; alle SO-AC, særlig 13–15; AD-10, S1/S3/S4 |

Ingen av 6.1–6.5 er startet eller ført som ferdige i sprintregisteret.
Bruk `bmad-build` etter produktavklaringen; den skal lese denne specen,
endringsforslaget og gjeldende instruksjoner. Live-evaluering er egen senere
bestilling. Ingen gjenåpning av gammel S5-måling eller endring av S6-kandidat.

Eksisterende testfiler gjenbrukes som regresjon. Utvid PDF-/HTTP-/reducer- og
E2E-dekning ved samme grenser med de nye syntetiske dokumentene. Testfasit
skal være uavhengig av AI-/adapterretur. Full ny UI-flyt er ikke testet ennå.
