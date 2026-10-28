---
id: SPEC-IBE160
created: 2026-10-15
companions:
  - grensekontrakter.md
  - sporbarhet.md
  - verifikasjon-og-avklaringer.md
  - ../../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md
  - ../../planning-artifacts/r3-http-ressurser-semester-v1.md
  - ../../planning-artifacts/r1-live-ki-semester-v1.md
  - ../../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md
  - ../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md
  - ../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md
  - ../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md
  - ../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md
sources:
  - ../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md
  - ../../reference/course/Sensorveiledning-IBE160-Del-1.pdf
---

# Property Acquisition Agent — spesifikasjon for v1

Denne SPEC-en og alle filene i `companions:` utgjør den samlede kontrakten som neste BMAD-fase skal lese. SPEC er destillert fra beslutningsloggen med siterte kilder; de adopterte dokumentene beholder eierskapet til krav, UX og arkitektur. Final ARCHITECTURE-SPINE er en obligatorisk kompanjong med stabile AD-1–AD-10; R2-kompanjongen konkretiserer den utsatte lesbarhetsregelen 2026-10-20.

## Prioritert tillegg 2026-10-28

Brukerbestilt FINN-retning og avgrenset unntak fra tidligere non-goals er registrert i
[FINN-1 med tilgangsport, design og FI-AC1–FI-AC6](../../implementation-artifacts/finn-import-checkpoint-2026-10-28.md).
Dette er betinget videreutvikling, ikke levert import eller endret historisk akseptanse.
Eksisterende finansformler, S5-W1 og frosset S6-kandidat beholdes.

Brukeren godkjente samme dag [FINN-1-implementeringsspecen](../../implementation-artifacts/spec-finn-import.md):
separat importgrunnlag/adapter, brukerkontroll og egenkapital/låneforslag med
deaktivert produksjonsrute. Offline implementering er autorisert; live-aktivering
og nye betalte forsøk krever fortsatt eget grunnlag. Ingen historisk storyakseptanse endres.

Den godkjente deaktiverte leveransen er nå implementert og kontrollert med
[uavhengig review, AC-spor og offline regresjon](../../implementation-artifacts/finn-import-2026-10-28/sluttverifikasjon.md).
Dette dokumenterer implementeringen, uten å lukke live-aktiveringsporten.

## Why

En privat eiendomsinvestor i Norge trenger å førstevurdere ett allerede funnet boligutleieobjekt og forstå om neste handling er å forkaste, innhente informasjon eller undersøke videre. Kontrollerbare TG2/TG3-funn, bekreftede tall og faste regler skal redusere sammenstillingsarbeid og gjøre usikkerhet synlig. Tidsgevinst er et evalueringsmål; investoren tar selv investeringsbeslutningen.

## Capabilities

- **CAP-1**
  - **intent:** Investoren kan registrere og bekrefte finansgrunnlaget med kilder, forutsetninger og kostnadsinnhold for ett objekt.
  - **success:** P/L/D/J/Ymin har kontrollerbart og bekreftet grunnlag; år/måned normaliseres riktig, blank og null skilles, og ugyldige verdier eller uløste konflikter vises ved berørt felt. FR-1–FR-4.
- **CAP-2**
  - **intent:** Investoren kan analysere én støttet tilstandsrapport og se alle eksplisitte TG2/TG3 med kilde og eventuell usikkerhet.
  - **success:** En tekstbasert PDF på høyst 30 sider gir grad, kort beskrivelse, dokumentnavn og PDF-side eller eksplisitt usikkerhet; dokument-/analysefeil blir aldri vellykket tomliste. Live bruker ett eksplisitt analysekall. FR-6–FR-9.
- **CAP-3**
  - **intent:** Investoren kan kontrollere, korrigere, avvise og bekrefte rapportfunn uten å miste opprinnelsen.
  - **success:** Valgt funn åpner korrekt originalside med tilgang til hel side og nabosider; original, utkast, brukt korrigering og avvisning kan skilles. Brukt korrigering krever nødvendig ny funn-/listebekreftelse uten nytt KI-kall. FR-8–FR-11; final UX.
- **CAP-4**
  - **intent:** Investoren kan registrere separat avklaring av alvorlige TG3-funn for førstevurderingen.
  - **success:** Avklart krever eksplisitt status, ikke-tom begrunnelse og konkret grunnlag som gjelder riktig rapportforhold; ukjent eller ugyldig er uavklart. Rapportfunn og brukeropphav beholdes uten ekstern verifisering eller automatisk Gå videre. FR-5; AD-2/AD-8.
- **CAP-5**
  - **intent:** Investoren kan etterprøve bruttoyield, NOI, nettoyield og kontantstrøm før skatt.
  - **success:** De fire låste formlene bruker hvert sitt gyldige, bekreftede årsgrunnlag og viser formler/kilder; negative resultater beholdes. Utilstrekkelig input gir konkret ikke-beregnbarhet, og gyldige delberegninger merkes. S1 kontrolleres uten toleransemargin i reglene. FR-12–FR-14.
- **CAP-6**
  - **intent:** Investoren kan forstå én gjeldende screeninganbefaling, alle avgjørende regler og neste handling.
  - **success:** Mangler har prioritet foran økonomiske brudd; ellers gir oppfylte krav Gå videre. Samme grunnlag gir identisk kodebestemt anbefaling, utløsere, begrunnelse og neste handling med etterprøvbart beslutningsgrunnlag. FR-16–FR-18.
