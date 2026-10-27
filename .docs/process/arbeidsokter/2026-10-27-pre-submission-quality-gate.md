# Pre-submission quality gate — arbeidsøkt 2026-10-27

Utgangspunkt: `be895e0009ae133b3899e53236e2dfdcab853d5d`.
Aktiv promptlogg:
[session-01a17efd-94fb-7371-9d49-49c778c25b46.jsonl](../prompts/session-01a17efd-94fb-7371-9d49-49c778c25b46.jsonl).
Mads bestilte selvstendig sensorsimulering og retting frem til reell
menneskelig gate. Ingen push/pull, betalte kall, nye features eller S5-forsøk.

## Autoritet og metode

AGENTS.md, faktisk syvsiders sensorveiledning (lest med pypdf), faglærerens
brief-tilbakemelding, låst SPEC/kompanjonger, DESIGN/EXPERIENCE og 5.4/5.5 AC.
BMAD build ble rendret én gang for denne aktiveringen. Gjeldende bruker-
mandat dekker interne plan-/implementeringscheckpoints, ikke nye
produktvalg eller ekstern S6. Tre uavhengige lesegjennomganger før endring:
`/root/sensor_gate`, `/root/result_gate`, `/root/delivery_gate`.
De endret ikke filer og utførte ingen tester eller leverandørkall.

[Funn og foreløpig sensorskår](../../implementation-artifacts/pre-submission-2026-10-27/independent-initial-assessment.json)
er stikkprøver, ikke ekte sensur/S6. Konkrete feil føres bare sentralt i
[deferred-work](../../implementation-artifacts/deferred-work.md).
[Avgrenset rettingsspec](../../implementation-artifacts/spec-pre-submission-quality-gate-2026-10-27.md)
dekker testmiljø, TG3-tekst og bevaring av første feil. Kode-/testarbeidet
ble sendt til en implementeringsagent uten samtalehistorikk; hovedagenten
kontrollerer diff og bevis selv før uavhengig endringsreview.

## Bevisgrense

Tidligere grønne fulltester fra 5375e7f og den forrige post-patch-runden
beholdes. Ny state-/testserverkode vil kreve relevant ny regresjon, med
sanert/fiktivt miljø og OS-sperret eksternt nett. Ingen opprinnelige S5-
eller liveobservasjoner endres. 4.4 done; 4.5 formelt in-progress med S5-W1;
5.4 backlog/R4-S6 open; 5.5 in-progress til faktisk samlet akseptanse.

## Implementering og faktisk regresjon

Implementeringsagenten rettet testmiljø, TG3-tekst og første feilbevaring.
Hovedagenten leste faktisk diff. Egen kontroll fant at duplikatavvisningen
også måtte kunngjøres gjennom eksisterende report-announcement; dette ble
rettet uten ny live-region og prøvd med både timeout og transport-failure.

Full Vitest: 1088/1088. Full E2E: 195/197; to F4-varianter feilet på en
oversett eksplisitt forventning om den generiske gamle elektrikerveiledningen.
Original rødlogg er bevart. Bare denne hjelpetekstforventningen ble endret;
finans-/screeningfasit og originalobservasjoner ble ikke tilpasset.
Etter siste duplikatstatus består 134 målrettede unit og 6 E2E, inklusive
begge F4-variantene. Resten består: 3 dev, 37 komponenter, typecheck/build,
lint, 7 helperprøver og 204 frontendfiler uten lekkasje. Ingen fullrunde
ble gjentatt etter avgrenset status-/forventningsretting.

[Rå indekser og kildemanifester](../../implementation-artifacts/pre-submission-quality-gate-2026-10-27.md#faktisk-verifikasjon-etter-retting)
bevarer hvilke filer som var prøvd i hver runde. Alle server-/browser-
kontroller var OS-nettsperret med loopback. E2E/dev/buildhelper fikk fiktiv
arvet live-konfigurasjon. Ingen ekte nøkkel, betalt kall eller S5-kjøring.
16 nye bilder av resultat/feil ble faktisk åpnet og inspisert av hovedagenten.
