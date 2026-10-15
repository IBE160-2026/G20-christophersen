# Sluttkontroll — arkitektur v1

Ferdigstilt 2026-10-15. [ARCHITECTURE-SPINE.md](ARCHITECTURE-SPINE.md) har status `final`, ti stabile beslutnings-ID-er og spor fra godkjente krav til modulansvar og planlagt verifikasjon. [Beslutningsloggen](.memlog.md) bevarer valg, begrunnelser, kildearbeid og gjennomganger.

## Låste brukervalg

| Valg | Plass i arkitekturen |
| --- | --- |
| Q-1: React, TypeScript, Vite og liten Node/Express-backend | AD-1, AD-9, Stack |
| Q-2: Nettleseren eier aktiv vurdering; rene finans-/regelmoduler | AD-1, AD-2, AD-7, AD-8 |
| Q-3: Lokalt sidemerket PDF-uttrekk før ett KI-kall | AD-3, AD-4 |
| Q-4: Samme dokumentpipeline og kontrakter for demo/live | AD-4, AD-6 |
| Q-5: Desimalstrenger, modent bibliotek og eksakt terskelsammenligning | AD-7, AD-8 |
| Q-6: Bygget frontend og API fra én lokal Express-server | AD-9 |
| Q-7: Ett ventende HTTP-kall, duplikatvern og avvisning av gamle svar | AD-4, AD-5 |

## Uavhengige gjennomganger

Fem kildeavstemminger dekket [Brief](reviews/reconcile-brief.md), [PRD](reviews/reconcile-prd.md), [final UX](reviews/reconcile-ux.md), [faglærerens tilbakemelding](reviews/reconcile-feedback.md) og [hele sensorveiledningen](reviews/reconcile-course.md). Tre lave presiseringsfunn ble innarbeidet: kostnadsgrunnlaget i finans, ny enkeltfunnbekreftelse etter brukt korrigering og synlig ubrukt utkast på Resultat. Ingen kildekonflikter eller blokkeringer gjenstår.

Reviewer Gate omfattet [arkitekturrubrikk](reviews/review-rubric.md), [teknologigrunnlag](reviews/review-technology.md) og [konsistens mellom modulgrenser](reviews/review-seams.md). Ett lavt teknologifunn og ett middels konsistensfunn ble lukket:

- Node-uttrekk bruker PDF.js legacy-build; frontend bruker browser-build og lokalt bundlet worker med samsvarende versjon. [Etterkontroll bestått](reviews/recheck-technology.md).
- En TG3-avklaring gjelder det konkrete rapportforholdet og registrerte grunnlaget. En stabil funn-ID overfører ikke avklaringen til et annet teknisk forhold. Felles inputvalidering eier anvendbarheten; retting av samme forhold kan bevare avklaringen. [Etterkontroll bestått](reviews/recheck-seams.md).

Alle rapporter bevares med opprinnelige funn. Lukkingene er ført i beslutningsloggen og samme AD-ID-er.

## Dokumentkontroll og avgrensning

[Maskinlesbar sluttkontroll](.working/sluttkontroll-data.json) registrerer ni eksisterende kildereferanser, 30 kravbindinger, ti komplette AD-er, to Mermaid-diagrammer og kontroll av lokale lenker. [Spine-linteren](.working/lint-spine.json) har null funn. Diagrammenes struktur er gjennomgått; de er ikke visuelt rendret i denne kjøringen.

SHA-256-kontroll mot [inntaksgrunnlaget](.working/kildeintegritet.json) viser at alle tolv oppstrømsfiler er uendret. Godkjente produktkrav, v1-scope, finansregler, screeninglogikk og UX-beslutninger er bevart. [Teknologinotatet](.working/teknologigrunnlag.md) dokumenterer primærkilder og skiller teknisk egnethet fra faktisk installasjon.

Leverandør, modell, budsjett og konkrete timeouter avklares før live-integrasjonen. Detaljert PDF-lesbarhetskontroll, kontraktfelt og kjørekommandoer har eiere og avklaringspunkter i `Deferred`. Ingen epics, stories eller implementering er startet. Produktkode, installasjon, applikasjonstester, ren lokal kjøring og live KI-kvalitet/-tid er ikke verifisert gjennom denne dokumentleveransen.