- **CAP-7**
  - **intent:** Investoren kan gå tilbake og endre grunnlaget med tydelig skille mellom historisk og gjeldende resultat.
  - **success:** Retur uten endring bevarer kontroll; faktisk endring krever relevant oppdatering og merker siste resultat Utdatert. Uendret rapport gjenbrukes uten KI-kall, ny rapport krever analyse/kontroll, og sene svar fra forlatt/erstattet analyse blir ikke gjeldende. FR-5/FR-6/FR-11/FR-15/FR-18; AD-2/AD-5.
- **CAP-8**
  - **intent:** En annen person kan gjennomføre samme vurderingsflyt lokalt med tydelig merket demo og valgfri live-analyse.
  - **success:** Etter dokumentert installasjon viser rapportbundet lagret uttrekk og aktive beregninger/regler alle tre utfall uten nøkkel, betalt konto eller eksternt nett. Ingen live-fallback eller påstand om live-kvalitet/-tid fra demo. NFR-3/NFR-4; S6.

## Constraints

- Godkjent v1, finans, screening, UX og final arkitektur er låst. CAP-ID-ene supplerer eksisterende UJ-/FR-/NFR-/S-/AD- og test-ID-er. Reell motstrid eller endring krever avklaring med Mads før beslutning; se [sporbarhet](sporbarhet.md).
- NOK og samme år gjelder. P inkluderer eventuell fellesgjeld uten kjøpsomkostninger; D er eierbetalt drift, J renter/avdrag uten dobbelttelling. P > 0; L/D/J/Ymin ≥ 0; null bekreftes eksplisitt. Bare kjent månedsbeløp annualiseres med 12. Detaljer og uendrede formler står i PRD og [grensekontrakter](grensekontrakter.md).
- Prioriteten er kritisk utilstrekkelig grunnlag eller uavklart alvorlig TG3 → **Innhent mer informasjon**; ellers nettoyield < Ymin eller kontantstrøm < 0 → **Forkast**; ellers → **Gå videre**. Likhet godtas; alle utløsere på avgjørende nivå vises. Kode eier beregninger, begrunnelse og neste handling.
- AD-1–AD-10 styrer modulgrenser, React-eid økt, delt kontrakt, sidemerket PDF-uttrekk, ett HTTP-analyseforløp, duplikat-/gamlesvarvern, demo/live og lokal levering. Stakk og versjonspins adopteres fra spine; desimalstrenger og eksakte terskler brukes før separat visningsavrunding.
- R2 skiller readable fra deterministisk bevist blank, som beholder fysisk PDF-side og ikke alene blokkerer analyse. Unreadable/unknown/incomplete blokkerer fullføring med synlige berørte sider; tekstløse fotosider kan avvises konservativt. Ingen OCR/vision, manuell semantisk klassifisering av tekstløse sider eller vilkårlig tegn-/prosentterskel. Se [godkjent R2-regel](../../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md).
- Final DESIGN/EXPERIENCE styrer de fire navngitte trinnene, stepper/status, lokale feil, original-PDF, korrigeringsutkast, TG3, historisk resultat, detaljåpning, tilgjengelighet og grafitt/petrol. Ingen skjult produktutvidelse eller konkurrerende UX-kontrakt innføres.
- [R3 er lukket](../../planning-artifacts/r3-http-ressurser-semester-v1.md) med eksplisitte semester-v1-ressursgrenser og cleanup-livsløp før Story 2.5. Originalbytes/SHA-256, samme demo-/live-kontrakt og frontend-eid midlertidig økt bevares; ingen serverpersistens. Lokal PDF-/demo-frist 60 s er atskilt fra R1s live-frist 120 s og S5s evalueringsmål. Portlukkingen implementerer ingen HTTP-funksjon.
- [R1 er lukket 2026-10-23](../../planning-artifacts/r1-live-ki-semester-v1.md): OpenAI GPT-6.1 Sol/Responses/offisiell JS/TS-SDK, strict Structured Outputs, reasoning low/Standard, ett kall med hele eksisterende PDF.js-tekstgrunnlaget, hard live-frist 120 s og ingen retry. Nøkkel kun i backendmiljø, offline demo uten klient/nøkkel. Datert kapasitet/pris og USD 20 totalt med sekvensielle live-forsøk/budsjettstopp er avklart; faktisk kontogrense kontrolleres før live-test. Ingen Epic 4-implementering eller live-bevis følger av portlukking.
- S1–S6 og eksisterende testfasit er akseptansemål, ikke oppnådde resultater. Utsatte gjennomføringsvalg beholder eier og avklaringspunkt i [verifikasjon og avklaringer](verifikasjon-og-avklaringer.md); ingen produktantakelser brukes til å lukke dem.

## Non-goals

- Sourcing/annonseuthenting, live markedsdata, markedsanalyse, rangering/investeringsscore, DSCR, stresstesting, kapitalbehovsmodell, automatisk låneplan, kostnadsestimater og nye finansielle fratrekk.
- OCR, salgsoppgave eller andre dokumenttyper, juridisk analyse, ny teknisk klassifisering/godkjenning, full due diligence, kjøpsbeslutning, bud eller ekstern kommunikasjon.
- Innlogging, flere roller, samarbeid, varig vurderings-/porteføljehistorikk, hosting og samarbeidende KI-agenter. Langsiktig visjon i brief-addendum gir ingen v1-forpliktelse.
- Denne kjøringen oppretter ikke epics, stories, produktkode, fixtures eller produkttestresultater.

## Success signal

- Investoren kan gjennomføre UJ-1 og etterprøve at F1 gir Gå videre, F2 Forkast og F3/F4 Innhent mer informasjon, med korrekt økonomi, rapportkilde og tydelig usikkerhet. Alle relevante regel-/grenseeksempler og S1–S6 skal dokumenteres etter [verifikasjonskontrakten](verifikasjon-og-avklaringer.md), inklusive separat live-evaluering og ren lokal kjøring.
