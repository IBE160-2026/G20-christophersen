---
title: "Implementation readiness — Property Acquisition Agent"
date: 2026-10-16
status: complete
verdict: CONCERNS
intent: readiness-only
epics: epics.md
approvedStories: 37
acceptanceCriteria: 188
finalValidation: coverage-and-structure-pass
epicsWorkflowClosure: complete
epicsWorkflowClosed: 2026-10-16
implementationStarted: false
lastReadinessUpdate: 2026-10-20
---

# Implementation readiness — Property Acquisition Agent

## Oppfølging av R3 — lukket 2026-10-20

**R3 er lukket som beslutningsport; samlet vurdering er fortsatt CONCERNS.**
[Mads' R3-beslutning](r3-http-ressurser-semester-v1.md) fastsetter én PDF på
maks 50 MiB (`50 * 1024 * 1024` bytes), JSON-/metadata-body på maks 1 MiB
(`1 * 1024 * 1024` bytes), binære PDF-bytes uten base64-JSON, kun in-memory
og ingen serverpersistens. Én aktiv request per session/flyt, ingen retry,
samlet hard 60-sekundersfrist for lokal PDF/demo og deterministisk cleanup
ved normalretur/feil/abort/timeout er vedtatt. Eksisterende duplikatmarkør
beholdes til serverstopp uten PDF/tekst. Live-timeout avgjøres fortsatt ved R1;
S5s medianmål er ingen HTTP-timeout.

Beslutningen fyller eksisterende Deferred og er konsistent med Story 2.5
AC1–AC5, AD-2–AD-6/AD-9/AD-10, SPEC og eksisterende originalhash-/demokontrakt.
Ingen faktisk låst produktregel er endret. HTTP-håndhevelse og testmatrisen
i beslutningen leveres først ved egen bestilling av 2.5, ikke ved portlukking.
1.2 og 2.1–2.4 er done; 2.5 er backlog og ikke startet. Ingen gjenstående
beslutningsblokkering før 2.5 er funnet. R1/R4 er åpne ved sine senere porter;
R2 er også closed. R2-oppfølgingen og readiness-utsagnene fra tidligere økter
nedenfor er historikk; gjeldende story-/portstatus står i sprintregisteret.

## Oppfølging av R2 — lukket 2026-10-20

**R2 er lukket som beslutningsport; samlet vurdering er fortsatt CONCERNS.** [R2-beslutningen](r2-pdf-lesbarhet-semester-v1.md) fastsetter deterministisk PDF.js-ekstraksjon i Node, fysisk side og separate uendrede originalbytes, uten OCR/vision/AI-fallback. Readable krever brukbart tekstlag; bare strukturelt bevist fravær av innhold gir blank, som ikke alene blokkerer. Unreadable/unknown/incomplete blokkerer fullført analyse med alle berørte fysiske sider. Konservativ avvisning av legitime tekstløse fotosider er uttrykkelig godkjent av Mads. Ingen manuell semantisk klassifisering eller vilkårlig tegn-/prosentterskel innføres.

Regelen er konsistent med tekstbasert rapportscope, FR-6/FR-9 og vern mot falsk fullføring: en bevist blank side inneholder ikke ulest rapportinnhold, mens en helt blank PDF fortsatt er ustøttet. Story 2.3 AC3/AC4, AD-3/Deferred og SPEC er presisert uten nye krav-/AC-ID-er eller endret produktkrav. Kontraktversjon 2 skiller blank fra blokkerende statuser. Forhåndsdefinerte PDF-fixtureutfall står i beslutningen; faktiske ekstraksjons-/blankdeteksjonstester gjenstår i 2.3. Ingen slik implementering eller lesbarhetsgodkjenning påstås fra portlukkingen.

Den første oppfølgingen samme dag beholdt R2 åpen med regelforslag; den er erstattet av Mads' nye godkjente regel. R1/R3/R4 er uendret, 2.1/2.2 er done og Story 2.3 er fortsatt backlog. Ingen beslutningsblokkering gjenstår før klargjøring av 2.3 etter egen bestilling. Resten av dokumentet bevarer readiness-kontrollen fra 2026-10-16, inklusive daværende implementeringsstatus; tabellens R2-rad viser nå gjeldende status.

**Vurdering: CONCERNS.** Kravdekningen, storystrukturen og implementeringsrekkefølgen er tilstrekkelig planlagt. Ingen udekkede v1-krav, nye funksjoner uten kilde eller skjulte avhengigheter til senere stories er funnet. Hele planen kan likevel ikke implementeres fortløpende uten avklaringer: eksisterende gjennomføringsporter for PDF-lesbarhet, HTTP-ressurser og valgt live-oppsett må lukkes før berørt arbeid. Faktiske personer og miljø må også være tilgjengelige for måling/kjørbarhetsbevis.

Epic 1 kan være første implementeringsarbeid når Mads senere bestiller kodearbeid. Dette dokumentet starter ingen implementering. Det er heller ikke bevis for fungerende app, beståtte produkttester eller oppnådde S1–S6. Ingen installasjon, appkode, fixtures, produkttest, leverandørkall eller sprint-statusfil er opprettet/kjørt i kontrollen.

## Grunnlag og metode

Kontrollert 2026-10-16 mot alle 37 godkjente stories i [epics.md](epics.md), med både akseptansekriterier, arbeidsgrenser, testkrav og forutsetninger. Kontrollen omfatter BMADs avsluttende epic-/storyvalidering og readiness-gatens spørsmål: Kan en utvikler bygge dette uten å finne på udokumenterte beslutninger?

| Dokumentfamilie | Autoritativt innhold og status |
|---|---|
| Product Brief | [brief](briefs/brief-IBE160-2026-09-15/brief.md), complete, oppdatert 2026-10-08; [addendum](briefs/brief-IBE160-2026-09-15/addendum.md) med F1–F4, formler og fasit. |
| PRD | [PRD](prds/prd-IBE160-2026-10-10/prd.md) og [addendum](prds/prd-IBE160-2026-10-10/addendum.md), final 2026-10-10: 18 FR, fem NFR, S1–S6, K1–K3 og eksisterende testfasit. |
| UX | [DESIGN](ux-designs/ux-IBE160-2026-10-13/DESIGN.md) og [EXPERIENCE](ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), final, oppdatert 2026-10-14: visuell kontrakt og faktisk atferd for fire trinn. |
| Arkitektur | [ARCHITECTURE-SPINE](architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md), final, oppdatert 2026-10-15: AD-1–AD-10, starter/startstakk, modulgrenser og Deferred. |
| SPEC | [SPEC](../specs/spec-IBE160/SPEC.md) fra 2026-10-15 med adopterte kompanjonger: [grensekontrakter](../specs/spec-IBE160/grensekontrakter.md), [sporbarhet](../specs/spec-IBE160/sporbarhet.md) og [verifikasjon/avklaringer](../specs/spec-IBE160/verifikasjon-og-avklaringer.md). SPEC er en samlet kontrakt, ikke bare hovedfilens sammendrag. |
| Faglærer | [Tilbakemelding](briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) lest med [gjeldende oppfølging](briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md); historisk bredt MVP gjeninnføres ikke. |
| Kurs/prosess | [Sensorveiledning, del 1](../reference/course/Sensorveiledning-IBE160-Del-1.pdf), s. 1–7, og [AGENTS.md](../../AGENTS.md). Tidligere prosess-/reconcile-/reviewfiler er historikk og bevis, ikke konkurrerende produktversjoner. |

Inventaret er basert på dokumentinnhold og status, inklusive SPEC under .docs/specs. Konfigurasjonens project_knowledge-peker til en ikke opprettet docs-mappe er ikke et planleggingshull: de eksplisitt autoritative dokumentene finnes i .docs. Ingen PRFAQ eller ekstra dokumenttype kreves når de aktuelle beslutningene allerede er registrert.

Alle 14 låste kildefiler er SHA-256-kontrollert mot [baseline fra kravuttaket](../process/arbeidsokter/2026-10-15-epics-og-stories.md) og er uendret. Alle fem innarbeidede epic-seksjoner er byte-identiske med storytekstene Mads godkjente. Brukerens senere presisering er eksplisitt videreført: live er valgfritt ved kjøring, mens produktets evne til faktisk KI-analyse er påkrevd i v1. Eldre «valgfri live»-formuleringer brukes ikke til å fjerne denne leveransen.

## Resultat av avsluttende BMAD-validering

| Kontroll | Resultat og begrunnelse |
|---|---|
| FR-dekning | Bestått på plannivå: alle FR-1–FR-18 har konkrete funksjonsstories/AC, ikke bare QA-henvisninger. Se matrisen nedenfor. |
| Øvrige kravspor | NFR-1–NFR-5, CAP-1–CAP-8, AD-1–AD-10 og UX-DR1–UX-DR41 er dekket i funksjonsstoryenes Kravspor, også før Epic 5s samlede verifikasjon regnes med. |
| Starter først | 1.1 etablerer offisiell Vite react-ts/startstakk, låsfil/installasjon, konfigurasjon og importgrenser. 1.2 leverer faktisk kjørbar app separat. Den norske tittelen og AC oppfyller starterkravet; eksisterende repo trenger ingen oppdiktet ny kloning. |
| Ingen for stor grunnmodell | Bare nødvendige felt/typer opprettes før første bruk. Ingen database/tabeller, full framtidig modell eller nytt agentrammeverk i oppstarten. |
| Storyformat | 37 fortløpende, unike story-ID-er; alle har Som/vil jeg/slik at, akseptansekriterier i Given/When/Then/And, relevante kravspor, testkrav og forutsetninger. 188 lokalt nummererte AC; ingen uutfylte storymalfelt. |
| Storyavhengigheter | 117 eksplisitte direkte avhengigheter, alle til tidligere stories. Kontrollert som heltallspar, også 2.9/2.10/2.11. Ingen sykluser eller ukjente story-ID-er. Semantisk kontroll av leveranse/testgrense er utført i tillegg til grafkontroll. |
| Selvstendige epics | Epic 1 gir kontrollert Tallgrunnlag; Epic 2 gir rapport-/original-/funnkontroll uten Resultat; Epic 3 gir full demovurdering fra 1/2; Epic 4 gir reell KI og egne evalueringsbevis; Epic 5 gir etterprøvbar mottakerleveranse. Ingen krever en senere epic for sitt beskrevne utfall. |
| Gjentatt berøring av felles kode | Begrunnet: domain, contracts og frontend state utvides for samme vurdering. 1.6s mangellogikk gjenbrukes i 2/3; 3.4 fullfører samme screening; Epic 4 bytter adapter ved samme grense. Det planlegges ingen kastet regelmotor eller separat demo-/live-logikk. Fem epics og to rapportmilepæler er valgt etter eksplisitt vurdering/godkjenning. |
| Scope og kildekonflikt | Ingen uavklart motstrid om produktregler, UX eller arkitektur funnet. Final UX konkretiserer original-PDF utover PRDs minimum, og final arkitektur avgjør historisk «stakk ikke valgt», i samsvar med SPEC. Ingen slik beslutning er åpnet igjen. |

Dette er bestått deknings-/strukturvalidering med de registrerte gjennomføringsportene. Det er ingen ubetinget erklæring om at alle 37 stories kan startes nå. Mads valgte BMADs terminale «C — Complete Workflow» 2026-10-16. Workflowen er avsluttet; readiness-vurderingen og de åpne gjennomføringsportene er uendret, og kodearbeid er ikke autorisert gjennom dette valget.

## Kontroll av FR mot konkret storylogikk

AC-numrene er lokale til storyen. Tabellen angir bærende dekning; fullteksten i PRD og alle storyens øvrige kravspor/testkrav gjelder fortsatt.

| FR | Bærende story/AC | Kontrollert atferd |
|---|---|---|
| FR-1 | 1.3 AC1–3; 1.4 AC2–4; 1.7 AC1 | P/L/D/J/Ymin, riktige definisjoner/enheter, år/måned og synlig årsgrunnlag uten skjulte verdier. |
| FR-2 | 1.5 AC1–5; 3.6 AC3 | Opphav/forutsetninger, kostnadsoverlapp, 120 000 = D 100 000 + J 20 000, uløst kildekonflikt og etterprøvbar visning. |
| FR-3 | 1.4 AC1/AC4; 1.7 AC2–3; 3.1 AC3–4 | Blank/null, ugyldighet og bekreftelse; berørt beregnbarhet og konkrete lokale feil. |
| FR-4 | 1.7 AC1–5; 2.6 AC1 | Eksplisitt kontroll av gjeldende finansgrunnlag, berørt ny bekreftelse og gyldig analysestart. |
| FR-5 | 2.10 AC1–5; 2.11 AC3; 3.4 AC4; 3.9 AC3–4 | Separat status og begge tekster; forholdsbunden anvendbarhet, alle relevante TG3 og korrekt oppdatering uten å fjerne funnet. |
| FR-6 | 2.2 AC1–3; 2.3 AC1–4; 2.4 AC1–3; 2.5 AC1–3; 2.6 AC1–5; 4.2 AC1; 4.3 AC1/AC5; 4.4 AC2 | Støttet PDF, én rapport/ett kall, demoalternativ, ny rapport, gjenbruk, faktisk live-funksjonalitet og vern mot duplikat/gamle svar. |
| FR-7 | 2.1 AC3; 2.6 AC4; 4.2 AC1–3; 4.4 AC1–5 | Alle eksplisitte TG2/TG3, ingen relevansfiltrering/ny grad, kilde og reell original-S2-evaluering før retting. |
| FR-8 | 2.1 AC3–4; 2.7 AC1–5; 3.7 AC2 | Original-PDF på riktig filside, hel side/nabosider/panel og bevart kilde/opphav i resultat. |
| FR-9 | 2.1 AC2–3; 2.3 AC3–4; 2.6 AC2–4; 4.2 AC3–5; 4.3 AC3 | Kandidat/usikkerhet, dokument-/analysefeil, ingen gjettet grad/side eller falsk tomliste/fullføring; prioritet 1 består. |
| FR-10 | 2.8 AC1–4; 2.9 AC1–4; 3.9 AC1–2 | Bekreft/Korriger/Avvis, original/utkast/Bruk/Avbryt, avviste originaler og ingen ny KI ved kontrollendring. |
| FR-11 | 2.11 AC1–4; 3.5 AC2; 3.9 AC2 | Egen bekreftelse av gjeldende liste, ny kontroll ved endring, gyldig tomliste kontra feil og TG3 atskilt. |
| FR-12 | 3.1 AC1–6; 3.6 AC1–3 | Fire eksakte formler, årsnormalisering, negative tall, ingen nye fratrekk og uendrede tall ved rapport-/modus-/TG3-variant. |
| FR-13 | 3.1 AC3–4; 3.4 AC1/AC4; 3.6 AC1–2; 3.7 AC3 | Gyldighet per nøkkeltall; manglende J/Ymin/P=0 riktig behandlet, Ikke beregnbart/Delgrunnlag og informasjonsmanglers prioritet. |
| FR-14 | 3.2 AC1–4; 3.3 AC1–4; 3.6 AC3–4 | Eksakt terskel uten toleranse, likhet/én krone under, separat avrunding og kontrollerbare formler/input/kilder. |
| FR-15 | 3.5 AC2–4; 3.8 AC1–5 | Berørt ny finansbekreftelse, nytt gjeldende resultat, Ymin endrer bare regler og uendret rapport gjenbrukes. |
| FR-16 | 3.2 AC1–4; 3.4 AC1–6 | Én kodeanbefaling med prioritet 1–3, alle avgjørende utløsere, deterministisk utfall og ingen økonomi over mangler. |
| FR-17 | 3.4 AC1–5; 3.3 AC2; 3.7 AC1/AC3 | Fast konkret begrunnelse/neste handling, begge økonomiske brudd, skjult avrundingsbrudd og ingen kjøps-/teknisk godkjenning. |
| FR-18 | 3.5 AC1–6; 3.6 AC1–5; 3.7 AC1–6; 3.8/3.9 | Sammenhengende gjeldende snapshot, komplett tilgjengelig grunnlag, historisk vern, ubrukt utkast og relevante oppdateringsforløp. |

Tekniske forutsetninger som 1.1/1.2 spores til NFR/AD/CAP fremfor en oppdiktet direkte bruker-FR. QA-storyene 5.1–5.5 er bevisst verifikasjon/leveranse, ikke foreldreløse nye produktfunksjoner.

## NFR, UX og SPEC

| Krav | Realisering og kontroll |
|---|---|
| NFR-1 | 1.4/1.6, 2.1/2.5/2.6/2.8–2.11, 3.1–3.5/3.8/3.9 og 4.2/4.3: determinisme, synlige feil, kall-/versjons-/revisjonsvern. 5.1/5.5 etterprøver. |
| NFR-2 | 1.2/1.7, 2.6–2.11, 3.6–3.9 og 4.3 leverer tilgjengelighet ved funksjonen. 5.2 kontrollerer felles UX manuelt; 5.5 inkluderer live-observasjoner fra 4.3. |
| NFR-3 | 1.1/1.2 kjørbart grunnlag, 2.4 lokal demo, 3.7–3.9 full vurdering; 5.3 komplett demo-README, 5.4 faktisk annen-person-S6 og 5.5 endelig live-anvisning. |
| NFR-4 | 1.1/1.2/2.2/2.5/4.1–4.4: lokal nøkkel/datagrense og fiktive data; 5.5 faktisk repo-/historikk-/artefaktkontroll. |
| NFR-5 | 2.6 synlig-liste-hendelse og 2.11 kontrollslutthendelse; 4.5 full reell S5-protokoll/manuell referanse; 5.5 sammenstiller uten å bruke demo som live-bevis. |

| UX-DR-gruppe | Bærende realisering |
|---|---|
| 1–4 | Appskall/navigasjon/handlinger: 1.2/1.7/2.6/3.7/4.3. |
| 5–9 | Tall/periode/opphav/kostnad/bekreftelse: 1.3–1.5/1.7 og 3.6/3.8. |
| 10–13 | Rapport/analysestatus/funn: 2.2–2.7 og 4.2/4.3. |
| 14–19 | Kontroll/korrigering/opphav/PDF/TG3/liste: 2.7–2.11 og 3.9. |
| 20–23 | Anbefaling/nøkkeltall/grunnlagsdetaljer/åpning: 3.3/3.4/3.6/3.7. |
| 24–26 | Lokale feil/status/historisk resultat: 1.6/1.7, 2.6/2.10/2.11, 3.5/3.7–3.9 og 4.3. |
| 27–29 | Tokens/typografi/tallformat: 1.2/2.7 og 3.3/3.6/3.7. |
| 30–35 | Responsive-/panel-/fokus-/tastatur-/kontrastatferd: 1.7/2.6–2.8/3.7 og funksjonsnære manuelle kontroller. |
| 36–41 | Lokale mangler/tilstander/hierarki/språk/flyter: 1.7/2.6–2.11/3.5–3.9/4.3; samlet kontroll i 5.2/5.5. |

CAP-1 realiseres i Epic 1; CAP-2 i 2/4; CAP-3/CAP-4 i 2 med resultat-/returdel i 3; CAP-5/CAP-6 i 3 med tidlig felles mangeldel i 1/2; CAP-7 i økt-/kontroll-/endringsstoryene i 1–3; CAP-8 i lokal kjøring, adaptere og mottakerbevis gjennom 1–5. Ingen SPEC-kapabilitet er bare henvist til en senere test uten funksjonseier.

De ti arbeidsområdene er synlig atskilt: 1.1 grunnstruktur; 1.2 kjørbar app; 1.3–1.7 tall/validering; 2.2 PDF-validering og 2.3 tekstuttrekk; 2.4 demo og 4.1–4.3 live-adapter; 2.8–2.11 funnkontroll; 3.1 finans/3.2 terskler; 3.4 screening; 3.6/3.7 resultat; funksjonsnære feil/tilgjengelighet og 5.1–5.5 samlet testing/sensor-kjørbarhet.

## Avklaringspunkter som gir CONCERNS

Dette er dokumenterte porter, ikke nye produktkrav eller tillatelse til å endre låst v1. De er ikke alle blokkere for første story.

| ID / prioritet | Hvor og hva gjenstår | Ansvarlig / senest før | Hva lukker punktet |
|---|---|---|---|
| R1 — høy for live | Epic 4s gjennomføringsport og 4.1/4.2/4.4: leverandør, eksakt modell/SDK, kontekst/output, pris/budsjett og live-timeouter er ikke valgt her. | Mads + live-integrasjon, før Epic 4 implementeres og før betalte tester. | Dokumentert valgt oppsett med datert pris-/kostnadsgrunnlag, kapasitet for hele støttede rapportgrunnlaget i ett kall, avtalt budsjett og testbare timeout-/retryinnstillinger. Ingen ny leverandørplattform eller hard S5-timeout. |
| R2 — **lukket 2026-10-20** | [Godkjent deterministisk PDF.js-regel](r2-pdf-lesbarhet-semester-v1.md) med konservativ blankdeteksjon, blokkerende unreadable/unknown/incomplete og forventede fixtureutfall. | Dokumentansvar + Mads, før Story 2.3. | Beslutningen er avstemt mot Story 2.3, AD-3/AD-4, SPEC og kontraktversjon 2. PDF-ekstraktor/blankdetektor og faktiske fixturetester er fortsatt 2.3-arbeid, ikke bevis fra portlukkingen. |
| R3 — **lukket 2026-10-20** | [Godkjente upload-/bodygrenser, lokal 60 s-frist og ressurslivsløp](r3-http-ressurser-semester-v1.md); ingen serverpersistens eller retry. | Mads + Backendansvar, før Story 2.5; live-timeout og avstemming mot live forblir R1 før Epic 4. | Verdier, tidlig avvisning, abort-/feil-/timeout-cleanup og beholdt duplikatmarkør er dokumentert og konsistenskontrollert. Håndhevelse og produkttester gjenstår i 2.5; portlukking er ikke implementeringsbevis. 30-sidersscope og S5 bevares. |
| R4 — middels, ekstern | 4.5 og 5.4: faktisk person til menneskelig kontroll/manuell referanse og en annen person/rent miljø til S6 må organiseres. | Mads/evalueringsansvarlig, før de respektive målingene/kjøringene. | Avtalt faktisk gjennomføring og senere reelle måle-/kjørebevis. Agentens egen kjøring eller en utfylt plan er ikke bestått S5/S6. |

R1–R3 finnes allerede i låst arkitektur/SPEC og i de godkjente storyene. Avklaringen skjer innen den registrerte kontrakten; om den krever endring av produktkrav, scope, finans, regler, UX, arkitektur eller grensekontrakt, skal Mads spørres før endring. Readiness-kontrollen har ikke valgt verdier eller endret grunnlaget.

Vanlig implementeringsdetaljering er ikke et nytt produktgap: nødvendige schemas/typer defineres før første bruk i 1.3/1.4/2.1; TG3-binding detaljeres i 2.10 innen registrert samme-forhold/ukjent-tilhørighet-regel; en avgrenset testkomposisjon for 3.6 må bruke de faktiske komponentene uten ny produktskjerm. Ingen senere story er nødvendig for å bestemme disse registrerte grensene.

## Story-størrelse og faktisk gjennomførbarhet

| Epic | Stories / AC | Avgrenset verdi og vurdering |
|---|---|---|
| 1 | 7 / 34 | Kjørbar app og kontrollert tallgrunnlag. Starter/appstart, registrering, ren validering, kilde-/kostnadsgrunnlag, lokal mangellogikk og bekreftelse er atskilt. Ingen finansmotor på forskudd. |
| 2 | 11 / 50 | Kompleks rapportflyt delt i to demonstrerbare milepæler etter 2.7 og 2.11. PDF-format, tekst, adapter, HTTP, klient, visning og kontrollhandlinger har hver sin verifiserbare grense. R2/R3 gjelder. |
| 3 | 9 / 48 | Finans, terskler, format og screening er separate moduler. Snapshotvernet 3.5 kommer før resultatvisning. 3.6 testes ved komponentgrensen før full Resultat-rute; 3.8/3.9 fullfører hver sin oppdateringsintegrasjon. |
| 4 | 5 / 29 | Valgt klient, produksjonsadapter, appintegrasjon, reell S2 og S5 er separate leveranser. R1/R4 og faktisk leverandør-/evalueringsutfall begrenser ubetinget gjennomførbarhet. |
| 5 | 5 / 27 | Regresjon, manuell UX, demo-README, S6 og samlet leveransebevis er atskilt. 5.1–5.4 kan utføres etter Epic 3; 5.5 trenger også 4.3–4.5. Tidlige bevis må gjelde leveranseversjonen. |

Oppdelingen er kvalitativt gjennomførbar med de registrerte portene og eksterne bidragene. Det er ikke grunnlag for å garantere at hver story tar én bestemt kort økt eller at semesterkapasiteten er tilstrekkelig: faktisk tidsbudsjett/kapasitet er ikke oppgitt. 37 er arbeidsenheter innen fem epics, ikke 37 nye produktfunksjoner.

2.2 (faktiske PDF-er/fasit), 2.5 (HTTP/avbrudd/ressurser), 2.7 (renderer/panel/fokus), 3.7/3.9 (samlet resultat/endringer) og 5.5 (sluttkontroll) krever mest oppmerksomhet på arbeidsgrensen. De gjenbruker tidligere moduler og har observerbar avslutning; ingen obligatorisk omgruppering er påvist. Hvis faktisk arbeid avdekker større omfang, bør arbeidsoppgaver brytes videre innen samme story eller storyoppdelingen avklares før mer kodearbeid, uten å endre låst kontrakt. 4.5/5.4 kan ikke gjennomføres av en utviklingsagent alene uten de uttrykkelige menneskelige bidragene.

## Test- og bevisgrenser

| Fasit / kontroll | Planlagt utførelse og grense |
|---|---|
| BT-1–BT-18 / S1 | 1.4 normalisering; 3.1 beregnbarhet/formler, 3.2 eksakte grenser, 3.3 separat format, 3.6/3.8 visning/oppdatering; 5.1/5.5 samlet reell status. Ingen S1-margin i reglene. |
| AT-1–AT-20 / S3 | 1.6/2.6/2.10/2.11 lokal mangelautoritet; 3.4 komplett prioritet/alle utløsere/identisk tekst; 3.5/3.7–3.9 snapshot/UI/retur. F3/umulige hovedreisetilstander testes ved riktig grense. |
| RT-1–RT-19 / S4 | Faktiske bytes i 2.2/2.3; kontrakt/adapter/HTTP/klient i 2.1/2.4–2.6; original/kontroll i 2.7–2.11; live-grenser i 4.2/4.3. RT-16–RT-18s reelle modelltreff er 4.4, ikke bestått fra kontrollsvar. |
| Sju FR-5-eksempler | 2.10/2.11 separat registrering/anvendbarhet/liste; 3.4/3.9 økonomisk effekt/oppdatering, med opprinnelig TG3 beholdt. |
| S2 | 4.4 evaluerer opprinnelig reelt uttrekk mot alle fasitfunn før retting, hvert TG3 og per-rapport feil/oversett/feil side/oppdiktet. All TG3, ≥90 % TG2 med riktig side og ingen oppdiktede i utvalget; ingen generell kvalitetsgaranti. |
| TT-1–TT-9 / S5 | 4.5 utfører hele protokollen. t_start → faktisk synlig t_liste → kontrollert/bekreftet t_bekreftet; separate medianer ≤300/600 s, feil/ufullført/demo separat og faktisk samme-case manuell referanse. |
| Manuell UX / S6 | Funksjonsnær kontroll og 5.2; 5.3 faktisk oppskrift og 5.4 en annen persons rene kjøring. Browserressurser kan installeres med nett før selve offline-demoen. |

Versjonspins/installasjon er kontrakt fra spine, ikke verifisert kjørbart miljø i denne økten. 1.1 må prøve faktisk installasjon/type/lint og rapportere eventuelle inkompatibiliteter uten å bytte pins i stillhet. Faktiske PDF-fixtures/fasit leveres i 2.2 før adapterevaluering. Det er forventet implementeringsarbeid, ikke en påstått eksisterende leveranse eller et manglende produktkrav.

## Anbefalt videre håndtering

Behold de fem godkjente epicene og 37 storyene. Bruk 1.1 → 1.2 → resten av Epic 1 som første kjede når kodearbeid senere bestilles. Lukk R2 før 2.3, R3 før 2.5 og R1 før Epic 4; organiser R4 før faktisk måling/S6. Dette gir ingen tillatelse til å hoppe over de registrerte portene.

Den bestilte readiness-kontrollen er ferdig med CONCERNS. Mads avsluttet planleggingsworkflowen med dokumenterte forbehold ved C 2026-10-16. Ingen sprintstatus eller implementering er startet ved avslutningen; R1–R4 må fortsatt lukkes ved de oppgitte avklaringspunktene. [Dagens arbeidslogg](../process/arbeidsokter/2026-10-16-epics-validering-og-readiness.md) dokumenterer fremgangsmåte og kontroller.
