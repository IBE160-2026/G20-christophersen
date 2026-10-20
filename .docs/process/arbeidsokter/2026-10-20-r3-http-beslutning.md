# Arbeidsøkt 2026-10-20 — lukking av R3 før Story 2.5

Mads bestilte dokumentert lukking av R3 med eksplisitte semester-v1-verdier,
konsistenskontroll og lokal commit. Ingen implementering av 2.5/Epic 4 og
ingen push. Hele bestillingen er bevart som andre oppføring i
`../prompts/session-01a1594c-43d0-7051-8f65-cd662f3600f1.jsonl`.

## Beslutning og avstemming

[R3-beslutningen](../../planning-artifacts/r3-http-ressurser-semester-v1.md)
er autoritativ for de vedtatte ressursdetaljene: PDF maks 50 * 1024 * 1024
bytes, JSON-/metadata-body maks 1 * 1024 * 1024 bytes, én faktisk PDF,
ingen base64-JSON, in-memory uten disk/database, én aktiv request per
session/flyt, ingen retry og én hard lokal PDF-/demo-frist på 60 000 ms.

Dokumentet definerer tidlig avvisning og løpende bytetelling, ressurseierskap
og cleanup ved normalretur/feil/abort/timeout. Den lokale fristen omfatter
signatur-/formatvalidering, ekstraksjon, demo og resultatbinding, uten reset
per steg. Ingen separat timeoutverdi for andre HTTP-faser eller live er
valgt. S5s medianmål er beholdt som evalueringsmål.

Story 2.5 AC1–AC5, arkitektur AD-2–AD-6/AD-9/AD-10, SPEC/kompanjonger,
implementation-readiness og sprintplan/status er lest. Eksisterende server,
PDF-validering/sidetelling, ekstraksjon, workers, schemas/resultatbinding og
demo-adapter er kontrollert. Kurs-/faglærerføringer om sporbarhet, liten v1,
testing, ressurs-/datahåndtering og lokalkjøring er videreført fra det leste
autoritative grunnlaget; ingen ekstra kurskrav er konstruert.

Ingen konflikt eller nytt udekket produkt-/arkitekturvalg er funnet:

- Eksisterende 30-sidersgrense, R2, komplette originalbytes og SHA-256 består.
- Requestens backendkopier/tekst/parserressurser skal frigjøres, mens AD-5s
  tekniske duplikatmarkør beholdes til serverstopp uten dokumentinnhold.
- Frontendens original-PDF og midlertidige aktive vurdering bevares for
  kontroll; visningsressurser frigjøres når de ikke lenger brukes.
- Demo bruker samme kontrakter og standard lokale hash-/versjonsbundne
  uttrekk. Ingen ny lagring, runtime-DTO eller skjemaversjon innføres.
- Eksisterende finally/destroy/terminate er grunnlag, ikke bevis for allerede
  implementert hard timeout eller requeststyrt kansellering. Dette og
  testmatrisen gjennomføres først i Story 2.5.

## Endrede filer

- `.docs/planning-artifacts/r3-http-ressurser-semester-v1.md` — nytt vedtak med grenser, livsløp, konsistens og senere testmatrise.
- `.docs/planning-artifacts/implementation-readiness.md` — gjeldende R3-oppfølging og lukket port i registeret; eldre kontroller beholdt som historikk.
- `.docs/planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md` — kort AD-5-/AD-9-presisering og Deferred-peker.
- `.docs/planning-artifacts/epics.md` — bare Story 2.5s avklaringspunkt, ingen endrede AC.
- `.docs/specs/spec-IBE160/SPEC.md` — R3 som obligatorisk kompanjong og kontraktpeker.
- `.docs/specs/spec-IBE160/grensekontrakter.md` — mottaks-/cleanup-kontrakt med R3-peker.
- `.docs/specs/spec-IBE160/verifikasjon-og-avklaringer.md` — R3 avklart, implementering/tester fortsatt senere arbeid.
- `.docs/implementation-artifacts/sprint-plan.md` — oppfølgingsstatus og lukket R3-rad.
- `.docs/implementation-artifacts/sprint-status.yaml` — R3 closed med dato/beslutningspeker; alle storystatuser bevart.
- `.docs/implementation-artifacts/epic-2-context.md` — gjeldende R3-status for senere storyarbeid.
- Denne arbeidsøkten og eksisterende promptlogg — sporbar bestilling, avstemming og kontroller.

## Kontroller og sluttstatus

Dokumentkontroll: eksplisitte binære byteverdier, inklusive grenseverdier,
ressurs-/timeout-/abortsemantikk og senere testtilfeller kontrollert mot
bestillingen og eksisterende kontrakter. `git diff --check`, lokale lenker,
SPEC-kompanjongpeker og BMAD-sprintvalidator består. 95 lokale dokumentlenker
er kontrollert. YAML-registeret bevarer
samtlige development_status-verdier og alle andre porter; bare R3 lukkes.
Story 2.5s AC er byte-identiske, og produktkode/tester/fixtures/PRD/UX er
uendret mot `a617b9c`. Ingen produkttestsuite er kjørt for dokumentvedtaket;
det gir ingen HTTP-/cleanup-/S2-/S5-/S6-bevis.

R2/R3 er closed; R1/R4 er åpne ved sine senere kontrollpunkter. Readiness
forblir CONCERNS. 1.2 og 2.1–2.4 er done. Ingen beslutningsblokkering før
2.5 er funnet, men 2.5 er fortsatt backlog og ikke startet. Epic 2/SP2 pågår.
Lokal dokumentasjonscommit uten push avslutter bestillingen.
