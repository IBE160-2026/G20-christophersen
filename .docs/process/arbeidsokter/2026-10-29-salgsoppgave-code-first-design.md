# Arbeidsøkt: code-first design før implementering

Dato: 2026-10-29. Baseline: `15402fc307726e0528c1ae0a068b36ab3dee5845`,
branch `main`. Bare aktiv promptlogg var usporet ved start; session-ID og
brukerprompt samsvarer med denne økten. Automatisk logging er uendret og
tidligere logger er bevart. [Aktiv prompt](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl).

Brukeren bestilte design før implementering, ingen betalte kall eller push,
lokal commit med promptlogg og stopp før vesentlige valg/første live-test.
`bmad-build` ble rendret én gang og fulgt gjennom undersøkelse/utkast i
step-02. To lesende undersøkelsesagenter ble brukt etter step-02s eksplisitte
anvisning: én for PDF/TG-dekning, én for kostnad/adapter. Ingen agent endret kode.
OpenAI Docs ble brukt til offisielle priser, Structured Outputs og token-/
reasoningbegrensninger. Ingen nøkkel, kontotilgang eller modelltransport ble lest
eller testet. PDF-skillens lesende tekstuttrekk ble brukt til kursveiledningen.

Funn: lokal PDF-/kilde-/kontrollarkitektur kan gjenbrukes; økonomi, område
og funn i dagens nye import er hardkodet for kjente syntetiske hasher.
Strict request og tokenvakt finnes, men ingen verifisert produksjonsteller
eller pris-/kostnadsregnskap. Demo-kontrakten kan ikke merke ekte uttrekk korrekt.
R1 låser Sol/low/Standard; finans og screening ligger allerede i rene moduler.

[Designforslaget](../../planning-artifacts/salgsoppgave-code-first-design-2026-10-29.md)
beskriver behandlingsintervaller uten hull, kandidatavstemming, uløst
rapporttekst som AI-input, fysisk kildebinding, USD 0,20 samlet tak og
foreslått 40k/8k requestgrense. Kostnadseksempler er aritmetiske anslag,
ikke observerte dokumentkostnader eller kvalitetsbevis. Billigere modeller
er prisalternativer uten gjennomført kvalitetsprøve. Ingen universell semantisk
TG-garanti påstås; manifestet skal hindre tap ved filtrering og sperre ved rest.

Sensorveiledningen s. 2–6, faglærerfeedback, R1, arkitektur og godkjent
salgsoppgave-spec er brukt for sporbarhet og bevarte grenser. Ingen ny regel
eller prisgrense er utledet fra kurskildene. Sentral deferred-work er kun
supplert med PAA-SO2-oppfølging; ingen historisk oppføring er lukket.

Verifikasjon i denne økten er lesende kildeundersøkelse, lokal dokument-/
lenkekontroll, kostnadsaritmetikk og diffkontroll. Ingen produktimplementering
eller produkttest er startet før designgodkjenning. Det er derfor ingen ny
grønn testkjøring, reell modellmåling eller endret S5/S6-akseptanse å rapportere.

Neste checkpoint: Mads godkjenner eller endrer modellen/budsjettet og designet
i [arbeidsplanen](../../implementation-artifacts/spec-salgsoppgave-code-first.md).
Deretter offline bygg/test/review; live-porten forblir stengt til egen senere
beslutning. Designcheckpoint og aktiv promptlogg committes lokalt uten push.
