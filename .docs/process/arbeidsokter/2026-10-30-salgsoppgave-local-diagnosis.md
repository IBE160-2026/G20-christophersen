# Lokal lesbarhetsdiagnose – 2026-10-30

Brukeren ba om å forklare ukjent/ufullstendig sidestatus, skille tekstlag fra
klassifisering, finne relevante dokumentdeler automatisk og begrense manuell
kontroll. Dette er lokal undersøkelse, ikke ny produktimplementering eller
aktivering. Utgangspunkt er lokal commit `afd7337`.
[Aktiv promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl).

Undersøkelsen fant tre forskjellige mekanismer i eksisterende PDF-kode:

- `otherContent` avviser PDF-oppføringene PieceInfo/Group med generell ukjent-
  melding. Dette er struktur-/støtteusikkerhet, ikke dokumentklassifisering.
- Manglende digitalt tekstlag og ubehandlet raster er selvstendige forhold.
- `inspectStreamBytes` fanger også inflateSync-grenseoverskridelse som damaged;
  slik status alene beviser ikke skadet komprimering eller faktisk teksttap.
  TrueType-diagnostikk kan i tillegg bevare usikkerhet på enkelte tekstsider.

En privat instrumentert kopi reproduserte opprinnelig uttrekk. Isolert
metadataeksperiment bevarte identisk tekst og fysiske sider; produksjonskoden
og sikkerhetsportene ble ikke endret. Separat zlib-kontroll, native PDFKit-
rendering og lokal Vision CPU-OCR ga et mer presist kontrollgrunnlag. Vision
feilet først i sandbox og fullførte uten sandbox; ingen fjern-OCR eller API.
Rålogger, sider, bilder, kildeutdrag, OCR-linjer/bokser og resultater ligger kun
under ignorert privat område. Ingen identifiserende dokumentopplysning eller
originalhash gjengis her.

Visuell dokumentoversikt og målrettet kontroll av hele utvalgte sider ble
utført av agenten. Dette er verken full originalgjennomlesing, komplett
tekst-/TG-dekning eller uavhengig menneskelig fasit. Ny privat sideoversikt
bevarer samtlige fysiske sider og eksakte kildeankere i originalens tekstlag.
OCR forblir et separat uverifisert derivat og erstatter ikke originalen.
Brukerens kontroll er begrenset til konkrete økonomi-/transaksjonsopplysninger
og avklaring av rapportgrunnlaget for en mulig avgrenset første prøve; det er
ikke bedt om å attestere hele dokumentet eller godkjenne ufullstendig dekning.

Første avgrensede prøve og komplett TG-kvalitetsprøve er forskjellige formål.
Ingen endring av støttet transaksjonstype, finans-/screeningregler, fasitkrav
eller produktets bekreftelsesregler er valgt på brukerens vegne. Opprinnelige
fasit-/attestasjonsfiler står uendret og uverifisert. Ingen frysing, initialisert
budsjett, API-count, betalt generering eller push. Count-prisporten og
kvalitets-/live-portene er fortsatt åpne.

Operasjonell sluttkontroll: byteidentisk original/incoming/case; fullstendig
fysisk sideregnskap; kildeankere verifisert med JavaScript UTF-16-offsets;
null menneskelig attestasjon og ingen freeze; alt privat materiale Git-ignorert
og ingen privat fil sporet/staget. Ingen appkode er endret, derfor er den
historiske fulltesten ikke kjørt om igjen som påstått validering av ekte innhold.
