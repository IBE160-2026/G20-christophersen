# Sluttkontroll — BMAD spec

Ferdigstilt 2026-10-15 for Property Acquisition Agent. [SPEC.md](SPEC.md) har åtte stabile kapabiliteter, tre nye innholdskompanjonger og sju adopterte kildedokumenter. Begge Self-Validate-pass er bestått; ingen reell produkt-/arkitekturbeslutning blokkerer spec. Dette er dokumentkontroll, ikke bevis for et implementert produkt.

## Leveranse og autoritet

- [grensekontrakter.md](grensekontrakter.md) samler eksisterende data-/modulgrenser, finans, screening, analyseforløp og endring→gyldighet.
- [sporbarhet.md](sporbarhet.md) binder UJ-1, FR-1–FR-18, NFR-1–NFR-5 og S1–S6 til CAP, Brief, UX, AD og eksisterende testfasit.
- [verifikasjon-og-avklaringer.md](verifikasjon-og-avklaringer.md) bevarer akseptansemål, testgrenser, kurs-/faglærerføringer og alle eksisterende Deferred med eiere og avklaringspunkter.

Brief/addendum, PRD/addendum, DESIGN, EXPERIENCE og final ARCHITECTURE-SPINE er obligatoriske adopterte kompanjonger i SPEC-frontmatter. De eier fortsatt detaljkrav, fasit, tokens og arkitektur; ingen konkurrerende versjoner er produsert. AD-1–AD-10 er uendret, sammen med kildekonteksten til PRDs Q-1, arkitekturens Q-1–Q-7 og UX A/B, UX-C og A1–A5.

## Pass 1 — koherens

Spec Law 1–6 og 8 er gjennomgått: hver CAP har intent og observerbar success; intensjonene beskriver brukerens evne, mens teknisk gjennomføring ligger i kompanjongene. Constraints utelukker konkrete alternativer; non-goals er eksplisitte, og suksess kan demonstreres mot F1–F4 og S1–S6. ID-er er unike og bevares på senere kjøringer. Ingen nye antakelser eller skjulte produktvalg er brukt for å fylle hull.

Særlig kontrollert: mangler før økonomiske terskler, alle utløsere på avgjørende nivå, eksakt likhet/avrunding, delberegning kontra tilstrekkelig screening, gyldig tomliste kontra feil, original/utkast/gjeldende korrigering og separat TG3-avklaring. Ubrukt utkast påvirker ikke screening; brukt korrigering krever ny kontroll. TG3-avklaring gjelder rapportforholdet og ikke bare funn-ID. Gamle/sene svar og historisk resultat kan ikke bli gjeldende grunnlag.

**Verdikt: Bestått.** Gjennomføringsvalgene i arkitekturens Deferred er videreført med samme eiere/triggere og er ikke feilaktig erklært avgjort.

## Pass 2 — bevaring

Beslutningsbærende innhold er gjennomgått mot kildene. Syv fulltekstadopsjoner bevarer råkrav, eksempler, fasit, UX-tokens/tilstander og arkitekturregler også når de ikke gjentas i kernel. [Kildeindeksen](.working/bevaringskontroll-data.json) viser 118 innholdsoverskrifter med landingsdokument og kildelinjer. Den supplerer kildeavstemmingen nedenfor.

