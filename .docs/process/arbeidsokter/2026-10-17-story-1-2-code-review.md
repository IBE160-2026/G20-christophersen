# KI-arbeidsøkt — code review av Story 1.2 — 2026-10-17

Brukerens bestilling er bevart i
[automatisk promptlogg](../prompts/session-01a14a12-109a-71b2-8a67-63eb0d0c50ff.jsonl).
Den ber om BMAD code review av `6296dfef0f93b69fd29180475732469a7acfd12d`,
selvstendige kontroller, retting bare innen Story 1.2, ny verifikasjon og
`done` i sprintstatus dersom reviewen består. Story 1.3 skal ikke startes.

## Utførelse og styring

`bmad-code-review/SKILL.md` og workflowens fire steg ble lest.
`resolve_customization.py --key workflow` ga fire aktive reviewlag og ingen
aktiveringssteg, ekstra fakta eller sluttinstruks. Storyfilen var allerede
`done`, sprintnøkkelen `review`; reviewen brukte full spec-kontekst.
HEAD var målcommiten. Den eneste eksisterende uversjonerte filen var
sesjonens automatiske promptlogg, som ble beholdt.

Alle dokumentene brukeren anga ble brukt: Story 1.2, final UX, final
arkitektur, SPEC med grensekontrakter/sporbarhet/verifikasjon, epics/stories,
sprintplan og sprintstatus. Kurs-PDF-ens sju sider ble lest med PDFKit,
sammen med faglærerens tilbakemelding og gjeldende oppfølging.

Reviewskillens eksplisitte krav autoriserte uavhengige underagenter.
Blind Hunter, Edge Case Hunter og Verification Gap startet uten
samtalekontekst og leste samme commitdiff i en unik tempmappe. Auditoren
startet da en agentslot ble ledig og fikk story-/plankonteksten. Alle brukte
samme modellnivå og fikk instruks om ingen egne skills/underagenter og ingen
redigering. Reviewerpromptene fulgte workflowens fire konfigurerte lag;
Blind Hunter beregnet 175 209 byte = 175,209 kB og funnminimum 10.
Diffen kan gjenskapes med `git diff 6296dfe^ 6296dfe`.

Alle lag fullførte. De leverte henholdsvis 10, 2, 2 og 0 funn. Hovedreviewen
triagerte hvert funn før gruppering og etterprøvde AC4 med faktisk Chromium:
320×200 klippet både trinnkontroll og fokus, mens 320×160/360×160 ga for lite
arbeidsareal. Den opprinnelige testmatrisen bestod uten å avdekke dette.

[Reviewrapporten](../../implementation-artifacts/story-1-2-review.md) bevarer
alle 14 funn med individuell dom, evidens, retting eller avvisningsgrunn.
Etter gruppering ble ni patchpunkter rettet. To mindre forslag ble avvist
etter workflowens regel om lav nytte og ekstra kompleksitet. Ingen funn er
utsatt, og ingen ny produkt-/arkitekturbeslutning var nødvendig.

## Retting og faktisk verifikasjon

- Én stepperkolonne ved smal zoom og mindre headerplass i korte vinduer
  bevarer hele kontroller/fokusringer og arbeidsoverskriften.
- Testene kontrollerer nå eksakt produktnavn/trinnrekkefølge/nummer/status,
  faktisk fokusfarge/kontrast og rå HTTP-traversering.
- Normal `npm run test:e2e` kjører både bygget demo og dev. Dev krever
  synlig skall, tilkoblet lokal HMR og avvisning av faktisk privat markørfil.
- Den isolerte rene kontrollen prøver en synlig HMR-kildeendring og retur,
  krever tom `pageerror`-liste, avviser opptatt port og finner sin egen checkout.
- README og gjeldende verifikasjonsstatus er oppdatert; tidligere
  implementeringsbevis er beholdt som historikk.

Siste fullstendige kjøring: **12 demotester + 2 dev-tester bestått**.
Type/lint/build bestod med Node 24.21.0/npm 11.19.0. Ren `npm ci`, sperret
eksternt TCP-nett, offline build/demo, én loopback-lytter, HTTP-grense,
manglende build, opptatt port, dev/HMR og faktisk opprydding bestod.

Native Chrome viste eksplisitt 200 %/400 %, tekststatus, fokus og sperret
videregang. Etter en tidlig tom UI-observasjon ved omlasting viste senere
observasjon skallet og ingen konsollmeldinger. Ingen vedvarende feil ble
påvist. Nøyaktige klippegrenser avgjøres av E2E-målingene, med skjermbilder
for 320×200 og 320×160. Ingen skjermleser-/andre-plattformkontroll påstås.
Zoom ble tilbakestilt til 100 %, DevTools og egen reviewfane lukket.

Kontrollene avdekket og rettet også feil i eget verifikasjonsarbeid: én
gjenværende pikselklipping etter første CSS-retting, feil sammenslåing av
Playwright-serverkonfigurasjon og portproben som først forvekslet TIME_WAIT
med aktiv lytter. Dev har egen outputmappe slik at demobildene bevares.
[Råutskriften](../../implementation-artifacts/story-1-2-review-kontroller.txt)
bevarer både disse forsøkene og beståtte sluttkjøringer.

Ytre sandkasse avviste lokal lytting/nøstet sandbox-exec. Kontroller som
krevde lokal server/Chromium ble kjørt etter automatisk godkjente unntak.
En eksisterende demo fra denne checkouten ble identifisert og midlertidig
stoppet, deretter gjenopprettet. Ingen fremmede prosesser ble stoppet.

## Sluttstatus

AC1–AC5 er oppfylt etter retting. Story 1.2 og sprintnøkkelen er **done**.
Epic 1 forblir in-progress, 1.1 done og alle senere stories backlog;
plan-/portmetadata og låste produktdokumenter er bevart. Ingen Story 1.3,
betalte/live-kall, commit, push eller produktutvidelse inngår.
