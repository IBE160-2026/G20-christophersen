# Story 2.8 — egenverifikasjon og sporbarhet

Dato: 2026-10-21. Baseline: `fee2f76e5e94745cc1df43a45ae103cf633981c0`.
Story/sprint er **review**, implementeringsspec er **in-review**.
Full uavhengig BMAD-review skal utføres av en ny agent før done og før 2.9.
Dette dokumenterer implementeringens egne kontroller.

## AC og faktisk bevis

| AC / autoritativt spor | Implementering og kjørt bevis |
|---|---|
| AC1; FR-8/10/11, AD-2 | Ren Bekreft binder kontroll til enkeltfunnets revisjon. Grad, beskrivelse, kilde og originalt analyseutfall er uendret. Synlig status og dokument/fysisk PDF-side. UI forklarer at dette verken bekrefter listen eller avklarer TG3. Unit og tastaturbasert bygget-app-prøve består. |
| AC2; final EXPERIENCE finding-edit/origin-detail | Eget rått utkast ligger ved siden av brukt korrigering og original. Utkast påvirker ikke gjeldende-funnselektor, revisjoner eller bekreftelser. Bevares ved funnbytte, trinnretur via begge tidligere trinn, PDF-panellukking og Esc. Feltgruppe merket «Redigert utkast — ikke brukt». Rene overganger og faktisk browserretur består. |
| AC3; SPEC Endring og gyldighet | Eksplisitt Bruk korrigering validerer først. Brukt representasjon bindes til samme findingId, gjeldende hash/dokument og gyldig fysisk side. listRevision øker; enkeltfunn-/listebekreftelse fjernes. Valgt PDF-side følger brukt korrigering. Originalen beholdes med identisk innhold/referanse, og ett analyse-POST gjennom hele forløpet er bevist. |
| AC4; RT-11/FR-9/10 | Avbryt fjerner bare utkast/feil og beholder tidligere brukt retting, kontrollstatus og revisjoner. Manglende grad, blank beskrivelse og ugyldig side gir konkrete feltfeil med aria-invalid/feilbeskrivelse og fokus til første feil. Ukjent kilde/side/grad gjettes ikke; usikkert funn kan først kontrolleres etter gyldig bruk. Ugyldig rapportidentitet avvises av domeneskjemaet. |

`tests/unit/finding-control.test.ts` har 16 nye prøver, inkludert åtte
ugyldige sider (tom, null, negativ, utenfor dokumentet, desimal, ord,
eksponent og usikkert stort heltall). Relevante eksisterende rapportprøver
gir sammen 44/44 målrettede unit-tester. Gammelt generasjonsgrunnlag,
ukjent findingId og rapportbytte kan ikke gjenbruke tidligere kontroll.

Gjeldende-funnselektoren inkluderer gyldig brukt korrigering av en tidligere
usikker kandidat; tidligere strukturelle kandidatfeil er fortsatt lesbare i
originalen. Rapportens øvrige begrensninger består som mangler. Dokument- eller
analysefeil blir aldri completed av kontroll/korrigering.

## Uavhengig RT-11-original

`tests/fixtures/finding-control/expected.json` er håndskrevet fasit før
adapter/generator: faktisk TG2 «Slitt takoverflate» på fysisk side 5;
side 4 har ingen grad. En annen TG2 på side 2 tillater faktisk funnbytte.
Den deterministiske PDF-generatoren leser verken fasit eller kontrollsvar.
Kontrolladapteren gir bevisst feil TG3/tak på side 4. Bygget-app-prøven
leser faktisk originaltekst på side 4 og 5 før eksplisitt retting.
Uavhengig Apple PDFKit har dessuten lest alle fem fysiske sider og bekreftet
TG2 på side 5 og fravær av teknisk grad på side 4.

## Funn og rettinger under implementering

- Gjeldende brukt versjon må brukes også til valgt funnoppsummering og kilde;
  Bruk oppdaterer fysisk PDF-side for valgt funn.
- Ukjent grad/side fra usikkert uttrekk kan ikke få en standard TG2 eller side 1.
  Tomme felt og eksplisitt kildekorrigering brukes i stedet.
- Fokus går til grad ved ny redigering, første ugyldige felt ved feil, og
  tilbake til Korriger etter Bruk/Avbryt. Utkast beholdes gjennom panel-Esc.
- Originale kandidatfeil beholdes som opphav, men tidligere strukturelle
  mangler skal ikke fortsette som gjeldende kandidatmangel etter gyldig brukt
  korrigering. Rapportbegrensninger beholdes.

Ingen ny produkt-/arkitekturavgjørelse var nødvendig. Ingen avvisningshandling,
TG3-avklaring, listebekreftelseshandling eller Epic 3-resultat er implementert.
Listebekreftelsesrevisjonen er bare forberedt som null og invalidert ved Bruk;
ingen brukerhandling kan sette den i Story 2.8. Unitprøven bruker en konstruert
tidligere bekreftelse for å verifisere selve ugyldiggjøringen direkte.

## Kjørte kontroller

Se [rå kontrollogg](story-2-8-kontroller.txt):

| Kontroll | Resultat |
|---|---|
| Full Vitest | 521/521, 20 filer |
| Full bygget-app-E2E | 72/72 |
| Full dev-E2E | 3/3 |
| Målrettet ny E2E etter siste testjustering | 3/3; inkluderer 320 px uten vannrett arbeidsflateoverflow |
| Typecheck / lint / build | Bestått |
| Diff whitespace | Bestått |

Første E2E-forsøk fant miljøbegrenset loopback og feil standardplassering av
nettleserbinær. Deretter bruktes eksplisitt lokal servertilgang og allerede
installert Chromium fra `/private/tmp/ibe160-story-1-2-browsers`; ingen ny
produktavhengighet eller konfigurasjonsendring var nødvendig. Vite har samme
informative størrelsesmelding for PDF.js-bundlen som før.

Agentutført faktisk tastatur-/browserkontroll og visuell inspeksjon:
[original/gjeldende/PDF 1440 px](story-2-8-original-current.png) og
[ugyldig utkast/fokus 320 px](story-2-8-draft-320.png). Smalt panel prøves ved
850 px. Dette er ikke en ekstern brukertest eller bevis på live-KI-kvalitet.

Sporbar prosess: [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-2-8.md).