| Kildegruppe | Bevaringsvurdering |
|---|---|
| Brief/addendum | Problem, primærbruker, differensiering som hypotese, låst v1, finans/kritisk grunnlag/anbefaling, F1–F4 og varianter, S1–S6, demo/kostnader/personvern og visjon utenfor v1 er bevart. |
| PRD/addendum | Alle 30 kravbindinger har egne sporbarhetsrader; alle FR-akseptansekriterier, NFR/S, K1–K3, sju FR-5-eksempler, RT-1–RT-19, BT-1–BT-18, AT-1–AT-20, TT-1–TT-9 og hele S5-protokollen er adoptert. |
| Final UX | Alle tokens og 26 komponentpar, fire flater/forløp, lokale feil/mangelutfall, original-PDF, utkast/Bruk/Avbryt, TG3, historisk resultat, detaljåpning, fokus/status/tastatur, kontrast og desktop-/zoom-panel er adoptert uendret. |
| Final arkitektur | Alle ti AD-er, stakkpins/structural seed, diagrammer, felles kontrakt/identitet, HTTP-/duplikat-/gamlesvarvern, finanspresisjon, tilstandseierskap, demo/live, lokal levering og Deferred er adoptert. Ingen ny implementeringsbeslutning erstatter dem. |
| Faglærer/oppfølging | Smal sekvensiell kjerne, deterministisk finans med fasit, kilder/usikkerhet, egne skisser, BMAD-/Claude Code-gjennomføringsløp, tid til testing/retting/README, kostnadskontroll og kjørbar demo er bevart som produkt-/prosessføringer. Tilbakemeldingens historiske kritikk gjeninnfører ikke det forkastede brede MVP-et. |
| Hele sensorveiledningen | Original PDF lest side 1–7 med PDFKit. Prosess-/plan–kode-spor, kvalitetssikring, faktisk funksjon/stabilitet, UX, arkitektursamsvar, README-basert kjøring og reporyddighet er innarbeidet uten å oppfinne ekstra produktkrav. [Tekstuttrekket](.working/sensorveiledning.txt) dokumenterer lesingen. |

Ingen reell kildekonflikt gjenstår. PRDs alle eksplisitte TG2/TG3 presiserer eldre brieftekst; final UX konkretiserer originaltilgang; fire skjermtrinn realiserer tre faglige steg; senere final arkitektur avgjør UX-tekstens historiske «stakk ikke valgt». Disse forholdene er ikke brukt som anledning til å endre krav.

**Wrapper-only content:** Oppstrøms ferdighetsseremoni, verktøy-/sesjonsmetadata, historiske avventer/arbeidsstatus, tidligere arbeidsrekkefølge, erstattet tallfasit og sensors karaktertabell/eksempelberegning/interne vurderingsrekkefølge overføres ikke som produktkrav. Historikken er bevart urørt. Sensorens vekting er vurderingsramme; kompleksitetseksempler oppretter ingen nye roller, database eller integrasjoner. Det er ikke utledet testdekningsprosent, sertifisering eller ny tidsgrense.

**Verdikt: Bestått.** Produktkrav, v1-scope, finansregler, anbefalingslogikk, godkjent UX og final arkitektur er bevart.

## Mekanisk kontroll og prosesspor

[Kontrollscriptet](.working/kontroller-spec.py) og [resultatet](.working/sluttkontroll-data.json) registrerer åtte komplette CAP-er, ti kompanjonger, to absorberte kilder, 30 kravrader, ti AD-ID-er, 66 adopterte RT/BT/AT/TT-eksempler og fungerende kontrollerte lokale lenker/ankre. Scriptet kontrollerer dokumentstruktur og referanser; semantisk kildevurdering er utført i de to passene ovenfor.

[Inntakets SHA-256](.working/kildeintegritet.json) stemmer fortsatt for alle ti kontrollerte autoritative filer. Git-status viser nye spec-/prosessfiler og ingen endringer i oppstrømsdokumentene. Validatorens første falske manglende-test-ID-funn skyldtes regex og ble rettet i kontrollscriptet; kildene trengte ingen retting.

Bestilling og viktige styringspunkter er bevart i den [hook-genererte promptloggen](../../process/prompts/session-01a13ecc-bfd7-71f0-b91f-0006e4376999.jsonl). [.memlog.md](.memlog.md) har kildearv, CAP-tildeling, begrunnelser, avgrensninger, verktøyavvik og kontrollverdikter som append-only prosesspor. Ingen kilde-/produktkrav er endret for å gjøre dokumentkontrollen grønn.

Ingen epics, stories, produktkode, testfixtures, pakkeinstallasjon, applikasjonstester eller live-kall er startet. Modell/budsjett, ressurstimeouter, detaljert PDF-lesbarhet, kodeschemas og faktiske bevis er fortsatt videre arbeid ved de eksisterende avklaringspunktene. Spesifikasjonen er ferdig kontrollert som grunnlag for neste BMAD-fase; ingen neste workflow er startet.
