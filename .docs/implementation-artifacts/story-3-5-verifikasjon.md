# Story 3.5 — verifikasjon

Dato: 2026-10-21. Autoritet: Story 3.5 AC1–AC6, SPEC CAP-7 og hele Endring og gyldighet i grensekontrakten, AD-2/8 og UX stale-result. Baseline fra Git: `c2faf8f597299210b98b5f8b7d445684dbf232c3`.

## Leveranse og avgrensning

Frontendøkten eier bare siste snapshot. `calculate-result` beregner synkront fra aktivt finans- og rapportgrunnlag gjennom eksisterende `evaluateScreening`; ingen innsendt anbefaling eller gammel beregningsretur kan overtas. Snapshotet har eksakte nøkkeltall/terskler, anbefaling/prioritet/utløsere, originalt uttrekk, brukerkorrigering/avvisning, bekreftelser og separat TG3-avklaring med binding. Kopien er isolert og dypt fryst.

Bindingen inkluderer eksisterende finans-/liste-/TG3-revisjoner og rapportgenerasjon, hash, dokumentnavn, requestId/status/feil. Faktiske finans-, enkeltfunn- og listebekreftelser inngår også. Endring gir navngitt grunn og kontrollbehov ved siden av uendret historisk snapshot. Endringsmarkering beholdes til ny eksplisitt vurdering, også dersom brukeren endrer tilbake til samme verdier/bekreftelser. Nullbekreftelse kan trekkes tilbake uten økt finansrevisjon; dette fanges av bekreftelsesbindingen.

Én økt representerer eksisterende ene objekt. Ny økt starter uten resultat. Ingen lagring, historieoversikt, database, nytt bekreftelsessteg, I/O, resultatkomponent eller ny navigasjon. Story 3.6–3.9 og Epic 4 er ikke implementert. Det siste historiske snapshotet bevares til ny vurdering erstatter det; dette er ikke en samling av eldre vurderinger.

## AC og testspor

`tests/unit/result-snapshot.test.ts` har 57 prøver. F1/F4 bruker uavhengig forhåndsdefinert fasit, faktiske PDF-bytes/hash og ekte registrerings-, analyseutfalls-, kontroll- og bekreftelseshandlinger. Snapshotet produseres av produksjonskoden; forventet anbefaling/tall er ikke ferdiglaget snapshotdata.

| AC / kontraktrad | Testbevis |
|---|---|
| AC1: sammenhengende revisjonsbundet F1 | Fire nøkkeltall, Gå videre, alle tre utløsere, finans-/liste-/funnbekreftelser, rapportnavn/hash/request/generasjon. Historisk kopi tåler mutert aktivt finans-/kilde-/kostnads-/original-/korrigerings-/TG3-grunnlag; mutasjon av snapshotretur avvises. |
| AC2: endret finansgrunnlag | Hvert P/L/D/J/Ymin, hver L/D/J-periode/år, hver kildetype/-beskrivelse/-konflikt, leietype, lagt til/endret/fjernet kostnad og D-periodens delte J-kontekst. Bare berørte bekreftelser oppheves; rapport/uttrekk bevares. |
| AC2/5: Bruk / Avvis | Ny funn-/listekontroll kreves; original og brukerhandling bevares. TG3→TG2 med annen PDF-side, ny korrigering etter bekreftelse og avvist TG3 testes separat. Avvisning oppretter ingen teknisk avklaring. Snapshotdelen av RT-11/12/14 og AT-16. |
| AC3: separat TG3 | Status, begrunnelse og grunnlag gjør historisk uten å nullstille uendrede tall/liste/uttrekk. Gyldig Avklart gir ny prioritet 3; ugyldig/blank avklaring gir prioritet 1. Representasjonsretting av samme forhold kontra annen beskrivelse/side bruker eksisterende FR-5-binding. RT-13 og AT-16. |
| AC4: navigasjon / utkast / Avbryt | Trinnretur, PDF-/funnvalg, zoom, ubrukt utkast, ugyldig Bruk, Avbryt, identiske registreringer og gamle avviste handlinger bevarer gyldighet. Ubrukt utkast er tilgjengelig via selektor og fjernet fra anvendt screeninggrunnlag. |
| AC5: ny korrekt vurdering | AT-16/BT-12: L→1 400 000 gir uberegnbart før bekreftelse, deretter NOI 1 000 000, cash 200 000 og Forkast. BT-13: manglende Ymin→bekreftet 10 gir uendrede fire nøkkeltall og korrekt ny screening. RT-3: rapportobjektet gjenbrukes. |
| AC5: rapportbytte / sent svar | Samme og annen PDF med nullstilte liste-/TG3-tellere gjør historisk ved ny generasjon; ny ukontrollert rapport, avbrutt analyse og gamle/sene feil/svar kan ikke gjenopplive komplett resultat. |
| AC6 | Ny økt er Ikke beregnet uten tall/anbefaling. Ny eksplisitt vurdering erstatter bare siste snapshot. |

## Kjørebevis

Alle endelige kontroller bruker repoets pinnede Node.js 24.21.0/npm 11.19.0. Den første målrettede prøven fant at analysekontrakten allerede fryser KI-originalen; mutasjonsprøven ble tilpasset til først å bevise dette og deretter mutere en separat aktiv kopi. Ingen produksjonsregel ble endret for testforventningen. Se [første prøve](story-3-5-forste-kontroll.txt).

- [Målrettet Vitest](story-3-5-kontroller.txt): 57/57 bestått.
- [Typecheck](story-3-5-typecheck.txt) og [lint](story-3-5-lint.txt): bestått.
- [Første brede Vitest-regresjon](story-3-5-regresjon.txt): 909/910 bestått; eksisterende HTTP-cleanup-prøve traff 5 s-fristen under samtidig E2E-belastning. [Isolert etterkontroll](story-3-5-http-etterkontroll.txt): bestått på 2,65 s. [Sluttregresjon uten samtidig E2E](story-3-5-regresjon-slutt.txt): **910/910 bestått i 27 testfiler**.
- [Bygg og Playwright](story-3-5-e2e.txt): bestått bygg, **89/89 bygget-app og 3/3 dev-E2E**. Eksisterende Vite-varsel om chunkstørrelse er beholdt; ingen ny bundlingbeslutning tas her.

Første bredkjøring traff sandkassens `listen EPERM`, uten testgrunnlag for produktfeil. Lokal servertillatelse ble deretter gitt. Playwright krevde Chromium headless shell 1248, mens maskinens cache hadde 1243; riktig versjon er installert under `/private/tmp/ibe160-story-3-5-browsers` ([installasjonslogg](story-3-5-browser-install.txt)). Det endrer ingen avhengigheter eller konfigurasjon i repoet. Eksisterende demo-/nettverksprøver er regresjonsbevis for RT-15; ingen live KI-kvalitet eller tidsmål hevdes.

Ingen review er startet. Overlevering: spec `in-review`, Story 3.5 `review` og lokal commit uten push. Ingen blockers; de første miljø-/tidsfristfeilene er etterprøvd med grønne sluttkontroller. Story 3.6 og senere står urørt i backlog.
